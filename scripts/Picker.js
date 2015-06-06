// Picker dialog
var Picker = (function(picker) {
  'use strict';
  
  picker.settings = {
    height:520,
    width:600,
    title:"Select a folder, or file to replace",
    defaultSVGName:"sankeysnip.svg",
    mime:"image/svg+xml",
    mimeFolder:"application/vnd.google-apps.folder"
  };
  
  var token_,
    key_,
    name_=picker.settings.defaultSVGName;
  
  /**
  * set the access token
  * @param {string} token the oauth token
  * @return {Picker} self
  */
  picker.setToken = function (token) {
    token_ = token;
    return picker;
  };
  
  /**
  * set the developer key
  * @param {string} key the developer key
  * @return {Picker} self
  */
  picker.setKey = function (key) {
    key_ = key;
    return picker;
  };
  
 /**
  * set the filename
  * @param {string} key the developer key
  * @return {Picker} self
  */
  picker.setName = function (name) {
    name_ = name;
    return picker;
  };
  
  /**
   * open a picker dialog
   * @param {string} content the content to write
   * @param {function} success what to do when done.
   * @param {function} failure what do to on failure
   */
  picker.writeContent = function (content, success, failure) {
  
  
   var docsView = new google.picker.DocsView()
          .setIncludeFolders(true) 
          .setMimeTypes(picker.settings.mime)
          .setSelectFolderEnabled(true)
          .setOwnedByMe(true)
          .setMode(google.picker.DocsViewMode.GRID);


    var googlePicker = new google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(token_)
      .setDeveloperKey(key_)
      .setTitle(picker.settings.title)
      .setSize(picker.settings.width *.9,picker.settings.height*.9)
      .setCallback( function (pickResult) {
      
        if (pickResult[google.picker.Response.ACTION] === google.picker.Action.PICKED){
          var doc = pickResult[google.picker.Response.DOCUMENTS][0];
          var id = doc[google.picker.Document.ID];
          var url = doc[google.picker.Document.URL];
          var title = doc[google.picker.Document.NAME];
          var mime = doc[google.picker.Document.MIME_TYPE];
          var parentId = doc[google.picker.Document.PARENT_ID];
          
          // now we have the folder, write the content using the drive API
          gapi.client.load('drive', 'v2').then(function() {
          
            // use the token inherited from Apps Script
            gapi.auth.setToken({
              access_token: token_
            });
            
            if (mime === picker.settings.mimeFolder) {
              // writing a new file to a folder
              return prepareFileAndContent (content,id).then (success, failure);
            }
            else {
              // replacing the contents of an existing file
              return prepareFileAndContent (content,parentId,id).then (success, failure);
            }

          });
        }
      })  
      .setOrigin('https://docs.google.com')
      .build();
      
    googlePicker.setVisible(true);
  };
  
  
  function prepareFileAndContent (content,folderId,fileId) {
  
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    
   
    var resource = {
      'title': name_,
      'parents':[{id:folderId}],
      'mimeType':picker.settings.mime,
      'description':'Created by sankey snip (http://ramblings.mcpher.com/Home/excelquirks/addons/sankeyaddon) on ' + new Date().toString()
    };
    
    
    var multipartRequestBody =
        delimiter +  
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(resource) +
        delimiter + 
        'Content-Type: ' + 
        picker.settings.mime + '\r\n' + '\r\n' +
        content +
        close_delim;
   
    return gapi.client.request({
        'path': '/upload/drive/v2/files'+ (fileId ? '/' + fileId : ''  ) + '?uploadType=multipart',
        'method': fileId ? 'PUT': 'POST',
        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
        'body': multipartRequestBody
    });
    
  }

  return picker;
  
})(Picker || {});
