/*
 * jQuery File Upload Plugin JS Example 4.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint browser: true, regexp: false */
/*global $ */

$(function () {
    $('html').removeClass('no_js');
    
    var fileUploadOptions = {
            uploadTable: $('#files'),
            progressAllNode: $('#file_upload_progress div'),
            buildUploadRow: function (files, index) {
                var baseFileName = files[index].name.replace(/^.*[\/\\]/, ''),
                    encodedFileName = encodeURIComponent(baseFileName);
                return $('#template_upload').clone().removeAttr('id')
                    .attr('data-file-id', encodedFileName)
                    .find('.file_upload_name').text(baseFileName)
                    .closest('tr');
            },
            buildDownloadRow: function (file) {
                var encodedFileName = encodeURIComponent(file.name);
                return $('#template_download').clone().removeAttr('id')
                    .attr('data-file-id', encodedFileName)
                    .find('.file_upload_name a').text(file.name)
                    .attr('href', 'upload/' + encodedFileName)
                    .closest('tr');
            },
            beforeSend: function (event, files, index, xhr, handler, callBack) {
                handler.uploadRow.find('.file_upload_start button').click(function () {
                    $(this).remove();
                    $.getJSON(
                        'upload.php?file=' + handler.uploadRow.attr('data-file-id'),
                        function (file) {
                            if (file && file.size !== files[index].size) {
                                handler.uploadedBytes = file.size;
                            }
                            callBack();
                        }
                    );
                    return false;
                });
            },
            maxChunkSize: 10000000
        };
        
    $.getJSON('upload.php', function (files) {
        var filesTable = $('#files');
        $.each(files, function (index, file) {
            fileUploadOptions.buildDownloadRow(file)
                .appendTo(filesTable).fadeIn();
        });
    });
    
    $('#files .file_upload_delete button').live('click', function () {
        var row = $(this).closest('tr');
        $.ajax('upload.php?file=' + row.attr('data-file-id'), {
            type: 'DELETE',
            success: function () {
                row.fadeOut(function () {
                    row.remove();
                });
            }
        });
        return false;
    });
    
    $('#file_upload_start, #file_upload_cancel, #file_upload_delete').click(function () {
        $('#files .' + $(this).attr('id') + ' button:visible').click();
        return false;
    });
    
    $('#file_upload')
        .attr('action', 'upload.php')
        .fileUploadUI(fileUploadOptions);
});