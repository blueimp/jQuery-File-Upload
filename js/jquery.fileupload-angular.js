/*
 * jQuery File Upload AngularJS Plugin 1.0.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true */
/*global angular */

(function () {
    'use strict';

    angular.module('blueimp.fileupload', [])

        .provider('fileUpload', function () {
            var scopeApply = function () {
                    var scope = angular.element(this)
                        .fileupload('option', 'scope')();
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                },
                $config;
            $config = this.defaults = {
                handleResponse: function (e, data) {
                    var files = data.result && data.result.files;
                    if (files) {
                        data.scope().replace(data.files, files);
                    } else if (data.errorThrown ||
                            data.textStatus === 'error') {
                        data.files[0].error = data.errorThrown ||
                            data.textStatus;
                    }
                },
                add: function (e, data) {
                    var scope = data.scope();
                    data.process(function () {
                        return scope.process(data);
                    }).always(
                        function () {
                            var file = data.files[0],
                                submit = function () {
                                    return data.submit();
                                };
                            file.$cancel = function () {
                                scope.clear(data.files);
                                return data.abort();
                            };
                            file.$state = function () {
                                return data.state();
                            };
                            file.$progress = function () {
                                return data.progress();
                            };
                            file.$response = function () {
                                return data.response();
                            };
                            if (file.$state() === 'rejected') {
                                file._$submit = submit;
                            } else {
                                file.$submit = submit;
                            }
                            scope.$apply(function () {
                                var method = scope.option('prependFiles') ?
                                        'unshift' : 'push';
                                Array.prototype[method].apply(
                                    scope.queue,
                                    data.files
                                );
                                if (file.$submit &&
                                        (scope.option('autoUpload') ||
                                        data.autoUpload) &&
                                        data.autoUpload !== false) {
                                    file.$submit();
                                }
                            });
                        }
                    );
                },
                progress: function (e, data) {
                    data.scope().$apply();
                },
                done: function (e, data) {
                    var that = this;
                    data.scope().$apply(function () {
                        data.handleResponse.call(that, e, data);
                    });
                },
                fail: function (e, data) {
                    var that = this;
                    if (data.errorThrown === 'abort') {
                        return;
                    }
                    if (data.dataType.indexOf('json') === data.dataType.length - 4) {
                        try {
                            data.result = angular.fromJson(data.jqXHR.responseText);
                        } catch (err) {}
                    }
                    data.scope().$apply(function () {
                        data.handleResponse.call(that, e, data);
                    });
                },
                stop: scopeApply,
                processstart: scopeApply,
                processstop: scopeApply,
                getNumberOfFiles: function () {
                    return this.scope().queue.length;
                },
                dataType: 'json',
                prependFiles: true,
                autoUpload: false
            };
            this.$get = [
                function () {
                    return {
                        defaults: $config
                    };
                }
            ];
        })

        .provider('formatFileSizeFilter', function () {
            var $config = this.defaults = {
                // Byte units following the IEC format
                // http://en.wikipedia.org/wiki/Kilobyte
                units: [
                    {size: 1000000000, suffix: ' GB'},
                    {size: 1000000, suffix: ' MB'},
                    {size: 1000, suffix: ' KB'}
                ]
            };
            this.$get = function () {
                return function (bytes) {
                    if (!angular.isNumber(bytes)) {
                        return '';
                    }
                    var unit = true,
                        i = -1;
                    while (unit) {
                        unit = $config.units[i += 1];
                        if (i === $config.units.length - 1 || bytes >= unit.size) {
                            return (bytes / unit.size).toFixed(2) + unit.suffix;
                        }
                    }
                };
            };
        })

        .controller('FileUploadController', [
            '$scope', '$element', '$attrs', 'fileUpload',
            function ($scope, $element, $attrs, fileUpload) {
                $scope.disabled = angular.element('<input type="file">')
                    .prop('disabled');
                $scope.queue = $scope.queue || [];
                $scope.clear = function (files) {
                    var queue = this.queue,
                        i = queue.length,
                        file = files,
                        length = 1;
                    if (angular.isArray(files)) {
                        file = files[0];
                        length = files.length;
                    }
                    while (i) {
                        if (queue[i -= 1] === file) {
                            return queue.splice(i, length);
                        }
                    }
                };
                $scope.replace = function (oldFiles, newFiles) {
                    var queue = this.queue,
                        file = oldFiles[0],
                        i,
                        j;
                    for (i = 0; i < queue.length; i += 1) {
                        if (queue[i] === file) {
                            for (j = 0; j < newFiles.length; j += 1) {
                                queue[i + j] = newFiles[j];
                            }
                            return;
                        }
                    }
                };
                $scope.progress = function () {
                    return $element.fileupload('progress');
                };
                $scope.active = function () {
                    return $element.fileupload('active');
                };
                $scope.option = function (option, data) {
                    return $element.fileupload('option', option, data);
                };
                $scope.add = function (data) {
                    return $element.fileupload('add', data);
                };
                $scope.send = function (data) {
                    return $element.fileupload('send', data);
                };
                $scope.process = function (data) {
                    return $element.fileupload('process', data);
                };
                $scope.processing = function (data) {
                    return $element.fileupload('processing', data);
                };
                $scope.applyOnQueue = function (method) {
                    var list = this.queue.slice(0),
                        i,
                        file;
                    for (i = 0; i < list.length; i += 1) {
                        file = list[i];
                        if (file[method]) {
                            file[method]();
                        }
                    }
                };
                $scope.submit = function () {
                    this.applyOnQueue('$submit');
                };
                $scope.cancel = function () {
                    this.applyOnQueue('$cancel');
                };
                // The fileupload widget will initialize with
                // the options provided via "data-"-parameters,
                // as well as those given via options object:
                $element.fileupload(angular.extend(
                    {scope: function () {
                        return $scope;
                    }},
                    fileUpload.defaults
                )).on('fileuploadadd', function (e, data) {
                    data.scope = $scope.option('scope');
                }).on([
                    'fileuploadadd',
                    'fileuploadsubmit',
                    'fileuploadsend',
                    'fileuploaddone',
                    'fileuploadfail',
                    'fileuploadalways',
                    'fileuploadprogress',
                    'fileuploadprogressall',
                    'fileuploadstart',
                    'fileuploadstop',
                    'fileuploadchange',
                    'fileuploadpaste',
                    'fileuploaddrop',
                    'fileuploaddragover',
                    'fileuploadchunksend',
                    'fileuploadchunkdone',
                    'fileuploadchunkfail',
                    'fileuploadchunkalways',
                    'fileuploadprocessstart',
                    'fileuploadprocess',
                    'fileuploadprocessdone',
                    'fileuploadprocessfail',
                    'fileuploadprocessalways',
                    'fileuploadprocessstop'
                ].join(' '), function (e, data) {
                    $scope.$emit(e.type, data);
                });
                // Observe option changes:
                $scope.$watch(
                    $attrs.fileupload,
                    function (newOptions, oldOptions) {
                        if (newOptions) {
                            $element.fileupload('option', newOptions);
                        }
                    }
                );
            }
        ])

        .controller('FileUploadProgressController', [
            '$scope', '$attrs', '$parse',
            function ($scope, $attrs, $parse) {
                var fn = $parse($attrs.progress),
                    update = function () {
                        var progress = fn($scope);
                        if (!progress || !progress.total) {
                            return;
                        }
                        $scope.num = Math.floor(
                            progress.loaded / progress.total * 100
                        );
                    };
                update();
                $scope.$watch(
                    $attrs.progress + '.loaded',
                    function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            update();
                        }
                    }
                );
            }
        ])

        .controller('FileUploadPreviewController', [
            '$scope', '$element', '$attrs', '$parse',
            function ($scope, $element, $attrs, $parse) {
                var fn = $parse($attrs.preview),
                    file = fn($scope);
                if (file.preview) {
                    $element.append(file.preview);
                }
            }
        ])

        .directive('fileupload', function () {
            return {
                controller: 'FileUploadController'
            };
        })

        .directive('progress', function () {
            return {
                controller: 'FileUploadProgressController'
            };
        })

        .directive('preview', function () {
            return {
                controller: 'FileUploadPreviewController'
            };
        })

        .directive('download', function () {
            return function (scope, elm, attrs) {
                elm.on('dragstart', function (e) {
                    try {
                        e.originalEvent.dataTransfer.setData(
                            'DownloadURL',
                            [
                                'application/octet-stream',
                                elm.prop('download'),
                                elm.prop('href')
                            ].join(':')
                        );
                    } catch (err) {}
                });
            };
        });

}());
