var bandwidth = require('../utils/bandwidth');
var iframeLoader = require('../utils/iframeLoader');
var utils = require ('../components/utils');

var photoswipeHTML = require('../../html/photoswipe.html')
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('photoswipe/src/js/ui/photoswipe-ui-default');
var pswpElement;


var MediaPlayer = require ('../components/mediaPlayer');

//array populated during init, scrapes all classes for 'gv-asset'
var queue = [];		
var isThereVideo = false;
var currentlyPlaying;

//default config data
var windowWidth = 0;
var windowHeight = 0;
var windowPixelRatio = window.devicePixelRatio;
var DEFAULT_BITRATE = '488k';
var videoBitRate = DEFAULT_BITRATE;


function init(dom){

	//bitrate detection for video
	if(isThereVideo){
		setTimeout(function() {
	        bandwidth.getSpeed(setVideoBitrate);
	    }, 2000);
	}

	//init photoswiper
	initPhotoSwipe(dom);
	
	//determine assets to lazy load or monitor viewport position
	var list = dom.querySelectorAll('.gv-asset');
	for(var l = 0; l < list.length; l ++){
		queue.push({
			el: list[l],
			status: 'none'
		});

		if(list[l].getAttribute('data-asset-type') === 'video'){
			isThereVideo = true;
		}
	}

	

	//scan the list of managed assets
	scanAssets();

	window.addEventListener(
		'scroll', 
		utils.debounce(function(){
			scanAssets();
		}, 250)
	);

	window.addEventListener(
		'resize', 
		utils.debounce(function(){
			scanAssets();
		}, 250)
	);

}

function initPhotoSwipe(dom){
	dom.innerHTML += photoswipeHTML;
	pswpElement = dom.querySelectorAll('.pswp')[0];
}

function measureWindow(){
	var w = window.innerWidth;
	windowHeight = window.innerHeight;

	if(w !== windowWidth){
		windowWidth = w;
		return true;
	}
	return false;
}


//scans the list of media elements for loading, initializing, unloading
function scanAssets() {
	resizeAsset = measureWindow();

	for(var a = 0; a < queue.length; a ++){

		if(queue[a].status === 'none'){
			var status = updateAsset(queue[a], queue[a].el, queue[a].el.getAttribute('data-asset-type'), resizeAsset);
			if(status === 'loaded'){
				queue.splice(a, 1);
				a--;
			}
		}

	}

}

function updateAsset(asset, el, type, resizeAsset){
	var position = measureElement(el);
   
	if(type === 'image' || type === 'image-lead'){
		
		if(resizeAsset){
			el.setAttribute('style', 'height: ' + (position.rect.width * el.getAttribute('data-image-ratio')) + 'px');
		}

		if(position.nearViewport){
			loadImage(el, position.rect);
			return 'loaded';
		}

	} else if (type === 'iframe'){

		if(position.nearViewport){
			loadIframe(el);
			return 'loaded';
		}			

	} else if (type === 'audio'){

		if(!asset.player){
			asset.player = new MediaPlayer(el);
			el.classList.remove('gv-asset');
		}

		if(position.nearViewport){
			asset.player.isReady(true);
		}

		return 'active';

	} else if (type === 'video'){

		if(!asset.player){
			asset.player = new MediaPlayer(el);
			el.classList.remove('gv-asset'); 
		}

		if(position.nearViewport){
			asset.player.isReady(true);
			return 'active';
		}

		asset.player.isReady(false);
		return 'active';		
	}

	return 'notloaded';
}

function measureElement(el){

	var rect = el.getBoundingClientRect();

	return {
		inViewport: (rect.top < windowHeight ) ? true : false,
		nearViewport: ( Math.abs(rect.top) < windowHeight * 2.5 ) ? true : false,
		rect: rect
	}
}

function loadImage(el, bBox){

	var sizes = el.getAttribute('data-image-sizes').split(',');
	var ratio = Number(el.getAttribute('data-image-ratio'));
	var basePath = el.getAttribute('data-url');
	var photoSwipeList = [];
	var sizeToLoad;

	for(var s = 0; s < sizes.length; s++){
		var w = Number(sizes[s]);

		photoSwipeList.push({
			src: basePath + '/' + w + '.jpg',
			w: w,
			h: w * ratio,
			ratio: ratio
		})

		if( bBox.width < w && !sizeToLoad){
			sizeToLoad = w;
		}
		if( s === sizes.length -1 && !sizeToLoad ){
			sizeToLoad = w;
		}
	}


	//loading image
	var image = new Image();
	var path = basePath + '/' + sizeToLoad + '.jpg';
	
	image.onload = function() {
			
			var img = document.createElement('img');
			img.setAttribute('src', path);
			el.appendChild(img);
			

			el.setAttribute('style', 'height: auto;');
       		el.classList.remove('gv-asset'); 
       		el.classList.add('gv-loaded');
       		el.onclick = function(){
       			loadPhotoSwipe(photoSwipeList);
       		}
	};  

	image.src = path;


}

function loadPhotoSwipe(photoSwipeList){
	
	var zoomPhoto = getZoomPhoto(photoSwipeList);

	var options = {
             // history & focus options are disabled on CodePen        
        history: false
        
    };

	var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, zoomPhoto , options);
    gallery.init();

}

function getZoomPhoto(photoSwipeList){

	var zoomedPhoto = new Array();

	realViewportWidth = windowPixelRatio * windowWidth;
	realViewportHeight = windowPixelRatio * windowHeight;
console.log(realViewportWidth)

	for(var p = 0; p < photoSwipeList.length; p ++){
		var photo = photoSwipeList[p];
		if(photo.ratio >= 1){
			//how to pick size if vertical shape
			if(photo.h > realViewportHeight){
				zoomedPhoto.push(photo);
				break;
			} else if( p == photoSwipeList.length -1){
				zoomedPhoto.push(photo);
				break;
			}

		} else {
			//how to pick size if horizontal shape

			if(photo.w >= realViewportWidth){
				zoomedPhoto.push(photo);
				break;
			} else if( p == photoSwipeList.length -1){
				zoomedPhoto.push(photo);
				break;
			}

		}		
	}

	return zoomedPhoto;
}

function loadIframe(el){
	el.classList.remove('gv-asset'); 
	iframeLoader.boot(el, el.getAttribute('data-url'));	
}


function registerPlaying(player){
	if(currentlyPlaying != player){
		if(currentlyPlaying){
			currentlyPlaying.pause();
		}
		
		currentlyPlaying = player;
	} 
	
}

function setVideoBitrate(bitrate) {
	var kbps = bitrate / 1024;
	if (kbps >= 4068) { videoBitRate = '4M'; }
	if (kbps < 4068) { videoBitRate  = '2M'; }
	if (kbps < 2048) { videoBitRate  = '768k'; }
	if (kbps < 1024) { videoBitRate  = '488k'; }
	if (kbps < 512)  { videoBitRate  = '220k'; }
}

module.exports = {
	init: init,
	registerPlaying: registerPlaying,
	videoBitRate: videoBitRate
};
