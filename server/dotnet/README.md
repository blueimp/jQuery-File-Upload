# ASP.NET server side demo for jQuery File Upload

## To try out this .net version
Change the "action" attribute in form line of ../../index.html to:
* action="server/dotnet/file.upload"

You will need to set up IIS to the root folder of the plugin as a virtual directory,
and you will need to make this folder (server/dotnet/) into an IIS application.
* howto: http://www.banmanpro.com/support2/appstartpoint.asp

## Status
Currently this example stores the uploaded file in the server's temp directory
and stores information about the uploaded file in session state, but doesn't
provide thumbnails or serve it back up again.
