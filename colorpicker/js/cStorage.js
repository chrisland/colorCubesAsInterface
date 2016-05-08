"use strict";


/**
 * Easy JS Framework to get / edit localStorage
 *
 * @class cStorage
 * @version 0.2.4
 * @license MIT
 *
 * @author Christian Marienfeld post@chrisand.de
 *
 * ### Examples:
 *
*	var obj = {"data":[{id:1},{id:2},{id:3}]};
*	var storage = new cStorage('test').save(obj);
*
*	var item = storage.root('data').find({id:2});
*
*	var myItemObject = item.get();
*
*	item.edit({name:"Hello World"});
*
*	var json = storage.toString();
*	// json = {"data":[{"id":1},{"id":2,"name":"Hello World"},{"id":3}]}
*
*
 *
 * @param {String} dbname Name of localStorage
 * @param {String} [rootString] Dot seperated path to get deeper into the object or array
 *
 * @return {Object} cStorage Object

 * @api public
 */


function cStorage(dbname, rootString) {

	if (!dbname) {
		throw new Error('missing function params');
		return false;
	} else {

		this._dbname = dbname;
		this._data = _helper.getStorage(this._dbname);

		this._foundParent = this.root(rootString)._foundParent;
		this._foundChild = false;
    this._foundPath = false;
		this._foundKey = false;
		this._isFound = false;

		return this;
	}

}





/**
* Save the Main-Data-Object to the localStorage
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.save({my:"test"});
*
* @function save
* @version 0.1.0
*
* @param {Object} [obj=global data] The object to save to localStorage
* @param {Boolean} [encode=false] Encode the value for a conflict free json string
* @param {Boolean} [deeper=true] Encode deep values
*
* @return {Object} cStorage object
*
* @api public
*/


cStorage.prototype.save = function(obj, encode, deeper) {
	if (!obj || typeof obj !== 'object') {
		obj = this._data;
	}
	if (deeper == undefined) {
		deeper = true;
	}
	if (encode){
		_helper.loop(obj, function (root, k) {
			return _helper.encode(root[k]);
		}, deeper);
	}
	this._data = this._foundParent = obj;
	this._isFound = false;
	window.localStorage.setItem(this._dbname, this.toString());

	return this;
};




/**
* Navigate into the Main-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.root('data');
*	storage.root('data.user');
*	storage.root('data.user.4');
*
* @function root
* @version 0.2.4
*
* @param {String} [root=rootObject] Dot seperated path to get deeper into the object or array
*
* @return {Object} cStorage Object
*
* @api public
*/


cStorage.prototype.root = function(root){

	this._foundParent = this._data;
	this._foundKey = false;
	this._foundChild = false;
	this._foundPath = false;
	this._isFound = false;

	if (!root) {
		this._foundParent = this._data;
	} else {

		var loopRoot = _helper.getRootObjFromString(this._data, root);
		if (loopRoot) {
			this._foundParent = loopRoot;
			this._foundPath = root.split('.');
			this._isFound = true;
		}
	}
	return this;
};



/**
* Find Note from Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.find({id:3});
*
*	storage.root('data').find({id:3}, true);
*
*	storage.root('json').find({name:"erde"}, false);
*
*	storage.find({text:"find this value"});
*
* @function find
* @version 0.2.4
*
* @param {String} param Selector Object
* @param {Boolean} [deeper=true] Search deeper into the object
*
* @return {Object} cStorage Object
*
* @api public
*/


cStorage.prototype.find = function(param, deeper) {

	if (!param) {
		return false;
	}

	if (deeper == undefined) {
		deeper = true;
	}
	var findKey, findValue;

	if (typeof param === 'string' || typeof param === 'number' ) {
		findValue = findKey = param;
	} else {

		for(var i in param){
		  findKey = i;
		  findValue = param[i];
		}
	}

	var root = this._foundParent;

	this._foundParent = false;
	this._foundKey = false;
	this._foundChild = false;
	this._foundPath = false;
	this._isFound = false;

	var ret = _helper.find(root, {key:findKey, value:findValue}, deeper);

	if (ret) {
		this._foundParent = ret[1];
		this._foundKey = ret[2];
		this._foundChild = ret[3];
		this._foundPath = ret[4];
		this._isFound = true;
	}

	return this;

};



