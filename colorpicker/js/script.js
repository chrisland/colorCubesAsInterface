
var palette =  {

	me		: this,
  canvas	: undefined,
  ctx		: undefined,

  sat		: 100,
  lum		: 100,

  init : function(id) {

    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    this.drawPalette(this.sat, this.lum);

    return this;
  },

  drawPalette: function(s, v) {

    var bmp, data, rgb, x, y, l, p, m, mm, c, f1, f2, wm,
      w = 500, h = 500, md = 250, //localize
      c0, c1, c2, c3, c4, c5, c6;

    c0 = this.hsv2rgb(0, s, v);
    c1 = this.hsv2rgb(60, s, v);
    c2 = this.hsv2rgb(120, s, v);
    c3 = this.hsv2rgb(180, s, v);
    c4 = this.hsv2rgb(240, s, v);
    c5 = this.hsv2rgb(300, s, v);

    // make horizontal gradient
    var grd = this.ctx.createLinearGradient(0, 0, w, 0);

    grd.addColorStop(0, 	 'rgb(' + c0.r + ',' + c0.g + ',' + c0.b + ')');
    grd.addColorStop(0.1667, 'rgb(' + c1.r + ',' + c1.g + ',' + c1.b + ')');
    grd.addColorStop(0.3333, 'rgb(' + c2.r + ',' + c2.g + ',' + c2.b + ')');
    grd.addColorStop(0.5, 	 'rgb(' + c3.r + ',' + c3.g + ',' + c3.b + ')');
    grd.addColorStop(0.6667, 'rgb(' + c4.r + ',' + c4.g + ',' + c4.b + ')');
    grd.addColorStop(0.8333, 'rgb(' + c5.r + ',' + c5.g + ',' + c5.b + ')');
    grd.addColorStop(1, 	 'rgb(' + c0.r + ',' + c0.g + ',' + c0.b + ')');

    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, w, h);

    //make vertical white-to-color and color-to-black part
    bmp = this.ctx.getImageData(0, 0, w, h);
    data = bmp.data;

    mm = 255 / md;
    m = mm / 255;
    wm = w * 4;

    for (y = 0; y < md; y++) {

      f1 = y * m;
      f2 = (md - y) * mm;
      l = y * wm;

      for (x = 0; x < wm; x += 4) {
        p = l + x;

        data[p]		= f2 + data[p] * f1;
        data[p + 1] = f2 + data[p + 1] * f1;
        data[p + 2] = f2 + data[p + 2] * f1;
      }
    }

    for (y = md; y < h; y++) {

      f1 = (h - y) * m;
      l = y * wm;

      for (x = 0; x < wm; x += 4) {
        p = l + x;

        data[p]		= data[p] * f1;
        data[p + 1] = data[p + 1] * f1;
        data[p + 2] = data[p + 2] * f1;
      }
    }

    this.ctx.putImageData(bmp, 0, 0);

  },


  hsv2rgb : function(h, s, v) {

    h /= 60;
    s *= 0.01;
    v *= 0.01;

    var i = Math.floor(h);
    var f = h - i;
    var m = v * (1 - s);
    var n = v * (1 - s * f);
    var k = v * (1 - s * (1 - f));
    var rgb;

    switch (i) {
      case 0:
        rgb = [v, k, m];
        break;
      case 1:
        rgb = [n, v, m];
        break;
      case 2:
        rgb = [m, v, k];
        break;
      case 3:
        rgb = [m, n, v];
        break;
      case 4:
        rgb = [k, m, v];
        break;
      case 5:
      case 6:
        rgb = [v, m, n];
      break;
    }

    return {
      r: rgb[0] * 255 |0,
      g: rgb[1] * 255 |0,
      b: rgb[2] * 255 |0
    }
  },

  rgb2hsv: function() {

    var rr, gg, bb,

    r = arguments[0] / 255,
    g = arguments[1] / 255,
    b = arguments[2] / 255,
    h, s,

    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function (c) {
      return (v - c) / 6 / diff + 0.5;
    };

    if (diff === 0) {
      h = s = 0;

    } else {
      s = diff / v;

      rr = diffc(r);
      gg = diffc(g);
      bb = diffc(b);

      if (r === v) {h = bb - gg}
      else if (g === v) {h = (0.3333333333) + rr - bb}
      else if (b === v) {h = (0.6666666667) + gg - rr};
      if (h < 0) {h += 1}
      else if (h > 1) {h -= 1}
    }

    return {
      h: h * 360,
      s: s * 100,
      v: v * 100
    }
  },



  getPixel: function(x, y) {

    var ptn = this.ctx.getImageData(x, y, 1, 1).data,
      hsv = this.rgb2hsv(ptn[0], ptn[1], ptn[2]);

    return {
      r: ptn[0],
      g: ptn[1],
      b: ptn[2]
      // ,a: ptn[3],
      // h: hsv.h,
      // s: hsv.s,
      // v: hsv.v
    }
  }
}


