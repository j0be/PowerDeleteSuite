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
    user: pq && pq('.user a').length && pq('.user a')[0].textContent || 'noauth',
    debugging: true
},
stream = {};

var app = {
    init: function () {
        if (validation.versions()) {
            app.determineUsage();
        }
    },
    setup: function () {
        function dom() {
            return xhr(_pd.baseUrl+'app.html?v' + Math.round(Math.random() * 100)).then(function (response) {
                pq('body>.content[role=\'main\']')[0].innerHTML = response.responseText;
                if (pd.sameUser && pq('.pd__form').length) {
                    pq('.pd__form')[0].classList.add('same_user');
                }
                setTimeout(function () {  pq('.pd')[0].classList.add('animate'); }, 500);
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite markup'));
        }
        function css() {
            return xhr(_pd.baseUrl + 'app.css?v' + Math.round(Math.random() * 100)).then(function (response) {
                var pd = document.createElement('style');
                pd.setAttribute('id', 'pd-style');
                pd.innerHTML = response.responseText;
                pq('head')[0].appendChild(pd);
            }).catch(alert.bind(undefined, 'Failed to get PowerDeleteSuite css')).then(dom);
        }
        return css();
    },
    determineUsage: function () {
        if (validation.page.profile()) {
            app.setup()
                .then(app.populateSubreddits)
                .then(app.listen)
                .then(app.settings.apply);
        } else if (validation.page.comments()) {
            //TODO: prompt for comment removal
            alert('Comment removal stuff to come');
        } else if (confirm('There\'s no functions to run on this page. Would you like to navigate to your profile?')) {
            document.location.href = '/user/me';
        }
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
            element.childNodes[0].childNodes[0].checked = true;
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
            localStorage.setItem('pd_settings_' + pd.user, JSON.stringify(settings));
        },
        apply: function () {
            var settings = localStorage.getItem('pd_settings_' + pd.user) ? JSON.parse(localStorage.getItem('pd_settings_' + pd.user)) : false;
            if (settings) {
                settings.forEach(function(setting) {
                    var element = setting[0] && pq('#' + setting[0].replace(/[, ]/g, ''))[0],
                        attribute = element && element.getAttribute('type') === 'checkbox' ? 'checked' : 'value';
                    if (element) {
                        element[attribute] = setting[1];
                    }
                });
            }
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
    },
    page: {
        profile: function () {
            var isUserPage = !!document.location.href.match(/\/user\//);
            if(isUserPage) {
                pd.sameUser = document.location.pathname.split('/')[2] === pd.user;
            }
            return isUserPage;
        },
        comments: function () {
            return !!document.location.href.match(/\/comments\//);
        }
    }
};

app.init();
