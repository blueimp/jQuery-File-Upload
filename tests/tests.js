/*
 * jQuery File Upload Plugin Tests 3.0.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint nomen: true, unparam: true */
/*global $, QUnit, document, expect, module, test, asyncTest, start, ok, strictEqual, notStrictEqual */

$(function () {
    'use strict';

    QUnit.done = function () {
        // Delete all uploaded files:
        var url = $('#fileupload').find('form').prop('action');
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
            setup: function () {
                // Set the .fileupload method to the basic widget method:
                $.widget('blueimp.fileupload', $.blueimp.fileupload, {});
            },
            teardown: function () {
                // De-initialize the file input plugin:
                $('#fileupload:blueimp-fileupload').fileupload('destroy');
                // Remove all remaining event listeners:
                $('#fileupload input').unbind();
                $(document).unbind();
            }
        },
        lifecycleUI = {
            setup: function () {
                // Set the .fileupload method to the UI widget method:
                $.widget('blueimpUI.fileupload', $.blueimpUI.fileupload, {});
            },
            teardown: function () {
                // De-initialize the file input plugin:
                $('#fileupload:blueimpUI-fileupload').fileupload('destroy');
                // Remove all remaining event listeners:
                $('#fileupload input, #fileupload button').unbind();
                $(document).unbind();
            }
        };

    module('Initialization', lifecycle);
    
    test('Widget initialization', function () {
        ok($('#fileupload').fileupload().data('fileupload'));
    });

    test('File input initialization', function () {
        var fu = $('#fileupload').fileupload();
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
        ok($('#fileupload').fileupload()
            .fileupload('option', 'dropZone').length);
    });
    
    test('Event listeners initialization', function () {
        var fu = $('#fileupload').fileupload();
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
        var fu = $('#fileupload').fileupload(),
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
        var fu = $('#fileupload').fileupload(),
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
        var fu = $('#fileupload').fileupload(),
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
        $('#fileupload').fileupload({
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
        var fu = $('#fileupload').fileupload(),
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
            add: function (e, data) {
                ok(true, 'Triggers add callback');
                start();
            }
        }).fileupload('add', param);
    });

    asyncTest('send', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
            done: function (e, data) {
                ok(true, 'Triggers done callback');
                start();
            }
        }).fileupload('send', param);
    });
    
    asyncTest('fail', function () {
        expect(1);
        var param = {files: [{name: 'test'}]},
            fu = $('#fileupload').fileupload({
                url: '404',
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
            fu = $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        var fu = $('#fileupload').fileupload(),
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
        var fu = $('#fileupload').fileupload(),
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
        var fu = $('#fileupload').fileupload(),
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        $('#fileupload').fileupload({
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
        var fu = $('#fileupload').fileupload(),
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
        $('#fileupload').fileupload({
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
        var fu = $('#fileupload').fileupload(),
            param = {files: [{name: '1'}, {name: '2'}]},
            index = 1;
        fu.data('fileupload')._isXHRUpload = function () {
            return true;
        };
        $('#fileupload').fileupload({
            singleFileUploads: true,
            add: function (e, data) {
                ok(true, 'Triggers callback number ' + index.toString());
                index += 1;
            }
        }).fileupload('add', param).fileupload(
            'option',
            'singleFileUploads',
            false
        ).fileupload('add', param);
    });

    asyncTest('sequentialUploads', function () {
        expect(6);
        var param = {files: [
                {name: '1'},
                {name: '2'},
                {name: '3'},
                {name: '4'},
                {name: '5'},
                {name: '6'}
            ]},
            addIndex = 0,
            sendIndex = 0,
            loadIndex = 0,
            fu = $('#fileupload').fileupload({
                sequentialUploads: true,
                add: function (e, data) {
                    addIndex += 1;
                    if (addIndex === 4) {
                        data.submit().abort();
                    } else {
                        data.submit();
                    }
                },
                send: function (e, data) {
                    sendIndex += 1;
                },
                done: function (e, data) {
                    loadIndex += 1;
                    strictEqual(sendIndex, loadIndex, 'upload in order');
                },
                fail: function (e, data) {
                    strictEqual(data.errorThrown, 'abort', 'upload aborted');
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
            fu = $('#fileupload').fileupload({
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

    module('UI Initialization', lifecycleUI);
    
    test('Widget initialization', function () {
        ok($('#fileupload').fileupload().data('fileupload'));
        ok(
            $('#fileupload').fileupload('option', 'uploadTemplate').length,
            'Initialized upload template'
        );
        ok(
            $('#fileupload').fileupload('option', 'downloadTemplate').length,
            'Initialized download template'
        );
        ok(
            $('#fileupload :ui-progressbar').length,
            'Initialized global progressbar'
        );
    });

    test('Buttonbar event listeners', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar'),
            files = [{name: 'test'}];
        expect(7);
        $('#fileupload').fileupload({
            send: function (e, data) {
                ok(true, 'Started file upload via global start button');
            },
            fail: function (e, data) {
                ok(true, 'Canceled file upload via global cancel button');
                data.context.remove();
            },
            destroy: function (e, data) {
                ok(true, 'Delete action called via global delete button');
            }
        });
        ok(
            buttonbar.find('.start')
                .data('events').click.length,
            'Listens to start button click events'
        );
        ok(
            buttonbar.find('.cancel')
                .data('events').click.length,
            'Listens to cancel button click events'
        );
        ok(
            buttonbar.find('.delete')
                .data('events').click.length,
            'Listens to delete button click events'
        );
        $('#fileupload').fileupload('add', {files: files});
        buttonbar.find('.cancel').click();
        $('#fileupload').fileupload('add', {files: files});
        buttonbar.find('.start').click();
        buttonbar.find('.cancel').click();
        $('#fileupload').data('fileupload')._renderDownload(files)
            .appendTo($('#fileupload .files')).show();
        buttonbar.find('.delete').click();
    });

    module('UI API', lifecycleUI);

    test('destroy', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar');
        $('#fileupload').fileupload();
        buttonbar.find('button').click($.noop);
        $('#fileupload').fileupload('destroy');
        strictEqual(
            buttonbar.find('.start').data('events').click.length,
            1,
            'Removes own start button click event listener'
        );
        strictEqual(
            buttonbar.find('.cancel').data('events').click.length,
            1,
            'Removes own cancel button click event listener'
        );
        strictEqual(
            buttonbar.find('.delete').data('events').click.length,
            1,
            'Removes own delete button click event listener'
        );
        ok(
            !$('#fileupload :ui-progressbar').length,
            'Deinitialized global progressbar'
        );
    });
    
    test('disable', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar');
        $('#fileupload').fileupload();
        $('#fileupload').fileupload('disable');
        strictEqual(
            buttonbar.find('input, button').not(':disabled').length,
            0,
            'Disables the buttonbar buttons'
        );
    });
    
    test('enable', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar');
        $('#fileupload')
            .fileupload()
            .fileupload('disable')
            .fileupload('enable');
        strictEqual(
            buttonbar.find('input, button').not(':disabled').length,
            4,
            'Enables the buttonbar buttons'
        );
    });

    module('UI Callbacks', lifecycleUI);
    
    test('destroy', function () {
        expect(3);
        $('#fileupload').fileupload({
            destroy: function (e, data) {
                ok(true, 'Triggers destroy callback');
                strictEqual(
                    data.url,
                    'test',
                    'Passes over deletion url parameter'
                );
                strictEqual(
                    data.type,
                    'DELETE',
                    'Passes over deletion request type parameter'
                );
            }
        });
        $('#fileupload').data('fileupload')._renderDownload([{
            name: 'test',
            delete_url: 'test',
            delete_type: 'DELETE'
        }]).appendTo($('#fileupload .files')).show();
        $('#fileupload .fileupload-buttonbar .delete').click();
    });

    module('UI Options', lifecycleUI);
    
    test('autoUpload', function () {
        expect(1);
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                send: function (e, data) {
                    ok(true, 'Started file upload automatically');
                    return false;
                }
            })
            .fileupload('add', {files: [{name: 'test'}]})
            .fileupload('option', 'autoUpload', false)
            .fileupload('add', {files: [{name: 'test'}]});
    });

    test('maxNumberOfFiles', function () {
        expect(4);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                maxNumberOfFiles: 1,
                singleFileUploads: false,
                send: function (e, data) {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                },
                done: $.noop
            })
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload('add', {files: [{name: 'test'}]})
            .fileupload('option', 'maxNumberOfFiles', 1)
            .fileupload('add', {files: [{name: 1}, {name: 2}]})
            .fileupload({
                maxNumberOfFiles: 1,
                send: function (e, data) {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                    return false;
                }
            })
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload({
                maxNumberOfFiles: 0,
                send: function (e, data) {
                    ok(
                        !$.blueimpUI.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            })
            .fileupload('send', {files: [{name: 'test'}]});
    });

    test('maxFileSize', function () {
        expect(3);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                maxFileSize: 1000,
                send: function (e, data) {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                    return false;
                }
            })
            .fileupload('add', {files: [{
                name: (addIndex += 1)
            }]})
            .fileupload('add', {files: [{
                name: (addIndex += 1),
                size: 999
            }]})
            .fileupload('add', {files: [{
                name: 'test',
                size: 1001
            }]})
            .fileupload({
                send: function (e, data) {
                    ok(
                        !$.blueimpUI.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            })
            .fileupload('send', {files: [{
                name: 'test',
                size: 1001
            }]});
    });
    
    test('minFileSize', function () {
        expect(3);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                minFileSize: 1000,
                send: function (e, data) {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                    return false;
                }
            })
            .fileupload('add', {files: [{
                name: (addIndex += 1)
            }]})
            .fileupload('add', {files: [{
                name: (addIndex += 1),
                size: 1001
            }]})
            .fileupload('add', {files: [{
                name: 'test',
                size: 999
            }]})
            .fileupload({
                send: function (e, data) {
                    ok(
                        !$.blueimpUI.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            })
            .fileupload('send', {files: [{
                name: 'test',
                size: 999
            }]});
    });
    
    test('acceptFileTypes', function () {
        expect(3);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                previewFileTypes: /none/,
                send: function (e, data) {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                    return false;
                }
            })
            .fileupload('add', {files: [{
                name: (addIndex += 1) + '.jpg'
            }]})
            .fileupload('add', {files: [{
                name: (addIndex += 1),
                type: 'image/jpeg'
            }]})
            .fileupload('add', {files: [{
                name: 'test.txt',
                type: 'text/plain'
            }]})
            .fileupload({
                send: function (e, data) {
                    ok(
                        !$.blueimpUI.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            })
            .fileupload('send', {files: [{
                name: 'test.txt',
                type: 'text/plain'
            }]});
    });

});