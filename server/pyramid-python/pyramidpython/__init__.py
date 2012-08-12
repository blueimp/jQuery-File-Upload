from pyramid.config import Configurator

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.add_static_view('css', 'css', cache_max_age=3600)
    config.add_static_view('js', 'js', cache_max_age=3600)
    config.add_route('imageuploadform', '/')
    # upload processing
    # After replacing server/php/ in imageupload.pt with tal:attributes="action actionurl"
    # the following can be replaced with any URL base
    config.add_route('imageupload', '/server/php{sep:/*}{name:.*}')
    # retrieving images
    config.add_route('imageview', '/image/{name:.+}')
    config.scan()
    return config.make_wsgi_app()
