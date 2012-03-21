using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.SessionState;
using Newtonsoft.Json;

namespace JQueryFileUpload
{

    /// <summary>
    /// Server side handler for the jQuery File Upload. Must be added in Web.config to function.
    /// </summary>
    /// <remarks>
    /// See <a href="http://blueimp.github.com/jQuery-File-Upload/">http://blueimp.github.com/jQuery-File-Upload/</a>
    /// </remarks>
    public class UploadHttpHandler : IHttpHandler, IRequiresSessionState
    {
        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            var sessionStore = GetSessionStore(context);
            if (context.Request.HttpMethod == "GET")
            {
                //provide upload control with list of known files
                WriteFileListJson(context, sessionStore);
                return;
            }
            if (context.Request.HttpMethod != "POST")
            {
                context.Response.StatusCode = 403;
                context.Response.Write("<html><head></head><body><h1>403 - Forbidden</h1><p>Uploaded files must be POSTed.</p></body></html>");
                return;
            }
            if (context.Request.Files.Count == 0)
            {
                throw new Exception("File missing from form post");
            }
            if (context.Request.Files.Count > 1)
            {
                throw new NotImplementedException("Currently only supports single file at a time.");
            }
            var uploadedFiles = new Dictionary<string, FileData>();
            foreach (var key in context.Request.Files.AllKeys)
            {
                var file = context.Request.Files[key];
                var savePath = SaveUploadToDisk(file);
                var fileName = file.FileName;
                fileName = NextUniqueFilename(fileName, sessionStore.ContainsKey);
                var fileData = new FileData
                                {
                                    Name = fileName,
                                    Size = file.ContentLength,
                                    SavePath = savePath
                                };
                uploadedFiles.Add(fileName, fileData);
                sessionStore.Add(fileName, fileData);
            }
            WriteFileListJson(context, uploadedFiles);
        }

        /// <summary>
        /// Finds the next unused unique (numbered) filename.
        /// </summary>
        /// <param name="fileName">Name of the file.</param>
        /// <param name="inUse">Function that will determine if the name is already in use</param>
        /// <returns>The original filename if it wasn't already used, or the filename with " (n)"
        /// added to the name if the original filename is already in use.</returns>
        private static string NextUniqueFilename(string fileName, Func<string, bool> inUse)
        {
            // http://stackoverflow.com/questions/1078003/c-how-would-you-make-a-unique-filename-by-adding-a-number/9806736#9806736
            if (!inUse(fileName))
            {
                // this filename has not been seen before, return it unmodified
                return fileName;
            }
            // this filename is already in use, add " (n)" to the end
            var name = Path.GetFileNameWithoutExtension(fileName);
            var extension = Path.GetExtension(fileName);
            if (name == null)
            {
                throw new Exception("File name without extension returned null.");
            }
            const int max = 9999;
            for (var i = 1; i < max; i++)
            {
                var nextUniqueFilename = string.Format("{0} ({1}){2}", name, i, extension);
                if (!inUse(nextUniqueFilename))
                {
                    return nextUniqueFilename;
                }
            }
            throw new Exception(string.Format("Too many files by this name. Limit: {0}", max));
        }

        /// <summary>
        /// Writes the file list as JSON to the httpcontect, setting content type and encoding.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="uploadedFiles">The uploaded files to write out.</param>
        private static void WriteFileListJson(HttpContext context, Dictionary<string, FileData> uploadedFiles)
        {
            // text/plain for IE / Opera which don't handle application/json. Ref https://github.com/blueimp/jQuery-File-Upload/wiki/Setup
            context.Response.ContentType = context.Request.AcceptTypes != null && context.Request.AcceptTypes.AsQueryable().Contains("application/json") ? "application/json" : "text/plain";
            context.Response.ContentEncoding = Encoding.UTF8;
            //ref http://johnnycoder.com/blog/2008/12/16/httphandler-json-data/
            var results = new List<object>();
            foreach (var file in uploadedFiles)
            {
                results.Add(new
                                {
                                    name = file.Value.Name,
                                    size = file.Value.Size
                                });
            }
            context.Response.Write(JsonConvert.SerializeObject(results));
        }

        /// <summary>
        /// Saves the uploaded file to the temp folder with the right extension and a temporary file name.
        /// </summary>
        /// <param name="file">The file.</param>
        /// <returns>The path to the saved file</returns>
        private static string SaveUploadToDisk(HttpPostedFile file)
        {
            var path = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            path = Path.ChangeExtension(path, Path.GetExtension(file.FileName));
            file.SaveAs(path);
            return path;
        }

        /// <summary>
        /// Unzips the file, loops through the slides and adds them as pages
        /// </summary>
        /// <param name="zipFilePath">The path to the zip file containing the presentation.</param>
        private void ProcessPresentation(string zipFilePath)
        {
            
        }

        /// <summary>
        /// Get session storage for list of uploaded files. Creates dictionary if missing.
        /// </summary>
        /// <param name="context">The http context.</param>
        /// <returns></returns>
        private static Dictionary<string, FileData> GetSessionStore(HttpContext context)
        {
            if (context.Session["UploadedFileHandler_Files"] == null)
            {
                context.Session["UploadedFileHandler_Files"] = new Dictionary<string, FileData>();
            }
            return (Dictionary<string, FileData>)context.Session["UploadedFileHandler_Files"];
        }

        /// <summary>
        /// Container for all the data we need to know about an uploaded file,
        /// including data for redisplay in the uploader, and where the temp file
        /// is saved.
        /// </summary>
        private class FileData
        {
            public string Name { get; set; }
            public long Size { get; set; }
            public string SavePath { get; set; }
        }
    }
}