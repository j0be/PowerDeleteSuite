javascript: (function () {
    window.pq = function (str) {
        return document.querySelectorAll(str);
    };
    window.alpha = true;
    window._pd = {
        bookmarkver: '1.3',
        domain: document.location.hostname.split('.').slice(-2).join('.'),
        scriptUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + (alpha ? 'alpha/app.js' : 'master/powerdeletesuite.js'),
    };
    window.xhr = function (url, cb, err) {
        var this_xhr = new XMLHttpRequest();
        url += (url.match(/\?/) ? '&' : '?') + (new Date()).getDate();
        this_xhr.open('GET', url);
        this_xhr.send(null);
        this_xhr.onreadystatechange = function () {
            if (this_xhr.readyState === 4) {
                if (this_xhr.status === 200) {
                    cb(this_xhr);
                } else {
                    err(this_xhr);
                }
            }
        };
        return this_xhr;
    };

    if (_pd.domain === 'reddit.com') {
        xhr(_pd.scriptUrl, function (response) {
            var pd = document.createElement('script');
            pd.setAttribute('id', 'pd-script');
            pd.innerHTML = response.responseText;
            pq('head')[0].appendChild(pd);
        }, function (data) {
            alert('Error retreiving PowerDeleteSuite from github');
        });
    } else {
        if (confirm('This script is designed to be run from your user profile on reddit. Would you like to go there now?')) {
            document.location = 'http://reddit.com/u/me/overview';
        }
    }
})();
