Object.assign(window.pds, {
    version: '2.0.0',
    app: {
        loadResources: function() {
            return new Promise(function(resolve, reject) {
                return Promise.all([
                    pds.fetch(`${baseUrl}dist/style.css?${new Date().getDate()}`).then(pds.resource.bind({}, 'style', 'pdsstyles')),
                    pds.fetch(`https://fonts.googleapis.com/icon?family=Material+Icons`).then(pds.resource.bind({}, 'style', 'materialicons')),
                    pds.fetch(`${baseUrl}dist/app.html?${new Date().getDate()}`).then(pds.app.handleTemplate)
                ]).then(resolve).catch(function() {
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
            let isDarkTheme = Math.max(...themeColor) < 128;
            document.querySelector('#pds').classList.add(isDarkTheme ? 'dark' : 'light');
            document.querySelector('#pds').classList.add(isNewReddit ? 'new' : 'old');
        }
    }
});

pds.app.loadResources();