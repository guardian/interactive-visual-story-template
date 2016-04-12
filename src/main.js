var Handlebars = require('handlebars/dist/cjs/handlebars');
var Tabletop = require('./js/utils/tabletop');
var getJSON = require('./js/utils/getjson');
var polyfills = require ('./js/utils/polyfills');
var assetManager = require('./js/components/assetManager');

var dom;

// Useful detection tool. See js/utils/detect.js for more.
//console.log('Is IOS: ', detect.isIOS());
//console.log('Connection speed: ', detect.getConnectionSpeed());

/**
 * Update app using fetched JSON data.
 * @param {object:json} data - JSON spreedsheet data.
 */

/**
 * Boot the app.
 * @param {object:dom} el - <figure> element on the page. 
 */
function boot(el) {
	dom = el;
 	//parse the parameters from the url or alt field of embed
    var params = parseUrl(dom);
    if(params.key){
    	//load data if key is found
        loadData(params);
    } else {
    	//error if key is not found
        dom.innerHTML = '<h1>Please enter a key in the alt text of the embed or as a param on the url in the format "key=""</h1>';
    }

}

function parseUrl(el){
    var urlParams; 
    var params = {};

    if(el.getAttribute('data-alt')){
        //pull params from alt tag of bootjs
        urlParams = el.getAttribute('data-alt').split('&');
        params.liveLoad = false;
    } else if(urlParams === undefined){
        //if doesn't exist, pull from url param
        urlParams = window.location.search.substring(1).split('&');
        //set live load so that data loads directly from google spreadsheets for speedy editing
        params.liveLoad = true;
    }
    
    urlParams.forEach(function(param){
     
        if (param.indexOf('=') === -1) {
            params[param.trim()] = true;
        } else {
            var pair = param.split('=');
            params[ pair[0] ] = pair[1];
        }
        
    });
    
    return params;
}

function loadData(params){
    

    if(!params.liveLoad){

        var isLive = ( window.location.origin.search('interactive.guim.co.uk') > -1 || window.location.origin.search('gutools.co.uk') > -1) ? false : true;
        var folder = (!isLive)? 'docsdata-test' : 'docsdata';

        getJSON('https://interactive.guim.co.uk/' + folder + '/' + params.key + '.json', 
            function(json){
                console.log(json)
                render(json.sheets.blocks, json.sheets.config);
            }
        );
    } else {
        //load the data via tabletop for speedy editing (ie no caching layer)
        loadDataViaTabletop(params);
        //setInterval(function(){ loadDataViaTabletop(params); }, 30000);

    }

}


function loadDataViaTabletop(params){
    Tabletop.init({ 
        key: params.key,
        callback: function(data) { 
            render(data.blocks.elements, data.config.elements);
        }
    });
}

function render(blocks, config){

    var rowData = [];
    var row;
    var params = {};

    config.forEach(function(d){
        params[d.param] = d.value;
    })

    blocks.forEach(function(b,i){

        if(b.block_type === 'row'){

            if(i > 0){
                rowData.push(row);
            }
            row = {
                row: b,
                blocks: []
            };
        } else {
            row.blocks.push(b);

            if(row.blocks.length === 1){
                row.row.layout = (b.layout.search('flex') > -1) ? 'flex' : "full";
            }

            if(i === blocks.length -1){
                rowData.push(row);
            }

        }

    });

    //update page global styles
    var selectors = document.querySelectorAll('article,.gv-container,.article--standard');

    if(params.global_styles){

        if(params.global_styles !== ''){
            var classes = params.global_styles.split(' ');


            for(var s = 0; s < selectors.length; s++){

                classes.forEach(function(c){
                    selectors[s].classList.add( c );
                })
                        
            }
        }              

    }
    //set wrapper band colour on guardian page
    //console.log(params)

    if(params.global_styles){
        if(params.global_styles.search('bg-neutral-1') >-1){
            var bands = document.querySelectorAll('.l-side-margins');
            for(var b = 0; b < bands.length; b ++){
                bands[b].className += ' gv-bg-black';
            }
        }
    }



    //update display
    var data = {
        rows: rowData,
        config: params
    };

    Handlebars.registerHelper({
        'if_eq': function(a, b, opts) {
    	    if(a === b){
    	        return opts.fn(this);
    	    }
    	    return opts.inverse(this);
    	},
        'if_not_eq': function(a, b, opts) {
            if(a === b){
                return opts.inverse(this);
            }
            return opts.fn(this);
                
        },
        'if_contains': function(a, b, opts){
            if(a.search(b) == -1 ){
                return opts.inverse(this);
            }
            return opts.fn(this);
        },
        getImageData: function(){
            var query = this.asset_data;
            query = query.split('&');
            var imgData = {
                cropRatio: 1,
                sizes: []
            };
            query.forEach(function(d){
                var pair = d.split('=');
                if( pair[0] === 'cropRatio' ){
                    var sizes = pair[1].split(',');
                    imgData.cropRatio = Number(sizes[1]) / Number(sizes[0]); 
                } else {
                    imgData[ pair[0] ] = pair[1];
           
                }
            });


            return 'data-image-ratio=' + imgData.cropRatio +' data-image-sizes=' + imgData.size ; 
        },

    });

    Handlebars.registerPartial({
        'row': require('./html/row.html'),
        'block': require('./html/block.html'),
        'audioBlock': require('./html/block_audio.html'),
        'iframeBlock': require('./html/block_iframe.html'),
        'photoBlock': require('./html/block_photo.html'),
        'textBlock': require('./html/block_text.html'),
        'quoteBlock': require('./html/block_quote.html'),
        'videoBlock': require('./html/block_video.html'),
        'shareBlock': require('./html/block_share.html')


    });

  	var content = Handlebars.compile( 
                        require('./html/base.html'), 
                        { 
                            compat: true
                        
                        }
                );
  	
  	dom.innerHTML = content(data);

    assetManager.init(dom);

}

module.exports = { boot: boot };
