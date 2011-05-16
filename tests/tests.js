/*
 * jQuery File Upload Plugin Tests 2.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint nomen: false, unparam: false */
/*global $, QUnit, document, expect, module, test, asyncTest, start, ok, strictEqual, notStrictEqual */

$(function () {
    'use strict';

    QUnit.done = function () {
        // Delete all uploaded files:
        var url = $('#file-upload').prop('action');
        $.getJSON(url, function (files) {
            $.each(files, function (index, file) {
                $.ajax({
                    url: url + '?file=' + encodeURIComponent(file.name),
                    type: 'DELETE'
                });
            });
        });
    };

    var lifecycle = {
        teardown: function () {
            // De-initialize the file input plugin:
            $('#file-upload:blueimp-fileupload').fileupload('destroy');
            // Remove all remaining event listeners:
            $('#file-upload input').unbind();
            $(document).unbind();
        }
    };

    module('Initialization', lifecycle);
    
    test('Widget initialization', function () {
        ok($('#file-upload').fileupload().data('fileupload'));
    });

    test('File input initialization', function () {
        var fu = $('#file-upload').fileupload();
        ok(
            fu.fileupload('option', 'fileInput').length,
            'File input field inside of the widget'
        );
        ok(
            fu.fileupload('option', 'fileInput').length,
            'Widget element as file input field'
        );
    });
    
    test('Drop zone initialization', function () {
        ok($('#file-upload').fileupload()
            .fileupload('option', 'dropZone').length);
    });
    
    test('Event listeners initialization', function () {
        var fu = $('#file-upload').fileupload();
        ok(
            fu.fileupload('option', 'fileInput')
                .data('events').change.length,
            'Listens to file input change events'
        );
        ok(
            fu.fileupload('option', 'dropZone')
                .data('events').drop.length,
            'Listens to drop zone drop events'
        );
        ok(
            fu.fileupload('option', 'dropZone')
                .data('events').dragover.length,
            'Listens to drop zone dragover events'
        );
    });

    module('API', lifecycle);

    test('destroy', function () {
        var fu = $('#file-upload').fileupload(),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone');
        fileInput.change($.noop);
        dropZone.bind('drop', $.noop);
        dropZone.bind('dragover', $.noop);
        fu.fileupload('destroy');
        strictEqual(
            fileInput.data('events').change.length,
            1,
            'Removes own file input change event listener'
        );
        strictEqual(
            dropZone.data('events').drop.length,
            1,
            'Removes own drop zone drop event listener'
        );
        strictEqual(
            dropZone.data('events').dragover.length,
            1,
            'Removes own drop zone dragover event listener'
        );
    });
    
    test('disable', function () {
        var fu = $('#file-upload').fileupload(),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone'),
            param = {files: [{name: 'test'}]};
        fileInput.change($.noop);
        dropZone.bind('drop', $.noop);
        dropZone.bind('dragover', $.noop);
        fu.fileupload('disable');
        expect(3);
        strictEqual(
            fileInput.data('events').change.length,
            1,
            'Removes own file input change event listener'
        );
        strictEqual(
            dropZone.data('events').drop.length,
            1,
            'Removes own drop zone drop event listener'
        );
        strictEqual(
            dropZone.data('events').dragover.length,
            1,
            'Removes own drop zone dragover event listener'
        );
        fu.fileupload({
            add: function (e, data) {
                ok(false);
            }
        }).fileupload('add', param);
    });
    
    test('enable', function () {
        var fu = $('#file-upload').fileupload(),
            param = {files: [{name: 'test'}]};
        fu.fileupload('disable');
        fu.fileupload('enable');
        expect(4);
        ok(
            fu.fileupload('option', 'fileInput')
                .data('events').change.length,
            'Listens to file input change events'
        );
        ok(
            fu.fileupload('option', 'dropZone')
                .data('events').drop.length,
            'Listens to drop zone drop events'
        );
        ok(
            fu.fileupload('option', 'dropZone')
                .data('events').dragover.length,
            'Listens to drop zone dragover events'
        );
        $('#file-upload').fileupload({
            send: function (e, data) {
                strictEqual(
                    data.files[0].name,
                    'test',
                    'Triggers send callback'
                );
                return false;
            }
        }).fileupload('send', param);
    });
    
    test('option', function () {
        var fu = $('#file-upload').fileupload(),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone');
        fu.fileupload('option', 'fileInput', null);   
        fu.fileupload('option', 'dropZone', null);
        ok(
            !fileInput.data('events'),
            'Removes event listener after changing fileInput option'
        );
        ok(
            !dropZone.data('events'),
            'Removes event listeners after changing dropZone option'
        );
        fu.fileupload('option', 'fileInput', fileInput);   
        fu.fileupload('option', 'dropZone', dropZone);
        ok(
            fileInput.data('events').change.length,
            'Adds change event listener after setting fileInput option'
        );
        ok(
            dropZone.data('events').drop.length,
            'Adds drop event listener after setting dropZone option'
        );
        ok(
            dropZone.data('events').dragover.length,
            'Adds dragover event listener after setting dropZone option'
        );
    });

    asyncTest('add', function () {
        expect(4);
        var param = {files: [{name: 'test'}]},
            param2 = {files: [{fileName: 'test', fileSize: 123}]};
        $('#file-upload').fileupload({
            add: function (e, data) {
                strictEqual(
                    data.files[0].name,
                    param.files[0].name,
                    'Triggers add callback'
                );
            }
        }).fileupload('add', param).fileupload(
            'option',
            'add',
            function (e, data) {
                strictEqual(
                    data.files[0].name,
                    param2.files[0].fileName,
                    'Normalizes fileName'
                );
                strictEqual(
                    data.files[0].size,
                    param2.files[0].fileSize,
                    'Normalizes fileSize'
                );
                data.submit().complete(function () {
                    ok(true, 'data.submit() Returns a jqXHR object');
                    start();
                });
            }
        ).fileupload('add', param2);
    });
    
    asyncTest('send', function () {
        expect(3);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            send: function (e, data) {
                strictEqual(
                    data.files[0].name,
                    'test',
                    'Triggers send callback'
                );
            }
        }).fileupload('send', param).fail(function () {
            ok(true, 'Allows to abort the request');
        }).complete(function () {
            ok(true, 'Returns a jqXHR object');
            start();
        }).abort();
    });
    
    module('Callbacks', lifecycle);

    asyncTest('add', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            add: function (e, data) {
                ok(true, 'Triggers add callback');
                start();
            }
        }).fileupload('add', param);
    });

    asyncTest('send', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            send: function (e, data) {
                ok(true, 'Triggers send callback');
                start();
                return false;
            }
        }).fileupload('send', param);
    });

    asyncTest('done', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            done: function (e, data) {
                ok(true, 'Triggers done callback');
                start();
            }
        }).fileupload('send', param);
    });
    
    asyncTest('fail', function () {
        expect(1);
        var param = {files: [{name: 'test'}]},
            fu = $('#file-upload').fileupload({
                url: '404',
                multipart: false,
                fail: function (e, data) {
                    ok(true, 'Triggers fail callback');
                    start();
                }
            });
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };
        fu.fileupload('send', param);
    });
    
    asyncTest('always', function () {
        expect(2);
        var param = {files: [{name: 'test'}]},
            counter = 0,
            fu = $('#file-upload').fileupload({
                multipart: false,
                always: function (e, data) {
                    ok(true, 'Triggers always callback');
                    if (counter === 1) {
                        start();
                    } else {
                        counter += 1;
                    }
                }
            });
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };
        fu.fileupload('add', param).fileupload(
            'option',
            'url',
            '404'
        ).fileupload('add', param);
    });
    
    asyncTest('progress', function () {
        expect(1);
        var param = {files: [{name: 'test'}]},
            counter = 0;
        $('#file-upload').fileupload({
            forceIframeTransport: true,
            progress: function (e, data) {
                ok(true, 'Triggers progress callback');
                if (counter === 0) {
                    start();
                } else {
                    counter += 1;
                }
            }
        }).fileupload('send', param);
    });
    
    asyncTest('progressall', function () {
        expect(1);
        var param = {files: [{name: 'test'}]},
            counter = 0;
        $('#file-upload').fileupload({
            forceIframeTransport: true,
            progressall: function (e, data) {
                ok(true, 'Triggers progressall callback');
                if (counter === 0) {
                    start();
                } else {
                    counter += 1;
                }
            }
        }).fileupload('send', param);
    });

    asyncTest('start', function () {
        expect(1);
        var param = {files: [{name: '1'}, {name: '2'}]},
            active = 0;
        $('#file-upload').fileupload({
            send: function (e, data) {
                active += 1;
            },
            start: function (e, data) {
                ok(!active, 'Triggers start callback before uploads');
                start();
            }
        }).fileupload('send', param);
    });
    
    asyncTest('stop', function () {
        expect(1);
        var param = {files: [{name: '1'}, {name: '2'}]},
            active = 0;
        $('#file-upload').fileupload({
            send: function (e, data) {
                active += 1;
            },
            always: function (e, data) {
                active -= 1;
            },
            stop: function (e, data) {
                ok(!active, 'Triggers stop callback after uploads');
                start();
            }
        }).fileupload('send', param);
    });

    test('change', function () {
        var fu = $('#file-upload').fileupload(),
            fuo = fu.data('fileupload'),
            fileInput = fu.fileupload('option', 'fileInput');
        expect(2);
        fu.fileupload({
            change: function (e, data) {
                ok(true, 'Triggers change callback');
                strictEqual(
                    data.files.length,
                    1,
                    'Creates pseudo File object'
                );
            },
            add: $.noop
        });
        fuo._onChange({
            data: {fileupload: fuo},
            target: fileInput[0]
        });
    });
    
    test('drop', function () {
        var fu = $('#file-upload').fileupload(),
            fuo = fu.data('fileupload');
        expect(1);
        fu.fileupload({
            drop: function (e, data) {
                ok(true, 'Triggers drop callback');
            },
            add: $.noop
        });
        fuo._onDrop({
            data: {fileupload: fuo},
            originalEvent: {dataTransfer: {}},
            preventDefault: $.noop
        });
    });
    
    test('dragover', function () {
        var fu = $('#file-upload').fileupload(),
            fuo = fu.data('fileupload');
        expect(1);
        fu.fileupload({
            dragover: function (e, data) {
                ok(true, 'Triggers dragover callback');
            },
            add: $.noop
        });
        fuo._onDragOver({
            data: {fileupload: fuo},
            originalEvent: {dataTransfer: {}},
            preventDefault: $.noop
        });
    });

    module('Options', lifecycle);

    test('paramName', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            paramName: null,
            send: function (e, data) {
                strictEqual(
                    data.paramName,
                    data.fileInput.prop('name'),
                    'Takes paramName from file input field if not set'
                );
                return false;
            }
        }).fileupload('send', param);
    });
    
    test('url', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            url: null,
            send: function (e, data) {
                strictEqual(
                    data.url,
                    $(data.fileInput.prop('form')).prop('action'),
                    'Takes url from form action if not set'
                );
                return false;
            }
        }).fileupload('send', param);
    });
    
    test('type', function () {
        expect(2);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            type: null,
            send: function (e, data) {
                strictEqual(
                    data.type,
                    'POST',
                    'Request type is "POST" if not set to "PUT"'
                );
                return false;
            }
        }).fileupload('send', param);
        $('#file-upload').fileupload({
            type: 'PUT',
            send: function (e, data) {
                strictEqual(
                    data.type,
                    'PUT',
                    'Request type is "PUT" if set to "PUT"'
                );
                return false;
            }
        }).fileupload('send', param);
    });
    
    test('replaceFileInput', function () {
        var fu = $('#file-upload').fileupload(),
            fuo = fu.data('fileupload'),
            fileInput = fu.fileupload('option', 'fileInput'),
            fileInputElement = fileInput[0];
        expect(2);
        fu.fileupload({
            replaceFileInput: false,
            change: function (e, data) {
                strictEqual(
                    fu.fileupload('option', 'fileInput')[0],
                    fileInputElement,
                    'Keeps file input with replaceFileInput: false'
                );
            },
            add: $.noop
        });
        fuo._onChange({
            data: {fileupload: fuo},
            target: fileInput[0]
        });
        fu.fileupload({
            replaceFileInput: true,
            change: function (e, data) {
                notStrictEqual(
                    fu.fileupload('option', 'fileInput')[0],
                    fileInputElement,
                    'Replaces file input with replaceFileInput: true'
                );
            },
            add: $.noop
        });
        fuo._onChange({
            data: {fileupload: fuo},
            target: fileInput[0]
        });
    });

    asyncTest('forceIframeTransport', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#file-upload').fileupload({
            forceIframeTransport: true,
            done: function (e, data) {
                strictEqual(
                    data.dataType.substr(0, 6),
                    'iframe',
                    'Iframe Transport is used'
                );
                start();
            }
        }).fileupload('send', param);
    });
    
    test('singleFileUploads', function () {
        expect(3);
        var fu = $('#file-upload').fileupload(),
            param = {files: [{name: '1'}, {name: '2'}]},
            index = 1;
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };
        $('#file-upload').fileupload({
            singleFileUploads: true,
            add: function (e, data) {
                ok(true, 'Triggers callback number ' + index);
                index += 1;
            }
        }).fileupload('add', param).fileupload(
            'option',
            'singleFileUploads',
            false
        ).fileupload('add', param);
    });
    
    asyncTest('sequentialUploads', function () {
        expect(3);
        var param = {files: [
                {name: '1'},
                {name: '2'},
                {name: '3'}
            ]},
            sendIndex = 0,
            loadIndex = 0,
            fu = $('#file-upload').fileupload({
                sequentialUploads: true,
                multipart: false,
                send: function (e, data) {
                    sendIndex += 1;
                },
                always: function (e, data) {
                    loadIndex += 1;
                    strictEqual(sendIndex, loadIndex, 'upload in order');
                },
                stop: function (e) {
                    start();
                }
            });
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };
        fu.fileupload('add', param);
    });
    
    asyncTest('multipart', function () {
        expect(4);
        var param = {files: [{
                name: 'test.png',
                size: 123,
                type: 'image/png'
            }]},
            fu = $('#file-upload').fileupload({
                multipart: false,
                always: function (e, data) {
                    strictEqual(
                        data.contentType,
                        param.files[0].type,
                        'non-multipart upload sets file type as contentType'
                    );
                    strictEqual(
                        data.headers['X-File-Name'],
                        param.files[0].name,
                        'non-multipart upload sets X-File-Name header'
                    );
                    strictEqual(
                        data.headers['X-File-Type'],
                        param.files[0].type,
                        'non-multipart upload sets X-File-Type header'
                    );
                    strictEqual(
                        data.headers['X-File-Size'],
                        param.files[0].size,
                        'non-multipart upload sets X-File-Size header'
                    );
                    start();
                }
            });
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };    
        fu.fileupload('send', param);
    });

});