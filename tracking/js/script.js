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





var overlaps = (function () {
    function getPositions( elem ) {
        var pos, width, height;
        pos = $( elem ).position();
        width = $( elem ).width();
        height = $( elem ).height();
        return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
    }

    function comparePositions( p1, p2 ) {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function ( a, b ) {
        var pos1 = getPositions( a ),
            pos2 = getPositions( b );
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };
})();

function checkOverlay() {
    var area = $( '#img-farbraum' )[0],
        box = $( '#box0' )[0],
        html;

    html = $( area ).find('.box').not( box ).map( function ( i ) {
      console.log(i);
        return '<p>Red box + Box ' + ( i + 1 ) + ' = ' + overlaps( box, this ) + '</p>';
    }).get().join( '' );

    $( '#img-farbraum-result' ).append( html );
}

var checkOverlayBtn = document.querySelector('#checkOverlay');
checkOverlayBtn.onclick = function (e) {
  checkOverlay();
};


$( document ).ready(function() {


  interact('.draggable')
    .draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      // enable autoScroll
      autoScroll: true,

      // call this function on every dragmove event
      onmove: dragMoveListener,
      // call this function on every dragend event
      onend: function (event) {
        var textEl = event.target.querySelector('p');

        textEl && (textEl.textContent =
          'moved a distance of '
          + (Math.sqrt(event.dx * event.dx +
                       event.dy * event.dy)|0) + 'px');
      }
    })
    .resizable({
   preserveAspectRatio: true,
   edges: { left: true, right: true, bottom: true, top: true }
 })
 .on('resizemove', function (event) {
   var target = event.target,
       x = (parseFloat(target.getAttribute('data-x')) || 0),
       y = (parseFloat(target.getAttribute('data-y')) || 0);

   // update the element's style
   target.style.width  = event.rect.width + 'px';
   target.style.height = event.rect.height + 'px';

   // translate when resizing from top or left edges
   x += event.deltaRect.left;
   y += event.deltaRect.top;

   target.style.webkitTransform = target.style.transform =
       'translate(' + x + 'px,' + y + 'px)';

   target.setAttribute('data-x', x);
   target.setAttribute('data-y', y);
   target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
 });

    function dragMoveListener (event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }

    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;

});
