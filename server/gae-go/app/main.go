/*
 * jQuery File Upload Plugin GAE Go Example 3.2.0
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
	"appengine/image"
	"appengine/taskqueue"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

const (
	WEBSITE           = "https://blueimp.github.io/jQuery-File-Upload/"
	MIN_FILE_SIZE     = 1       // bytes
	MAX_FILE_SIZE     = 5000000 // bytes
	IMAGE_TYPES       = "image/(gif|p?jpeg|(x-)?png)"
	ACCEPT_FILE_TYPES = IMAGE_TYPES
	EXPIRATION_TIME   = 300 // seconds
	THUMBNAIL_PARAM   = "=s80"
)

var (
	imageTypes      = regexp.MustCompile(IMAGE_TYPES)
	acceptFileTypes = regexp.MustCompile(ACCEPT_FILE_TYPES)
)

type FileInfo struct {
	Key          appengine.BlobKey `json:"-"`
	Url          string            `json:"url,omitempty"`
	ThumbnailUrl string            `json:"thumbnailUrl,omitempty"`
	Name         string            `json:"name"`
	Type         string            `json:"type"`
	Size         int64             `json:"size"`
	Error        string            `json:"error,omitempty"`
	DeleteUrl    string            `json:"deleteUrl,omitempty"`
	DeleteType   string            `json:"deleteType,omitempty"`
}

func (fi *FileInfo) ValidateType() (valid bool) {
	if acceptFileTypes.MatchString(fi.Type) {
		return true
	}
	fi.Error = "Filetype not allowed"
	return false
}

func (fi *FileInfo) ValidateSize() (valid bool) {
	if fi.Size < MIN_FILE_SIZE {
		fi.Error = "File is too small"
	} else if fi.Size > MAX_FILE_SIZE {
		fi.Error = "File is too big"
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
	fi.DeleteUrl = fi.Url + "?delete=true"
	fi.DeleteType = "DELETE"
	if imageTypes.MatchString(fi.Type) {
		servingUrl, err := image.ServingURL(
			c,
			fi.Key,
			&image.ServingURLOptions{
				Secure: strings.HasSuffix(u.Scheme, "s"),
				Size:   0,
				Crop:   false,
			},
		)
		check(err)
		fi.ThumbnailUrl = servingUrl.String() + THUMBNAIL_PARAM
	}
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
		fi.CreateUrls(r, context)
	}()
	check(err)
	_, err = io.Copy(w, lr)
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
				w.Header().Add("X-Content-Type-Options", "nosniff")
				if !imageTypes.MatchString(bi.ContentType) {
					w.Header().Add("Content-Type", "application/octet-stream")
					w.Header().Add(
						"Content-Disposition",
						fmt.Sprintf("attachment; filename=\"%s\"", parts[2]),
					)
				}
				w.Header().Add(
					"Cache-Control",
					fmt.Sprintf("public,max-age=%d", EXPIRATION_TIME),
				)
				blobstore.Send(w, blobKey)
				return
			}
		}
	}
	http.Error(w, "404 Not Found", http.StatusNotFound)
}

func post(w http.ResponseWriter, r *http.Request) {
    result := make(map[string][]*FileInfo, 1)
    result["files"] = handleUploads(r)
	b, err := json.Marshal(result)
	check(err)
	if redirect := r.FormValue("redirect"); redirect != "" {
	    if strings.Contains(redirect, "%s") {
	        redirect = fmt.Sprintf(
    			redirect,
    			escape(string(b)),
    		)
	    }
		http.Redirect(w, r, redirect, http.StatusFound)
		return
	}
	w.Header().Set("Cache-Control", "no-cache")
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
	result := make(map[string]bool, 1)
	if key := parts[1]; key != "" {
		c := appengine.NewContext(r)
		blobKey := appengine.BlobKey(key)
		err := blobstore.Delete(c, blobKey)
		check(err)
		err = image.DeleteServingURL(c, blobKey)
		check(err)
		result[key] = true
	}
	jsonType := "application/json"
	if strings.Index(r.Header.Get("Accept"), jsonType) != -1 {
		w.Header().Set("Content-Type", jsonType)
	}
	b, err := json.Marshal(result)
	check(err)
	fmt.Fprintln(w, string(b))
}

func handle(w http.ResponseWriter, r *http.Request) {
	params, err := url.ParseQuery(r.URL.RawQuery)
	check(err)
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add(
		"Access-Control-Allow-Methods",
		"OPTIONS, HEAD, GET, POST, PUT, DELETE",
	)
	w.Header().Add(
		"Access-Control-Allow-Headers",
		"Content-Type, Content-Range, Content-Disposition",
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
}
