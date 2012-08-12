import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'pyramid_debugtoolbar',
    'waitress',
    'pillow',
    ]

setup(name='pyramid-python',
      version='0.1',
      description='pyramid-python',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='Daniel Black',
      author_email='daniel.black@ingenious.com.au',
      url='https://github.com/blueimp/jQuery-File-Upload',
      keywords='web pyramid pylons jquery file upload',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=requires,
      test_suite="pyramidpython",
      entry_points = """\
      [paste.app_factory]
      main = pyramidpython:main
      """,
      )

