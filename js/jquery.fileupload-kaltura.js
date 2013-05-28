/**
 * jQuery File Upload Processing Plugin 1.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT

 * User: itayk
 * Date: 5/27/13
 * Time: 6:36 PM
 */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            './jquery.fileupload'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery
        );
    }
}(function ($) {
    'use strict';

    var originalAdd = $.blueimp.fileupload.prototype.options.add;
    var originaldone = $.blueimp.fileupload.prototype.options.done;

    // The File Upload Processing plugin extends the fileupload widget
    // with file processing functionality:
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {

        options: {
            chunkbefore: function (e, data) {

                var isLastChunk = data.maxChunkSize -  data.chunkSize >  0;
                var isFirstChunk = data.uploadedBytes == 0;
                if (!isFirstChunk)   {
                    data.formData["resume"] = 1;
                    data.formData["resumeAt"] = data.uploadedBytes;
                }
                if (isLastChunk) {
                    data.formData["finalChunk"] = 1;
                }
                console.log("LastChunk:" + isLastChunk + "; FirstChunk:" + isFirstChunk);


            },
            getFilesFromResponse:function (data) {
              //  data.result.files =  data.result.files || [];
             //   data.result.files.push(
                return    [
                    { "name": data.result.fileName,
                        "size": data.result.fileSize,
                        "url": "http://www.kaltura.com/api_v3/?service=uploadToken&action=get&ks=" + ks +"&uploadTokenId=" + data.result.id ,
                        "thumbnail_url": 'http://123.com',
                        "delete_url": "http://www.kaltura.com/api_v3/?service=uploadToken&action=delete&ks=" + ks +"&uploadTokenId=" + data.result.id ,
                        "delete_type": "GET"
                    }]


                }



    },

        beforeAdd: function (e, data) {

            var masterdfd = new jQuery.Deferred();

            var that = this;
            var getUpload = function(tokenId) {
                var dfd = new jQuery.Deferred();
                $.ajax({
                    url:'http://www.kaltura.com/api_v3/?service=uploadToken&action=get&format=1',
                    data:{uploadTokenId:tokenId,ks:ks},
                    type: "POST"
                }).done(function(response)
                    {
                        dfd.resolve(response);
                    });
                return dfd;
            };

            var addFile = function(fileName,size) {
                var dfd = new jQuery.Deferred();
                $.ajax({
                    url:'http://www.kaltura.com/api_v3/?service=uploadToken&action=add&format=1',
                    data:{"uploadToken:fileName":fileName,
                        "uploadToken:fileSize":size,
                        ks:ks},
                    type:"POST"
                }).done(function(response)
                    {
                        dfd.resolve(response)
                    });

                return dfd;
            };

            var connectFileToToken = function( kalturaUploadToken, file, data, index )  {
                data.firstChunk=true;
                //should resume
                if (kalturaUploadToken.uploadedFileSize)
                {
                    var lastChunk = (parseInt(kalturaUploadToken.fileSize) -
                        parseInt(kalturaUploadToken.uploadedFileSize)  <=
                        $(that).fileupload('option','maxChunkSize'));
                    data.formData = {ks:ks,
                        uploadTokenId:kalturaUploadToken.id,
                        resume:1,
                        finalChunk:lastChunk ? 1:0,
                        resumeAt:kalturaUploadToken.uploadedFileSize
                    };
                }
                else {
                    data.formData = {ks:ks,
                        uploadTokenId:kalturaUploadToken.id,
                        resume:0,
                        finalChunk:0,
                        resumeAt:0};
                }



                masterdfd.resolve(data);
            }

            //if we're is resume mode
            if ($.blueimp.fileupload.prototype.option.uploadTokenId)
            {
                $.when(getUpload($.blueimp.fileupload.prototype.option.uploadTokenId)).then(function(kalturaUploadToken)
                {
                    $.each(data.files, function (index, file) {
                        connectFileToToken(kalturaUploadToken, file, data , index);
                    });
                })
            }
            else {

                $.each(data.files, function (index, file) {
                    $.when(addFile(file.name,file.size)).then(
                        function(kalturaUploadToken){
                            connectFileToToken(kalturaUploadToken, file, data, index);
                        });
                });
            }
            return masterdfd;
        }

    })
}));