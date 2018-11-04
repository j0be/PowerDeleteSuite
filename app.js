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
            app.setup()
                .then(app.populateSubreddits)
                .then(app.listen)
                .then(app.settings.apply);
        }
    },
    setup: function () {
        function dom() {
            return xhr(_pd.baseUrl+'app.html?v' + Math.round(Math.random() * 100)).then(function (response) {
                pq('body>.content[role=\'main\']')[0].innerHTML = response.responseText;
                pq('.pd')[0].classList.add('animate');
                setTimeout(function () {  console.log('add animate'); }, 500);
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite markup'));
        }
        function css() {
            return xhr(_pd.baseUrl + 'app.css?v' + Math.round(Math.random() * 100)).then(function (response) {
                pq('head')[0].innerHTML += '<style>' + response.responseText + '</style>';
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite css'))
            .then(dom);
        }
        return css();
    },
    listen: function () {
        pq('.pd__actions-tooltip').forEach(function (element) {
            element.addEventListener("click", function (event) { event.stopPropagation(); });
        });
        pq('.pd__filter--sidebar a[for]').forEach(function (element) {
            element.addEventListener("click", function (event) { event.stopPropagation(); app.filter.sidebar(event); });
        });
        pq('.pd form input, .pd form textarea').forEach(function (element) {
            element.addEventListener("change", function () { app.settings.store(); });
        });
    },
    filter: {
        sidebar: function (event) {
            pq('.pd__filter--sidebar a[for]').forEach(function (element) { element.classList.remove('active'); });
            event.currentTarget.classList.add('active');

            pq('.pd__filter--option').forEach(function (element) { element.classList.remove('active'); });
            pq('#' + event.currentTarget.getAttribute('for'))[0].classList.add('active');
        }
    },
    populateSubreddits: function () {
        var subreddits = Array.from(pq('#per-sr-karma tbody th')).map(function (element) { return element.textContent.toLowerCase(); }).sort(),
            template = pq('.pd .subreddits .template')[0].outerHTML.replace('class="template"','');

        subreddits.forEach(function (subreddit) {
            var element = document.createElement('div');
            element.innerHTML = template;
            element.childNodes[0].innerHTML += subreddit;
            element.childNodes[0].childNodes[0].value = subreddit;
            element.childNodes[0].childNodes[0].id = 'subreddit-' + subreddit;
            pq('.pd .subreddits')[0].appendChild(element);
        });
    },
    settings: {
        store: function () {
            var settings = [];
            pq('.pd form input, .pd form textarea').forEach(function (element) {
                var value = element.getAttribute('type') === 'checkbox' ? element.checked : element.value;
                settings.push([element.id, value]);
            });
            localStorage.setItem('pd_settings', JSON.stringify(settings));
            console.log('store');
        },
        apply: function () {
            var settings = localStorage.getItem('pd_settings') ? JSON.parse(localStorage.getItem('pd_settings')) : false;
            if (settings) {
                settings.forEach(function(setting) {
                    var element = setting[0] && pq('#' + setting[0].replace(/[, ]/g, ''))[0],
                        attribute = element && element.getAttribute('type') === 'checkbox' ? 'checked' : 'value';
                    if (element) {
                        element[attribute] = setting[1];
                    }
                });
            }
            console.log('apply');
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
