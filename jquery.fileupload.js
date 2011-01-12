/*
 * jQuery File Upload Plugin 3.1
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
        func = 'function',
        protocolRegExp = /^http(s)?:\/\//,
        onInputChangeCalled,

        isXHRUploadCapable = function () {
            return typeof XMLHttpRequest !== undef && typeof File !== undef && (
                !settings.multipart || typeof FormData !== undef || typeof FileReader !== undef
            );
        },

        initEventHandlers = function () {
            if (typeof settings.onDocumentDragEnter === func) {
                documentListeners['dragenter.' + settings.namespace] = settings.onDocumentDragEnter;
            }
            if (typeof settings.onDocumentDragLeave === func) {
                documentListeners['dragleave.' + settings.namespace] = settings.onDocumentDragLeave;
            }
            documentListeners['dragover.'   + settings.namespace] = fileUpload.onDocumentDragOver;
            documentListeners['drop.'       + settings.namespace] = fileUpload.onDocumentDrop;
            $(document).bind(documentListeners);
            if (typeof settings.onDragEnter === func) {
                dropZoneListeners['dragenter.' + settings.namespace] = settings.onDragEnter;
            }
            if (typeof settings.onDragLeave === func) {
                dropZoneListeners['dragleave.' + settings.namespace] = settings.onDragLeave;
            }
            dropZoneListeners['dragover.'   + settings.namespace] = fileUpload.onDragOver;
            dropZoneListeners['drop.'       + settings.namespace] = fileUpload.onDrop;
            dropZone.bind(dropZoneListeners);
            fileInputListeners['click.'     + settings.namespace] = fileUpload.onInputClick;
            fileInputListeners['change.'    + settings.namespace] = fileUpload.onInputChange;
            fileInput.bind(fileInputListeners);
        },

        removeEventHandlers = function () {
            $.each(documentListeners, function (key, value) {
                $(document).unbind(key, value);
            });
            $.each(dropZoneListeners, function (key, value) {
                dropZone.unbind(key, value);
            });
            $.each(fileInputListeners, function (key, value) {
                fileInput.unbind(key, value);
            });
        },

        initUploadEventHandlers = function (files, index, xhr, settings) {
            if (typeof settings.onProgress === func) {
                xhr.upload.onprogress = function (e) {
                    settings.onProgress(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onLoad === func) {
                xhr.onload = function (e) {
                    settings.onLoad(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onAbort === func) {
                xhr.onabort = function (e) {
                    settings.onAbort(e, files, index, xhr, settings);
                };
            }
            if (typeof settings.onError === func) {
                xhr.onerror = function (e) {
                    settings.onError(e, files, index, xhr, settings);
                };
            }
        },

        getFormData = function (settings) {
            if (typeof settings.formData === func) {
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

        handleFile = function (event, files, index) {
            var xhr = new XMLHttpRequest(),
                uploadSettings = $.extend({}, settings);
            if (typeof settings.initUpload === func) {
                settings.initUpload(
                    event,
                    files,
                    index,
                    xhr,
                    uploadSettings,
                    function () {
                        uploadFile(files, index, xhr, uploadSettings);
                    }
                );
            } else {
                uploadFile(files, index, xhr, uploadSettings);
            }
        },

        handleFiles = function (event, files) {
            var i;
            for (i = 0; i < files.length; i += 1) {
                handleFile(event, files, i);
            }
        },

        legacyUpload = function (input, iframe, settings) {
            iframe
                .unbind('abort')
                .bind('abort', function (e) {
                    iframe.readyState = 0;
                    // javascript:false as iframe src prevents warning popups on HTTPS in IE6
                    // concat is used here to prevent the "Script URL" JSLint error:
                    iframe.unbind('load').attr('src', 'javascript'.concat(':false;'));
                    if (typeof settings.onAbort === func) {
                        settings.onAbort(e, [{name: input.value, type: null, size: null}], 0, iframe, settings);
                    }
                })
                .unbind('load')
                .bind('load', function (e) {
                    iframe.readyState = 4;
                    if (typeof settings.onLoad === func) {
                        settings.onLoad(e, [{name: input.value, type: null, size: null}], 0, iframe, settings);
                    }
                });
            uploadForm.find(':input[type!=file]').not(':disabled')
                .attr('disabled', true)
                .addClass(settings.namespace + '_disabled');
            $.each(getFormData(settings), function (index, field) {
                uploadForm.append(
                    $('<input type="hidden"/>')
                        .attr('name', field.name)
                        .val(field.value)
                        .addClass(settings.namespace + '_form_data')
                );
            });
            uploadForm
                .attr('action', settings.url)
                .attr('target', iframe.attr('name'));
            iframe.readyState = 2;
            uploadForm.get(0).submit();
            uploadForm.find('.' + settings.namespace + '_disabled')
                .removeAttr('disabled')
                .removeClass(settings.namespace + '_disabled');
            uploadForm.find('.' + settings.namespace + '_form_data').remove();
        },

        handleLegacyUpload = function (event, input) {
            var iframeName = 'iframe_' + settings.namespace + (new Date()).getTime(),
                // javascript:false as iframe src prevents warning popups on HTTPS in IE6:
                iframe = $('<iframe src="javascript:false;" name="' + iframeName + '"></iframe>'),
                uploadSettings = $.extend({}, settings);
            iframe.readyState = 0;
            iframe.abort = function () {
                iframe.trigger('abort');
            };
            iframe.bind('load', function () {
                iframe.unbind('load');
                if (typeof settings.initUpload === func) {
                    settings.initUpload(
                        event,
                        [{name: input.value, type: null, size: null}],
                        0,
                        iframe,
                        uploadSettings,
                        function () {
                            legacyUpload(input, iframe, uploadSettings);
                        }
                    );
                } else {
                    legacyUpload(input, iframe, uploadSettings);
                }
            }).appendTo(dropZone);
        };

        this.onDocumentDragOver = function (e) {
            if (typeof settings.onDocumentDragOver === func &&
                settings.onDocumentDragOver(e) === false) {
                return false;
            }
            e.preventDefault();
        };
        
        this.onDocumentDrop = function (e) {
            if (typeof settings.onDocumentDrop === func &&
                settings.onDocumentDrop(e) === false) {
                return false;
            }
            e.preventDefault();
        };

        this.onDragOver = function (e) {
            if (typeof settings.onDragOver === func &&
                settings.onDragOver(e) === false) {
                return false;
            }
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer) {
                dataTransfer.dropEffect = dataTransfer.effectAllowed = 'copy';
            }
            e.preventDefault();
        };

        this.onDrop = function (e) {
            if (typeof settings.onDrop === func &&
                settings.onDrop(e) === false) {
                return false;
            }
            var dataTransfer = e.originalEvent.dataTransfer;
            if (dataTransfer && dataTransfer.files && isXHRUploadCapable()) {
                handleFiles(e, dataTransfer.files);
            }
            e.preventDefault();
        };
        
        this.onInputClick = function (e) {
            if (typeof settings.onInputClick === func &&
                settings.onInputClick(e) === false) {
                return false;
            }
            e.target.form.reset();
            onInputChangeCalled = false;
        };
        
        this.onInputChange = function (e) {
            if (typeof settings.onInputChange === func &&
                settings.onInputChange(e) === false) {
                return false;
            }
            if (onInputChangeCalled) {
                return;
            }
            onInputChangeCalled = true;
            if (e.target.files && isXHRUploadCapable()) {
                handleFiles(e, e.target.files);
            } else {
                handleLegacyUpload(e, e.target);
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
            initEventHandlers();
        };
        
        this.destroy = function () {
            removeEventHandlers();
            dropZone
                .removeData(settings.namespace)
                .removeClass(settings.cssClass);
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
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.fileUpload');
        }
    };
    
}(jQuery));