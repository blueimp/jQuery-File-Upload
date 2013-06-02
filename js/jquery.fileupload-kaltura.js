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
            ks:null,
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


            },
            getFilesFromResponse:function (data) {
                return    [
                    { "name": data.result.fileName,
                        "size": data.result.fileSize,
                        "url": "http://www.kaltura.com/api_v3/?service=uploadToken&action=get&ks=" + data.ks +"&uploadTokenId=" + data.result.id ,
                        "thumbnail_url": 'http://123.com',
                        "delete_url": "http://www.kaltura.com/api_v3/?service=uploadToken&action=delete&ks=" + data.ks +"&uploadTokenId=" + data.result.id ,
                        "delete_type": "GET"
                    }]
                }
    },

        beforeAdd: function (e, data) {

            var masterdfd = new jQuery.Deferred();
            var that = this;
            if (!this.options.ks)
            {
                alert("Missing KS");
                return;
            }
            var getUpload = function(tokenId) {
                var dfd = new jQuery.Deferred();
                $.ajax({
                    url:'http://www.kaltura.com/api_v3/?service=uploadToken&action=get&format=1',
                    data:{uploadTokenId:tokenId,ks:that.options.ks},
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
                    url:'http://www.kaltura.com/api_v3/?service=uploadToken&action=list&format=1',
                    //TODO:filter is not working need to check it
                    data:{
                        'filter:objectType':'KalturaUploadTokenFilter',
                        'filter:advancedSearch:objectType':'KalturaSearchCondition',
                        'filter:advancedSearch:field':'fileName',
                        'filter:advancedSearch:value':fileName,
                        ks:that.options.ks},
                    type:"POST"
                }).done(function(response)
                    {
                        if (response && response.objects && response.objects.length > 0)
                        {
                            for (var index = 0 ; index < response.objects.length ; index ++)
                            {
                                var currentObject = response.objects[index];
                                if (fileName == currentObject.fileName && size == currentObject.fileSize && currentObject.uploadedFileSize != size)
                                {
                                    dfd.resolve(currentObject);
                                    return;
                                }
                            }
                        }
                        addFileToKaltura();
                    });

                var addFileToKaltura = function(){
                    $.ajax({
                        url:'http://www.kaltura.com/api_v3/?service=uploadToken&action=add&format=1',
                        data:{"uploadToken:fileName":fileName,
                            "uploadToken:fileSize":size,
                            ks:that.options.ks},
                        type:"POST"
                    }).done(function(response)
                        {
                            dfd.resolve(response)
                        });
                }


                return dfd;
            };

            var connectFileToToken = function( kalturaUploadToken, file, data, index )  {
                data.firstChunk=true;
                data.uploadTokenId = kalturaUploadToken.id;
                //should resume
                if (kalturaUploadToken.uploadedFileSize)
                {
                    data.uploadedBytes =  parseInt(kalturaUploadToken.uploadedFileSize);
                    var lastChunk = (parseInt(kalturaUploadToken.fileSize) -
                        parseInt(kalturaUploadToken.uploadedFileSize)  <=
                        $.blueimp.fileupload.prototype.option.maxChunkSize);
                    data.formData = {ks:that.options.ks,
                        uploadTokenId:kalturaUploadToken.id,
                        resume:1,
                        finalChunk:lastChunk ? 1:0,
                        resumeAt:kalturaUploadToken.uploadedFileSize
                    };
                }
                else {
                    data.formData = {ks:that.options.ks,
                        uploadTokenId:kalturaUploadToken.id,
                        resume:0,
                        finalChunk:0,
                        resumeAt:0};
                }
                masterdfd.resolve(data);
            }
            $.each(data.files, function (index, file) {
                $.when(addFile(file.name,file.size)).then(
                    function(kalturaUploadToken){
                        connectFileToToken(kalturaUploadToken, file, data, index);
                    });
            });
            return masterdfd;
        }
    })
}));