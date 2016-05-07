/**
 *    Palette picker version 1.5 (optimized)
 *    (C) 2013 Ken Fyrstenberg Nilsen, Abidas Software
 *    MIT license
 *
 */

var abdias = {

	palette : function(id, callback) {

		var	me		= this,
			canvas	= document.getElementById(id),
			ctx		= canvas.getContext('2d'),
			cursor	= 8,
			hasCB	= (typeof callback !== 'undefined'),

			width, height, middle,
			dltX, dltY,

			sat		= 100,
			lum		= 100,

			oldPos = [-1, -1], oldData = null
			;


		/**
		 *	Init environment
		*/
		function init() {

			me.update();

			canvas.addEventListener('mousemove', pickColor, false);
			canvas.addEventListener('click', getMousePos, false);
		};

		/**
		 *	Get canvas's position (recursive)
		*/
		function getPosition(el) {

			var xp = 0, yp = 0;

			while (el) {
				xp += (el.offsetLeft - el.scrollLeft + el.clientLeft);
				xp += (el.offsetTop - el.scrollTop + el.clientTop);
				el = el.offsetParent;
			}

			return {
				x: xp,
				y: yp
			}
		};

		/**
		 *	Render the palette
		*/
		function drawPalette(s, v) {

			var bmp, data, rgb, x, y, l, p, m, mm, c, f1, f2, wm,
				w = width, h = height, md = middle, //localize
				c0, c1, c2, c3, c4, c5, c6;

			c0 = me.hsv2rgb(0, s, v);
			c1 = me.hsv2rgb(60, s, v);
			c2 = me.hsv2rgb(120, s, v);
			c3 = me.hsv2rgb(180, s, v);
			c4 = me.hsv2rgb(240, s, v);
			c5 = me.hsv2rgb(300, s, v);

			// make horizontal gradient
			var grd = ctx.createLinearGradient(0, 0, w, 0);

			grd.addColorStop(0, 	 'rgb(' + c0.r + ',' + c0.g + ',' + c0.b + ')');
			grd.addColorStop(0.1667, 'rgb(' + c1.r + ',' + c1.g + ',' + c1.b + ')');
			grd.addColorStop(0.3333, 'rgb(' + c2.r + ',' + c2.g + ',' + c2.b + ')');
			grd.addColorStop(0.5, 	 'rgb(' + c3.r + ',' + c3.g + ',' + c3.b + ')');
			grd.addColorStop(0.6667, 'rgb(' + c4.r + ',' + c4.g + ',' + c4.b + ')');
			grd.addColorStop(0.8333, 'rgb(' + c5.r + ',' + c5.g + ',' + c5.b + ')');
			grd.addColorStop(1, 	 'rgb(' + c0.r + ',' + c0.g + ',' + c0.b + ')');

			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, w, h);

			//make vertical white-to-color and color-to-black part
			bmp = ctx.getImageData(0, 0, w, h);
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

			ctx.putImageData(bmp, 0, 0);
		};

		/**
		 *	Pick color and call callback
		*/
		function pickColor(e) {

			var x = e.pageX - dltX,
				y = e.pageY - dltY,
				c, ox, oy, sc = false;

			if (oldData !== null) {
				ox = oldPos[0];
				oy = oldPos[1];
				if (x > ox - 1 && y > oy - 1 && x < ox + cursor && y < oy + cursor) {
					clearCursor();
					sc = true;
				}
			}

			c = me.getPixel(x, y);

			if (sc)
				setCursor(ox + cursor / 2, oy + cursor / 2);

			if (hasCB) {
				c.lum = lum;
				c.sat = sat;
				callback(c);
			}

		}

		function getMousePos(e) {

			var x = e.pageX - dltX,
				y = e.pageY - dltY;

			setCursor(x, y);
		};

		function setCursor(x, y, noCB) {

			var cur = cursor / 2,
				c = me.getPixel(x, y);

			me.selectedColor = c;

			if (typeof me.oncolorselect !== 'undefined' && typeof noCB === 'undefined') {
				c.lum = lum;
				c.sat = sat;
				me.oncolorselect(c);
			}

			x = (x + 0.5 - cur) |0;
			y = (y + 0.5 - cur) |0;

			clearCursor();

			//copy new area
			oldData = ctx.getImageData(x, y, cursor, cursor);
			oldPos = [x, y];

			//draw cursor
			ctx.beginPath();
			ctx.rect(x + 2, y + 2, cursor -3, cursor - 3);

			if (y < height * 0.65) {
				ctx.strokeStyle = 'rgb(0,0,0)';
			} else {
				ctx.strokeStyle = 'rgb(255,255,255)';
			}

			ctx.stroke();

		}

		function clearCursor() {

			if (oldData !== null)
				ctx.putImageData(oldData, oldPos[0], oldPos[1]);
		}

		/**
		 *	Convert RGB to HSV
		*/
		/*function rgb2hsv(r, g, b){

			r /= 255, g /= 255, b /= 255;

			var max = Math.max(r, g, b), min = Math.min(r, g, b),
				h, s, l = (max + min) / 2,
				d;

			if (max === min){
				h = s = 0;

			} else {
				d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}

			return {h: (h * 360),
					s: (s * 100),
					v: (l * 100)};
		}*/
		function rgb2hsv() {

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
		};
		this.hsv2rgb = function(h, s, v) {

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
		}

		/**
		 *	PUBLIC METHODS
		*/

		/**
		 *	Current selected color
		*/
		this.selectedColor = null;

		/**
		 *	Update palette
		*/
		this.update = function() {

			width	= canvas.width;
			height	= canvas.height;
			middle	= (height / 2 + 0.5) | 0;

			var dlt	= getPosition(canvas);
			dltX = dlt.x;
			dltY = dlt.y;

			oldData = null;

			drawPalette(sat, lum);
		};

		/**
		 *	Return RGB + alpha, and HSV from a pixel on canvas
		*/
		this.getPixel = function(x, y) {

			var ptn = ctx.getImageData(x, y, 1, 1).data,
				hsv = rgb2hsv(ptn[0], ptn[1], ptn[2]);

			return {
				r: ptn[0],
				g: ptn[1],
				b: ptn[2],
				a: ptn[3],
				h: hsv.h,
				s: hsv.s,
				v: hsv.v
			}
		};

		/**
		 *	Set cursor based on HSV color
		*/
		this.setCursorHSV = function(c, noCB) {

			var	s = c.s,
				v = c.v,
				m = height / 2,

				x = width / 360 * c.h,
				y = 0;

			if (s === sat && v === lum) {
				y = m;

			} else if (v === lum && s <= 100) {
				y = m / 100 * s;

			} else if (s === sat && v <= 100) {
				y = m / 100 * (100 - v) + m;
			}

			setCursor(x, y, noCB);

		};

		this.setCursorRGB = function(r, g, b) {

			if (arguments.length === 1) {
				r = me.hexToColor(r);
				if (r === null) return;
				g = r.g;
				b = r.b;
				r = r.r;
			}

			var hsv = rgb2hsv(r, g, b);

			if (hsv.s !== sat || hsv.v !== lum) {
				sat = hsv.s;
				//lum = hsv.v;
				oldData = null;
				drawPalette(sat, lum);
			}

			this.setCursorHSV(hsv, true);
		};

		/**
		 *	Convert color object to hex-representation
		*/
		this.colorToHex = function(c) {

			return "#" + (16777216 + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1);

		}

		this.hexToColor = function(h) {

			var cmps = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);

			return cmps ? {
				r: parseInt(cmps[1], 16),
				g: parseInt(cmps[2], 16),
				b: parseInt(cmps[3], 16)
			} : null;
		}

		this.saturation = function(s) {

			if (arguments.length === 0)
				return sat;

			sat = s;
			oldData = null;

			drawPalette(sat, lum);
		}

		this.lum = function(v) {

			if (arguments.length === 0)
				return lum;

			lum = v;
			oldData = null;

			drawPalette(sat, lum);
		}

		init();

	}
};



