/*
 * jQuery File Upload Plugin GAE Go Example 2.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

package app

import (
	"appengine"
	"appengine/blobstore"
	"appengine/memcache"
	"appengine/taskqueue"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"regexp"
	"resize"
	"strings"
	"time"
)

import _ "image/gif"
import _ "image/jpeg"

const (
	WEBSITE              = "http://blueimp.github.com/jQuery-File-Upload/"
	MIN_FILE_SIZE        = 1       // bytes
	MAX_FILE_SIZE        = 5000000 // bytes
	IMAGE_TYPES          = "image/(gif|p?jpeg|(x-)?png)"
	ACCEPT_FILE_TYPES    = IMAGE_TYPES
	EXPIRATION_TIME      = 300 // seconds
	THUMBNAIL_MAX_WIDTH  = 80
	THUMBNAIL_MAX_HEIGHT = THUMBNAIL_MAX_WIDTH
)

var (
	imageTypes      = regexp.MustCompile(IMAGE_TYPES)
	acceptFileTypes = regexp.MustCompile(ACCEPT_FILE_TYPES)
)

type FileInfo struct {
	Key          appengine.BlobKey `json:"-"`
	Url          string            `json:"url,omitempty"`
	ThumbnailUrl string            `json:"thumbnail_url,omitempty"`
	Name         string            `json:"name"`
	Type         string            `json:"type"`
	Size         int64             `json:"size"`
	Error        string            `json:"error,omitempty"`
	DeleteUrl    string            `json:"delete_url,omitempty"`
	DeleteType   string            `json:"delete_type,omitempty"`
}

func (fi *FileInfo) ValidateType() (valid bool) {
	if acceptFileTypes.MatchString(fi.Type) {
		return true
	}
	fi.Error = "acceptFileTypes"
	return false
}

func (fi *FileInfo) ValidateSize() (valid bool) {
	if fi.Size < MIN_FILE_SIZE {
		fi.Error = "minFileSize"
	} else if fi.Size > MAX_FILE_SIZE {
		fi.Error = "maxFileSize"
	} else {
		return true
	}
	return false
}

func (fi *FileInfo) CreateUrls(r *http.Request, c appengine.Context) {
	u := &url.URL{
		Scheme: r.URL.Scheme,
		Host:   appengine.DefaultVersionHostname(c),
		Path:   "/",
	}
	uString := u.String()
	fi.Url = uString + escape(string(fi.Key)) + "/" +
		escape(string(fi.Name))
	fi.DeleteUrl = fi.Url
	fi.DeleteType = "DELETE"
	if fi.ThumbnailUrl != "" && -1 == strings.Index(
		r.Header.Get("Accept"),
		"application/json",
	) {
		fi.ThumbnailUrl = uString + "thumbnails/" +
			escape(string(fi.Key))
	}
}

func (fi *FileInfo) CreateThumbnail(r io.Reader, c appengine.Context) (data []byte, err error) {
	defer func() {
		if rec := recover(); rec != nil {
			log.Println(rec)
			// 1x1 pixel transparent GIf, bas64 encoded:
			s := "R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
			data, _ = base64.StdEncoding.DecodeString(s)
			fi.ThumbnailUrl = "data:image/gif;base64," + s
		}
		memcache.Add(c, &memcache.Item{
			Key:        string(fi.Key),
			Value:      data,
			Expiration: EXPIRATION_TIME,
		})
	}()
	img, _, err := image.Decode(r)
	check(err)
	if bounds := img.Bounds(); bounds.Dx() > THUMBNAIL_MAX_WIDTH ||
		bounds.Dy() > THUMBNAIL_MAX_HEIGHT {
		w, h := THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT
		if bounds.Dx() > bounds.Dy() {
			h = bounds.Dy() * h / bounds.Dx()
		} else {
			w = bounds.Dx() * w / bounds.Dy()
		}
		img = resize.Resize(img, img.Bounds(), w, h)
	}
	var b bytes.Buffer
	err = png.Encode(&b, img)
	check(err)
	data = b.Bytes()
	fi.ThumbnailUrl = "data:image/png;base64," +
		base64.StdEncoding.EncodeToString(data)
	return
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}

func escape(s string) string {
	return strings.Replace(url.QueryEscape(s), "+", "%20", -1)
}

func delayedDelete(c appengine.Context, fi *FileInfo) {
	if key := string(fi.Key); key != "" {
		task := &taskqueue.Task{
			Path:   "/" + escape(key) + "/-",
			Method: "DELETE",
			Delay:  time.Duration(EXPIRATION_TIME) * time.Second,
		}
		taskqueue.Add(c, task, "")
	}
}

func handleUpload(r *http.Request, p *multipart.Part) (fi *FileInfo) {
	fi = &FileInfo{
		Name: p.FileName(),
		Type: p.Header.Get("Content-Type"),
	}
	if !fi.ValidateType() {
		return
	}
	defer func() {
		if rec := recover(); rec != nil {
			log.Println(rec)
			fi.Error = rec.(error).Error()
		}
	}()
	var b bytes.Buffer
	lr := &io.LimitedReader{R: p, N: MAX_FILE_SIZE + 1}
	context := appengine.NewContext(r)
	w, err := blobstore.Create(context, fi.Type)
	defer func() {
		w.Close()
		fi.Size = MAX_FILE_SIZE + 1 - lr.N
		fi.Key, err = w.Key()
		check(err)
		if !fi.ValidateSize() {
			err := blobstore.Delete(context, fi.Key)
			check(err)
			return
		}
		delayedDelete(context, fi)
		if b.Len() > 0 {
			fi.CreateThumbnail(&b, context)
		}
		fi.CreateUrls(r, context)
	}()
	check(err)
	var wr io.Writer = w
	if imageTypes.MatchString(fi.Type) {
		wr = io.MultiWriter(&b, w)
	}
	_, err = io.Copy(wr, lr)
	return
}

func getFormValue(p *multipart.Part) string {
	var b bytes.Buffer
	io.CopyN(&b, p, int64(1<<20)) // Copy max: 1 MiB
	return b.String()
}

func handleUploads(r *http.Request) (fileInfos []*FileInfo) {
	fileInfos = make([]*FileInfo, 0)
	mr, err := r.MultipartReader()
	check(err)
	r.Form, err = url.ParseQuery(r.URL.RawQuery)
	check(err)
	part, err := mr.NextPart()
	for err == nil {
		if name := part.FormName(); name != "" {
			if part.FileName() != "" {
				fileInfos = append(fileInfos, handleUpload(r, part))
			} else {
				r.Form[name] = append(r.Form[name], getFormValue(part))
			}
		}
		part, err = mr.NextPart()
	}
	return
}

func get(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		http.Redirect(w, r, WEBSITE, http.StatusFound)
		return
	}
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) == 3 {
		if key := parts[1]; key != "" {
			blobKey := appengine.BlobKey(key)
			bi, err := blobstore.Stat(appengine.NewContext(r), blobKey)
			if err == nil {
				w.Header().Add(
					"Cache-Control",
					fmt.Sprintf("public,max-age=%d", EXPIRATION_TIME),
				)
				if imageTypes.MatchString(bi.ContentType) {
					w.Header().Add("X-Content-Type-Options", "nosniff")
				} else {
					w.Header().Add("Content-Type", "application/octet-stream")
					w.Header().Add(
						"Content-Disposition:",
						fmt.Sprintf("attachment; filename=%s;", parts[2]),
					)
				}
				blobstore.Send(w, appengine.BlobKey(key))
				return
			}
		}
	}
	http.Error(w, "404 Not Found", http.StatusNotFound)
}

func post(w http.ResponseWriter, r *http.Request) {
	b, err := json.Marshal(handleUploads(r))
	check(err)
	if redirect := r.FormValue("redirect"); redirect != "" {
		http.Redirect(w, r, fmt.Sprintf(
			redirect,
			escape(string(b)),
		), http.StatusFound)
		return
	}
	jsonType := "application/json"
	if strings.Index(r.Header.Get("Accept"), jsonType) != -1 {
		w.Header().Set("Content-Type", jsonType)
	}
	fmt.Fprintln(w, string(b))
}

func delete(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) != 3 {
		return
	}
	if key := parts[1]; key != "" {
		c := appengine.NewContext(r)
		blobstore.Delete(c, appengine.BlobKey(key))
		memcache.Delete(c, key)
	}
}

func serveThumbnail(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) == 3 {
		if key := parts[2]; key != "" {
			var data []byte
			c := appengine.NewContext(r)
			item, err := memcache.Get(c, key)
			if err == nil {
				data = item.Value
			} else {
				blobKey := appengine.BlobKey(key)
				if _, err = blobstore.Stat(c, blobKey); err == nil {
					fi := FileInfo{Key: blobKey}
					data, _ = fi.CreateThumbnail(
						blobstore.NewReader(c, blobKey),
						c,
					)
				}
			}
			if err == nil && len(data) > 3 {
				w.Header().Add(
					"Cache-Control",
					fmt.Sprintf("public,max-age=%d", EXPIRATION_TIME),
				)
				contentType := "image/png"
				if string(data[:3]) == "GIF" {
					contentType = "image/gif"
				} else if string(data[1:4]) != "PNG" {
					contentType = "image/jpeg"
				}
				w.Header().Set("Content-Type", contentType)
				fmt.Fprintln(w, string(data))
				return
			}
		}
	}
	http.Error(w, "404 Not Found", http.StatusNotFound)
}

func handle(w http.ResponseWriter, r *http.Request) {
	params, err := url.ParseQuery(r.URL.RawQuery)
	check(err)
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add(
		"Access-Control-Allow-Methods",
		"OPTIONS, HEAD, GET, POST, PUT, DELETE",
	)
	switch r.Method {
	case "OPTIONS":
	case "HEAD":
	case "GET":
		get(w, r)
	case "POST":
		if len(params["_method"]) > 0 && params["_method"][0] == "DELETE" {
			delete(w, r)
		} else {
			post(w, r)
		}
	case "DELETE":
		delete(w, r)
	default:
		http.Error(w, "501 Not Implemented", http.StatusNotImplemented)
	}
}

func init() {
	http.HandleFunc("/", handle)
	http.HandleFunc("/thumbnails/", serveThumbnail)
}
