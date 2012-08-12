This is a server side demonstration of jQuery-File-Upload using pyramid.

This has been based on the gae-python and php server implementations already developed and borrows heavily on their implimenations.

# To setup an environment:

virtualenv env
source env/bin/activate

Install libjpeg and zlib development versions to support jpeg and png thumbnails respectively.
# e.g:
# yum install libjpeg-turbo-devel zlib-devel
# apt-get install libjpeg62-dev zlib1g-dev

# to install all the dependancies
python setup.py develop

# To run the service

pserve demo.ini

Then access the demo on http://0.0.0.0:6543
