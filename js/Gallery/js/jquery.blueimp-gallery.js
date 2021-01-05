/*
 * blueimp Gallery jQuery plugin
 * https://github.com/blueimp/Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    define(['jquery', './blueimp-gallery'], factory)
  } else {
    factory(window.jQuery, window.blueimp.Gallery)
  }
})(function ($, Gallery) {
  'use strict'

  // Global click handler to open links with data-gallery attribute
  // in the Gallery lightbox:
  $(document).on('click', '[data-gallery]', function (event) {
    // Get the container id from the data-gallery attribute:
    var id = $(this).data('gallery')
    var widget = $(id)
    var container =
      (widget.length && widget) || $(Gallery.prototype.options.container)
    var callbacks = {
      onopen: function () {
        container.data('gallery', this).trigger('open')
      },
      onopened: function () {
        container.trigger('opened')
      },
      onslide: function () {
        container.trigger('slide', arguments)
      },
      onslideend: function () {
        container.trigger('slideend', arguments)
      },
      onslidecomplete: function () {
        container.trigger('slidecomplete', arguments)
      },
      onclose: function () {
        container.trigger('close')
      },
      onclosed: function () {
        container.trigger('closed').removeData('gallery')
      }
    }
    var options = $.extend(
      // Retrieve custom options from data-attributes
      // on the Gallery widget:
      container.data(),
      {
        container: container[0],
        index: this,
        event: event
      },
      callbacks
    )
    // Select all links with the same data-gallery attribute:
    var links = $(this)
      .closest('[data-gallery-group], body')
      .find('[data-gallery="' + id + '"]')
    if (options.filter) {
      links = links.filter(options.filter)
    }
    return new Gallery(links, options)
  })
})
