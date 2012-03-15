/*
 * jQuery File Upload Image Processing Plugin 1.0.6
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'load-image',
            'canvas-to-blob',
            './jquery.fileupload'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.loadImage,
            window.canvasToBlob
        );
    }
}(function ($, loadImage, canvasToBlob) {
    'use strict';

    // The File Upload IP version extends the basic fileupload widget
    // with image processing functionality:
    $.widget('blueimpIP.fileupload', $.blueimp.fileupload, {

        options: {
            // The regular expression to define which image files are to be
            // resized, given that the browser supports the operation:
            resizeSourceFileTypes: /^image\/(gif|jpeg|png)$/,
            // The maximum file size of images that are to be resized:
            resizeSourceMaxFileSize: 20000000, // 20MB
            // The maximum width of the resized images:
            resizeMaxWidth: undefined,
            // The maximum height of the resized images:
            resizeMaxHeight: undefined,
            // The minimum width of the resized images:
            resizeMinWidth: undefined,
            // The minimum height of the resized images:
            resizeMinHeight: undefined,

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // See the basic file upload widget for more information:
            add: function (e, data) {
                $(this).fileupload('resize', data).done(function () {
                    data.submit();
                });
            }
        },

        // Resizes the image file at the given index and stores the created blob
        // at the original position of the files list, returns a Promise object:
        _resizeImage: function (files, index, options) {
            var that = this,
                file = files[index],
                deferred = $.Deferred(),
                canvas,
                blob;
            options = options || this.options;
            loadImage(
                file,
                function (img) {
                    var width = img.width,
                        height = img.height;
                    canvas = loadImage.scale(img, {
                        maxWidth: options.resizeMaxWidth,
                        maxHeight: options.resizeMaxHeight,
                        minWidth: options.resizeMinWidth,
                        minHeight: options.resizeMinHeight,
                        canvas: true
                    });
                    if (width !== canvas.width || height !== canvas.height) {
                        canvasToBlob(canvas, function (blob) {
                            if (!blob.name) {
                                if (file.type === blob.type) {
                                    blob.name = file.name;
                                } else if (file.name) {
                                    blob.name = file.name.replace(
                                        /\..+$/,
                                        '.' + blob.type.substr(6)
                                    );
                                }
                            }
                            files[index] = blob;
                            deferred.resolveWith(that);
                        }, file);
                    } else {
                        deferred.resolveWith(that);
                    }
                }
            );
            return deferred.promise();
        },

        // Resizes the images given as files property of the data parameter,
        // returns a Promise object that allows to bind a done handler, which
        // will be invoked after processing all images is done:
        resize: function (data) {
            var that = this,
                options = $.extend({}, this.options, data),
                resizeAll = $.type(options.resizeSourceMaxFileSize) !== 'number',
                isXHRUpload = this._isXHRUpload(options);
            $.each(data.files, function (index, file) {
                if (isXHRUpload && that._resizeSupport &&
                        (options.resizeMaxWidth || options.resizeMaxHeight ||
                            options.resizeMinWidth || options.resizeMinHeight) &&
                        (resizeAll || file.size < options.resizeSourceMaxFileSize) &&
                        options.resizeSourceFileTypes.test(file.type)) {
                    that._processing += 1;
                    if (that._processing === 1) {
                        that.element.addClass('fileupload-processing');
                    }
                    that._processingQueue = that._processingQueue.pipe(function () {
                        var deferred = $.Deferred();
                        that._resizeImage(
                            data.files,
                            index,
                            options
                        ).done(function () {
                            that._processing -= 1;
                            if (that._processing === 0) {
                                that.element
                                    .removeClass('fileupload-processing');
                            }
                            deferred.resolveWith(that);
                        });
                        return deferred.promise();
                    });
                }
            });
            return this._processingQueue;
        },

        _create: function () {
            $.blueimp.fileupload.prototype._create.call(this);
            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this).promise();
            this._resizeSupport = canvasToBlob && canvasToBlob(
                document.createElement('canvas'),
                $.noop
            );
        }

    });

}));
