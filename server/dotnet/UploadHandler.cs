/*
 * jQuery File Upload Plugin C# Example 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * PHP Version: Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 * 
 * Translated to C# by Shannon Whitley 2012
 * http://whitleymedia.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
/*
 * Notes:  Form action must reference the full url, including default.aspx.
 *         Orientation and Resumable Downloads are not current supported.
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Text.RegularExpressions;
using System.Runtime.Serialization.Json;
using System.Text;


namespace jQueryFileUpload
{
    public class UploadHandler
    {
        public string script_url { get; set; }
        public string upload_dir { get; set; }
        public string upload_url { get; set; }
        public string param_name { get; set; }
        public string delete_type { get; set; }
        public int max_file_size { get; set; }
        public int min_file_size { get; set; }
        public string accept_file_types { get; set; }
        public int max_number_of_files { get; set; }
        public int max_width { get; set; }
        public int max_height { get; set; }
        public int min_width { get; set; }
        public int min_height { get; set; }
        public bool discard_aborted_uploads { get; set; }
        //TODO: Enable this later if needed.
        //      The orientation code has not been written.
        //public bool orient_images { get; set; }
        Dictionary<string, UploadFileInfo> image_versions = null;
        public class UploadFileInfo
        {
            public string name { get; set; }
            public long size { get; set; }
            public int width { get; set; }
            public int height { get; set; }
            public string type { get; set; }
            public string dir { get; set; }
            public string url { get; set; }
            public string thumbnail_url { get; set; }
            public string error { get; set; }
            public string delete_type { get; set; }
            public string delete_url { get; set; }
            public Dictionary<string, UploadFileInfo> image_versions { get; set; }
        }

        public UploadHandler()
        {
            PropertiesInit(null, null);
        }

        public UploadHandler(string path, string url)
        {
            PropertiesInit(path, url);
        }

        private void PropertiesInit(string path, string url)
        {
            this.script_url = url;
            this.upload_dir = path + "/files/";
            this.upload_url = url + "/files/";
            this.param_name = "files";
            // Set the following option to 'POST', if your server does not support
            // DELETE requests. This is a parameter sent to the client:
            this.delete_type = "DELETE";
            // The web.config setting maxRequestLength
            // takes precedence over max_file_size:
            //<system.web>
            //<httpRuntime executionTimeout="240" maxRequestLength="10124" />
            //</system.web>
            this.max_file_size = 10124000;
            this.min_file_size = 1;
            this.accept_file_types = @"^.+\.((jpg)|(gif)|(jpeg)|(png))$";
            // The maximum number of files for the upload directory:
            this.max_number_of_files = -1;
            // Image resolution restrictions:
            this.max_width = -1;
            this.max_height = -1;
            this.min_width = 1;
            this.min_height = 1;
            //Set the following option to false to enable resumable uploads:
            this.discard_aborted_uploads = true;
            //Set to true to rotate images based on EXIF meta data, if available:
            //this.orient_images = false;
            // Uncomment the following version to restrict the size of
            // uploaded images. You can also add additional versions with
            // their own upload directories:
            /*this.image_versions = new Dictionary<string, UploadFileInfo>() {
                {"Large",new UploadFileInfo(){width=250,height=250, dir=this.upload_dir + "Large/", url=this.upload_url + "Large/"}}
                ,{"Thumbnail",new UploadFileInfo(){width=80,height=80, dir=this.upload_dir + "Thumbnail/", url = this.upload_url + "Thumbnail/"}}
            };*/
        }

        public UploadFileInfo FileDeleteUrlSet(UploadFileInfo file)
        {
            file.delete_url = this.script_url + "/Default.aspx?file=" + HttpUtility.UrlEncode(file.name);
            file.delete_type = this.delete_type;
            if (file.delete_type != "DELETE")
            {
                file.delete_url += "&_method=DELETE";
            }

            return file;
        }

        public UploadFileInfo FileObjectGet(string file_name)
        {
            UploadFileInfo file = new UploadFileInfo();
            string file_path = this.upload_dir + file_name;
            if (File.Exists(file_path) && file_name.Length > 0 && file_name.Substring(0, 1) != ".")
            {
                file.name = file_name;
                file.size = new FileInfo(file_path).Length;
                file.url = this.upload_url + HttpUtility.UrlEncode(file_name);
                if (this.image_versions != null)
                {
                    file.image_versions = new Dictionary<string, UploadFileInfo>();
                    foreach (string version in this.image_versions.Keys)
                    {
                        if (File.Exists(this.image_versions[version].dir + file_name))
                        {
                            file.image_versions.Add(version, new UploadFileInfo()
                            {
                                name = file_name
                                , dir = this.image_versions[version].dir
                                , url = this.image_versions[version].url + HttpUtility.UrlEncode(file_name)
                            });
                        }
                    }
                }
                if (file.image_versions != null && file.image_versions.ContainsKey("Thumbnail"))
                {
                    file.thumbnail_url = file.image_versions["Thumbnail"].url;
                }
                file = FileDeleteUrlSet(file);
            }
            return file;
        }

        public List<UploadFileInfo> FileObjectsGet()
        {
            List<UploadFileInfo> infoList = new List<UploadFileInfo>();
            foreach (string file in Directory.GetFiles(this.upload_dir))
            {
                infoList.Add(FileObjectGet(Path.GetFileName(file)));
            }
            return infoList;
        }

        public bool ScaledImageCreate(UploadFileInfo file)
        {
            string file_path = this.upload_dir + file.name;
            string new_file_path = file.dir + file.name;
            Image img = Image.FromFile(file_path);
            string fileNameExtension = Path.GetExtension(file_path).ToLower();
            ImageFormat imageType = GetImageType(fileNameExtension);
            if (img == null)
            {
                return false;
            }
            int img_width = img.Width;
            int img_height = img.Height;

            if (img_width < 1 || img_height < 1)
            {
                return false;
            }

            float scale = Math.Min(file.width / (float)img_width, file.height / (float)img_height);

            int new_width = (int)Math.Round(img_width * scale, 0);
            int new_height = (int)Math.Round(img_height * scale, 0);

            Bitmap new_image = new Bitmap(new_width, new_height);
            Graphics g = Graphics.FromImage(new_image);
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;

            foreach (PropertyItem pItem in img.PropertyItems)
            {
                new_image.SetPropertyItem(pItem);
            }

            g.DrawImage(img, new Rectangle(0, 0, new_width, new_height));

            img.Dispose();

            new_image.Save(new_file_path, imageType);
            new_image.Dispose();

            return true;
        }

        private static ImageFormat GetImageType(string fileExt)
        {
            switch (fileExt)
            {
                case ".jpg":
                    return ImageFormat.Jpeg;
                case ".gif":
                    return ImageFormat.Gif;
                default: // (png)
                    return ImageFormat.Png;
            }
        }

        public bool Validate(HttpPostedFile uploaded_file, UploadFileInfo file, string error, int index)
        {
            if (error != null)
            {
                file.error = error;
                return false;
            }

            if (String.IsNullOrEmpty(file.name))
            {
                file.error = "missingFileName";
                return false;
            }
            if (file.name.IndexOfAny(System.IO.Path.GetInvalidFileNameChars()) != -1)
            {
                file.error = "invalidFileName";
                return false;
            }

            if (!Regex.IsMatch(file.name, this.accept_file_types, RegexOptions.Multiline | RegexOptions.IgnoreCase))
            {
                file.error = "acceptFileTypes";
                return false;
            }

            if (this.max_file_size > 0 && (file.size > this.max_file_size))
            {
                file.error = "maxFileSize";
                return false;
            }
            if (this.min_file_size > 1 && (file.size < this.min_file_size))
            {
                file.error = "minFileSize";
                return false;
            }
            if (this.max_number_of_files > 0 && FileObjectsGet().Count >= this.max_number_of_files)
            {
                file.error = "maxNumberOfFiles";
                return false;
            }

            if (File.Exists(this.upload_dir + file.name) && file.size == new FileInfo(this.upload_dir + file.name).Length)
            {
                using (Image img = Image.FromFile(this.upload_dir + file.name))
                {
                    file.width = img.Width;
                    file.height = img.Height;
                    img.Dispose();
                }

                if ((this.max_width > 0 && file.width > this.max_width) ||
                    (this.max_height > 0 && file.height > this.max_height))
                {
                    file.error = "maxResolution";
                    return false;
                }
                if ((this.min_width > 0 && file.width < this.min_width) ||
                    (this.min_height > 0 && file.height < this.min_height))
                {
                    file.error = "minResolution";
                    return false;
                }
            }

            return true;
        }

        public UploadFileInfo FileUploadHandle(HttpPostedFile uploaded_file, string name, long size, string type, string error, int index)
        {
            UploadFileInfo file = new UploadFileInfo();
            file.name = name;
            file.size = size;
            file.type = type;

            if (Validate(uploaded_file, file, error, index))
            {
                string file_path = this.upload_dir + name;
                bool append_file = !this.discard_aborted_uploads && File.Exists(file_path)
                    || file.size > uploaded_file.InputStream.Length;

                // multipart/formdata uploads (POST method uploads)
                if (append_file)
                {
                    using (FileStream fs = File.Open(file_path, FileMode.Append))
                    {
                        uploaded_file.InputStream.CopyTo(fs);
                        fs.Flush();
                    }
                }
                else
                {
                    using (FileStream fs = File.OpenWrite(file_path))
                    {
                        uploaded_file.InputStream.CopyTo(fs);
                        fs.Flush();
                    }

                }


                if (file.size == new FileInfo(file_path).Length)
                {
                    //Validate again for chunked files.
                    if (Validate(uploaded_file, file, error, index))
                    {
                        //if (this.orient_images)
                        //{
                        //    //orient_image(file_path);
                        //}
                        //Create different versions
                        file.url = this.upload_url + HttpUtility.UrlEncode(file.name);
                        file.image_versions = new Dictionary<string, UploadFileInfo>();
                        foreach (string version in this.image_versions.Keys)
                        {
                            file.image_versions.Add(version, new UploadFileInfo()
                            {
                                name = file.name
                                ,
                                dir = this.image_versions[version].dir
                                ,
                                url = this.image_versions[version].url + HttpUtility.UrlEncode(file.name)
                                ,
                                width = this.image_versions[version].width
                                ,
                                height = this.image_versions[version].height
                            });

                            ScaledImageCreate(file.image_versions[version]);
                        }
                        if (file.image_versions != null && file.image_versions.ContainsKey("Thumbnail"))
                        {
                            file.thumbnail_url = file.image_versions["Thumbnail"].url;
                        }
                        file = FileDeleteUrlSet(file);
                    }
                }
                else
                {
                    if (!append_file && this.discard_aborted_uploads)
                    {
                        File.Delete(file_path);
                        file.error = "abort";
                    }

                }
            }
            
            return file;
        }
    }

    public static class Json
    {
        public static T Deserialise<T>(string json)
        {
            T obj = Activator.CreateInstance<T>();
            using (MemoryStream ms = new MemoryStream(Encoding.Unicode.GetBytes(json)))
            {
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
                obj = (T)serializer.ReadObject(ms);
                return obj;
            }
        }
        public static string Serialize<T>(T obj)
        {
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
            using (MemoryStream ms = new MemoryStream())
            {
                serializer.WriteObject(ms, obj);
                return Encoding.Default.GetString(ms.ToArray());
            }
        }
    }

}