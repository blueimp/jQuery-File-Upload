// Requires croppie.js (https://github.com/Foliotek/Croppie/raw/master/croppie.min.js )
// Requires all fileupload dependencies for jquery.fileupload-image.js, including this files itself.


// Add cropping to fileupload

	$.blueimp.fileupload.prototype.processActions.cropImage = function (data, options) {
    	var $uploadCrop;
	    var dfd = $.Deferred(),
	    file = data.files[data.index];
		$uploadCrop = $(data.preview).croppie({
		    viewport: {
		        width: 200,
		        height: 200,
		        type: 'square'
		    },
		    boundary: {
		        width: 300,
		        height: 300
		    }
		});
		$('cr-original-image').croppie();
		$('.upload-result').on('click', function (ev) {
			$uploadCrop.croppie(data, {
				type: 'canvas',
				size: 'viewport'
			}).then(function (resp) {

				// replace input by cropped input
			});
		});
			    

	   dfd.resolveWith(this, [data]);

	    return dfd.promise();
	};

	$('#fileupload').fileupload({
	    processQueue: [
	    	{   action: 'loadImageMetaData'
	    	},
	        {
	            action: 'loadImage',
	            prefix: true,
	        },
	        {
	            action: 'resizeImage',
	            prefix: 'image',

	        },
	        
	        {action: 'saveImage'},
	        {action: 'saveImageMetaData'},
	        {
	            action: 'resizeImage',
	            prefix: 'preview',

	        },
	        
	        {action: 'setImage'},
	        {
	        	action: 'cropImage',
	        },
	        
	        
	        {action: 'deleteImageReferences'},

	    ]
	});
