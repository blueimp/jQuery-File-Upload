from pyramid.view import view_config, view_defaults

from pyramid.exceptions import NotFound

import re, os, shutil


# Replace server/php/ in imageupload.pt with tal:attributes="action actionurl"
# to keep urls consistant
@view_config(route_name='imageuploadform',request_method='GET', renderer='imageupload.pt')
def imageupload(request):
    return {'actionurl':request.route_url('imageupload',sep='',name='')}

MIN_FILE_SIZE = 1 # bytes
MAX_FILE_SIZE = 5000000 # bytes
IMAGE_TYPES = re.compile('image/(gif|p?jpeg|(x-)?png)')
ACCEPT_FILE_TYPES = IMAGE_TYPES
THUMBNAIL_SIZE = 80
EXPIRATION_TIME = 300 # seconds
IMAGEPATH = [ 'images' ]
THUMBNAILPATH = [ 'images', 'thumbnails' ]
# change the following to POST if DELETE isn't supported by the webserver
DELETEMETHOD="DELETE"

class Image:
    def imagepath(self,name):
        p = IMAGEPATH + [ name ]
        return os.path.join('pyramidpython', *p) 

@view_defaults(route_name='imageupload')
class ImageUpload(Image):

    def __init__(self,request):
        self.request = request
        request.response.headers['Access-Control-Allow-Origin'] = '*'
        request.response.headers['Access-Control-Allow-Methods'] = 'OPTIONS, HEAD, GET, POST, PUT, DELETE'

    def validate(self, file):
        if file['size'] < MIN_FILE_SIZE:
            file['error'] = 'minFileSize'
        elif file['size'] > MAX_FILE_SIZE:
            file['error'] = 'maxFileSize'
        elif not ACCEPT_FILE_TYPES.match(file['type']):
            file['error'] = 'acceptFileTypes'
        else:
            return True
        return False

    def get_file_size(self, file):
        file.seek(0, 2) # Seek to the end of the file
        size = file.tell() # Get the position of EOF
        file.seek(0) # Reset the file position to the beginning
        return size

    def thumbnailurl(self,name):
        return self.request.route_url('imageview',name='thumbnails') + '/' + name

    def thumbnailpath(self,name):
        p = THUMBNAILPATH + [ name ]
        return os.path.join('pyramidpython', *p)

    def createthumbnail(self,filename):
        from PIL import Image
        image = Image.open( self.imagepath(filename) )
        timage = image.resize( (THUMBNAIL_SIZE, THUMBNAIL_SIZE), Image.ANTIALIAS)        
        timage.save( self.thumbnailpath(filename) )
        return

    def fileinfo(self,name):
        filename = self.imagepath(name) 
        f, ext = os.path.splitext(name)
        if ext!='.type' and os.path.isfile(filename):
            info = {}
            info['name'] = name
            info['size'] = os.path.getsize(filename)
            info['url'] = self.request.route_url('imageview',name=name)
            info['thumbnail_url'] = self.thumbnailurl(name)
            info['delete_type'] = DELETEMETHOD
            info['delete_url'] = self.request.route_url('imageupload',sep='',name='') + '/' + name
            if DELETEMETHOD != 'DELETE':
                info['delete_url'] += '&_method=DELETE'
            return info
        else:
            return None

    @view_config(request_method='OPTIONS')
    def options(self):
        return Response(body='')

    @view_config(request_method='HEAD')
    def options(self):
        return Response(body='')

    @view_config(request_method='GET', renderer="json")
    def get(self):
        p = self.request.matchdict.get('name')
        if p:
            return self.fileinfo(p)
        else:
            filelist = []
            for f in os.listdir(os.path.join('pyramidpython',*IMAGEPATH)):
                n = self.fileinfo(f)
                if n:
                    filelist.append(n)
            return filelist

    @view_config(request_method='DELETE', xhr=True, accept="application/json", renderer='json')
    def delete(self):
        import json
        filename = self.request.matchdict.get('name')
        try:
            os.remove(self.imagepath(filename) + '.type')
        except IOError:
            pass
        try:
            os.remove(self.thumbnailpath(filename))
        except IOError:
            pass
        try:
            os.remove(self.imagepath(filename))
        except IOError:
            return False
        return True
    
    @view_config(request_method='POST', xhr=True, accept="application/json", renderer='json')
    def post(self):
        if self.request.matchdict.get('_method') == "DELETE":
            return self.delete()
        results = []
        for name, fieldStorage in self.request.POST.items():
            if isinstance(fieldStorage,unicode):
                continue
            result = {}
            result['name'] = os.path.basename(fieldStorage.filename)
            result['type'] = fieldStorage.type
            result['size'] = self.get_file_size(fieldStorage.file)
            if self.validate(result):
                with open( self.imagepath(result['name'] + '.type'), 'w') as f:
                    f.write(result['type'])
                with open( self.imagepath(result['name']), 'w') as f:
                    shutil.copyfileobj( fieldStorage.file , f)
                self.createthumbnail(result['name'])

                result['delete_type'] = DELETEMETHOD
                result['delete_url'] = self.request.route_url('imageupload',sep='',name='') + '/' + result['name']
                result['url'] = self.request.route_url('imageview',name=result['name'])
                if DELETEMETHOD != 'DELETE':
                    result['delete_url'] += '&_method=DELETE'
                if (IMAGE_TYPES.match(result['type'])):
                    try:
                        result['thumbnail_url'] = self.thumbnailurl(result['name'])
                    except: # Could not get an image serving url
                        pass
            results.append(result)
        return results


@view_defaults(route_name='imageview')
class ImageView(Image):

    def __init__(self,request):
        self.request = request

    @view_config(request_method='GET', http_cache = (EXPIRATION_TIME, {'public':True}))
    def get(self):
        page = self.request.matchdict.get('name')
        try:
            with open( self.imagepath( os.path.basename(page) ) + '.type', 'r', 16) as f:
                self.request.response.content_type = f.read()
        except IOError:
            pass
        try:
            self.request.response.body_file = open( self.imagepath(page), 'r', 10000)
        except IOError:
            raise NotFound
        return self.request.response
