/*
 * jQuery File Upload Image Resize Plugin 1.1.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            './jquery.fileupload-process'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';
    // Prepend to the default processQueue:
    $.blueimp.fileupload.prototype.options.processQueue.push(
        {
            action: 'loadMovie',
            fileTypes: '@loadMovieFileTypes',
            maxFileSize: '@loadMovieMaxFileSize',

            disabled: '@disableMovieLoad'
        },

        {
            action: 'setMovie',
            // The name of the property the resized image
            // is saved as on the associated file object:
            name: 'preview',
            disabled: '@disableMoviePreview'
        }
    );

    // The File Upload Resize plugin extends the fileupload widget
    // with image resize functionality:
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {

        options: {
            // The regular expression for the types of images to load:
            // matched against the file type:
            loadMovieFileTypes: /^video\/(mp4|webm)$/,
            // The maximum file size of images to load:
            loadMovieMaxFileSize: 5000000000 // 5MB


        },

        processActions: {

            // Loads the image given via data.files and data.index
            // as img element if the browser supports canvas.
            // Accepts the options fileTypes (regular expression)
            // and maxFileSize (integer) to limit the files to load:
            loadMovie: function (data, options) {
                if (options.disabled) {
                    return data;
                }

                var renderMovie = function(file)
                {
                    var type = file.type;

                    var videoNode = document.createElement('video');

                    var canPlay = videoNode.canPlayType(type);

                    canPlay = (canPlay === '' ? 'no' : canPlay);

                    var message = 'Can play type "' + type + '": ' + canPlay;

                    var isError = canPlay === 'no';

                    if (isError) {
                        return dfd.rejectWith(that, [data]);
                    }

                    var fileURL = URL.createObjectURL(file);

                    videoNode.src = fileURL;
                    data.movie = videoNode;
                    videoNode.controls = true;
                    videoNode.style.width = "200px";
                    videoNode.style.height = "200px";
                    dfd.resolveWith(that, [data]);
                    return true;
                }

                var that = this,
                    file = data.files[data.index],
                    dfd = $.Deferred();
                if (($.type(options.maxFileSize) === 'number' &&
                    file.size > options.maxFileSize) ||
                    (options.fileTypes &&
                        !options.fileTypes.test(file.type)) ||
                    !renderMovie(file)
                        ) {
                    dfd.rejectWith(that, [data]);
                }
                return dfd.promise();
            },


            // Sets the resized version of the image as a property of the
            // file object, must be called after "saveImage":
            setMovie: function (data, options) {
                var img =  data.movie;
                if (img && !options.disabled) {
                    data.files[data.index][options.name] = img;
                }
                return data;
            }

        }

    });

}));
