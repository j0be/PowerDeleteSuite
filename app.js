window.pq = function (str) {
    return document.querySelectorAll(str);
};
window.alpha = true;
window._pd = {
    bookmarkver: '1.3',
    domain: document.location.hostname.split('.').slice(-2).join('.'),
    baseUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + (alpha ? 'alpha/' : 'master/'),
};

window.xhr = function (url, methodType) {
    var promiseObj = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(methodType || 'GET', url, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var resp = xhr.responseText,
                        response;
                    try {
                        response = JSON.parse(resp);
                    } catch(e) {
                        response = { responseText: resp };
                    }
                    resolve(response);
                } else {
                    reject(xhr.status);
                }
            }
        };
    });
    return promiseObj;
};

/*****************/

var pd = {
    version: '2.0.0',
    bookmarkver: '1.3',
    debugging: true
},
stream = {};

var app = {
    init: function () {
        if (validation.versions()) {
            app.setup();
        }
    },
    setup: function () {
        function dom() {
            return xhr(_pd.baseUrl+'app.html').then(function (response) {
                pq('body>.content[role=\'main\']')[0].innerHTML = response.responseText;
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite markup'));
        }
        function css() {
            return xhr(_pd.baseUrl + 'app.css').then(function (response) {
                pq('head')[0].innerHTML += response.responseText;
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite css'))
            .then(dom);
        }
        return css();
    }
};

var validation = {
    versions: function () {
        function checkBookmarkletVersion() {
            if (typeof _pd.bookmarkver === 'undefined' || _pd.bookmarkver !== pd.bookmarkver) {
                if (confirm('There\'s been an update to the bookmarklet. Would you like to go to the Github repo in order to get the latest version?')) {
                    document.location.href = 'https://github.com/j0be/PowerDeleteSuite';
                    return false;
                }
            }
            return true;
        }
        function checkAppVersion() {
            pd.prevRunVersion = localStorage.getItem('pd_ver') ? localStorage.getItem('pd_ver') : '0';
            localStorage.setItem('pd_ver', pd.version);
            if (pd.version !== pd.prevRunVersion) {
                if (confirm('You\'ve gotten the latest update! You are now running PowerDeleteSuite v' + pd.version + '. Would you like to open the changelog in a new tab?')) {
                    xhr('/r/PowerDeleteSuite/new.json', function (response) {
                        var data = JSON.parse(response.responseText);
                        window.open('http://reddit.com' + data.data.children[0].data.permalink);
                    }, function () {
                        window.open('http://reddit.com/r/PowerDeleteSuite');
                    });
                }
            }
            return true;
        }
        return pd.debugging || (checkBookmarkletVersion() && checkAppVersion());
    }
};

app.init();
