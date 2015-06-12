# -*- coding: utf-8 -*-
#
# jQuery File Upload Plugin GAE Python Example 3.1.0
# https://github.com/blueimp/jQuery-File-Upload
#
# Copyright 2011, Sebastian Tschan
# https://blueimp.net
#
# Licensed under the MIT license:
# http://www.opensource.org/licenses/MIT
#

from google.appengine.api import memcache, images
import json
import os
import re
import urllib
import webapp2

DEBUG=os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')
WEBSITE = 'https://blueimp.github.io/jQuery-File-Upload/'
MIN_FILE_SIZE = 1  # bytes
# Max file size is memcache limit (1MB) minus key size minus overhead:
MAX_FILE_SIZE = 999000  # bytes
IMAGE_TYPES = re.compile('image/(gif|p?jpeg|(x-)?png)')
ACCEPT_FILE_TYPES = IMAGE_TYPES
THUMB_MAX_WIDTH = 80
THUMB_MAX_HEIGHT = 80
THUMB_SUFFIX = '.'+str(THUMB_MAX_WIDTH)+'x'+str(THUMB_MAX_HEIGHT)+'.png'
EXPIRATION_TIME = 300  # seconds
# If set to None, only allow redirects to the referer protocol+host.
# Set to a regexp for custom pattern matching against the redirect value:
REDIRECT_ALLOW_TARGET = None

class CORSHandler(webapp2.RequestHandler):
    def cors(self):
        headers = self.response.headers
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] =\
            'OPTIONS, HEAD, GET, POST, DELETE'
        headers['Access-Control-Allow-Headers'] =\
            'Content-Type, Content-Range, Content-Disposition'

    def initialize(self, request, response):
        super(CORSHandler, self).initialize(request, response)
        self.cors()

    def json_stringify(self, obj):
        return json.dumps(obj, separators=(',', ':'))

    def options(self, *args, **kwargs):
        pass

class UploadHandler(CORSHandler):
    def validate(self, file):
        if file['size'] < MIN_FILE_SIZE:
            file['error'] = 'File is too small'
        elif file['size'] > MAX_FILE_SIZE:
            file['error'] = 'File is too big'
        elif not ACCEPT_FILE_TYPES.match(file['type']):
            file['error'] = 'Filetype not allowed'
        else:
            return True
        return False

    def validate_redirect(self, redirect):
        if redirect:
            if REDIRECT_ALLOW_TARGET:
                return REDIRECT_ALLOW_TARGET.match(redirect)
            referer = self.request.headers['referer']
            if referer:
                from urlparse import urlparse
                parts = urlparse(referer)
                redirect_allow_target = '^' + re.escape(
                    parts.scheme + '://' + parts.netloc + '/'
                )
            return re.match(redirect_allow_target, redirect)
        return False

    def get_file_size(self, file):
        file.seek(0, 2)  # Seek to the end of the file
        size = file.tell()  # Get the position of EOF
        file.seek(0)  # Reset the file position to the beginning
        return size

    def write_blob(self, data, info):
        key = urllib.quote(info['type'].encode('utf-8'), '') +\
            '/' + str(hash(data)) +\
            '/' + urllib.quote(info['name'].encode('utf-8'), '')
        try:
            memcache.set(key, data, time=EXPIRATION_TIME)
        except: #Failed to add to memcache
            return (None, None)
        thumbnail_key = None
        if IMAGE_TYPES.match(info['type']):
            try:
                img = images.Image(image_data=data)
                img.resize(
                    width=THUMB_MAX_WIDTH,
                    height=THUMB_MAX_HEIGHT
                )
                thumbnail_data = img.execute_transforms()
                thumbnail_key = key + THUMB_SUFFIX
                memcache.set(
                    thumbnail_key,
                    thumbnail_data,
                    time=EXPIRATION_TIME
                )
            except: #Failed to resize Image or add to memcache
                thumbnail_key = None
        return (key, thumbnail_key)

    def handle_upload(self):
        results = []
        for name, fieldStorage in self.request.POST.items():
            if type(fieldStorage) is unicode:
                continue
            result = {}
            result['name'] = urllib.unquote(fieldStorage.filename)
            result['type'] = fieldStorage.type
            result['size'] = self.get_file_size(fieldStorage.file)
            if self.validate(result):
                key, thumbnail_key = self.write_blob(
                    fieldStorage.value,
                    result
                )
                if key is not None:
                    result['url'] = self.request.host_url + '/' + key
                    result['deleteUrl'] = result['url']
                    result['deleteType'] = 'DELETE'
                    if thumbnail_key is not None:
                        result['thumbnailUrl'] = self.request.host_url +\
                             '/' + thumbnail_key
                else:
                    result['error'] = 'Failed to store uploaded file.'
            results.append(result)
        return results

    def head(self):
        pass

    def get(self):
        self.redirect(WEBSITE)

    def post(self):
        if (self.request.get('_method') == 'DELETE'):
            return self.delete()
        result = {'files': self.handle_upload()}
        s = self.json_stringify(result)
        redirect = self.request.get('redirect')
        if self.validate_redirect(redirect):
            return self.redirect(str(
                redirect.replace('%s', urllib.quote(s, ''), 1)
            ))
        if 'application/json' in self.request.headers.get('Accept'):
            self.response.headers['Content-Type'] = 'application/json'
        self.response.write(s)

class FileHandler(CORSHandler):
    def normalize(self, str):
        return urllib.quote(urllib.unquote(str), '')

    def get(self, content_type, data_hash, file_name):
        content_type = self.normalize(content_type)
        file_name = self.normalize(file_name)
        key = content_type + '/' + data_hash + '/' + file_name
        data = memcache.get(key)
        if data is None:
            return self.error(404)
        # Prevent browsers from MIME-sniffing the content-type:
        self.response.headers['X-Content-Type-Options'] = 'nosniff'
        content_type = urllib.unquote(content_type)
        if not IMAGE_TYPES.match(content_type):
            # Force a download dialog for non-image types:
            content_type = 'application/octet-stream'
        elif file_name.endswith(THUMB_SUFFIX):
            content_type = 'image/png'
        self.response.headers['Content-Type'] = content_type
        # Cache for the expiration time:
        self.response.headers['Cache-Control'] = 'public,max-age=%d' \
            % EXPIRATION_TIME
        self.response.write(data)

    def delete(self, content_type, data_hash, file_name):
        content_type = self.normalize(content_type)
        file_name = self.normalize(file_name)
        key = content_type + '/' + data_hash + '/' + file_name
        result = {key: memcache.delete(key)}
        content_type = urllib.unquote(content_type)
        if IMAGE_TYPES.match(content_type):
            thumbnail_key = key + THUMB_SUFFIX
            result[thumbnail_key] = memcache.delete(thumbnail_key)
        if 'application/json' in self.request.headers.get('Accept'):
            self.response.headers['Content-Type'] = 'application/json'
        s = self.json_stringify(result)
        self.response.write(s)

app = webapp2.WSGIApplication(
    [
        ('/', UploadHandler),
        ('/(.+)/([^/]+)/([^/]+)', FileHandler)
    ],
    debug=DEBUG
)
