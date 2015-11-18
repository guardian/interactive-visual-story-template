var CanvasVideoPlayer = require('../utils/canvasvideoplayer');
var throttle = require('../utils/throttle');

function loopPlayer(el,player){

    var src = el.getAttribute('data-url'),
        posterSrc = src.replace('.mp4', '_poster.jpg');

    var videoContainer = el.querySelector('.gv-loop__video-container');

    var video = document.createElement('video');
    video.setAttribute('loop', true);
    video.setAttribute('poster', posterSrc);
    video.innerHTML = '<source src="' + src  + '" type="video/mp4"></source>';
    videoContainer.appendChild(video);


    function playIfNearby(evt) {
        if (window.innerWidth >= 620) {
            var rect = el.getBoundingClientRect(),
                nearby = Math.abs(rect.top) < window.innerHeight * 2;
            if (nearby) {
                video.play();
                window.removeEventListener('scroll', throttledPlayIfNearby);
            }
        }
    }
    var throttledPlayIfNearby = throttle(playIfNearby, 250);

    window.addEventListener('scroll', throttledPlayIfNearby);
    window.setTimeout(playIfNearby, 100)
;}

module.exports = loopPlayer;
