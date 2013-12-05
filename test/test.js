/*
 * jQuery File Upload Plugin Test 9.4.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, QUnit, window, document, expect, module, test, asyncTest, start, ok, strictEqual, notStrictEqual */

$(function () {
    // jshint nomen:false
    'use strict';

    QUnit.done = function () {
        // Delete all uploaded files:
        var url = $('#fileupload').prop('action');
        $.getJSON(url, function (result) {
            $.each(result.files, function (index, file) {
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
                $.widget('blueimp.fileupload', window.testBasicWidget, {});
            },
            teardown: function () {
                // Remove all remaining event listeners:
                $(document).unbind();
            }
        },
        lifecycleUI = {
            setup: function () {
                // Set the .fileupload method to the UI widget method:
                $.widget('blueimp.fileupload', window.testUIWidget, {});
            },
            teardown: function () {
                // Remove all remaining event listeners:
                $(document).unbind();
            }
        };

    module('Initialization', lifecycle);

    test('Widget initialization', function () {
        var fu = $('#fileupload').fileupload();
        ok(fu.data('blueimp-fileupload') || fu.data('fileupload'));
    });

    test('Data attribute options', function () {
        $('#fileupload').attr('data-url', 'http://example.org');
        $('#fileupload').fileupload();
        strictEqual(
            $('#fileupload').fileupload('option', 'url'),
            'http://example.org'
        );
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

    test('Paste zone initialization', function () {
        ok($('#fileupload').fileupload()
            .fileupload('option', 'pasteZone').length);
    });

    test('Event listeners initialization', function () {
        expect(
            $.support.xhrFormDataFileUpload ? 4 : 1
        );
        var eo = {
                originalEvent: {
                    dataTransfer: {files: [{}], types: ['Files']},
                    clipboardData: {items: [{}]}
                }
            },
            fu = $('#fileupload').fileupload({
                dragover: function () {
                    ok(true, 'Triggers dragover callback');
                    return false;
                },
                drop: function () {
                    ok(true, 'Triggers drop callback');
                    return false;
                },
                paste: function () {
                    ok(true, 'Triggers paste callback');
                    return false;
                },
                change: function () {
                    ok(true, 'Triggers change callback');
                    return false;
                }
            }),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone'),
            pasteZone = fu.fileupload('option', 'pasteZone');
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
    });

    module('API', lifecycle);

    test('destroy', function () {
        expect(4);
        var eo = {
                originalEvent: {
                    dataTransfer: {files: [{}], types: ['Files']},
                    clipboardData: {items: [{}]}
                }
            },
            options = {
                dragover: function () {
                    ok(true, 'Triggers dragover callback');
                    return false;
                },
                drop: function () {
                    ok(true, 'Triggers drop callback');
                    return false;
                },
                paste: function () {
                    ok(true, 'Triggers paste callback');
                    return false;
                },
                change: function () {
                    ok(true, 'Triggers change callback');
                    return false;
                }
            },
            fu = $('#fileupload').fileupload(options),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone'),
            pasteZone = fu.fileupload('option', 'pasteZone');
        dropZone.bind('dragover', options.dragover);
        dropZone.bind('drop', options.drop);
        pasteZone.bind('paste', options.paste);
        fileInput.bind('change', options.change);
        fu.fileupload('destroy');
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
    });

    test('disable/enable', function () {
        expect(
            $.support.xhrFormDataFileUpload ? 4 : 1
        );
        var eo = {
                originalEvent: {
                    dataTransfer: {files: [{}], types: ['Files']},
                    clipboardData: {items: [{}]}
                }
            },
            fu = $('#fileupload').fileupload({
                dragover: function () {
                    ok(true, 'Triggers dragover callback');
                    return false;
                },
                drop: function () {
                    ok(true, 'Triggers drop callback');
                    return false;
                },
                paste: function () {
                    ok(true, 'Triggers paste callback');
                    return false;
                },
                change: function () {
                    ok(true, 'Triggers change callback');
                    return false;
                }
            }),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone'),
            pasteZone = fu.fileupload('option', 'pasteZone');
        fu.fileupload('disable');
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
        fu.fileupload('enable');
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
    });

    test('option', function () {
        expect(
            $.support.xhrFormDataFileUpload ? 10 : 7
        );
        var eo = {
                originalEvent: {
                    dataTransfer: {files: [{}], types: ['Files']},
                    clipboardData: {items: [{}]}
                }
            },
            fu = $('#fileupload').fileupload({
                dragover: function () {
                    ok(true, 'Triggers dragover callback');
                    return false;
                },
                drop: function () {
                    ok(true, 'Triggers drop callback');
                    return false;
                },
                paste: function () {
                    ok(true, 'Triggers paste callback');
                    return false;
                },
                change: function () {
                    ok(true, 'Triggers change callback');
                    return false;
                }
            }),
            fileInput = fu.fileupload('option', 'fileInput'),
            dropZone = fu.fileupload('option', 'dropZone'),
            pasteZone = fu.fileupload('option', 'pasteZone');
        fu.fileupload('option', 'fileInput', null);
        fu.fileupload('option', 'dropZone', null);
        fu.fileupload('option', 'pasteZone', null);
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
        fu.fileupload('option', 'dropZone', 'body');
        strictEqual(
            fu.fileupload('option', 'dropZone')[0],
            document.body,
            'Allow a query string as parameter for the dropZone option'
        );
        fu.fileupload('option', 'dropZone', document);
        strictEqual(
            fu.fileupload('option', 'dropZone')[0],
            document,
            'Allow a document element as parameter for the dropZone option'
        );
        fu.fileupload('option', 'pasteZone', 'body');
        strictEqual(
            fu.fileupload('option', 'pasteZone')[0],
            document.body,
            'Allow a query string as parameter for the pasteZone option'
        );
        fu.fileupload('option', 'pasteZone', document);
        strictEqual(
            fu.fileupload('option', 'pasteZone')[0],
            document,
            'Allow a document element as parameter for the pasteZone option'
        );
        fu.fileupload('option', 'fileInput', ':file');
        strictEqual(
            fu.fileupload('option', 'fileInput')[0],
            $(':file')[0],
            'Allow a query string as parameter for the fileInput option'
        );
        fu.fileupload('option', 'fileInput', $(':file')[0]);
        strictEqual(
            fu.fileupload('option', 'fileInput')[0],
            $(':file')[0],
            'Allow a document element as parameter for the fileInput option'
        );
        fu.fileupload('option', 'fileInput', fileInput);
        fu.fileupload('option', 'dropZone', dropZone);
        fu.fileupload('option', 'pasteZone', pasteZone);
        fileInput.trigger($.Event('change', eo));
        dropZone.trigger($.Event('dragover', eo));
        dropZone.trigger($.Event('drop', eo));
        pasteZone.trigger($.Event('paste', eo));
    });

    asyncTest('add', function () {
        expect(2);
        var param = {files: [{name: 'test'}]};
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
                data.submit().complete(function () {
                    ok(true, 'data.submit() Returns a jqXHR object');
                    start();
                });
            }
        ).fileupload('add', param);
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
            add: function () {
                ok(true, 'Triggers add callback');
                start();
            }
        }).fileupload('add', param);
    });

    asyncTest('submit', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            submit: function () {
                ok(true, 'Triggers submit callback');
                start();
                return false;
            }
        }).fileupload('add', param);
    });

    asyncTest('send', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            send: function () {
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
            done: function () {
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
                fail: function () {
                    ok(true, 'Triggers fail callback');
                    start();
                }
            });
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        fu.fileupload('send', param);
    });

    asyncTest('always', function () {
        expect(2);
        var param = {files: [{name: 'test'}]},
            counter = 0,
            fu = $('#fileupload').fileupload({
                always: function () {
                    ok(true, 'Triggers always callback');
                    if (counter === 1) {
                        start();
                    } else {
                        counter += 1;
                    }
                }
            });
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
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
            progress: function () {
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
            progressall: function () {
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
            send: function () {
                active += 1;
            },
            start: function () {
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
            send: function () {
                active += 1;
            },
            always: function () {
                active -= 1;
            },
            stop: function () {
                ok(!active, 'Triggers stop callback after uploads');
                start();
            }
        }).fileupload('send', param);
    });

    test('change', function () {
        var fu = $('#fileupload').fileupload(),
            fuo = fu.data('blueimp-fileupload') || fu.data('fileupload'),
            fileInput = fu.fileupload('option', 'fileInput');
        expect(2);
        fu.fileupload({
            change: function (e, data) {
                ok(true, 'Triggers change callback');
                strictEqual(
                    data.files.length,
                    0,
                    'Returns empty files list'
                );
            },
            add: $.noop
        });
        fuo._onChange({
            data: {fileupload: fuo},
            target: fileInput[0]
        });
    });

    test('paste', function () {
        var fu = $('#fileupload').fileupload(),
            fuo = fu.data('blueimp-fileupload') || fu.data('fileupload');
        expect(1);
        fu.fileupload({
            paste: function () {
                ok(true, 'Triggers paste callback');
            },
            add: $.noop
        });
        fuo._onPaste({
            data: {fileupload: fuo},
            originalEvent: {
                dataTransfer: {files: [{}]},
                clipboardData: {items: [{}]}
            },
            preventDefault: $.noop
        });
    });

    test('drop', function () {
        var fu = $('#fileupload').fileupload(),
            fuo = fu.data('blueimp-fileupload') || fu.data('fileupload');
        expect(1);
        fu.fileupload({
            drop: function () {
                ok(true, 'Triggers drop callback');
            },
            add: $.noop
        });
        fuo._onDrop({
            data: {fileupload: fuo},
            originalEvent: {
                dataTransfer: {files: [{}]},
                clipboardData: {items: [{}]}
            },
            preventDefault: $.noop
        });
    });

    test('dragover', function () {
        var fu = $('#fileupload').fileupload(),
            fuo = fu.data('blueimp-fileupload') || fu.data('fileupload');
        expect(1);
        fu.fileupload({
            dragover: function () {
                ok(true, 'Triggers dragover callback');
            },
            add: $.noop
        });
        fuo._onDragOver({
            data: {fileupload: fuo},
            originalEvent: {dataTransfer: {types: ['Files']}},
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
                    data.paramName[0],
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
            fuo = fu.data('blueimp-fileupload') || fu.data('fileupload'),
            fileInput = fu.fileupload('option', 'fileInput'),
            fileInputElement = fileInput[0];
        expect(2);
        fu.fileupload({
            replaceFileInput: false,
            change: function () {
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
            change: function () {
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
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        $('#fileupload').fileupload({
            singleFileUploads: true,
            add: function () {
                ok(true, 'Triggers callback number ' + index.toString());
                index += 1;
            }
        }).fileupload('add', param).fileupload(
            'option',
            'singleFileUploads',
            false
        ).fileupload('add', param);
    });

    test('limitMultiFileUploads', function () {
        expect(3);
        var fu = $('#fileupload').fileupload(),
            param = {files: [
                {name: '1'},
                {name: '2'},
                {name: '3'},
                {name: '4'},
                {name: '5'}
            ]},
            index = 1;
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        $('#fileupload').fileupload({
            singleFileUploads: false,
            limitMultiFileUploads: 2,
            add: function () {
                ok(true, 'Triggers callback number ' + index.toString());
                index += 1;
            }
        }).fileupload('add', param);
    });

    test('limitMultiFileUploadSize', function () {
        expect(7);
        var fu = $('#fileupload').fileupload(),
            param = {files: [
                {name: '1-1', size: 100000},
                {name: '1-2', size: 40000},
                {name: '2-1', size: 100000},
                {name: '3-1', size: 50000},
                {name: '3-2', size: 40000},
                {name: '4-1', size: 45000} // New request due to limitMultiFileUploads
            ]},
            param2 = {files: [
                {name: '5-1'},
                {name: '5-2'},
                {name: '6-1'},
                {name: '6-2'},
                {name: '7-1'}
            ]},
            index = 1;
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        $('#fileupload').fileupload({
            singleFileUploads: false,
            limitMultiFileUploads: 2,
            limitMultiFileUploadSize: 150000,
            limitMultiFileUploadSizeOverhead: 5000,
            add: function () {
                ok(true, 'Triggers callback number ' + index.toString());
                index += 1;
            }
        }).fileupload('add', param).fileupload('add', param2);
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
                send: function () {
                    sendIndex += 1;
                },
                done: function () {
                    loadIndex += 1;
                    strictEqual(sendIndex, loadIndex, 'upload in order');
                },
                fail: function (e, data) {
                    strictEqual(data.errorThrown, 'abort', 'upload aborted');
                },
                stop: function () {
                    start();
                }
            });
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        fu.fileupload('add', param);
    });

    asyncTest('limitConcurrentUploads', function () {
        expect(12);
        var param = {files: [
                {name: '1'},
                {name: '2'},
                {name: '3'},
                {name: '4'},
                {name: '5'},
                {name: '6'},
                {name: '7'},
                {name: '8'},
                {name: '9'},
                {name: '10'},
                {name: '11'},
                {name: '12'}
            ]},
            addIndex = 0,
            sendIndex = 0,
            loadIndex = 0,
            fu = $('#fileupload').fileupload({
                limitConcurrentUploads: 3,
                add: function (e, data) {
                    addIndex += 1;
                    if (addIndex === 4) {
                        data.submit().abort();
                    } else {
                        data.submit();
                    }
                },
                send: function () {
                    sendIndex += 1;
                },
                done: function () {
                    loadIndex += 1;
                    ok(sendIndex - loadIndex < 3);
                },
                fail: function (e, data) {
                    strictEqual(data.errorThrown, 'abort', 'upload aborted');
                },
                stop: function () {
                    start();
                }
            });
        (fu.data('blueimp-fileupload') || fu.data('fileupload'))
            ._isXHRUpload = function () {
                return true;
            };
        fu.fileupload('add', param);
    });

    if ($.support.xhrFileUpload) {
        asyncTest('multipart', function () {
            expect(2);
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
                            data.headers['Content-Disposition'],
                            'attachment; filename="' + param.files[0].name + '"',
                            'non-multipart upload sets Content-Disposition header'
                        );
                        start();
                    }
                });
            fu.fileupload('send', param);
        });
    }

    module('UI Initialization', lifecycleUI);

    test('Widget initialization', function () {
        var fu = $('#fileupload').fileupload();
        ok(fu.data('blueimp-fileupload') || fu.data('fileupload'));
        ok(
            $('#fileupload').fileupload('option', 'uploadTemplate').length,
            'Initialized upload template'
        );
        ok(
            $('#fileupload').fileupload('option', 'downloadTemplate').length,
            'Initialized download template'
        );
    });

    test('Buttonbar event listeners', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar'),
            files = [{name: 'test'}];
        expect(4);
        $('#fileupload').fileupload({
            send: function () {
                ok(true, 'Started file upload via global start button');
            },
            fail: function (e, data) {
                ok(true, 'Canceled file upload via global cancel button');
                data.context.remove();
            },
            destroy: function () {
                ok(true, 'Delete action called via global delete button');
            }
        });
        $('#fileupload').fileupload('add', {files: files});
        buttonbar.find('.cancel').click();
        $('#fileupload').fileupload('add', {files: files});
        buttonbar.find('.start').click();
        buttonbar.find('.cancel').click();
        files[0].deleteUrl = 'http://example.org/banana.jpg';
        ($('#fileupload').data('blueimp-fileupload') ||
                $('#fileupload').data('fileupload'))
            ._renderDownload(files)
            .appendTo($('#fileupload .files')).show()
            .find('.toggle').click();
        buttonbar.find('.delete').click();
    });

    module('UI API', lifecycleUI);

    test('destroy', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar'),
            files = [{name: 'test'}];
        expect(1);
        $('#fileupload').fileupload({
            send: function () {
                ok(true, 'This test should not run');
                return false;
            }
        })
            .fileupload('add', {files: files})
            .fileupload('destroy');
        buttonbar.find('.start').click(function () {
            ok(true, 'Clicked global start button');
            return false;
        }).click();
    });

    test('disable/enable', function () {
        var buttonbar = $('#fileupload .fileupload-buttonbar');
        $('#fileupload').fileupload();
        $('#fileupload').fileupload('disable');
        strictEqual(
            buttonbar.find('input[type=file], button').not(':disabled').length,
            0,
            'Disables the buttonbar buttons'
        );
        $('#fileupload').fileupload('enable');
        strictEqual(
            buttonbar.find('input[type=file], button').not(':disabled').length,
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
        ($('#fileupload').data('blueimp-fileupload') ||
                $('#fileupload').data('fileupload'))
            ._renderDownload([{
                name: 'test',
                deleteUrl: 'test',
                deleteType: 'DELETE'
            }])
            .appendTo($('#fileupload .files'))
            .show()
            .find('.toggle').click();
        $('#fileupload .fileupload-buttonbar .delete').click();
    });

    asyncTest('added', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            added: function (e, data) {
                start();
                strictEqual(
                    data.files[0].name,
                    param.files[0].name,
                    'Triggers added callback'
                );
            },
            send: function () {
                return false;
            }
        }).fileupload('add', param);
    });

    asyncTest('started', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            started: function () {
                start();
                ok('Triggers started callback');
                return false;
            },
            sent: function () {
                return false;
            }
        }).fileupload('send', param);
    });

    asyncTest('sent', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            sent: function (e, data) {
                start();
                strictEqual(
                    data.files[0].name,
                    param.files[0].name,
                    'Triggers sent callback'
                );
                return false;
            }
        }).fileupload('send', param);
    });

    asyncTest('completed', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            completed: function () {
                start();
                ok('Triggers completed callback');
                return false;
            }
        }).fileupload('send', param);
    });

    asyncTest('failed', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            failed: function () {
                start();
                ok('Triggers failed callback');
                return false;
            }
        }).fileupload('send', param).abort();
    });

    asyncTest('stopped', function () {
        expect(1);
        var param = {files: [{name: 'test'}]};
        $('#fileupload').fileupload({
            stopped: function () {
                start();
                ok('Triggers stopped callback');
                return false;
            }
        }).fileupload('send', param);
    });

    asyncTest('destroyed', function () {
        expect(1);
        $('#fileupload').fileupload({
            dataType: 'html',
            destroyed: function () {
                start();
                ok(true, 'Triggers destroyed callback');
            }
        });
        ($('#fileupload').data('blueimp-fileupload') ||
                $('#fileupload').data('fileupload'))
            ._renderDownload([{
                name: 'test',
                deleteUrl: '.',
                deleteType: 'GET'
            }])
            .appendTo($('#fileupload .files'))
            .show()
            .find('.toggle').click();
        $('#fileupload .fileupload-buttonbar .delete').click();
    });

    module('UI Options', lifecycleUI);

    test('autoUpload', function () {
        expect(1);
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                send: function () {
                    ok(true, 'Started file upload automatically');
                    return false;
                }
            })
            .fileupload('add', {files: [{name: 'test'}]})
            .fileupload('option', 'autoUpload', false)
            .fileupload('add', {files: [{name: 'test'}]});
    });

    test('maxNumberOfFiles', function () {
        expect(3);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                maxNumberOfFiles: 3,
                singleFileUploads: false,
                send: function () {
                    strictEqual(
                        sendIndex += 1,
                        addIndex
                    );
                },
                progress: $.noop,
                progressall: $.noop,
                done: $.noop,
                stop: $.noop
            })
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload('add', {files: [{name: (addIndex += 1)}]})
            .fileupload('add', {files: [{name: 'test'}]});
    });

    test('maxFileSize', function () {
        expect(2);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                maxFileSize: 1000,
                send: function () {
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
                        !$.blueimp.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            });
    });

    test('minFileSize', function () {
        expect(2);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                minFileSize: 1000,
                send: function () {
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
                        !$.blueimp.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            });
    });

    test('acceptFileTypes', function () {
        expect(2);
        var addIndex = 0,
            sendIndex = 0;
        $('#fileupload')
            .fileupload({
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                disableImageMetaDataLoad: true,
                send: function () {
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
                        !$.blueimp.fileupload.prototype.options
                            .send.call(this, e, data)
                    );
                    return false;
                }
            });
    });

    test('acceptFileTypes as HTML5 data attribute', function () {
        expect(2);
        var regExp = /(\.|\/)(gif|jpe?g|png)$/i;
        $('#fileupload')
            .attr('data-accept-file-types', regExp.toString())
            .fileupload();
        strictEqual(
            $.type($('#fileupload').fileupload('option', 'acceptFileTypes')),
            $.type(regExp)
        );
        strictEqual(
            $('#fileupload').fileupload('option', 'acceptFileTypes').toString(),
            regExp.toString()
        );
    });

});