var paletteObj = palette.init('palette');


var select = function() {


  var canvas = document.getElementById('select'),
      ctx = canvas.getContext('2d'),
      rect = {},
      drag = false,
      mouseX,
      mouseY,
      closeEnough = 10,
      dragTL = dragBL = dragTR = dragBR = false;

  function init() {
      canvas.addEventListener('mousedown', mouseDown, false);
      canvas.addEventListener('mouseup', mouseUp, false);
      canvas.addEventListener('mousemove', mouseMove, false);

      rect = {
          startX: 100,
          startY: 200,
          w: 300,
          h: 200
      }

      $('#save').on('click', function () {
        setRange();
      });
  }

  function mouseDown(e) {
      mouseX = e.pageX - this.offsetLeft;
      mouseY = e.pageY - this.offsetTop;

      // if there isn't a rect yet
      if (rect.w === undefined) {
          rect.startX = mouseY;
          rect.startY = mouseX;
          dragBR = true;
      }

      // if there is, check which corner
      //   (if any) was clicked
      //
      // 4 cases:
      // 1. top left
      else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY)) {
          dragTL = true;
      }
      // 2. top right
      else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY)) {
          dragTR = true;

      }
      // 3. bottom left
      else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
          dragBL = true;

      }
      // 4. bottom right
      else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
          dragBR = true;

      }
      // (5.) none of them
      else {
          // handle not resizing
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw();

  }

  function checkCloseEnough(p1, p2) {
      return Math.abs(p1 - p2) < closeEnough;
  }

  function mouseUp() {
      dragTL = dragTR = dragBL = dragBR = false;
  }

  function mouseMove(e) {
      mouseX = e.pageX - this.offsetLeft;
      mouseY = e.pageY - this.offsetTop;
      if (dragTL) {
          rect.w += rect.startX - mouseX;
          rect.h += rect.startY - mouseY;
          rect.startX = mouseX;
          rect.startY = mouseY;
      } else if (dragTR) {
          rect.w = Math.abs(rect.startX - mouseX);
          rect.h += rect.startY - mouseY;
          rect.startY = mouseY;
      } else if (dragBL) {
          rect.w += rect.startX - mouseX;
          rect.h = Math.abs(rect.startY - mouseY);
          rect.startX = mouseX;
      } else if (dragBR) {
          rect.w = Math.abs(rect.startX - mouseX);
          rect.h = Math.abs(rect.startY - mouseY);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw();
  }

  function draw() {
      ctx.strokeStyle = "#222222";
      ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
      //console.log(rect.startX, rect.startY, rect.w, rect.h);
      //console.log( paletteObj.getPixel(rect.startX, rect.startY) );
    //  console.log(palette);


      var coor = [
        {
          'x': rect.startX,
          'y': rect.startY
        },
        {
          'x': rect.startX + rect.w,
          'y': rect.startY
        },
        {
          'x': rect.startX + rect.w,
          'y': rect.startY + rect.h
        },
        {
          'x': rect.startX,
          'y': rect.startY + rect.h
        }
      ];

      for(var i = 0; i < coor.length; i++) {
        coor[i].color = paletteObj.getPixel(coor[i].x, coor[i].y)
      }


      drawHandles(coor);
      makeRange(coor);
  }

  function drawCircle(obj, radius, i) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, radius, 0, 2 * Math.PI);
    ctx.fill();

    //console.log(obj.color);
    //var color =  paletteObj.getPixel(x, y);
    drawText('    '+i+': rgb('+obj.color.r+','+obj.color.g+','+obj.color.b+')', obj.x, obj.y);
  }

  function drawText(text,x,y) {
    ctx.font="10px";
    ctx.fillText(text,x,y);
  }

  function drawHandles(coor) {
    for(var i = 0; i < coor.length; i++) {
      drawCircle(coor[i], closeEnough, i);
    }
  }


  var range = {};

  function makeRange(coor) {

    range = {
      r: [],
      g: [],
      b: []
    };

    for(var i = 0; i < coor.length; i++) {
      range.r.push(coor[i].color.r);
      range.g.push(coor[i].color.g);
      range.b.push(coor[i].color.b);

      $('#r_'+i).text(i+': '+coor[i].color.r);
      $('#g_'+i).text(i+': '+coor[i].color.g);
      $('#b_'+i).text(i+': '+coor[i].color.b);
    }


    $('#if_r').text( ' r > ' + range.r.min() +' && r < '+range.r.max() );
    $('#if_g').text( ' g > ' + range.g.min() +' && g < '+range.g.max() );
    $('#if_b').text( ' b > ' + range.b.min() +' && b < '+range.b.max() );

    $('#if_all').text (' r > ' + range.r.min() +' && r < '+range.r.max()+ ' && g > ' + range.g.min() +' && g < '+range.g.max()+' && b > ' + range.b.min() +' && b < '+range.b.max());

  }

  function setRange() {

    var db = new cStorage('range').save(range);

  }

  init();



}


Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};


select();
