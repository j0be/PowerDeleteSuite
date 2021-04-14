javascript: (function() {
    window.pds = {
        bookmarkversion: '2.0',
        fetch: function (url, options) {
            return fetch(url, options).then(function(response) {
                if (!response.ok) { throw Error(response.statusText); }
                return response.text();
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
    window.baseUrl = 'http://127.0.0.1:8080/';
    /*window.baseUrl = 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/alpha';*/
    var isReddit = document.location.hostname.split('.').slice(-2).join('.').toLowerCase() === 'reddit.com';
    if (isReddit) {
        var cachBustUrl = baseUrl + 'dist/app.js?' + (new Date().getDate());
        pds.fetch(cachBustUrl).then(function(data) {
            pds.resource('script', 'appjs', data);
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite from ' + (debugging ? 'local' : 'github'));
        });
    } else if (confirm('This script is designed to run on reddit. Would you like to go there now?')) {
        document.location = 'https://www.reddit.com/u/me/';
    } else {
        alert('Please go to reddit before running this script');
    }
})();
