javascript: (function () {
    window.pq = function (str) {
        return document.querySelectorAll(str);
    };
    window.alpha = true;
    window._pd = {
        bookmarkver: '1.3',
        domain: document.location.hostname.split('.').slice(-2).join('.'),
        baseUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + (alpha ? 'alpha/' : 'master/'),
        scriptUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + (alpha ? 'alpha/app.js' : 'master/powerdeletesuite.js'),
    };
    window.xhr = function (url, methodType) {
        var promiseObj = new Promise(function (resolve, reject) {
            var caller = new XMLHttpRequest();
            caller.open(methodType || 'GET', url, true);
            caller.send();
            caller.onreadystatechange = function () {
                if (caller.readyState === 4) {
                    if (caller.status === 200) {
                        var resp = caller.responseText,
                            response;
                        try {
                            response = JSON.parse(resp);
                        } catch (e) {
                            response = {
                                responseText: resp
                            };
                        }
                        resolve(response);
                    } else {
                        reject(caller.status);
                    }
                }
            };
        });
        return promiseObj;
    };

    if (_pd.domain === 'reddit.com') {
        xhr(_pd.scriptUrl + '?v' + Math.round(Math.random() * 100)).then(function (response) {
            var pd = document.createElement('script');
            pd.setAttribute('id', 'pd-script');
            pd.innerHTML = response.responseText;
            pq('head')[0].appendChild(pd);
        }).catch(function (data) {
            alert('Error retreiving PowerDeleteSuite from github');
        });
    } else {
        if (confirm('This script is designed to be run from your user profile on reddit. Would you like to go there now?')) {
            document.location = 'http://reddit.com/u/me';
        }
    }
})();
