# Issue Guidelines

The issues tracker should only be used for **bugs** or **feature requests**.

Please post **support requests** and **general discussions** about this project to the [support forum](https://groups.google.com/d/forum/jquery-fileupload).

## Bugs

Please follow these guidelines before reporting a bug:

1. **Update to the latest version** &mdash; Check if you can reproduce the issue with the latest version from the `master` branch.

2. **Use the GitHub issue search** &mdash; check if the issue has already been reported. If it has been, please comment on the existing issue.

3. **Isolate the demonstrable problem** &mdash; Try to reproduce the problem with the [Demo](http://blueimp.github.io/jQuery-File-Upload/) or with a reduced test case that includes the least amount of code necessary to reproduce the problem.

4. **Provide a means to reproduce the problem** &mdash; Please provide as much details as possible, e.g. server information, browser and operating system versions, steps to reproduce the problem. If possible, provide a link to your reduced test case, e.g. via [JSFiddle](http://jsfiddle.net/). 


## Feature requests

Please follow the bug guidelines above for feature requests, i.e. update to the latest version and search for exising issues before posting a new request.

Generally, feature requests might be accepted if the implementation would benefit a broader use case or the project could be considered incomplete without that feature.

If you need help integrating this project into another framework, please post your request to the [support forum](https://groups.google.com/d/forum/jquery-fileupload).

## Pull requests

[Pull requests](https://help.github.com/articles/using-pull-requests) are welcome and the preferred way of accepting code contributions.

However, if you add a server-side upload handler implementation for another framework, please continue to maintain this version in your own fork without sending a pull request. You are welcome to add a link and possibly documentation about your implementation to the [Wiki](https://github.com/blueimp/jQuery-File-Upload/wiki).

Please follow these guidelines before sending a pull request:

1. Update your fork to the latest upstream version.

2. Follow the coding conventions of the original repository. Changes to one of the JavaScript source files are required to pass the [JSLint](http://jslint.com/) validation tool.

3. Keep your commits as atomar as possible, i.e. create a new commit for every single bug fix or feature added.

4. Always add meaningfull commit messages.
