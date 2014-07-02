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
	var executeCordova;

    var originalAdd = $.blueimp.fileupload.prototype.options.add;
    var originaldone = $.blueimp.fileupload.prototype.options.done;

    // The File Upload Processing plugin extends the fileupload widget
    // with file processing functionality:
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
        options: {
            ks:null,
            apiURL:'http://www.kaltura.com/api_v3/',
            url: 'http://www.kaltura.com/api_v3/?service=uploadToken&action=upload&format=1',
			host: 'http://www.kaltura.com',
			isAndroidNative: false,
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
                else
                {
                    data.formData["finalChunk"] = 0;
                }


            },
            chunkdone: function(e, data){

            },
            chunksend:function(e, data){
            } ,
            addfail:function(e,data){
                 if (window && window.console && window.console.log)
                 {
                     console.log("addfail:",data);
                 }
            },
            getFilesFromResponse:function (data) {
	         return    [
                    { "name": data.result.fileName,
                        "size": data.result.fileSize,
                        "url": data.apiURL + "?service=uploadToken&action=get&ks=" + data.ks +"&uploadTokenId=" + data.result.id ,
                        "thumbnail_url": 'http://123.com',
                        "delete_url": data.apiURL + "?service=uploadToken&action=delete&ks=" + data.ks +"&uploadTokenId=" + data.result.id ,
                        "delete_type": "GET",
                        "create_url":data.apiURL + "?service=baseEntry&action=addfromuploadedfile&format=1&entry:objectType=KalturaBaseEntry&entry:type=-1&entry:name="+data.result.fileName+"&ks=" + data.ks +"&uploadTokenId=" + data.result.id ,
                        "create_type":"GET"
                    }]
                }
    },
        _getUploadedBytes: function (jqXHR) {
            if (jqXHR && jqXHR.responseText && jqXHR.responseText.indexOf("uploadedFileSize") > 0)
            {
                var upperBytesPos = parseInt(JSON.parse(jqXHR.responseText).uploadedFileSize);
                return upperBytesPos;
            }
            return null;
        },
        _verifyResult: function (result){
            if (result && result.code)
            {
                return false;
            }
            return true;
         },
        beforeAdd: function (e, data) {
            var masterdfd = new jQuery.Deferred();
            var that = this;
            if (!this.options.ks)
            {
                if (window && window.console && window.console.log)
                {
                 console.log("Missing KS");
                }
                return;
            }

			//disable chunks if Android native browser
			if ( navigator.userAgent.indexOf( 'Android') != -1 && ( navigator.userAgent.indexOf( 'Chrome') == -1 && !isNativeApp))  {
				that.options.maxChunkSize = undefined;
			}
            var getUpload = function(tokenId) {
                var dfd = new jQuery.Deferred();

                $.ajax({
                    url:that.options.apiURL +  '?service=uploadToken&action=get&format=9',
                    data:{uploadTokenId:tokenId,ks:that.options.ks},
                    type: "GET",
	                dataType:"jsonp"
                }).done(function(response)
                    {
                        if (that._verifyResult(response))
                        {
                            dfd.resolve(response);
                        }
                        else
                        {
                            dfd.reject(response);
                        }
                    });
                return dfd;
            };

            var addFile = function(fileName,size) {
                var dfd = new jQuery.Deferred();
                $.ajax({
                    url:that.options.apiURL + '?service=uploadToken&action=list&format=9',
                    //TODO:filter is not working need to check it
                    data:{   'filter:statusEqual':1,
                        'filter:objectType':'KalturaUploadTokenFilter',
                        'filter:advancedSearch:objectType':'KalturaSearchCondition',
                        'filter:advancedSearch:field':'fileName',
                        'filter:advancedSearch:value':fileName,
                        ks:that.options.ks},
                    type:"GET",
	                dataType:'jsonp'
                }).done(function(response)
                    {
                        if (!that._verifyResult(response))
                        {
                            dfd.reject(response);
                            return;
                        }
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
                        url:that.options.apiURL + '?service=uploadToken&action=add&format=9',
                        data:{"uploadToken:fileName":fileName,
                            "uploadToken:fileSize":size,
                            ks:that.options.ks},
	                    type:"GET",
	                    dataType:'jsonp'
                    }).done(function(response)
                        {

                            if (!that._verifyResult(response))
                            {
                                dfd.reject(response);
                                return;
                            }
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
                        finalChunk:1,
                        resumeAt:0};
                }

				if ( that.options.isAndroidNative ) {
					window.fileUploadProgress =  function ( val ) {
						var data = JSON.parse( val );
						that._trigger(
							'progressall',
							$.Event('progressall', {delegatedEvent: e}),
							data
						);

						that._trigger(
							'progress',
							$.Event('progressall', {delegatedEvent: e}),
							data
						);

						if ( data.loaded >= data.total ) {
							that._trigger('done', null, that.options);
						}
					}

					window.fileUploadFailed = function ( fileName ) {
						var data = {files: [{name: fileName}]}
						that._trigger('failed', e, data);
						that._trigger('finished', e, data);
					}

					executeCordova("startUpload", [ that.options.host, data.formData ] );
					data.autoUpload = false;
					masterdfd.resolve( data );
				} else {
					masterdfd.resolve( data );
				}
            }
            $.each(data.files, function (index, file) {
                $.when(addFile(file.name,file.size)).then(
                    function(kalturaUploadToken){
                        connectFileToToken(kalturaUploadToken, file, data, index);
                    }).fail(function(result)
                    {
                        masterdfd.reject(result);
                    });
            });
            return masterdfd;
        },
        _getSignture: function(params){
            params = this.ksort(params);
            var str = "";
            for(var k in params) {
                var v = params[k];
                str += k + v;
            }
            return MD5(str);


        },
        ksort: function(arr)
        {
            var sArr = [];
            var tArr = [];
            var n = 0;
            for (i in arr)
                tArr[n++] = i+" |"+arr[i];
            tArr = tArr.sort();
            for (var i=0; i<tArr.length; i++) {
                var x = tArr[i].split(" |");
                sArr[x[0]] = x[1];
            }
            return sArr;
        },
        _create: function () {
            var that = this;
            $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {

                var urlParams = $.String.deparam(options.url.split("?")[1]);
	            //if we're doing upload and we're in IE8 we need to change the format from json to xml
	            if (urlParams.action == "upload" &&
		            /msie 8/.test(navigator.userAgent.toLowerCase()))  {
		            options.url = options.url.replace(/format=1/,"format=2");
		            options.format = 2;
	            }
                if (urlParams.action)
                {
                    delete urlParams.action;
                }
                if (urlParams.service)
                {
                }
                if (typeof options.data == "String")
                {
                    var dataParams = $.String.deparam(options.data);
                    if (dataParams.fileData)
                    {
                        delete dataParams.fileData;
                    }
                    $.extend(urlParams,dataParams);
                }
                if (options.formData)
                {
                    $.extend(urlParams,options.formData);
                }
                var signature = that._getSignture(urlParams);
	            if (options.url.indexOf("?") > -1) {
                    options.url = options.url + "&kalsig=" + signature;
	            }   else {
		            options.url = options.url + "?kalsig=" + signature;
	            }



            });
            this._super();

			if ( navigator.userAgent.indexOf( 'Android') != -1 && navigator.userAgent.indexOf('kalturaNativeCordovaPlayer') != -1 ) {
				that.isAndroidNative = true;

				executeCordova= function( methodName, params ) {
					cordova.kWidget.exec( methodName, params ,'FileChooserPlugin');
				};

				that.options.fileInput.click(function(){
					executeCordova("openFileChooser", [ that.element.attr('id') ] );
				});
			}

        }
    })
}));

