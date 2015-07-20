function mediaDisplay(el,player){

	var utils = require('./utils');

	player.addEventListener("play", function () {
		el.classList.add("gv-state-playing");
		el.classList.remove("gv-state-paused");
	}, false);

	player.addEventListener("pause", function () {
		el.classList.add("gv-state-paused");
		el.classList.remove("gv-state-playing");
	}, false);

	player.addEventListener("timeupdate", utils.debounce(function(){ updateProgress(); }, 250), false);


	function loadSource(){
		sourceLoaded = true;
		var sourceEl = document.createElement('source');
			sourceEl.setAttribute('type', 'audio/mpeg');
			sourceEl.setAttribute('src', el.getAttribute('data-url'));
			player.appendChild(sourceEl);
	}

	function unloadSource(){
		var sources = player.getElementsByTagName('source');
		while(sources.length > 0){
			sources[0].parentNode.removeChild(sources[0]);
		}
		sourceLoaded = false;
	}

	function updateProgress(){
		if(player.duration && player.currentTime){
			el.querySelector('.audio-progress-circle').setAttribute( 'points',  updateVisualProgress( player.currentTime / player.duration, 50, 40, 0 ) );
		}
	}

	function updateVisualProgress ( pct, innerRadius, outerRadius, c ) {
		// get an SVG points list for the segment
		var points = [], i, angle, start, end, getPoint;
		start = 0;
		end = 2 * (Math.PI)  * pct;
		getPoint = function ( angle, radius ) {
		return ( ( radius * Math.sin( angle ) ).toFixed( 2 ) + ',' + ( radius * -Math.cos( angle ) ).toFixed( 2 ) );
		};
		// get points along the outer edge of the segment
		for ( angle = start; angle < end; angle += 0.05 ) {
		points[ points.length ] = getPoint( angle, outerRadius );
		}
		points[ points.length ] = getPoint( end, outerRadius );
		// get points along the inner edge of the segment
		for ( angle = end; angle > start; angle -= 0.05 ) {
		points[ points.length ] = getPoint( angle, innerRadius );
		}
		points[ points.length ] = getPoint( start, innerRadius );
		// join them up as an SVG points list
		return points.join( ' ' );
	}

	return {
		loadSource: loadSource,
		unloadSource: unloadSource
	};
}


module.exports = mediaDisplay;