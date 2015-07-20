define([], function() {
	var smallFile = 'http://cdn.theguardian.tv/interactive/speedtest/testfilesmall.dat';
	var largeFile =  'http://cdn.theguardian.tv/interactive/speedtest/testfile.dat';
	
	var bandwidth = 1000; //default value in case bandwidth detection fails. Must be non zero
	
	function loadScript(url, callback) {
		var script = document.createElement('script');
		script.charset = 'utf-8';
		script.src = url;
		var done = false;
		script.onload = script.onreadystatechange = function () {
			if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
				done = true;
				if (callback) {
					callback();
				}
				script.onload = script.onreadystatechange = null;
				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
			}
		};
		document.body.appendChild(script);
	};
	
	
	function timeFile(url, callback) {
		var startTime = new Date().getTime();
		url += '?bust=' + startTime;
		var err = null;
		
		loadScript(url, function () {
			var endTime = new Date().getTime();
			var loadTime = endTime - startTime;
			var loadSeconds = loadTime * 0.001;
			if (callback) {
				callback(err, loadSeconds);
			}
		});
	};
	
	/**
	 * Get the current connection bandwidth
	 * @param {object} callback Callback function.
	 * @return {float} Bandwidth value in bits per second.
	 */
	function getSpeed(callback) {
		var startTime = new Date().getTime();
		var checkFileSmall = 'http://cdn.theguardian.tv/interactive/speedtest/testfilesmall.dat';
		var fileSizeSmall = 1024*8;
		var checkFileLarge = 'http://cdn.theguardian.tv/interactive/speedtest/testfile.dat';
		var fileSizeLarge = 102400*8;
		var timeout = 5000; // just give up after 5 seconds
		var err = null;

		var loadSecondsLarge = 0;
		var loadSecondsSmall = 0;
		var loadedLarge = false;
		var loadedSmall = false;

		function bothLoaded(){
			var loadSecondsDiff = loadSecondsLarge - loadSecondsSmall;
			loadSecondsDiff = Math.max(loadSecondsDiff, 0.01);
			var fileSizeDiff = fileSizeLarge - fileSizeSmall;
			var rate = fileSizeDiff/loadSecondsDiff;


			var ratekbps = Math.round(rate/1024);
			ratekbps = Math.min(ratekbps, 10000);
			ratekbps = Math.max(ratekbps, 100);
			bandwidth = ratekbps;

			if (callback) {
				var temp = callback;
				callback = null; //prevent double callback
				temp(rate);
			}
		};

		timeFile(checkFileSmall, function(err, loadSeconds){
			//make sure dnscache is happy
			if(!err){
				timeFile(checkFileSmall, function(err, loadSeconds){
				if(!err){
					loadSecondsSmall = loadSeconds;
					loadedSmall = true;
					timeFile(checkFileLarge, function(err, loadSeconds){
						if(!err){
							loadSecondsLarge = loadSeconds;
							loadedLarge = true;
							bothLoaded();
						}
					});
				}
			});
			}
		});

		setTimeout(function(){
			if (callback) {
				var temp = callback;
				callback = null;
				temp(bandwidth);
			}
		}, timeout);
	};
		
	return {
		getSpeed: getSpeed
	};
});
