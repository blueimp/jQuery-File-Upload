/*
 * jQuery Image Gallery Plugin 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*global jQuery, window, document */

(function ($) {
    'use strict';

    // The Image Gallery plugin makes use of jQuery's live method to attach
    // a click handler for all elements that match the selector of the given
    // jQuery collection, now and in the future:
    // 
    // $('a[rel^=gallery]').imagegallery();
    // 
    // The click handler opens the linked images in a jQuery UI dialog.
    // The options object given to the imagegallery method is passed to the
    // jQuery UI dialog initialization and allows to set any dialog options:
    // 
    // $('a[rel^=gallery]').imagegallery({
    //     open: function (event, ui) {/* called on dialogopen */},
    //     title: 'Image Gallery' // Sets the dialog title
    // });
    // 
    // The click event listeners can be removed by calling the imagegallery
    // method with "destroy" as first argument, using the same selector for
    // the jQuery collection:
    // 
    // $('a[rel^=gallery]').imagegallery('destroy', options);
    // 
    // To directly open an image with gallery functionality, the imagegallery
    // method can be called with "open" as first argument:
    // 
    // $('a[rel^=gallery]').imagegallery('open');
    // 
    // The selector for related images can be overriden with the "selector"
    // option.
    // The namespace used for the click event listeners can be overriden
    // with the "namespace" option.
    
    $.fn.imagegallery = function (options, opts) {
        opts = $.extend({
            namespace: 'imagegallery',
            selector: $(this).selector
        }, opts);
        if (typeof options === 'string') {
            if (options === 'destroy') {
                $(opts.selector).die('click.' + opts.namespace);
            } else if (options === 'open') {
                $.fn.imagegallery.open(this, opts);
            }
            return this;
        }
        options = $.extend(opts, options);
        $(options.selector).live('click.' + options.namespace, function (e) {
            e.preventDefault();
            $.fn.imagegallery.open(this, options);
        });
        return this;
    };
    
    // Scales the given image (img HTML element) using the given arguments.
    // Returns a canvas object if useCanvas is true and the browser supports
    // canvas, else the scaled image:
    $.fn.imagegallery.scale = function (img, maxWidth, maxHeight, useCanvas) {
        var canvas = document.createElement('canvas'),
            scale = Math.min(
                (maxWidth || img.width) / img.width,
                (maxHeight || img.height) / img.height
            );
        if (scale > 1) {
            scale = 1;
        }
        img.width = parseInt(img.width * scale, 10);
        img.height = parseInt(img.height * scale, 10);
        if (!useCanvas || !canvas.getContext) {
            return img;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')
            .drawImage(img, 0, 0, img.width, img.height);
        return canvas;
    };

    // Opens the image of the given link in a jQuery UI dialog
    // and provides gallery functionality for related images:
    $.fn.imagegallery.open = function (link, options) {
        link = link instanceof $ ? link[0] : link;
        var rel = link.rel || 'gallery',
            className = rel.replace(/\W/g, '-') + '-dialog',
            links = $((options && options.selector) || 'a[rel="' + rel + '"]'),
            prevLink,
            nextLink,
            // The loader is displayed until the image has loaded
            // and the dialog has been opened:
            loader = $('<div class="' + className + '-loader"></div>')
                .hide().appendTo('body').fadeIn();
        options = $.extend({
            namespace: 'imagegallery',
            modal: true,
            resizable: false,
            width: 'auto',
            height: 'auto',
            show: 'fade',
            hide: 'fade',
            title: link.title ||
                decodeURIComponent(link.href.split('/').pop()),
            dialogClass: className
        }, options);
        links.each(function (index) {
            // Check the next and next but one link, to account for
            // thumbnail and name linking twice to the same image:
            if ((links[index + 1] === link || links[index + 2] === link) &&
                    this.href !== link.href) {
                prevLink = this; 
            }
            if ((links[index - 1] === link || links[index - 2] === link) &&
                    this.href !== link.href) {
                nextLink = this;
                return false;
            }
        });
        if (!prevLink) {
            prevLink = links[links.length - 1];
        }
        if (!nextLink) {
            nextLink = links[0];
        }
        $('<img>').bind('load error', function (e) {
            var dialog = $('<div></div>'),
                wheelCounter = 0,
                keyHandler = function (e) {
                    switch (e.which) {
                    case 37: // left
                    case 38: // up
                        dialog.trigger(
                            $.Event('click', {altKey: true})
                        );
                        return false;
                    case 39: // right
                    case 40: // down
                        dialog.click();
                        return false;
                    }
                },
                wheelHandler = function (e) {
                    wheelCounter = wheelCounter + (e.wheelDelta || e.detail || 0);
                    if ((e.wheelDelta && wheelCounter >= 120) ||
                            (!e.wheelDelta && wheelCounter < 0)) {
                        dialog.trigger(
                            $.Event('click', {altKey: true})
                        );
                        wheelCounter = 0;
                    } else if ((e.wheelDelta && wheelCounter <= -120) ||
                                (!e.wheelDelta && wheelCounter > 0)) {
                        dialog.click();
                        wheelCounter = 0;
                    }
                    return false;
                },
                closeDialog = function () {
                    dialog.dialog('close');
                    $(document).unbind(
                        'keydown.' + options.namespace,
                        keyHandler
                    );
                    $(document).unbind(
                        'mousewheel.' + options.namespace +
                            ', DOMMouseScroll.' + options.namespace,
                        wheelHandler
                    );
                },
                scaledImage;
            if (e.type === 'error') {
                scaledImage = this;
                dialog.addClass('ui-state-error');
            } else {
                scaledImage = $.fn.imagegallery.scale(
                    this,
                    $(window).width() - 100,
                    $(window).height() - 100,
                    options.canvas
                );
            }
            $(document).bind(
                'keydown.' + options.namespace,
                keyHandler
            );
            $(document).bind(
                'mousewheel.' + options.namespace +
                    ', DOMMouseScroll.' + options.namespace,
                wheelHandler
            );
            dialog.bind({
                click: function (e) {
                    dialog.unbind('click').fadeOut();
                    var newLink = (e.altKey && prevLink) || nextLink;
                    if (newLink.href !== link.href) {
                        options.callback = closeDialog;
                        $.fn.imagegallery.open(newLink, options);
                    } else {
                        closeDialog();
                    }
                },
                dialogopen: function () {
                    if (typeof options.callback === 'function') {
                        options.callback();
                    }
                    $('.ui-widget-overlay:last').click(closeDialog);
                },
                dialogclose: function () {
                    $(this).remove();
                }
            }).css('cursor', 'pointer').append(
                scaledImage
            ).appendTo('body').dialog(options);
            loader.fadeOut(function () {
                loader.remove();
            });
        }).prop('src', link.href);
        // Preload the next and previous images:
        $('<img>').prop('src', nextLink.href);
        $('<img>').prop('src', prevLink.href);
    };

}(jQuery));