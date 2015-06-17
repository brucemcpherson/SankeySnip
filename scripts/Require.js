var manifests = [
  { name: 'sankeysnip',
   scripts: ['Utils', 'Sankey' , 'Process' , 'View' ,'Home' ,'App', 'Client','CanvasConvert']
  },
  { name: 'js',
    scripts:['main']
  }
];
  
/**
* given an array of .html file names, it will get the source and return them concatenated for insertion into htmlservice
* like this you can share the same code between client and server side, and use the Apps Script IDE to manage your js code
* @param {string[]} scripts the names of all the scripts needed
* @return {string} the code inside script tags
*/
function requireJs (scripts) {
    return '<script>\n' + scripts.map (function (d) {
        return HtmlService.createHtmlOutputFromFile(d+".js").getContent();
    })
    .join('\n\n') + '</script>\n';
}
/**
* given a manifest name it will get the source and return them concatenated for insertion into htmlservice
* like this you can share the same code between client and server side, and use the Apps Script IDE to manage your js code
* @param {string} manifest the manifest name
* @return {string} the code inside script tags
*/
function requireJsManifest (manifest) {

  // find requested manifest
  var target = manifests.filter (function (d) {
    return d.name === manifest
  });
  
  // should be exactly 1
  if(target.length !== 1) { 
    throw 'manifest ambigous ' +manifest;
  }
  
  // get all the script contents
  return '<script>\n' + target[0].scripts.map (function (d) {
    return HtmlService.createHtmlOutputFromFile(d + ".js").getContent();
  })
  .join('\n\n') + '</script>\n';

}

/**
* given an array of .gs file names, it will get the source and return them concatenated for insertion into htmlservice
* like this you can share the same code between client and server side, and use the Apps Script IDE to manage your js code
* @param {string[]} scripts the names of all the scripts needed
* @return {string} the code inside script tags
*/
function requireGs (scripts) {
    return '<script>\n' + scripts.map (function (d) {
        return ScriptApp.getResource(d).getDataAsString();
    })
    .join('\n\n') + '</script>\n';
}
/**
* given a manifest name it will get the source and return them concatenated for insertion into htmlservice
* like this you can share the same code between client and server side, and use the Apps Script IDE to manage your js code
* @param {string} manifest the manifest name
* @return {string} the code inside script tags
*/
function requireGsManifest (manifest) {
  
  // find requested manifest
  var target = manifests.filter (function (d) {
    return d.name === manifest
  });
  
  // should be exactly 1
  if(target.length !== 1) { 
    throw 'manifest ambigous ' +manifest;
  }
  
  // get all the script contents
  return '<script>\n' + target[0].scripts.map (function (d) {
    return ScriptApp.getResource(d).getDataAsString();
  })
  .join('\n\n') + '</script>\n';

}

