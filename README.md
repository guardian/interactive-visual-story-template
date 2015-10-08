# Visual story template
version 1.1 

### Setup a new spreadsheet
1. <b>Copy</b> the spreadsheet template <a href="https://docs.google.com/spreadsheets/d/1c41KsYQhUXnWUenzZqqDVPCx71PZsUsDN0BTqpEevug">here</a>
2. Click "share" in the top right corner and <b>allow anyone on guardian.co.uk to edit</b> the spreadsheet. Also share with this email address.
<pre><code>1003398697195-cqgtcslthr0dkbfrosueatrs5aqjev5i@developer.gserviceaccount.com
</code></pre>
3. Publish the spreadsheet: Click File > Publish to the web > Publish. Note: this is for being able to preview. There's an additional step to publish the spreadsheet onto the site, which is listed below.


### Create your visual story
This layout tool generates a series of rows with blocks nested within each row

- To <b>create a new row of blocks</b>, select the 'row' in the block_type column. Then create blocks in the rows that follow
- To <b>create a new block within a row</b>, select the block type you wish to create from the block_type dropdown. Populate the related fields
    - <b>Layout</b>: select the width of the block you wish to create. Note that full/half blocks cannot be combined with flex blocks. Follow the layout grid below
    - <b>Primary text</b>: Typically header or large quote text
    - <b>Secondary text</b>: Typically paragraph or credit text depending on the block type
    - <b>URL</b>: 
        - For photo, use the bookmarklet here to grab the photo data from the media grid 
        - For video, there are two input options
        	- if this video is published on a video page on theguardian.com
        		View source on the video page, include the .mp4 path of the video in the url field and the poster image url in the asset_data field of the spreadsheet
        	- if the video is published through the interactive video output process
        		Include the video key / identifier used to acces the video via the multimedia api in the url field
        - For audio, include the url for the mp3 file
    - <b>Custom styles</b>: Use this sparingly. Add class names separated by a space from the list below to change the lead photo text colour, position, shadow, and background colour for mobile

![Alt text](https://raw.githubusercontent.com/guardian/interactive-visual-story-template/master/offline/layout_guide.png "Layout guide")

### Preview the visual story
Copy the url below and replace the [SPREADSHEET] with the spreadsheet key for your project
<pre><code>http://interactive.guim.co.uk/templates/visual-story/1.1/index.html?key=[SPREADSHEET]</code></pre>

### Create a composer asset for publication
<b>Note that this is not intended to be used with the Composer immersive setting switched on.</b><br>
Paste the url below into an interactive asset in composer to create the embed.
<pre><code>http://interactive.guim.co.uk/templates/visual-story/1.1/boot.js</code></pre>
In the alt field, add the following line replacing [SPREADSHEET] with the key you used above to create the preview link.
<pre><code>key=[SPREADSHEET]</code></pre>

Note: You have to publish the spreadsheet via the <a href='https://visuals.gutools.co.uk/docs/'>Visuals docs tool</a> for the project to show up on the site - or for edits to be reflected on the site. Go to the page, click publish next to the spreadsheet you created.


### Media grid bookmarklet
Create a new bookmark in your browser (Chrome!) and then save the following code in the url field. To grab the photo info from the grid, crop a photo and then select the bookmark. Select the contents of the text box created on the screen and then pasted into the URL field of a photo block above.

<pre><code>javascript: (function() {function loadData() {if (window.location.search.indexOf('?crop=') > -1) {var xmlhttp = new XMLHttpRequest();var url = "https://api." + window.location.host + window.location.pathname;xmlhttp.onreadystatechange = function() {if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {var data = JSON.parse(xmlhttp.responseText);logData(data);}};xmlhttp.withCredentials = true;xmlhttp.open("GET", url, true);xmlhttp.send();} else {alert('Please select a crop on the right');}}function logData(imgData) {var cropId = window.location.search.replace('?crop=', '');var cropData;var masterData;if (cropId === '') {alert('select a crop on the right');}for (var i = 0; i < imgData.data.exports.length; i++) {if (imgData.data.exports[i].id == cropId) {cropData = imgData.data.exports[i];masterData = imgData.data.exports[i].master.dimensions;break;}}var crops = cropData.assets.sort(function(a, b) {return a.dimensions.width - b.dimensions.width;});var widths = crops.map(function(crop) {return crop.dimensions.width;});var path = window.location.href.replace('https://media.gutools.co.uk/images/', 'http://media.guim.co.uk/').replace('?crop=', '/');var dimensions = 'cropRatio=' + masterData.width + ',' + masterData.height;var sizes = 'size=';widths.forEach(function(w, i) {sizes+= (i > 0) ? ',' : '';sizes += w;});sizes += '\t';var newInput = document.createElement("textarea");newInput.setAttribute('style', 'position: absolute; top: 50px; left: 0;');newInput.id = "gu-text";newInput.value = path + '\t' + dimensions + '&' + sizes ;newInput.cols = '175';newInput.rows = "1";document.getElementsByClassName('easel__canvas')[0].appendChild(newInput);}loadData();})();
</code></pre>

### Custom styles
Replace the [colour name] with any of the colour names listed in <a href='http://guardian.github.io/pasteup-palette/demo/'>this palette</a>
<pre><code>text-[colour name]
text-18
text-20
text-24
bg-[colour name]
text-shadow
lead-top-left
lead-bottom-left 
lead-top-right 
lead-bottom-right
row-divider </code></pre>

### The git repo for this project is here:
<pre><code>https://github.com/guardian/interactive-visual-story-template</code></pre>
