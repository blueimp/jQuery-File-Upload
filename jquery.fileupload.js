/*
 * jQuery File Upload Plugin 2.0
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
            multipart: true,
            formData: function () {
                return uploadForm.serializeArray();
            },
            withCredentials: false
        },
        documentListeners = {},
        dropZoneListeners = {},
        fileInputListeners = {},
        undef = 'undefined',
        protocolRegExp = /^http(s)?:\/\//,
        iframe,
        onInputChangeCalled,

        isXHRUploadCapable = function () {
            return typeof XMLHttpRequest !== undef && typeof File !== undef && (
                !settings.multipart || typeof FormData !== undef || typeof FileReader !== undef
            );
        },

        initEventHandlers = function () {
            documentListeners['dragenter.'  + settings.namespace] = function (e) {
                fileUpload.onDocumentDragEnter(e);
            };
            documentListeners['dragover.'   + settings.namespace] = function (e) {
                fileUpload.onDocumentDragOver(e);
            };
            documentListeners['dragleave.'  + settings.namespace] = function (e) {
                fileUpload.onDocumentDragLeave(e);
            };
            $(document).bind(documentListeners);
            dropZoneListeners['dragenter.'  + settings.namespace] = function (e) {
                fileUpload.onDragEnter(e);
            };
            dropZoneListeners['dragover.'   + settings.namespace] = function (e) {
                fileUpload.onDragOver(e);
            };
            dropZoneListeners['dragleave.'  + settings.namespace] = function (e) {
                fileUpload.onDragLeave(e);
            };
            dropZoneListeners['drop.'       + settings.namespace] = function (e) {
                fileUpload.onDrop(e);
            };
            dropZone.bind(dropZoneListeners);
            fileInputListeners['click.'     + settings.namespace] = function (e) {
                fileUpload.onInputClick(e);
            };
            fileInputListeners['change.'    + settings.namespace] = function (e) {
                fileUpload.onInputChange(e);
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
            if (typeof settings.onProgress === 'function') {
                xhr.upload.onprogress = function (e) {
                    settings.onProgress(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onLoad === 'function') {
                xhr.onload = function (e) {
                    settings.onLoad(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onAbort === 'function') {
                xhr.onabort = function (e) {
                    settings.onAbort(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onError === 'function') {
                xhr.onerror = function (e) {
                    settings.onError(e, files, index, xhr, settings);
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

        isSameDomain = function (url) {
            if (protocolRegExp.test(url)) {
                var host = location.host,
                    indexStart = location.protocol.length + 2,
                    index = url.indexOf(host, indexStart),
                    pathIndex = index + host.length;
                if ((index === indexStart || index === url.indexOf('@', indexStart) + 1) && (
                    url.length === pathIndex || $.inArray(url.charAt(pathIndex), ['/', '?', '#']))) {
                    return true;
                }
                return false;
            }
            return true;
        },

        uploadFile = function (files, index, xhr, settings) {
            var sameDomain = isSameDomain(settings.url),
                file = files[index],
                formData, fileReader;
            initUploadEventHandlers(files, index, xhr, settings);
            xhr.open(settings.method, settings.url, true);
            if (sameDomain) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            } else if (settings.withCredentials) {
                xhr.withCredentials = true;
            }
            if (!settings.multipart) {
                if (sameDomain) {
                    xhr.setRequestHeader('X-File-Name', unescape(encodeURIComponent(file.name)));
                }
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
                }, settings);
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
            if (typeof settings.onLoad === 'function') {
                iframe.unbind('load.' + settings.namespace)
                    .bind('load.' + settings.namespace, function (e) {
                    settings.onLoad(e, [{name: input.value, type: null, size: null}], 0, null, settings);
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
                }, settings);
            } else {
                legacyUpload(input, settings);
            }
        };
        
        this.onDocumentDragEnter = function (e) {
            if (typeof settings.onDocumentDragEnter === 'function') {
                if (settings.onDocumentDragEnter(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.onDocumentDragOver = function (e) {
            if (typeof settings.onDocumentDragOver === 'function') {
                if (settings.onDocumentDragOver(e) === false) {
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

        this.onDocumentDragLeave = function (e) {
            if (typeof settings.onDocumentDragLeave === 'function') {
                if (settings.onDocumentDragLeave(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.onDragEnter = function (e) {
            if (typeof settings.onDragEnter === 'function') {
                if (settings.onDragEnter(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.onDragOver = function (e) {
            if (typeof settings.onDragOver === 'function') {
                if (settings.onDragOver(e) === false) {
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

        this.onDragLeave = function (e) {
            if (typeof settings.onDragLeave === 'function') {
                if (settings.onDragLeave(e) === false) {
                    return;
                }
            }
            e.preventDefault();
        };

        this.onDrop = function (e) {
            if (typeof settings.onDrop === 'function') {
                if (settings.onDrop(e) === false) {
                    return;
                }
            }
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer && dataTransfer.files && isXHRUploadCapable()) {
                handleFiles(dataTransfer.files);
            }
            e.preventDefault();
        };
        
        this.onInputClick = function (e) {
            if (typeof settings.onInputClick === 'function') {
                if (settings.onInputClick(e) === false) {
                    return;
                }
            }
            e.target.form.reset();
            onInputChangeCalled = false;
        };
        
        this.onInputChange = function (e) {
            if (onInputChangeCalled) {
                return;
            }
            onInputChangeCalled = true;
            if (typeof settings.onInputChange === 'function') {
                if (settings.onInputChange(e) === false) {
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
                namespace = namespace ? namespace : 'file_upload';
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