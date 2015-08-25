function mediaDisplay(el,player){

	var utils = require('./utils');
	var assetManager = require('./assetManager');
	var videoBitRate = assetManager.videoBitRate;

	var src = el.getAttribute('data-url'),
		isSingleSourceVideo = (src.search('.mp4') > -1) ? true : false,
		posterSrc = (isSingleSourceVideo) ? el.getAttribute('data-asset-data') : getVideoPosterImage(src),
		coverLoaded = false,
		sourceLoaded = false;

	function init(){

		player = el.getElementsByTagName('video')[0];
		var width = player.getBoundingClientRect().width;
        var height = (width * 0.5625) + 'px';
        player.setAttribute('height', height);
		

	
		player.addEventListener("play", function () {
			el.classList.add("gv-state-playing");
			el.classList.remove("gv-state-paused");
			el.classList.remove("gv-state-hovering");
		}, false);

		player.addEventListener("pause", function () {
			el.classList.add("gv-state-paused");
			el.classList.remove("gv-state-playing");
		}, false);

		el.addEventListener("mouseover", function(){
			el.classList.add("gv-state-hovering");
		}, false);

		el.addEventListener("mouseout", function(){
			el.classList.remove("gv-state-hovering");
		}, false);


	}


	function loadSource(){

		

		if(!coverLoaded){
			coverLoaded = true;
			player.setAttribute('poster', posterSrc);
			player.setAttribute('height', 'auto');
		}
		if(!sourceLoaded){
			sourceLoaded = true;
			var videoURLs= getVideoURLS(src);
			Object.keys(videoURLs).forEach(function(key) {
				var sourceEl = document.createElement('source');
				sourceEl.setAttribute('type', key);
				sourceEl.setAttribute('src', videoURLs[key]);
				player.appendChild(sourceEl);
			});
		}
		
	}

	function unloadSource(){
		var sources = player.getElementsByTagName('source');
		while(sources.length > 0){
			sources[0].parentNode.removeChild(sources[0]);
		}
		sourceLoaded = false;
	}

	/**
	 * Extract basepath and filename form a full video endpoint URL.
	 * @param {string} videoURL - Full CDN path to video file.
	 * @return {object} {basepath, filename}
	 */
	function getVideoCDNBasePaths(videoURL) {
	    var regex = /(?:interactive\/mp4\/1080|interactive)\/(.+)\/(.+)_.+_.+\..+$/g;
	    var matches = regex.exec(videoURL);
	    
	    if (!matches) {
	        console.warn('Failed to find video path and filename', videoURL);
	        return;
	    }


	    var path = 'http://cdn.theguardian.tv/interactive/';
	    var oggPath = path + 'mp4/1080/' + matches[1] + '/' + matches[2];

	    path += matches[1] + '/' + matches[2];
	    var poster = path + '_768k_H264_poster.jpg';

	    return {
	        path: path,
	        oggPath: oggPath,
	        folder: matches[1],
	        filename: matches[2],
	        poster: poster 
	    };
	}


	function getMP4URL(path) {
		var fileSuffix = '_488k_H264.mp4';
		if (videoBitRate === '4M')   { fileSuffix = '_4M_H264.mp4'; }
		if (videoBitRate === '2M')   { fileSuffix = '_2M_H264.mp4'; }
		if (videoBitRate === '768k') { fileSuffix = '_768k_H264.mp4'; }
		if (videoBitRate === '488k') { fileSuffix = '_488k_H264.mp4'; }
		if (videoBitRate === '220k') { fileSuffix = '_220k_H264.mp4'; }
		return path + fileSuffix;
	}

	function getWebmURL(path) {
		var fileSuffix = '_488k_H264.mp4';
		if (videoBitRate === '4M')   { fileSuffix = '_4M_vp8.webm'; }
		if (videoBitRate === '2M')   { fileSuffix = '_2M_vp8.webm'; }
		if (videoBitRate === '768k') { fileSuffix = '_768k_vp8.webm'; }
		if (videoBitRate === '488k') { fileSuffix = '_488k_vp8.webm'; }
		if (videoBitRate === '220k') { fileSuffix = '_220k_vp8.webm'; }
		return path + fileSuffix;
	}

	function getOggURL(path) {
		var fileSuffix = '_mid.ogv';
		if (videoBitRate === '4M')   { fileSuffix = '_xhi.ogv'; }
		if (videoBitRate === '2M')   { fileSuffix = '_hi.ogv'; }
		if (videoBitRate === '768k') { fileSuffix = '_mid.ogv'; }
		if (videoBitRate === '488k') { fileSuffix = '_tiny.ogv'; }
		if (videoBitRate === '220k') { fileSuffix = '_lo.ogv'; }
		
		// Only _mid.ogv is working  so force that :(
		fileSuffix = '_mid.ogv';
		return path + fileSuffix;
	}


	/**
	 * Get different video encoded paths.
	 * @param {string} baseURL - Path to the video on the GU CDN.
	 * @param {number} [bitrate=1024] - Video bitrate to use.  
	 * @returns {object} URLs to video files.
	 */
	function getVideoURLS(filePath) {		
		//search to see if the video is single source, meaning it's from a video published on a video page rather than through the interactive video workflow
		if(isSingleSourceVideo ){
			return {
				'video/mp4': filePath
			};
		}

		var videoPaths = getVideoCDNBasePaths(filePath);
		return {
			'video/mp4': getMP4URL(videoPaths.path),
			'video/webm': getWebmURL(videoPaths.path),
			'video/ogg': getOggURL(videoPaths.oggPath),
			'video/m3u8': 'http://multimedia.guardianapis.com/interactivevideos/video.php?file='+
	            videoPaths.filename + '&format=application/x-mpegURL&maxbitrate=2000'	
		};
	    
	}

	/**
	 * Get video poster image URL.
	 * @param {string} filePath - Path to the video on the GU CDN.
	 * @returns {string} URL to video poster image.
	 */
	function getVideoPosterImage(filePath) {
	    var videoPaths = getVideoCDNBasePaths(filePath);
		return videoPaths.poster; 
	}

	init();

	return {
		loadSource: loadSource,
		unloadSource: unloadSource
	};
}


module.exports = mediaDisplay;