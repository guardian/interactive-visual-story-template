function mediaPlayer(el){

	var utils = require('./utils');
	var assetManager = require('./assetManager');
	var AudioPlayer = require('./mediaPlayerAudio');
	var VideoPlayer = require('./mediaPlayerVideo');

	var player;
	var playerComponent;
	var sourceLoaded = false;

	function init(){

		player = el.querySelectorAll('audio,video')[0];
		if(player.getAttribute('data-asset-type') === 'audio'){
			playerComponent = new AudioPlayer(el,player);
		} else if(player.getAttribute('data-asset-type') === 'video'){
			playerComponent = new VideoPlayer(el,player);
		}

		player.addEventListener("play", function () {
			assetManager.registerPlaying(player);
		}, false);

		player.addEventListener("pause", function () {

		}, false);



		el.addEventListener('click', function(){

			if(!player.paused){
				pause();
			} else {
				play();
			}
		})


	}

	function pause(){
		player.pause();
	}

	function play(){
		player.play();
	}

	function isReady(active){
		if(active){

			if(!sourceLoaded){
				sourceLoaded = true;
				playerComponent.loadSource();
			}

		} else {

			if(sourceLoaded){
				sourceLoaded = false;
				playerComponent.unloadSource();
			}

		}

	}

	function updateProgress(){

	}

	init();

	return {
		play: play,
		pause: pause,
		isReady: isReady
	};
}


module.exports = mediaPlayer;