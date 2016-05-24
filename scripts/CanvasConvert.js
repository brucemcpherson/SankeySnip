var CanvasConvert = (function(canvasConvert) {
  'use strict';

  canvasConvert.svgToPng = function (svg) {
  
    // create a canvas to use, no need to actually assign it to a parent
    var canvas = document.createElement("canvas");
    // plot it on a canvas
    canvg ( canvas , svg);

    // return it as png
    return canvasConvert.addStyle(canvas).toDataURL("image/png");
    
  };
  
  canvasConvert.addStyle = function (canvas) {
  
    var styledCanvas = document.createElement("canvas");
    
    // make a margin
    styledCanvas.width = canvas.width *1.1;
    styledCanvas.height = canvas.height *1.1;
    
    // now fill and copy the original
    var ctx = styledCanvas.getContext('2d');

    //fill
    ctx.save();
    ctx.fillStyle = 'white';   
    ctx.fillRect(0,0,styledCanvas.width,styledCanvas.height);
    ctx.strokeRect(0,0,styledCanvas.width,styledCanvas.height);
    ctx.restore();
    
    //copy over 
    ctx.drawImage (canvas, (styledCanvas.width- canvas.width) /2 , (styledCanvas.height-canvas.height) /2);

    return styledCanvas;
  
  };
  
  return canvasConvert;
  
})(CanvasConvert || {});