/**
* Return the Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var get = storage.get();
*
*	var get = storage.root('data').get();
*	var get = storage.get('data');
*
*	var get = storage.root('data').find({id:4}).get();
*	var get = storage.root('data').find({id:4}).get(null,true); //decode values
*
*	var get = storage.get('data',true,false); //decode values but not deep
*
*
* @function get
* @version 0.1.0
*
* @param {String} [root=rootObject] Dot seperated path to get deeper into the object or array
* @param {Boolean} [decode=false] Decode the value for humanreadable text
* @param {Boolean} [deeper=true] Encode all deeper values from object
*
* @return {Object} Note object
*
* @api public
*/


cStorage.prototype.get = function(root, decode, deeper) {

	var obj = this._foundParent;
	if (root) {
		obj = _helper.getRootObjFromString(this._data, root);
	}
	if (decode){
		if (deeper == undefined) {
			deeper = true;
		}
		_helper.loop(obj, function (root, k) {
			return _helper.decode(root[k]);
		}, deeper);
	}
	return obj;
};



/**
* Return a clone of the Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var clone = storage.clone();
*
*	var clone = storage.root('data').clone();
*
*	var clone = storage.root('data').find({id:6}).clone();
*
*
* @function clone
* @version 0.1.0
*
* @return {Object} Cloned note object
*
* @api public
*/


cStorage.prototype.clone = function() {
	return JSON.parse(JSON.stringify(this._foundParent));
};



/**
* Edit the Selected-Data-Object value
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.root('data').edit({value:6});
*
*	storage.find({id:1}).edit({data:'new Data'});
*
*	storage.find({id:2}).edit({
*		text:'HERE IS AN NEW WORLD',
*		lang: 'The new World'
*	});
*
* @function edit
* @version 0.1.0
*
* @param {Object} obj Object with key and new value
*
* @return {Object} cStorage Object
*
* @api public
*/



cStorage.prototype.edit = function(obj) {

	if (Object.prototype.toString.call( this._foundParent ) === '[object Array]') {
		return this;
	}
	if (!obj) {
		return this;
	}
	var findKey, findKey;
	for(var i in obj){
		findKey = i || '';
		findValue = obj[i] || '';
		if (findKey) {
			this._foundParent[findKey] = findValue;
		}
	}
	this.save();

	return this;
};


/**
* Add to the Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.root('data').add({value:6});
*
*	storage.find({id:1}).add({data:'new Data'});
*
*	storage.root('data').add({
*		id: 5,
*		text:'HERE IS AN NEW WORLD',
*		lang: 'The new World'
*	});
*
*	storage.root('data').add([{id:4},{id:5}]);
*
*
* @function add
* @version 0.1.0
*
* @param {Object} obj Object to insert
*
* @return {Object} cStorage Object
*
* @api public
*/


cStorage.prototype.add = function(obj) {
	if (!obj) {
		return this;
	}
	var root = this._foundParent;
	var that = this;

	var doit = function (r,p) {
		if (Object.prototype.toString.call( r ) === '[object Object]') {
			var findKey, findValue;
			for(var i in p){
				findKey = i || '';
				findValue = p[i] || '';
				if (findKey) {
					r[findKey] = findValue;
				}
			}
		} else if (Object.prototype.toString.call( r ) === '[object Array]') {
			r.push(p);
		}
	};

	if (Object.prototype.toString.call( obj ) === '[object Array]') {
		for(var i in obj){
			doit(root, obj[i]);
		}
	} else {
		doit(root, obj);
	}
	this.save();

	return this;
};






