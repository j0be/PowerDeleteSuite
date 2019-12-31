var pds = {
    init: function () {
        var items = ['app.css', 'ui.js', 'stream.js'];
        items.forEach(function(item) {
            pds.getter(item);
        });
    },
    getter: function (itemName) {
        var baseUrl = 'http://127.0.0.1:8000/';
        fetch(baseUrl + itemName).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.text();
        }).then(function(data) {
            var type = itemName.split('.').slice(-1);
            var mapper = {
                'js': 'script',
                'css': 'style'
            };
            var item = document.createElement(mapper[type]);
            item.innerHTML = data;
            document.getElementsByTagName('head')[0].appendChild(item);
        }).catch(function() {
            alert('Error retreiving PowerDeleteSuite ' + itemName + ' from github');
        });
    }
};
pds.init();