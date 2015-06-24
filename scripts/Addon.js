'use strict';
/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('Create Sankey Chart', 'showSankeySnip')
      .addToUi();
}

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}


/**
 * Opens a sidebar. 
 */
function showSankeySnip() {

  var ui = HtmlService.createTemplateFromFile('index.html')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Sankey Snip');
  
  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
* Opens a picker dialog
* will be kicked off as google.script.run from the sidebar
*/
function showPicker(content,pickerContent) {

  var html = HtmlService.createTemplateFromFile('filepicker.html')
    .evaluate()
    .getContent();

  var uiContent =  
    HtmlService.createTemplate(html + "<script>\ndoIt(" +
      JSON.stringify({
        "content":content,
        "pickerContent":pickerContent,
        "token": ScriptApp.getOAuthToken(),
        "key":'AIzaSyA2VcAc8N7EGAxgh4Tr1qJL_F27yuh4rx0'
      }) +
      ");\n</script>")
      .evaluate()
      .setWidth(Picker.settings.width)
      .setHeight(Picker.settings.height)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

   SpreadsheetApp.getUi().showModalDialog(uiContent, "Save svg code");
}


