var pdsUI = {
    init: function() {
        pdsUI.loadUI();
    },
    loadUI: function() {
        var items = {
            'app.css': { target: document.getElementsByTagName('head')[0] },
            'app.html': {
                target: document.getElementById('siteTable') ||
                    document.querySelectorAll('.ListingLayout-outerContainer div[tabindex="0"]').length && document.querySelectorAll('.ListingLayout-outerContainer div[tabindex="0"]')[0].parentNode ||
                    document.getElementById('powerdeletesuite').parentNode.parentNode,
                callback: pdsUI.handleLayout
            }
        };
        // Reset the layout markup
        items['app.html'].target.innerHTML = '';

        Object.keys(items).forEach(function(itemKey) {
            pdsUtil.getter(itemKey, items[itemKey].target, items[itemKey].callback);
        });
    },
    handleLayout: function () {
        document.getElementById('pds_ver').innerHTML = 'v' + pdsUtil.versions.app;
    }
};
pdsUI.init();