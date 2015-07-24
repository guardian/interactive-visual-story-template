define(['/js/main.js'], function(app) {

	var els = document.querySelectorAll('.article__body,.element-interactive');
 	for(var e = 0; e < els.length; e ++){
 		els[e].style.minHeight = '100vh';
 	}

    var css = document.createElement('link');
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.href = '/css/main.css';
    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(css);
    
    return app;
});