javascript: (function() {
    window.bookmarkver = '1.5';
    var isReddit = document.location.hostname.split('.').slice(-2).join('.') === 'reddit.com';
    if (isReddit) {
        var cachBustUrl = 'http://127.0.0.1:8000/app.js?' + (new Date().getDate());
        fetch(cachBustUrl).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.text();
        }).then(function(data) {
            var script = document.createElement('script');
            script.innerHTML = data;
            document.getElementsByTagName('head')[0].appendChild(script);
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite from github');
        });
    } else if (confirm('This script is designed to run on reddit. Would you like to go there now?')) {
        document.location = 'https://www.reddit.com/u/me/';
    } else {
        alert('Please go to reddit before running this script');
    }
})();
