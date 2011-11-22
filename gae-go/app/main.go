/*
 * jQuery File Upload Plugin GAE Go Example 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

package app

import (
	"appengine"
	"appengine/blobstore"
	"appengine/taskqueue"
	"fmt"
	"http"
	"image"
	"image/png"
	"io"
	"json"
	"log"
	"mime/multipart"
	"os"
	"regexp"
	"resize"
	"strings"
	"url"
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

var imageTypes, acceptFileTypes = regexp.MustCompile(IMAGE_TYPES),
	regexp.MustCompile(ACCEPT_FILE_TYPES)

type FileInfo struct {
	Key          appengine.BlobKey `json:"-"`
	ThumbnailKey appengine.BlobKey `json:"-"`
	Index        int               `json:"-"`
	Url          string            `json:"url,omitempty"`
	ThumbnailUrl string            `json:"thumbnail_url,omitempty"`
	Name         string            `json:"name"`
	Type         string            `json:"type"`
	Size         int64             `json:"size"`
	Error        string            `json:"error,omitempty"`
	DeleteUrl    string            `json:"delete_url,omitempty"`
	DeleteType   string            `json:"delete_type,omitempty"`
}

func (fi *FileInfo) Validate() (valid bool) {
	if fi.Size < MIN_FILE_SIZE {
		fi.Error = "minFileSize"
	} else if fi.Size > MAX_FILE_SIZE {
		fi.Error = "maxFileSize"
	} else if !acceptFileTypes.MatchString(fi.Type) {
		fi.Error = "acceptFileTypes"
	} else {
		return true
	}
	return false
}

func (fi *FileInfo) Finalize(c appengine.Context, rURL *url.URL) {
	u := &url.URL{Scheme: rURL.Scheme,
		Host: appengine.DefaultVersionHostname(c)}
	u.Path = "/" + url.QueryEscape(string(fi.Key)) + "/" +
		url.QueryEscape(string(fi.Name))
	fi.Url = u.String()
	var tk string
	if fi.ThumbnailKey != "" {
		tk = url.QueryEscape(string(fi.ThumbnailKey))
		u.Path = "/" + tk + "/thumbnail.png"
		fi.ThumbnailUrl = u.String()
	}
	fi.DeleteUrl = fi.Url + "?thumbnail=" + tk
	fi.DeleteType = "DELETE"
}

func (fi *FileInfo) CreateThumbnail(c appengine.Context, f multipart.File) {
	defer func() {
		if rec := recover(); rec != nil {
			log.Println(rec)
		}
	}()
	img, _, err := image.Decode(f)
	check(err)
	if b := img.Bounds(); b.Dx() > THUMBNAIL_MAX_WIDTH || b.Dy() > THUMBNAIL_MAX_HEIGHT {
		w, h := THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT
		if b.Dx() > b.Dy() {
			h = b.Dy() * h / b.Dx()
		} else {
			w = b.Dx() * w / b.Dy()
		}
		img = resize.Resize(img, img.Bounds(), w, h)
	}
	w, err := blobstore.Create(c, "image/png")
	defer func() {
		w.Close()
		check(err)
		fi.ThumbnailKey, err = w.Key()
		check(err)
	}()
	check(err)
	err = png.Encode(w, img)
	check(err)
}

func check(err os.Error) {
	if err != nil {
		panic(err)
	}
}

func queueDeletion(c appengine.Context, fi *FileInfo) {
	if key := string(fi.Key); key != "" {
		task := &taskqueue.Task{Path: "/" + url.QueryEscape(key) + "/-",
			Method: "DELETE", Delay: EXPIRATION_TIME * 1000000}
		taskqueue.Add(c, task, "")
		if key = string(fi.ThumbnailKey); key != "" {
			task = &taskqueue.Task{Path: "/" + url.QueryEscape(key) + "/-",
				Method: "DELETE", Delay: EXPIRATION_TIME * 1000000}
			taskqueue.Add(c, task, "")
		}
	}
}

func handleUpload(r *http.Request, fh *multipart.FileHeader, i int, c chan *FileInfo) {
	fi := FileInfo{Index: i, Name: fh.Filename}
	context := appengine.NewContext(r)
	defer func() {
		queueDeletion(context, &fi)
		if rec := recover(); rec != nil {
			fi.Error = rec.(os.Error).String()
			log.Println(rec)
		}
		c <- &fi
	}()
	if h, b := fh.Header["Content-Type"]; b && len(h) > 0 {
		fi.Type = h[0]
	}
	f, err := fh.Open()
	defer f.Close()
	check(err)
	fi.Size, err = f.Seek(0, 2)
	check(err)
	if fi.Validate() {
		_, err = f.Seek(0, 0)
		check(err)
		var w *blobstore.Writer
		w, err = blobstore.Create(context, fi.Type)
		defer func() {
			w.Close()
			check(err)
			fi.Key, err = w.Key()
			check(err)
			if imageTypes.MatchString(fi.Type) {
				_, err = f.Seek(0, 0)
				check(err)
				fi.CreateThumbnail(context, f)
			}
			fi.Finalize(context, r.URL)
		}()
		_, err = io.Copy(w, f)
	}
}

func handleUploads(r *http.Request) (fileInfos []*FileInfo) {
	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		for _, mfs := range r.MultipartForm.File {
			mfsLen := len(mfs)
			c := make(chan *FileInfo, mfsLen)
			for i, fh := range mfs {
				go handleUpload(r, fh, i, c)
			}
			fileInfos = make([]*FileInfo, mfsLen)
			for i := 0; i < mfsLen; i++ {
				fi := <-c
				fileInfos[fi.Index] = fi
			}
		}
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
			blobInfo, err := blobstore.Stat(appengine.NewContext(r), blobKey)
			if err == nil {
				w.Header().Add("Cache-Control", fmt.Sprintf("public,max-age=%d", EXPIRATION_TIME))
				if imageTypes.MatchString(blobInfo.ContentType) {
					w.Header().Add("X-Content-Type-Options", "nosniff")
				} else {
					w.Header().Add("Content-Type", "application/octet-stream")
					w.Header().Add("Content-Disposition:", fmt.Sprintf("attachment; filename=%s;", blobInfo.Filename))
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
		http.Redirect(w, r, fmt.Sprintf(redirect, url.QueryEscape(string(b))),
			http.StatusFound)
		return
	}
	if r.Header.Get("application/json") != "" {
		w.Header().Set("Content-Type", "application/json")
	}
	fmt.Fprintln(w, string(b))
}

func delete(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) != 3 {
		return
	}
	keys := make([]appengine.BlobKey, 0, 2)
	if key := parts[1]; key != "" {
		keys = append(keys, appengine.BlobKey(key))
		if key = r.FormValue("thumbnail"); key != "" {
			keys = append(keys, appengine.BlobKey(key))
		}
		err := blobstore.DeleteMulti(appengine.NewContext(r), keys)
		check(err)
	}
}

func handle(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "OPTIONS, HEAD, GET, POST, PUT, DELETE")
	switch r.Method {
	case "OPTIONS":
	case "HEAD":
	case "GET":
		get(w, r)
	case "POST":
		if r.FormValue("_method") == "DELETE" {
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
