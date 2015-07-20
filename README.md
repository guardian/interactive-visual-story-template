#Visual story template

###Setup a new spreadsheet
1. Copy the template spreadsheet <a href="https://docs.google.com/spreadsheets/d/1c41KsYQhUXnWUenzZqqDVPCx71PZsUsDN0BTqpEevug">here</a>
2. Click "share" in the top right corner and <b>allow anyone on guardian.co.uk to edit</b> the spreadsheet
3. Publish the spreadsheet to the web. Click File > Publish to the web > Publish
4. Email the interactive team with the link to your spreadsheet and ask that it be added to the s3 spreadsheet tool ( <a href='mailto:interactive.team@guardian.co.uk'>interactive.team@guardian.co.uk</a> )



###Create your visual story
This layout tool generates a series of rows with blocks nested within each row

- To <b>create a new row of blocks</b>, select the 'row' in the block_type column. Then create blocks in the rows that follow
- To <b>create a new block within a row</b>, select the block type you wish to create from the block_type dropdown. Populate the related fields
    - <b>Layout</b>: select the width of the block you wish to create. Note that full/half blocks cannot be combined with flex blocks
    - <b>Primary text</b>: Typically header or large quote text
    - <b>Secondary text</b>: Typically paragraph or credit text depending on the block type
    - <b>URL</b>: 
        - For photo, use the bookmarklet here to grab the photo data from the media grid 
        - For video, include the url from Octopus multimedia
        - For audio, include the url for the mp3 file
    - <b>Custom styles</b>: Use this sparingly. Add class names separated by a space from the list below to change the lead photo text colour, position, shadow, and background colour for mobile


###Preview the visual story
Copy the url below and replace the [SPREADSHEET] with the spreadsheet key for your project
<pre><code>http://interactive.guim.co.uk/templates/visual-story/1.0/index.html?key=[SPREADSHEET]</code></pre>

###Create a composer asset for publication
<b>Note that this is not intended to be used with the Composer immersive setting switched on.</b><br>
Paste the url below into an interactive asset in composer to create the embed.
<pre><code>http://interactive.guim.co.uk/templates/visual-story/1.0/boot.js</code></pre>
In the alt field, add the following line replacing [SPREADSHEET] with the key you used above to create the preview link.
<pre><code>key=[SPREADSHEET]</code></pre>

###Custom styles
Replace the [colour name] with any of the colour names listed in <a href='http://guardian.github.io/pasteup-palette/demo/'>this palette</a>
<pre><code>text-[colour name]
bg-[colour name]
text-shadow
lead-top-left
lead-bottom-left 
lead-top-right 
lead-bottom-right </code></pre>

###Media grid bookmarklet
Create a new bookmark in your browser (Chrome!) and then save the following code in the url field. To grab the photo info from the grid, crop a photo and then select the bookmark. Select the contents of the text box created on the screen and then pasted into the URL field of a photo block above.

<pre><code>javascript: (function() {function loadData() {if (window.location.search.indexOf('?crop=') > -1) {var xmlhttp = new XMLHttpRequest();var url = "https://api." + window.location.host + window.location.pathname;xmlhttp.onreadystatechange = function() {if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {var data = JSON.parse(xmlhttp.responseText);logData(data);}};xmlhttp.withCredentials = true;xmlhttp.open("GET", url, true);xmlhttp.send();} else {alert('Please select a crop on the right');}}function logData(imgData) {var cropId = window.location.search.replace('?crop=', '');var cropData;var masterData;if (cropId === '') {alert('select a crop on the right');}for (var i = 0; i < imgData.data.exports.length; i++) {if (imgData.data.exports[i].id == cropId) {cropData = imgData.data.exports[i];masterData = imgData.data.exports[i].master.dimensions;break;}}var crops = cropData.assets.sort(function(a, b) {return a.dimensions.width - b.dimensions.width;});var widths = crops.map(function(crop) {return crop.dimensions.width;});var path = window.location.href.replace('https://media.gutools.co.uk/images/', 'http://media.guim.co.uk/').replace('?crop=', '/');var dimensions = 'cropRatio=' + masterData.width + ',' + masterData.height;var sizes = 'size=';widths.forEach(function(w, i) {sizes+= (i > 0) ? ',' : '';sizes += w;});sizes += '\t';var newInput = document.createElement("textarea");newInput.setAttribute('style', 'position: absolute; top: 50px; left: 0;');newInput.id = "gu-text";newInput.value = path + '\t' + dimensions + '&' + sizes ;newInput.cols = '175';newInput.rows = "1";document.getElementsByClassName('easel__canvas')[0].appendChild(newInput);}loadData();})();
</code></pre>

###The git repo for this project is here:
<pre><code></code></pre>