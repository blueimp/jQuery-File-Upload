/*
 * jQuery File Upload User Interface Plugin 4.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint browser: true */
/*global jQuery, FileReader, URL, webkitURL */

(function ($) {

    var undef = 'undefined',
        func = 'function',
        UploadHandler,
        methods,

        MultiLoader = function (callBack) {
            var loaded = 0,
                list = [];
            this.complete = function () {
                loaded += 1;
                if (loaded === list.length + 1) {
                    // list.length * onComplete + 1 * onLoadAll
                    callBack(list);
                    loaded = 0;
                    list = [];
                }
            };
            this.push = function (item) {
                list.push(item);
            };
            this.getList = function () {
                return list;
            };
        };
        
    UploadHandler = function (container, options) {
        var uploadHandler = this,
            dragOverTimeout,
            isDropZoneEnlarged,
            multiLoader = new MultiLoader(function (list) {
                uploadHandler.hideProgressBarAll(function () {
                    uploadHandler.resetProgressBarAll();
                    if (typeof uploadHandler.onCompleteAll === func) {
                        uploadHandler.onCompleteAll(list);
                    }
                });
            }),
            getUploadTable = function (handler) {
                return typeof handler.uploadTable === func ?
                    handler.uploadTable(handler) : handler.uploadTable;
            },
            getDownloadTable = function (handler) {
                return typeof handler.downloadTable === func ?
                    handler.downloadTable(handler) : handler.downloadTable;
            };
        
        this.requestHeaders = {'Accept': 'application/json, text/javascript, */*; q=0.01'};
        this.dropZone = container;
        this.imageTypes = /^image\/(gif|jpeg|png)$/;
        this.previewMaxWidth = this.previewMaxHeight = 80;
        this.previewLoadDelay = 100;
        this.previewAsCanvas = true;
        this.previewSelector = '.file_upload_preview';
        this.progressSelector = '.file_upload_progress div';
        this.cancelSelector = '.file_upload_cancel button';
        this.cssClassSmall = 'file_upload_small';
        this.cssClassLarge = 'file_upload_large';
        this.cssClassHighlight = 'file_upload_highlight';
        this.dropEffect = 'highlight';
        this.uploadTable = this.downloadTable = null;
        this.buildUploadRow = this.buildDownloadRow = null;
        this.progressAllNode = null;

        this.loadImage = function (file, callBack, maxWidth, maxHeight, imageTypes, noCanvas) {
            var img,
                scaleImage,
                urlAPI,
                fileReader;
            if (imageTypes && !imageTypes.test(file.type)) {
                return null;
            }
            scaleImage = function (img) {
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
                if (noCanvas || typeof canvas.getContext !== func) {
                    return img;
                }
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                return canvas;
            };
            img = document.createElement('img');
            urlAPI = typeof URL !== undef ? URL : typeof webkitURL !== undef ? webkitURL : null;
            if (urlAPI && typeof urlAPI.createObjectURL === func) {
                img.onload = function () {
                    urlAPI.revokeObjectURL(this.src);
                    callBack(scaleImage(img));
                };
                img.src = urlAPI.createObjectURL(file);
            } else if (typeof FileReader !== undef &&
                    typeof FileReader.prototype.readAsDataURL === func) {
                img.onload = function () {
                    callBack(scaleImage(img));
                };
                fileReader = new FileReader();
                fileReader.onload = function (e) {
                    img.src = e.target.result;
                };
                fileReader.readAsDataURL(file);
            } else {
                callBack(null);
            }
        };

        this.addNode = function (parentNode, node, callBack) {
            if (parentNode && node) {
                node.css('display', 'none').appendTo(parentNode).fadeIn(function () {
                    if (typeof callBack === func) {
                        try {
                            callBack();
                        } catch (e) {
                            // Fix endless exception loop:
                            node.stop();
                            throw e;
                        }
                    }
                });
            } else if (typeof callBack === func) {
                callBack();
            }
        };

        this.removeNode = function (node, callBack) {
            if (node) {
                node.fadeOut(function () {
                    node.remove();
                    if (typeof callBack === func) {
                        try {
                            callBack();
                        } catch (e) {
                            // Fix endless exception loop:
                            node.stop();
                            throw e;
                        }
                    }
                });
            } else if (typeof callBack === func) {
                callBack();
            }
        };
        
        this.replaceNode = function (oldNode, newNode, callBack) {
            if (oldNode && newNode) {
                oldNode.fadeOut(function () {
                    newNode.css('display', 'none');
                    oldNode.replaceWith(newNode);
                    newNode.fadeIn(function () {
                        if (typeof callBack === func) {
                            try {
                                callBack();
                            } catch (e) {
                                // Fix endless exception loop:
                                oldNode.stop();
                                newNode.stop();
                                throw e;
                            }
                        }
                    });
                });
            } else if (typeof callBack === func) {
                callBack();
            }
        };

        this.resetProgressBarAll = function () {
            if (uploadHandler.progressbarAll) {
                uploadHandler.progressbarAll.progressbar(
                    'value',
                    0
                );
            }
        };

        this.hideProgressBarAll = function (callBack) {
            if (uploadHandler.progressbarAll && !$(getUploadTable(uploadHandler))
                    .find(uploadHandler.progressSelector + ':visible:first').length) {
                uploadHandler.progressbarAll.fadeOut(callBack);
            } else if (typeof callBack === func) {
                callBack();
            }
        };

        this.onAbort = function (event, files, index, xhr, handler) {
            handler.removeNode(handler.uploadRow, handler.hideProgressBarAll);
        };
        
        this.cancelUpload = function (event, files, index, xhr, handler) {
            var readyState = xhr.readyState;
            xhr.abort();
            // If readyState is below 2, abort() has no effect:
            if (typeof readyState !== 'number' || readyState < 2) {
                handler.onAbort(event, files, index, xhr, handler);
            }
        };
        
        this.initProgressBar = function (node, value) {
            if (!node || !node.length) {
                return null;
            }
            if (typeof node.progressbar === func) {
                return node.progressbar({
                    value: value
                });
            } else {
                node.addClass('progressbar')
                    .append($('<div/>').css('width', value + '%'))
                    .progressbar = function (key, value) {
                        return this.each(function () {
                            if (key === 'destroy') {
                                $(this).removeClass('progressbar').empty();
                            } else {
                                $(this).children().css('width', value + '%');
                            }
                        });
                    };
                return node;
            }
        };
        
        this.destroyProgressBar = function (node) {
            if (!node || !node.length) {
                return null;
            }
            return node.progressbar('destroy');
        };
        
        this.initUploadProgress = function (xhr, handler) {
            if (!xhr.upload && handler.progressbar) {
                handler.progressbar.progressbar(
                    'value',
                    100 // indeterminate progress displayed by a full animated progress bar
                );
            }
        };

        this.initUploadProgressAll = function () {
            if (uploadHandler.progressbarAll && uploadHandler.progressbarAll.is(':hidden')) {
                uploadHandler.progressbarAll.fadeIn();
            }
        };

        this.onSend = function (event, files, index, xhr, handler) {
            handler.initUploadProgress(xhr, handler);
        };

        this.onProgress = function (event, files, index, xhr, handler) {
            if (handler.progressbar && event.lengthComputable) {
                handler.progressbar.progressbar(
                    'value',
                    parseInt(event.loaded / event.total * 100, 10)
                );
            }
        };

        this.onProgressAll = function (event, list) {
            if (uploadHandler.progressbarAll && event.lengthComputable) {
                uploadHandler.progressbarAll.progressbar(
                    'value',
                    parseInt(event.loaded / event.total * 100, 10)
                );
            }
        };

        this.onLoadAll = function (list) {
            multiLoader.complete();
        };

        this.initProgressBarAll = function () {
            if (!uploadHandler.progressbarAll) {
                uploadHandler.progressbarAll = uploadHandler.initProgressBar(
                    (typeof uploadHandler.progressAllNode === func ?
                    uploadHandler.progressAllNode(uploadHandler) : uploadHandler.progressAllNode),
                    0
                );
            }
        };
        
        this.destroyProgressBarAll = function () {
            uploadHandler.destroyProgressBar(uploadHandler.progressbarAll);
        };

        this.initUploadRow = function (event, files, index, xhr, handler) {
            var uploadRow = handler.uploadRow = (typeof handler.buildUploadRow === func ?
                handler.buildUploadRow(files, index, handler) : null);
            if (uploadRow) {
                handler.progressbar = handler.initProgressBar(
                    uploadRow.find(handler.progressSelector),
                    0
                );
                uploadRow.find(handler.cancelSelector).click(function (e) {
                    handler.cancelUpload(e, files, index, xhr, handler);
                    e.preventDefault();
                });
                uploadRow.find(handler.previewSelector).each(function () {
                    var previewNode = $(this),
                        file = files[index];
                    if (file) {
                        setTimeout(function () {
                            handler.loadImage(
                                file,
                                function (img) {
                                    handler.addNode(
                                        previewNode,
                                        $(img)
                                    );
                                },
                                handler.previewMaxWidth,
                                handler.previewMaxHeight,
                                handler.imageTypes,
                                !handler.previewAsCanvas
                            );
                        }, handler.previewLoadDelay);
                    }
                });
            }
        };
        
        this.initUpload = function (event, files, index, xhr, handler, callBack) {
            handler.initUploadRow(event, files, index, xhr, handler);
            handler.addNode(
                getUploadTable(handler),
                handler.uploadRow,
                function () {
                    if (typeof handler.beforeSend === func) {
                        handler.beforeSend(event, files, index, xhr, handler, callBack);
                    } else {
                        callBack();
                    }
                }
            );
            handler.initUploadProgressAll();
        };
        
        this.parseResponse = function (xhr) {
            if (typeof xhr.responseText !== undef) {
                return $.parseJSON(xhr.responseText);
            } else {
                // Instead of an XHR object, an iframe is used for legacy browsers:
                return $.parseJSON(xhr.contents().text());
            }
        };
        
        this.initDownloadRow = function (event, files, index, xhr, handler) {
            var json, downloadRow;
            try {
                json = handler.response = handler.parseResponse(xhr);
                downloadRow = handler.downloadRow = (typeof handler.buildDownloadRow === func ?
                    handler.buildDownloadRow(json, handler) : null);
            } catch (e) {
                if (typeof handler.onError === func) {
                    handler.originalEvent = event;
                    handler.onError(e, files, index, xhr, handler);
                } else {
                    throw e;
                }
            }
        };
        
        this.onLoad = function (event, files, index, xhr, handler) {
            var uploadTable = getUploadTable(handler),
                downloadTable = getDownloadTable(handler),
                callBack = function () {
                    if (typeof handler.onComplete === func) {
                        handler.onComplete(event, files, index, xhr, handler);
                    }
                    multiLoader.complete();
                };
            multiLoader.push(Array.prototype.slice.call(arguments, 1));
            handler.initDownloadRow(event, files, index, xhr, handler);
            if (uploadTable && (!downloadTable || uploadTable.get(0) === downloadTable.get(0))) {
                handler.replaceNode(handler.uploadRow, handler.downloadRow, callBack);
            } else {
                handler.removeNode(handler.uploadRow, function () {
                    handler.addNode(
                        downloadTable,
                        handler.downloadRow,
                        callBack
                    );
                });
            }
        };

        this.dropZoneEnlarge = function () {
            if (!isDropZoneEnlarged) {
                if (typeof uploadHandler.dropZone.switchClass === func) {
                    uploadHandler.dropZone.switchClass(
                        uploadHandler.cssClassSmall,
                        uploadHandler.cssClassLarge
                    );
                } else {
                    uploadHandler.dropZone.addClass(uploadHandler.cssClassLarge);
                    uploadHandler.dropZone.removeClass(uploadHandler.cssClassSmall);
                }
                isDropZoneEnlarged = true;
            }
        };
        
        this.dropZoneReduce = function () {
            if (typeof uploadHandler.dropZone.switchClass === func) {
                uploadHandler.dropZone.switchClass(
                    uploadHandler.cssClassLarge,
                    uploadHandler.cssClassSmall
                );
            } else {
                uploadHandler.dropZone.addClass(uploadHandler.cssClassSmall);
                uploadHandler.dropZone.removeClass(uploadHandler.cssClassLarge);
            }
            isDropZoneEnlarged = false;
        };

        this.onDocumentDragEnter = function (event) {
            uploadHandler.dropZoneEnlarge();
        };
        
        this.onDocumentDragOver = function (event) {
            if (dragOverTimeout) {
                clearTimeout(dragOverTimeout);
            }
            dragOverTimeout = setTimeout(function () {
                uploadHandler.dropZoneReduce();
            }, 200);
        };
        
        this.onDragEnter = this.onDragLeave = function (event) {
            uploadHandler.dropZone.toggleClass(uploadHandler.cssClassHighlight);
        };
        
        this.onDrop = function (event) {
            if (dragOverTimeout) {
                clearTimeout(dragOverTimeout);
            }
            if (uploadHandler.dropEffect && typeof uploadHandler.dropZone.effect === func) {
                uploadHandler.dropZone.effect(uploadHandler.dropEffect, function () {
                    uploadHandler.dropZone.removeClass(uploadHandler.cssClassHighlight);
                    uploadHandler.dropZoneReduce();
                });
            } else {
                uploadHandler.dropZone.removeClass(uploadHandler.cssClassHighlight);
                uploadHandler.dropZoneReduce();
            }
        };

        this.init = function () {
            uploadHandler.initProgressBarAll();
        };
        
        this.destroy = function () {
            uploadHandler.destroyProgressBarAll();
        };

        $.extend(this, options);
    };

    methods = {
        init : function (options) {
            return this.each(function () {
                $(this).fileUpload(new UploadHandler($(this), options))
                    .fileUploadUI('option', 'init', undefined, options.namespace)();
            });
        },
        
        option: function (option, value, namespace) {
            if (!option || (typeof option === 'string' && typeof value === undef)) {
                return $(this).fileUpload('option', option, value, namespace);
            }
            return this.each(function () {
                $(this).fileUpload('option', option, value, namespace);
            });
        },
            
        destroy : function (namespace) {
            return this.each(function () {
                $(this).fileUploadUI('option', 'destroy', undefined, namespace)();
                $(this).fileUpload('destroy', namespace);
            });
        },
        
        upload: function (files, namespace) {
            return this.each(function () {
                $(this).fileUpload('upload', files, namespace);
            });
        }
    };
    
    $.fn.fileUploadUI = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' + method + '" does not exist on jQuery.fileUploadUI');
        }
    };
    
}(jQuery));