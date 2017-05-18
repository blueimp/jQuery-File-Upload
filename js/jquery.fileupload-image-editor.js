/*
 * jQuery File Upload Image Editor Plugin
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, require, window */
;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'cropper',
            './jquery.fileupload-image'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS:
        factory(
            require('jquery'),
            require('cropper'),
            require('./jquery.fileupload-image')
        );
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.loadImage
        );
    }
}(function ($, loadImage) {
    'use strict';
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
        options: {
            uploadImageEditorTarget: '#upload-image-editor',
            uploadImageEditorPreviewSelector: 'click .preview',
            cropperOptions: {
                aspectRatio: 16 / 9
            }
        },
        _initSpecialOptions: function () {
            this._super();
            this._initCropperContainer();
        },
        _initCropperContainer: function () {
            var $editor = $(this.options.uploadImageEditorTarget);
            
            $editor.data('options',this.options);
            
            
            $editor.on('shown.bs.modal', this._showEditor);
            $editor.on('hide.bs.modal', this._hideEditor);

            var $image = $editor.find('.cropper-img');
            var thiz = this;
            $editor.find('button.save').on('click', function () {
                var data = $editor.data('data');

                data.canvas = $image.cropper('getCroppedCanvas');

                var actions = thiz.processActions;
                var options = thiz.options;
                actions.saveImage(data, {}).then(function () {
                    data.files[0].name = $editor.find('input.filename').val() + $editor.data('extension');

                    actions.saveImageMetaData(data, {});
                    var resizeOptions = {
                        maxWidth: options.previewMaxWidth,
                        maxHeight: options.previewMaxHeight,
                        minWidth: options.previewMinWidth,
                        minHeight: options.previewMinHeight,
                        crop: options.previewCrop,
                        orientation: options.previewOrientation,
                        forceResize: options.previewForceResize
                    };
                    actions.resizeImage(data, resizeOptions).then(function () {
                        var imageOptions = {imagePreviewName: options.imagePreviewName};
                        actions.setImage(data, imageOptions);
                        actions.deleteImageReferences(data, {});

                        // Replace preview image
                        data.context.find('.preview').each(function (index, elm) {
                            $(elm).empty();
                            $(elm).append(data.files[index].preview);
                        });
                        data.context.find('.size').text(
                            thiz._formatFileSize(data.files[0].size)
                        );
                        data.context.find('.name').text(
                            data.files[0].name
                        );

                        $editor.modal('hide');
                    });
                });
            });
            $('.docs-buttons').on('click', '[data-method]', function () {
                var $this = $(this);
                var data = $this.data();
                var $target;
                if ($this.prop('disabled') || $this.hasClass('disabled')) {
                    return;
                }

                if ($image.data('cropper') && data.method) {
                    data = $.extend({}, data); // Clone a new one

                    if (typeof data.target !== 'undefined') {
                        $target = $(data.target);

                        if (typeof data.option === 'undefined') {
                            try {
                                data.option = JSON.parse($target.val());
                            } catch (e) {}
                        }
                    }

                    if (data.method === 'rotate') {
                        $image.cropper('clear');
                    }
                    $image.cropper(data.method, data.option, data.secondOption);
                    if (data.method === 'rotate') {
                        $image.cropper('crop');
                    }
                }
            });
        },
        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        },
        _initEventHandlers: function () {
            this._super();

            var handlers = {};
            handlers[this.options.uploadImageEditorPreviewSelector] = this._previewHandler.bind(this);

            this._on(this.options.filesContainer, handlers);
        },
        _hideEditor: function () {
            var $editor = $(this);
            
            var targetImg = $editor.find('img');
            if (targetImg.data('cropper')) {
                targetImg.cropper('destroy');
                $editor.data('data', null);
            }
        },
        _showEditor: function () {
            // This = editor
            var $editor = $(this);
            
            var targetImg = $editor.find('img');
            
            var options = $editor.data('options');   
            
            var cropperOptions = $.extend({
                aspectRatio: 16 / 9
            }, options.cropperOptions);
            targetImg.cropper(cropperOptions);

            var filename = $editor.data('data').files[0].name;
            var extension = filename.substring(filename.lastIndexOf('.'));
            filename = filename.substring(0, filename.length - extension.length);

            $editor.data('extension', extension);
            $editor.find('input.filename').val(filename);
        },
        _previewHandler: function (e) {
            e.preventDefault();

            var preview = $(e.currentTarget),
                template = preview.closest('.template-upload'),
                data = template.data('data');

            if (!data){
                return; // Not an upload preview
            }
            
            var $editor = $(this.options.uploadImageEditorTarget); 
            if(!$editor){
                return;
            }
            $editor.data('data', data);
            data.index = 0;
            var file = data.files[0];

            loadImage.readFile(file, function (e) {
                var targetImg = $editor.find('img');
                targetImg[0].src = e.target.result;
                $editor.modal();
            });
        }
    });
}));