/**
 *	Callback to update boxes with numbers
*/
function updateInfo(c) {

    document.getElementById('r').innerHTML = 'R: ' + c.r;
    document.getElementById('g').innerHTML = 'G: ' + c.g;
    document.getElementById('b').innerHTML = 'B: ' + c.b;

    document.getElementById('h').innerHTML = 'H: ' + ((c.h + 0.5) |0);
    document.getElementById('s').innerHTML = 'S: ' + ((c.s + 0.5) |0);
    document.getElementById('v').innerHTML = 'V: ' + ((c.v + 0.5) |0);

    document.getElementById('col').style.backgroundColor =
        'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';

	document.getElementById('sat').value = c.sat;
	document.getElementById('lum').value = c.lum;

}

/**
 *	When color change we set the hex representation in the text box
*/
function updateColor(c) {
    document.getElementById('hex').value = pal.colorToHex(c);
	document.getElementById('sat').value = c.sat;
	document.getElementById('lum').value = c.lum;
}

/**
 *	When we click set color we update palette with hex value from text box
*/
function setColor() {
	var col = document.getElementById('hex').value;
	pal.setCursorRGB(col);
}

/**
 *	In this demo we resize the canvas to fit window except a bar at the
 *	bottom for numeric boxes etc.
*/
function resize() {

	var el = document.getElementById('palette');

	el.width = window.innerWidth;
	el.height = window.innerHeight - 80;

	if (typeof pal !== 'undefined')
		pal.update();
}

function satChange(e) {
	pal.saturation(this.value);
}
function lumChange(e) {
	pal.lum(this.value);
}

/**
 *	START - init palette and events
*/
var pal;

resize();

pal = new abdias.palette('palette', updateInfo);
pal.oncolorselect = updateColor;

window.addEventListener('resize', resize, false);
document.getElementById('set').addEventListener('click', setColor, false);
document.getElementById('sat').addEventListener('change', satChange, false);
document.getElementById('lum').addEventListener('change', lumChange, false);