(function($){

    var digitTest = /^\d+$/,
        keyBreaker = /([^\[\]]+)|(\[\])/g,
        plus = /\+/g,
        paramTest = /([^?#]*)(#.*)?$/;

    /**
     * @add jQuery.String
     */
    $.String = $.extend($.String || {}, {

        /**
         * @function deparam
         *
         * Takes a string of name value pairs and returns a Object literal that represents those params.
         *
         * @param {String} params a string like <code>"foo=bar&person[age]=3"</code>
         * @return {Object} A JavaScript Object that represents the params:
         *
         *     {
		 *       foo: "bar",
		 *       person: {
		 *         age: "3"
		 *       }
		 *     }
         */
        deparam: function(params){

            if(! params || ! paramTest.test(params) ) {
                return {};
            }


            var data = {},
                pairs = params.split('&'),
                current;

            for(var i=0; i < pairs.length; i++){
                current = data;
                var pair = pairs[i].split('=');

                // if we find foo=1+1=2
                if(pair.length != 2) {
                    pair = [pair[0], pair.slice(1).join("=")]
                }

                var key = decodeURIComponent(pair[0].replace(plus, " ")),
                    value = decodeURIComponent(pair[1].replace(plus, " ")),
                    parts = key.match(keyBreaker);

                for ( var j = 0; j < parts.length - 1; j++ ) {
                    var part = parts[j];
                    if (!current[part] ) {
                        // if what we are pointing to looks like an array
                        current[part] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {}
                    }
                    current = current[part];
                }
                lastPart = parts[parts.length - 1];
                if(lastPart == "[]"){
                    current.push(value)
                }else{
                    current[lastPart] = value;
                }
            }
            return data;
        }
    });

})(jQuery)
