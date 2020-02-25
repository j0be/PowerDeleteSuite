javascript: (function() {
    window.bookmarkver = '2.0';

    window.debugging = true;
    var branch = 'alpha/';
    window.baseUrl = window.debugging ?
        'http://127.0.0.1:8080/' :
        'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + branch;

    var isReddit = document.location.hostname.split('.').slice(-2).join('.') === 'reddit.com';
    if (isReddit) {
        var cachBustUrl = baseUrl + 'app.js?' + (new Date().getDate());
        fetch(cachBustUrl).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.text();
        }).then(function(data) {
            var item = document.createElement('script');
            item.id = 'appjs';
            item.innerHTML = data;
            if (document.getElementById(item.id)) {
                document.getElementById(item.id).remove();
            }
            document.getElementsByTagName('head')[0].appendChild(item);
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite from ' + (debugging ? 'local' : 'github'));
        });
    } else if (confirm('This script is designed to run on reddit. Would you like to go there now?')) {
        document.location = 'https://www.reddit.com/u/me/';
    } else {
        alert('Please go to reddit before running this script');
    }
})();
