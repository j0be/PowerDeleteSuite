window.pq = function (str) {
    return document.querySelectorAll(str);
};
window.alpha = true;
window._pd = {
    bookmarkver: '1.3',
    domain: document.location.hostname.split('.').slice(-2).join('.'),
    baseUrl: 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + (alpha ? 'alpha/' : 'master/'),
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
            };
        };
    };
    return this_xhr;
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
            app.setup.css(); /* Waterfall loads the dom as well */
        }
    },
    setup: {
        dom: function () {
            xhr(baseUrl+'app.html', function (response) {
                pq('body>.content[role=\'main\']')[0].innerHTML = response.responseText;              
            }, alert.bind('Failed to get PowerDeleteSuite markup'));
        },
        css: function () {
            xhr(baseUrl + 'app.css', function (response) {
                pq('head')[0].innerHTML += response.responseText;
                app.setup.dom();
            }, alert.bind('Failed to get PowerDeleteSuite css'));
        }
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
