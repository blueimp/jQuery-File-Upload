/*
 * jQuery File Upload Plugin Angular JS Example 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global window, angular */

(function () {
    'use strict';

    var isOnGitHub = window.location.hostname === 'blueimp.github.com' ||
        window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'server/php/';

    angular.module('demo', [
        'blueimp.fileupload'
    ])
        .config([
            'fileUploadProvider',
            function (fileUploadProvider) {
                if (isOnGitHub) {
                    // Demo settings:
                    angular.extend(fileUploadProvider.defaults, {
                        disableImageResize: false,
                        maxFileSize: 5000000,
                        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
                    });
                }
            }
        ])

        .controller('DemoFileUploadController', [
            '$scope', '$http',
            function ($scope, $http) {
                $scope.loadingFiles = true;
                $http.get(url)
                    .then(function (response) {
                        $scope.loadingFiles = false;
                        $scope.queue = response.data.files;
                    });
            }
        ])

        .controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.delete_url,
                            method: file.delete_type
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                }
            }
        ]);

}());
