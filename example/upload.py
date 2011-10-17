#!/usr/bin/env python
#
# Port of jQuery File Upload Plugin PHP example in web2py Python
# Copyright 2011, Arturo Filastò, for the GlobaLeaks project
#                 http://globaleaks.org/
#
# Original code
# Copyright 2010, Sebastian Tschan
# https://blueimp.net
#
# Licensed under the MIT license:
# http://creativecommons.org/licenses/MIT/


import os, urllib
import shutil

# This part should go inside your model
class UploadHandler:
	def __init__(self, options=None):
		self.__options = {
					'script_url' : request.env.path_info,
					'upload_dir': request.folder + '/uploads', # Maybe this
					'upload_url': request.env.path_info + '/uploads/', # .. and this should removed?
					'param_name': 'files[]',
					'max_file_size': None,
					'min_file_size': 1,
					'accept_file_types': 'ALL',
					'max_number_of_files': None,
					'discard_aborted_uploads': True,
					'image_versions': {
									'thumbnail': {
												'upload_dir': request.folder + '/thumbnails/',
												'upload_uri': request.env.path_info + '/thumbnails/',
												'max_width': 80,
												'max_height': 80
												}
									}
					}
		if options:
			self.__options = options

	def __get_file_object(self, file_name):
		file_path = os.path.join(self.__options['upload_dir'], file_name)
		if os.path.isfile(file_path) and file_name[0] != '.':
			file = Storage()
			file.name = file_name
			file.size = os.path.getsize(file_path)
			file.url = self.__options['upload_url'] + \
					 urllib.urlencode(file.name)

			for version, options in self.__options['image_versions']:
				if os.path.isfile(self.__options['upload_dir'] + file_name):
					file[version + '_url'] = options['upload_url'] + \
										urllib.urlencode(file.name)

			file.delete_url = self.__options['script_url'] + \
							"?file=" + urllib.urlencode(file.name)
			file.delete_type = 'DELETE'
			return file

		return None

	def __get_file_objects(self):
		files = []
		for file in os.listdir(self.__options['upload_dir']):
			files.append(self.__get_file_object(file))
		return files

	def __create_scaled_image(self, file_name, options):
		# Function unimplemented because not needed by GL
		return True

	def __has_error(self, uploaded_file, file, error):
		if error:
			return error
		if file.name.split['.'][-1:][0] not in \
				self.__options['accepted_file_types'] and \
				self.__options['accepted_file_types'] != "ALL":
			return 'acceptFileTypes'
		if self.__options['max_file_size'] and \
			(file_size > self.__options['max_file_size'] or \
				file.size > self.__options['max_file_size']):
			return 'maxFileSize'

		if self.__options['min_file_size'] and \
			file_size > self.__options['min_file_size']:
			return 'minFileSize'

		if self.__options['max_number_of_files'] and \
			int(self.__options['max_number_of_files']) <= \
				len(self.__get_file_objects):
			return 'maxNumberOfFiles'
		return None

	def __handle_file_upload(self, uploaded_file, name, size, type, error):
		file = Storage()

		file.name = os.path.basename(name).strip('.\x20\x00..')
		#file.name = strip_path_and_sanitize(name)
		file.size = int(size)
		file.type = type
		# error = self.__has_error(uploaded_file, file, error)
		error = None

		if not error and file.name:
			file_path = os.path.join(self.__options['upload_dir'], file.name)
			append_file = not self.__options['discard_aborted_uploads'] and os.path.isfile(file_path) and file.size > os.path.getsize(file_path)

			if uploaded_file:
			# multipart/formdata uploads (POST method uploads)
				if append_file:
					dst_file = open(file_path, 'ab')
					shutil.copyfileobj(
									uploaded_file,
									dst_file
									)
				else:
					dst_file = open(file_path, 'w+b')
					shutil.copyfileobj(
									uploaded_file,
									dst_file
									)
			else:
			# Non-multipart uploads (PUT method)
			# take the request.body web2py file stream
				if append_file:
					shutil.copyfileobj(
									request.body,
									open(file_path, 'ab')
									)
				else:
					shutil.copyfileobj(
									request.body,
									open(file_path, 'w+b')
									)
			file_size = os.path.getsize(file_path)

			if file_size == file.size or not request.vars.http_x_file_name:
				file.url = self.__options['upload_url'] + file.name.replace(" ", "%20")

#				for version, options in self.__options['image_versions']:
#					if os.path.isfile(self.__options['upload_dir'] + file_name):
#						file[version + '_url'] = self.__options['upload_url'] + \
#											urllib.urlencode(file.name)

			elif self.__options['discard_aborted_uploads']:
				os.remove(file_path)
				file.error = 'abort'

			file.size = file_size
			file.delete_url = self.__options['script_url'] + \
						"?file=" + file.name.replace(" ", "%20")
			file.delete_type = 'DELETE'

		else:
			file.error = error

		return response.json([dict(**file)])

	def get(self):
		if request.vars.file:
			file_name = os.path.basename(request.vars.file)
			#file_name = strip_path_and_sanitize(request.vars.file)
			info = self.__get_file_object(file_name)
		else:
			filename = None
			info = self.__get_file_objects()
		return info

	def post(self):
		if request.vars[self.__options['param_name']].file:
			upload = Storage()
			upload.data = request.vars[self.__options['param_name']]
			upload['error'] = False
			upload['size'] = False #upload.data.file.tell()
			upload['type'] = upload.data.type
			upload.name = upload.data.filename
			# upload['file'] = upload_file.file
			# For the moment don't handle multiple files in one POST
			if request.vars.http_x_file_name:
				info = self.__handle_file_upload(
											upload.data.file,
											request.vars.http_x_file_name,
											request.vars.http_x_file_size,
											request.vars.http_x_file_type,
											upload['error']
											)
			else:
				info = self.__handle_file_upload(
											upload.data.file,
											upload['name'],
											upload['size'],
											upload['type'],
											upload['error']
											)

			return info

		def delete(self):
			file_name = os.path.basename(request.vars.file) if request.vars.file else None
			file_path = os.path.join(self.__options['upload_dir'],file_name)
			success = os.path.isfile(file_path) and file_name[0] != "." and os.remove(file_path)
			return success

# This should be inside your controller
FileUpload = UploadHandler()

@request.restful()
def fileupload():
    response.view = 'generic.json'

    def GET(*vars):
        print 'in da get'
        return FileUpload.get()

    def POST(**vars):
        print 'in da post'
        return FileUpload.post()

    def DELETE():
        return FileUpload.delete()

    return locals()




