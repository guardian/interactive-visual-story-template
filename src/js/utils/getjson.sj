/**
 * Get JSON data via XHR
 * @param {string} url - URL to JSON.
 * @param {function} callback - Function to be called with response data.
 */
function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
        xhr.open('GET', url, true);
    } else if(typeof XDomainRequest !== 'undefined') {
        xhr = new XDomainRequest();
        xhr.open('GET', url);
    }

    xhr.onload = function() {
        if (xhr.status && xhr.status !== 200) {
            console.error('Error fetching json:', xhr.status , xhr.statusText);
            return;
        }
        
        var json;
        try {
            json = JSON.parse(xhr.responseText);
        } catch(parseError) {
            throw parseError;
        } finally {
             callback(json);
        }
    };

    xhr.onerror = function() {
        console.error('Error fetching JSON');
    };

    // IE9 fixes
    xhr.onprogress = function () { };
    xhr.ontimeout = function () { };
    setTimeout(function () {
        xhr.send();
    }, 0);
}

module.exports = getJSON;