/**
* Remove the Selected-Data-Object value
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.root('data').remove();
*
*	storage.find({id:1}).remove();
*
*
* @function remove
* @version 0.2.4
*
*
* @return {Object} cStorage Object
*
* @api public
*/



cStorage.prototype.remove = function() {

	if (!this._foundPath && this._foundParent) {
		return false;
	}
	var root = JSON.parse(JSON.stringify(this._foundPath));
	var first = root.pop();
	root = root.join('.');

	var loopRoot = _helper.getRootObjFromString(this._data, root);
	if (loopRoot) {
		if (Object.prototype.toString.call( loopRoot ) === '[object Array]') {
			loopRoot.splice(first,1);
			this.save();
		} else if (Object.prototype.toString.call( loopRoot ) === '[object Object]') {
			delete loopRoot[first];
			this.save();
		}
	} else {
		return false;
	}

	return this;
};





/**
* Loop to the Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	storage.map(function (obj, key, value) {
*		console.log(obj, key, value);
*	});
*
*	storage.root('data').map(function (obj, key, value) {
*		console.log(obj, key, value);
*	});
*
*	storage.root('data').map(function (obj, key, value) {
*		console.log(obj, key, value);
*	}, false);
*
*
* @function map
* @version 0.2.4
*
* @param {Function} callback Call this function each note
* @param {Boolean} [deeper=true] Search deeper into the object
*
* @return {Object} cStorage Object
*
* @api public
*/



cStorage.prototype.map = function(callback, deeper) {
	if (!callback && typeof callback !== 'function') {
		throw new Error('missing function params');
		return false;
	}
	if (deeper == undefined) {
		deeper = true;
	}
	_helper.loop(this._foundParent, callback, deeper);
	return this;
};








/**
* Return the Selected-Data-Value
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var json = storage.getValue();
*
*	var json = storage.getValue(true); //decode values
*
*
* @function getValue
* @version 0.1.0
*
* @param {Boolean} [decode=false] Decode the value for humanreadable text
*
* @return {Object} Value Object
*
* @api public
*/


cStorage.prototype.getValue = function(decode) {
	if (decode) {
		return _helper.decode(this._foundChild);
	} else {
		return this._foundChild;
	}
};














/**
* Return a unique identifier of the Selected-Data-Object
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var nextId = storage.getUid();
*
*	var nextId = storage.root('data').getUid();
*
*	var nextId = storage.root('json.data.users').getUid();
*
*
* @function getUid
* @version 0.2.4
*
* @param {String} key Name of the unique identifier
*
* @return {Number} a unique identifier as integer
*
* @api public
*/


cStorage.prototype.getUid = function(key, deeper) {

	if (!key) {
		throw new Error('missing function params');
		return false;
	}
	var root = this._foundParent;
	if (deeper == undefined) {
		deeper = true;
	}
	var ret = false;
	var set = function (value) {
		if (!ret) {
			ret = parseInt(value);
		} else {
			if (ret < value) {
				ret = parseInt(value);
			}
		}
	};
	var allways = function (root, k, value) {
		if (key == k) {
			set(value);
		}
	};
	_helper.loop(root, allways, deeper);
	if (!ret || isNaN(ret)) {
		ret = 0
	}
	return parseInt(ret)+1;
};




/**
* Return the Selected-Data-Object as JSON-String
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var json = storage.toString();
*
*	var json = storage.root('data').toString();
*
*	var json = storage.toString('data');
*	var json = storage.toString('data', true, false); //decode values but not deep
*
*	var json = storage.root('data').find({id:4}).toString();
*	var json = storage.root('data').find({id:4}).toString(null,true); //decode values
*
*
* @function toString
* @version 0.1.0
*
* @param {String} [root=rootObject] Dot seperated path to get deeper into the object or array
* @param {Boolean} [decode=false] Decode the value for humanreadable text
* @param {Boolean} [deeper=true] Encode all deeper values from object
*
* @return {String} Note Object as JSON-String
*
* @api public
*/



