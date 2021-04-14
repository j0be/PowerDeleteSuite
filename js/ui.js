var pdsUI = {
    init: function() {
        pdsUI.loadUI();
    },
    loadUI: function() {
        var items = {
            'css/app.css': { target: document.getElementsByTagName('head')[0] },
            'html/app.html': {
                target: pdsUI.getTarget(),
                callback: pdsUI.handleLayout
            }
        };

        // Reset the layout markup
        items['html/app.html'].target.innerHTML = '';

        Object.keys(items).forEach(function(itemKey) {
            if (items[itemKey].target) {
                pdsUtil.getter(itemKey, items[itemKey].target, items[itemKey].callback);
            }
        });
    },
    handleLayout: function (data) {
        document.querySelector('#powerdeletesuite').innerHTML = data;
    },
    getTarget: function () {
        //Only check what's on the page if you're using old reddit
        if (window.r && !document.location.href.match(/\/user\//i)) {
            if (document.querySelectorAll(`.entry a.author[href*="${window.pdsUtil.config.name}"]`).length) {
                var wrap = document.createElement('div');
                wrap.id = 'pdswrapper';
                document.getElementById('siteTable').prepend(wrap);
                return document.getElementById('pdswrapper');
            } else if (confirm('There is nothing I can do on this page, would you like to navigate to your user page?')) {
                document.location.href = '/u/me/';
            }
            return false;
        }

        return document.getElementById('siteTable') ||
            document.querySelectorAll('.ListingLayout-outerContainer div[tabindex="0"]').length && document.querySelectorAll('.ListingLayout-outerContainer div[tabindex="0"]')[0].parentNode ||
            document.getElementById('powerdeletesuite').parentNode.parentNode;
    }
};

pdsUI.init();