javascript: (function() {
    window.pds = window.pds || {
        bookmarkversion: '2.0',
        baseUrl: 'http://127.0.0.1:8080/',
        /*baseUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/alpha',*/
        fetch: function (url, options) {
            if (url.slice(0,1) === '/') { url = document.location.origin + url; }
            return fetch(url, options).then(function(response) {
                if (!response.ok) { throw Error(response.statusText); }
                return response.url.match('.json') ?
                    response.json() :
                    response.text();
            });
        },
        resource: function (type, id, data) {
            var item = document.createElement(type);
            item.id = id;
            item.innerHTML = data;
            if (document.getElementById(item.id)) {
                document.getElementById(item.id).remove();
            }
            document.getElementsByTagName('head')[0].appendChild(item);
        }
    };
    var isReddit = document.location.hostname.split('.').slice(-2).join('.').toLowerCase() === 'reddit.com';
    if (isReddit) {
        var cachBustUrl = `${pds.baseUrl}dist/app.js?'${new Date().getDate()}`;
        pds.fetch(cachBustUrl).then(function(data) {
            pds.resource('script', 'appjs', data);
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite');
        });
    } else if (confirm('This script is designed to run on reddit. Would you like to go there now?')) {
        document.location = 'https://www.reddit.com/u/me/';
    } else {
        alert('Please go to reddit before running this script');
    }
})();
