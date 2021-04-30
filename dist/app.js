Object.assign(window.pds, {
    version: '2.0.0',
    app: {
        loadResources: function() {
            return new Promise(function(resolve, reject) {
                return Promise.all([
                    pds.fetch(`${pds.baseUrl}dist/style.css?${new Date().getDate()}`).then(pds.resource.bind({}, 'style', 'pdsstyles')),
                    pds.fetch(`https://fonts.googleapis.com/icon?family=Material+Icons`).then(pds.resource.bind({}, 'style', 'materialicons')),
                    pds.fetch(`${pds.baseUrl}dist/app.html?${new Date().getDate()}`).then(pds.app.handleTemplate)
                ])
                .then(Promise.all([
                    pds.fetch(`${pds.baseUrl}dist/stream.js?${new Date().getDate()}`).then(pds.resource.bind({}, 'script', 'pdsstream')),
                    pds.fetch(`${pds.baseUrl}dist/filters/main.js?${new Date().getDate()}`).then(pds.resource.bind({}, 'script', 'pdsfilters'))
                ]))
                .then(pds.app.listeners.attach)
                .then(resolve).catch(function() {
                    alert('ERROR');
                    reject();
                });
            });
        },
        handleTemplate: function(data) {
            let isNewReddit = !document.querySelector('#siteTable');

            let entryPoint;
            if (document.querySelector('#pds')) {
                entryPoint = document.querySelector('#pds').parentNode;
            } else {
                entryPoint = isNewReddit ?
                    document.querySelector('div[tabindex="0"]').parentNode :
                    document.querySelector('#siteTable');
            }

            entryPoint.innerHTML = data;
            document.querySelector('#appver').innerHTML = pds.version;
            document.querySelector('#bookmarkver').innerHTML = pds.bookmarkversion;

            let themeElement = isNewReddit ?
                document.querySelector('body>div>div') :
                document.querySelector('body');
            let themeColor = getComputedStyle(themeElement)
                .getPropertyValue('background-color')
                .match(/[\d, ]+/)[0]
                .split(/[, ]+/);
            let isDarkTheme = Math.max(...themeColor) < 100;
            document.querySelector('#pds').classList.add(isDarkTheme ? 'dark' : 'light');
            document.querySelector('#pds').classList.add(isNewReddit ? 'new' : 'old');
            pds.app.isDarkTheme = isDarkTheme;

            if (isNewReddit) {
                entryPoint.style.width = '100vw';
            }
        },
        listeners: {
            attach: function() {
                let el = document.querySelector('#pds');
                el.addEventListener('click', pds.app.listeners.toggle);
            },
            toggle: function(event) {
                if (event.target.hasAttribute('data-visible')) {
                    //Label event happens first, so invert
                    let action = !event.target.querySelector('input').checked ?
                        'remove' : 'add';
                    document.querySelector(`#${event.target.getAttribute('data-visible')}`).classList[action]('hide');
                }
            }
        }
    }
});

pds.app.loadResources();