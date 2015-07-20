define(['/js/main.js'], function(app) {
    var css = document.createElement('link');
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.href = '/css/main.css';
    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(css);
    
    return app;
});