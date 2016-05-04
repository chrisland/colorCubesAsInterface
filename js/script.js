/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var constraints = window.constraints = {
  audio: false,
  video: true
};
var errorElement = document.querySelector('#errorMsg');

var colorContainer_1 = document.querySelector('#colorContainer_1');
var colorContainer_2 = document.querySelector('#colorContainer_2');

var canvas = document.querySelector('#tempImg');


navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.onended = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
})
.catch(function(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
});

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}


var calcColorsBtn = document.querySelector('#calcColors');
calcColorsBtn.onclick = function (e) {
  calcColors();
};
var calcColorsLoopBtn = document.querySelector('#calcColorsLoop');
calcColorsLoopBtn.onclick = function (e) {

  setInterval(function () {
    calcColors();
  }, 1000);

};

function calcColors() {
  getColors( makeScreenshot() );
}


function makeScreenshot() {



  canvas.width = 640;
  canvas.height = 480;
  var ctx = canvas.getContext('2d');

  //draw image to canvas. scale to target dimensions
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //convert to desired file format
  var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

  return dataURI;
}

function getColors(src) {
  var img = document.createElement('img');
  img.setAttribute('src', src)

  img.addEventListener('load', function() {

      colorContainer_1.innerHTML = '';
      colorContainer_2.innerHTML = '';

      var vibrant = new Vibrant(img);
      var swatches = vibrant.swatches()
      for (var swatch in swatches) {
          if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
              //console.log(swatch, swatches[swatch].getHex())

              var item = document.createElement('div');
              item.className = 'color';
              item.style.backgroundColor = swatches[swatch].getHex();

              colorContainer_1.appendChild(item);
          }
      }

      var colorThief = new ColorThief();
      var colors = colorThief.getPalette(img, 5);

      for (var rgb in colors) {
        var item = document.createElement('div');
        item.className = 'color';
        item.style.backgroundColor = 'rgb('+colors[rgb][0]+','+colors[rgb][1]+','+colors[rgb][2]+')';

        colorContainer_2.appendChild(item);


      }

  });
}
