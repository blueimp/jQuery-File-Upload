/*
 * jQuery File Upload Plugin 1.1
 *
 * Copyright 2010, Sebastian Tschan, AQUANTUM
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 *
 * https://blueimp.net
 * http://www.aquantum.de
 */

/*jslint browser: true */
/*global File, FileReader, FormData, unescape, jQuery */

(function ($) {

    var FileUpload = function (dropZone) {
        var fileUpload = this,
        uploadForm = (dropZone.is('form') ? dropZone : dropZone.find('form')),
        fileInput = dropZone.find('input:file'),
        settings = {
            namespace: 'file_upload',
            cssClass: 'file_upload',
            url: uploadForm.attr('action'),
            method: uploadForm.attr('method'),
            fieldName: fileInput.attr('name'),
            streaming: false,
            formData: function () {
                return uploadForm.serializeArray();
            }
        },
        documentListeners = {},
        dropZoneListeners = {},
        fileInputListeners = {},
        undef = 'undefined',
        iframe,
        inputChangeCalled,

        isXHRUploadCapable = function () {
            return typeof XMLHttpRequest !== undef && typeof File !== undef && (
                settings.streaming || typeof FormData !== undef || typeof FileReader !== undef
            );
        },

        initEventHandlers = function () {
            documentListeners['dragenter.'  + settings.namespace] = function (e) {
                fileUpload.documentDragEnter(e);
            };
            documentListeners['dragover.'   + settings.namespace] = function (e) {
                fileUpload.documentDragOver(e);
            };
            documentListeners['dragleave.'  + settings.namespace] = function (e) {
                fileUpload.documentDragLeave(e);
            };
            $(document).bind(documentListeners);
            dropZoneListeners['dragenter.'  + settings.namespace] = function (e) {
                fileUpload.dragEnter(e);
            };
            dropZoneListeners['dragover.'   + settings.namespace] = function (e) {
                fileUpload.dragOver(e);
            };
            dropZoneListeners['dragleave.'  + settings.namespace] = function (e) {
                fileUpload.dragLeave(e);
            };
            dropZoneListeners['drop.'       + settings.namespace] = function (e) {
                fileUpload.drop(e);
            };
            dropZone.bind(dropZoneListeners);
            fileInputListeners['click.'     + settings.namespace] = function (e) {
                fileUpload.inputClick(e);
            };
            fileInputListeners['change.'    + settings.namespace] = function (e) {
                fileUpload.inputChange(e);
            };
            fileInput.bind(fileInputListeners);
        },

        removeEventHandlers = function () {
            $.each(documentListeners, function (i, listener) {
                if (documentListeners.hasOwnProperty(listener)) {
                    $(document).unbind(listener);
                }
            });
            $.each(dropZoneListeners, function (i, listener) {
                if (dropZoneListeners.hasOwnProperty(listener)) {
                    dropZone.unbind(listener);
                }
            });
            $.each(fileInputListeners, function (i, listener) {
                if (fileInputListeners.hasOwnProperty(listener)) {
                    fileInput.unbind(listener);
                }
            });
        },

        initUploadEventHandlers = function (files, index, xhr, settings) {
            if (typeof settings.progress === 'function') {
                xhr.upload.onprogress = function (e) {
                    settings.progress(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.load === 'function') {
                xhr.onload = function (e) {
                    settings.load(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.abort === 'function') {
                xhr.onabort = function (e) {
                    settings.abort(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.error === 'function') {
                xhr.onerror = function (e) {
                    settings.error(e, files, index, xhr, settings);
                };
            }
        },

        getFormData = function (settings) {
            if (typeof settings.formData === 'function') {
                return settings.formData();
            } else if ($.isArray(settings.formData)) {
                return settings.formData;
            } else if (settings.formData) {
                var formData = [];
                $.each(settings.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        buildMultiPartFormData = function (boundary, file, fileContent, fields) {
            var doubleDash = '--',
                crlf     = '\r\n',
                formData = '';
            $.each(fields, function (index, field) {
                formData += doubleDash + boundary + crlf +
                    'Content-Disposition: form-data; name="' +
                    unescape(encodeURIComponent(field.name)) +
                    '"' + crlf + crlf +
                    unescape(encodeURIComponent(field.value)) + crlf;
            });
            formData += doubleDash + boundary + crlf +
                'Content-Disposition: form-data; name="' +
                unescape(encodeURIComponent(settings.fieldName)) +
                '"; filename="' + unescape(encodeURIComponent(file.name)) + '"' + crlf +
                'Content-Type: ' + file.type + crlf + crlf +
                fileContent + crlf +
                doubleDash + boundary + doubleDash + crlf;
            return formData;
        },

        uploadFile = function (files, index, xhr, settings) {
            var file = files[index],
                formData, fileReader;
            initUploadEventHandlers(files, index, xhr, settings);
            xhr.open(settings.method, settings.url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (settings.streaming) {
                xhr.setRequestHeader('X-File-Name', unescape(encodeURIComponent(file.name)));
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            } else {
                if (typeof FormData !== undef) {
                    formData = new FormData();
                    $.each(getFormData(settings), function (index, field) {
                        formData.append(field.name, field.value);
                    });
                    formData.append(settings.fieldName, file);
                    xhr.send(formData);
                } else if (typeof FileReader !== undef) {
                    fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        var fileContent = e.target.result,
                            boundary = '----MultiPartFormBoundary' + (new Date()).getTime();
                        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
                        xhr.sendAsBinary(buildMultiPartFormData(
                            boundary,
                            file,
                            fileContent,
                            getFormData(settings)
                        ));
                    };
                    fileReader.readAsBinaryString(file);
                } else {
                    $.error('Browser does neither support FormData nor FileReader interface');
                }
            }
        },

        handleFile = function (files, index) {
            var xhr = new XMLHttpRequest();
            if (typeof settings.init === 'function') {
                settings.init(files, index, xhr, function (options) {
                    uploadFile(files, index, xhr, $.extend({}, settings, options));
                });
            } else {
                uploadFile(files, index, xhr, settings);
            }
        },

        handleFiles = function (files) {
            for (var i = 0; i < files.length; i += 1) {
                handleFile(files, i);
            }
        },

        legacyUpload = function (input, settings) {
            uploadForm.attr('action', settings.url)
                .attr('target', iframe.attr('name'));
            if (typeof settings.load === 'function') {
                iframe.unbind('load.' + settings.namespace)
                    .bind('load.' + settings.namespace, function (e) {
                    settings.load(e, [{name: input.value, type: null, size: null}], 0, null, settings);
                });
            }
            var formData = getFormData(settings);
            uploadForm.find(':input[type!=file]').not(':disabled')
                .attr('disabled', true).addClass(settings.namespace + '_disabled');
            $.each(formData, function (index, field) {
                uploadForm.append(
                    $('<input type="hidden"/>')
                        .attr('name', field.name).val(field.value)
                        .addClass(settings.namespace + '_form_data')
                );
            });
            uploadForm.get(0).submit();
            uploadForm.find('.' + settings.namespace + '_disabled')
                .removeAttr('disabled').removeClass(settings.namespace + '_disabled');
            uploadForm.find('.' + settings.namespace + '_form_data').remove();
        },

        handleLegacyUpload = function (input) {
            if (typeof settings.init === 'function') {
                settings.init([{name: input.value, type: null, size: null}], 0, null, function (options) {
                    legacyUpload(input, $.extend({}, settings, options));
                });
            } else {
                legacyUpload(input, settings);
            }
        };
        
        this.documentDragEnter = function (e) {
            if (typeof settings.documentDragEnter === 'function') {
                if (settings.documentDragEnter(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.documentDragOver = function (e) {
            if (typeof settings.documentDragOver === 'function') {
                if (settings.documentDragOver(e) === false) {
                    return;
                }
            }
            var dataTransfer = e.originalEvent.dataTransfer,
                target = e.originalEvent.target;
            if (dataTransfer && dropZone.get(0) !== target && !dropZone.has(target).length) {
                dataTransfer.dropEffect = 'none';
            }
            e.preventDefault();
        };

        this.documentDragLeave = function (e) {
            if (typeof settings.documentDragLeave === 'function') {
                if (settings.documentDragLeave(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.dragEnter = function (e) {
            if (typeof settings.dragEnter === 'function') {
                if (settings.dragEnter(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.dragOver = function (e) {
            if (typeof settings.dragOver === 'function') {
                if (settings.dragOver(e) === false) {
                    return;
                }
            }
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer) {
                dataTransfer.dropEffect = dataTransfer.effectAllowed = 'copy';
            }
            e.preventDefault();
            e.stopPropagation();
        };

        this.dragLeave = function (e) {
            if (typeof settings.dragLeave === 'function') {
                if (settings.dragLeave(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.drop = function (e) {
            if (typeof settings.drop === 'function') {
                if (settings.drop(e) === false) {
                    return;
                }
            }
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer && dataTransfer.files && isXHRUploadCapable()) {
                handleFiles(dataTransfer.files);
            }
            e.preventDefault();
        };
        
        this.inputClick = function (e) {
            if (typeof settings.inputClick === 'function') {
                if (settings.inputClick(e) === false) {
                    return;
                }
            }
            e.target.form.reset();
            inputChangeCalled = false;
        };
        
        this.inputChange = function (e) {
            if (inputChangeCalled) {
                return;
            }
            inputChangeCalled = true;
            if (typeof settings.inputChange === 'function') {
                if (settings.inputChange(e) === false) {
                    return;
                }
            }
            if (e.target.files && isXHRUploadCapable()) {
                handleFiles(e.target.files);
            } else {
                handleLegacyUpload(e.target);
            }
        };

        this.init = function (options) {
            if (options) {
                $.extend(settings, options);
            }
            if (dropZone.data(settings.namespace)) {
                $.error('FileUpload with namespace "' + settings.namespace + '" already assigned to this element');
                return;
            }
            dropZone.data(settings.namespace, fileUpload)
                .addClass(settings.cssClass);
            if (!isXHRUploadCapable()) {
                // javascript:false as iframe src prevents warning popups on HTTPS in IE6:
                iframe = $('<iframe src="javascript:false;" name="iframe_' + settings.namespace + '"></iframe>')
                    .appendTo(dropZone);
            }
            initEventHandlers();
        };
        
        this.destroy = function () {
            removeEventHandlers();
            dropZone.removeData(settings.namespace)
                .removeClass(settings.cssClass)
                .find('iframe[name=iframe_' + settings.namespace + ']')
                .unbind('load.' + settings.namespace).remove();
        };
    },

    methods = {
        init : function (options) {
            return this.each(function () {
                (new FileUpload($(this))).init(options);
            });
        },
                
        destroy : function (namespace) {
            return this.each(function () {
                namespace = namespace ? namespace : 'fileUpload';
                var fileUpload = $(this).data(namespace);
                if (fileUpload) {
                    fileUpload.destroy();
                } else {
                    $.error('No FileUpload with namespace "' + namespace + '" assigned to this element');
                }
            });

        }
    };
    
    $.fn.fileUpload = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.fileUpload');
        }
    };
    
}(jQuery));