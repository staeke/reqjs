// Left to do:
// 1. Priorities a) require-defer / require.priority
// 2. Config handling <-> Mergning/minifying
//		* Nice if we can have deployment-wise merging. Nice also if, during live running, it's possible
//		to debug by e.g. renaming a file or changing a flag. This way you can go back to the non-merged
//		(and non-minified) versions
//		* The minifying script/program/process should read the config file, and merge require.js and config.js to require.js
//		* Also nice if there are easy startup examples for e.g. .NET/Node.js/etc.
//	3. Make neater
// 4. Documentation/examples
// 5. Make possible to change polling in config file (see loadPendingRequires)


var require,define,log, _merges;

(function () {
	var REQUIRE_TIMEOUT = 5000;

	_merges = {};
	var _baseDir = "/scripts/";

	var _defines = ["jquery"];
	var _waits = [];
	var _loaded = [];

	var _mappings = {
		"jquery.colorpicker": "/scripts/static/colorpicker/js/colorpicker.js"
		/* Possible suggestion: "colorpicker-(.*)": "/scripts/colorpicker/colorpicker-$1.js" */
	};

	function lookupMapping(file, type) {
		if (typeof (type) == "undefined")
			type = ".js";

		if (typeof (_mappings[file]) != "undefined")
			return _mappings[file];

		if (file.indexOf("//") > -1)
			return file;
		if (file.indexOf("." + type) > -1 || file.indexOf(".aspx") > -1 || file.indexOf(".php") > -1)
			return _baseDir + file;
		return _baseDir + file + "." + type;
	}

	function merge(jsFileArray) {
		for (var i = 0; i < jsFileArray.length; i++)
			_merges[jsFileArray[i]] = jsFileArray.join(".");
	}

	//Config
	merge(["one", "two"]);

	//Move options to second argument?
	require = function(dependencies, onComplete, options) {

		if (typeof (dependencies) == "string")
			dependencies = [dependencies];

		if (typeof (options) == "undefined" || options == null)
			options = { type: "js" };

		var ok = true;

		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];

			if (_defines.indexOf(dependency) > -1)
				continue;

			if (_loaded.indexOf(dependency) > -1)
				return;

			_loaded.push(dependency);

			log("Trying to load " + dependency);

			var merged = lookupMerge(dependency);
			if(dependency != merged)
				log("Merged " + dependency + " to " + merged);
			var mapped = lookupMapping(merged, options.type);
			if(mapped != merged)
				log("Mapped " + merged + " to " + mapped);

			if (options.type == "js")
				addScript(mapped);
			else if (options.type == "css")
				addCss(mapped);

			ok = false;
		}

		if (typeof (onComplete) != "undefined" && onComplete != null) {
			if (!ok) {
				log("Pushing dep " + dependencies);

				waitFor({ dependencies: dependencies, onComplete: onComplete });
			}
			else
				onComplete(jQuery);
		}
	}

	function waitFor(obj) {
		setTimeout(function () {
			for (var i = 0; i < obj.dependencies.length; i++) {
				var dependency = obj.dependencies[i];
				if(typeof(_defines[dependency]) == "undefined")
					console.error("Timeout for dependency " + dependency + ". Make sure you call define(name) at the end of the script or use the jQuery plugin dependency syntax [jquery.pluginname]");
			}
		}, REQUIRE_TIMEOUT);
		_waits.push(obj);
	}

	function triggerWaitsComplete() {
		for (var i = _waits.length - 1; i > -1; i--) {
			var wait = _waits[i];
			var ok = true;
			for (var j = 0; j < wait.dependencies.length; j++) {
				if (_defines.indexOf(wait.dependencies[j]) < 0) {
					ok = false;
					break;
				}
			}
			if (ok) {
				log("Wait complete");
				_waits.splice(i, 1);
				wait.onComplete(jQuery);
			}
		}
	}

	function lookupMerge(jsFile) {
		if (typeof (_merges[jsFile]) == "undefined")
			return jsFile;
		return _merges[jsFile];
	}

	function addScript(url) {

		log("Loading " + url);

		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src = url;
		head.appendChild(script);
	}

	function addCss(url) {

		log("Loading " + url);

		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = url;
		head.appendChild(link);
	}

	function loadPendingRequires() {
		$("*[data-require-js]").each(function () {
			var req = $(this).data("require-js").split(',');
			require(req, null, { type: "js" });
		});
		$("*[data-require-css]").each(function () {
			var req = $(this).data("require-css").split(',');
			require(req, null, { type: "css" });
		});
	}

	define = function(script, fn) {
		if (typeof (fn) != "undefined")
			fn();
		log("Define " + script);
		_defines.push(script);
		triggerWaitsComplete();
	}

	log = function(msg) {
		var d = new Date();
		console.log(msg + " " + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds());
	}

	$(function () {
		log("jQuery DOM ready");
		clearInterval(_scriptPoller);
		loadPendingRequires();
	});

	$(window).load(function () {
		log("Window onLoad");
	});

	var _scriptPoller = setInterval(loadPendingRequires, 200);

	var jQueryExtend = $.fn.extend;
	$.fn.extend = function (plugin) {
		for (var fn in plugin)
			define("jquery." + fn.toLowerCase())
		jQueryExtend.apply(this, arguments);
	};
})();