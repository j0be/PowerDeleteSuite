var bootloader = {
    init: function () {
        var items = ['ui.js', 'stream.js'];
        items.forEach(function(item) {
            pdsUtil.getter(item);
        });
    }
};

window.pdsUtil = {
    versions: {
        app: '2.0.0',
        bookmark: '2.0'
    },
    getter: function(itemName, target, cb) {
        target = target || document.getElementsByTagName('head')[0];
        fetch(baseUrl + itemName).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.text();
        }).then(function(data) {
            var type = itemName.split('.').slice(-1);
            var mapper = {
                'js': 'script',
                'css': 'style',
                'html': 'div'
            };
            var item = document.createElement(mapper[type]);
            item.id = itemName.split('.').join('');
            item.innerHTML = data;

            if (document.getElementById(item.id)) {
                document.getElementById(item.id).remove();
            }

            target.appendChild(item);
            cb && cb();
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite ' + itemName + ' from ' + (debugging ? 'local' : 'github'));
        });
    }
};

bootloader.init();