cStorage.prototype.toString = function(root, decode, deeper) {
	return JSON.stringify( this.get(root, decode, deeper) );
};



/**
* Return true if Main-Data-Object is empty
*
* ### Examples:
*
*	var storage = new cStorage('emptyDb');
*
*	var check = storage.isEmpty();
*
*
* @function isEmpty
* @version 0.2.0
*
* @return {Boolean} filled (false) or not filled (true)
*
* @api public
*/


cStorage.prototype.isEmpty = function() {
	var root = this._foundParent;
	if (JSON.stringify(root).replace(/[{}\[\]]/g, "") == '') {
		return true;
	} else {
		return false;
	}
};



/**
* Return true if last Search was successful
* ( functions: root(), find() )
*
* ### Examples:
*
*	var storage = new cStorage('test');
*
*	var check = storage.root('data').isFound();
*
*	var check = storage.find({id:4}).isFound();
*
*
*
* @function isFound
* @version 0.2.0
*
* @return {Boolean} true if last root() or find() was successful
*
* @api public
*/


cStorage.prototype.isFound = function() {
	return this._isFound;
};









var _helper = {

	getStorage: function(name) {

		var localDb = window.localStorage.getItem(name) || '{}';
		var obj = {};

		try{
			obj = JSON.parse(localDb);
			if (typeof obj === 'object') {
				return obj;
			}
			return {};

		} catch(e){
	        throw new Error('non well formed json string');
	        return {};
	    }
	},

	encode: function (str) {
		if (str && typeof str === 'string') {
			return encodeURIComponent(str);
		}
		return str;
	},
	decode: function (str) {
		if (str && typeof str === 'string') {
			return decodeURIComponent(str.replace(/\+/g, " "));
		}
		return str;
	},

	getRootObjFromString: function (obj, root) {
		if (!obj) {
			return false;
		}
		var loopRoot = obj;
		if (root) {
			root = root.split('.');
			for(var i in root){
				loopRoot = loopRoot[root[i]];
			}
		}
		return loopRoot;
	},
	find: function (obj, selector, deeper, loopPath) {

		var rootTyp;
		if (Object.prototype.toString.call( obj ) === '[object Object]') {
			rootTyp = 'object';
		} else if (Object.prototype.toString.call( obj ) === '[object Array]') {
			rootTyp = 'array';
		} else {
			return false;
		}

		var path = loopPath || [];

		for (var k in obj) {
			if (obj.hasOwnProperty(k)) {
				if (rootTyp == 'object') {
					if (selector.key && selector.value && k == selector.key && obj[k] == selector.value) {
						return [true,obj,k,obj[k],path];
					}
				} else if (rootTyp == 'array') {
					if (selector.value && obj[k] == selector.value) {
						return [true,obj,k,obj[k],path];
					}
				}
				if ( typeof obj[k] === 'object' && deeper) {
					var ret = _helper.find(obj[k], selector, deeper, path);
					if (ret && ret[0]) {
						path.unshift(k);
						return [true,ret[1],ret[2],ret[3],ret[4]];
					}
				}
			}
		}

	},
	loop: function (root, allways, deeper) {

		var rootTyp;
		if (Object.prototype.toString.call( root ) === '[object Object]') {
			rootTyp = 'object';
		} else if (Object.prototype.toString.call( root ) === '[object Array]') {
			rootTyp = 'array';
		} else {
			return false;
		}

		for (var k in root) {
			if (root.hasOwnProperty(k)) {

				if(allways){
					var back = allways(root, k, root[k]);
					if (back) {
						root[k] = back;
					}
				}

				if (typeof root[k] === 'object' && deeper) {
					_helper.loop(root[k],allways, deeper);
				}
			}
		}
		return false;
	}

};
