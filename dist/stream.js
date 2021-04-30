Object.assign(window.pds, {
    stream: {
        done: false,
        pages: {
            count: 0,
            index: 0
        },
        types: ['overview', 'comments', 'submitted', 'search'],
        sorts: ['new', 'hot', 'top', 'controversial'],
        baseUrl: '/user/me',
    }
});

stream = {
    itemKeys: [
        'all_awardings',
        'body',
        'created',
        'distinguished',
        'is_original_content',
        'gilded',
        'hidden',
        'over_18',
        'saved',
        'score',
        'subreddit',
        'subreddit_type',
        'title',
        'upvote_ratio',
        'url'
    ],
    init: function init() {
        pds.stream.pages.count = pds.stream.types.length * pds.stream.sorts.length;
        stream.progress.update.pages();

        return stream.loadType({
            types: pds.stream.types.slice(0),
            sorts: pds.stream.sorts.slice(0)
        });
    },
    loadType: function loadType(streamObj) {
        return new Promise(function(resolve, reject) {
            stream.loadPages(streamObj).then(function() {
                debugger;
                if (streamObj.sorts.length > 1) {
                    streamObj.sorts.shift();
                    loadType(streamObj);
                } else if (streamObj.types.length > 1) {
                    streamObj.types.shift();
                    streamObj.sorts = pds.stream.sorts.slice(0);
                    loadType(streamObj);
                } else {
                    resolve();
                }
            });
        });
    },
    loadPages: function loadPages(streamObj) {
        return new Promise(function(resolve, reject) {
            stream.loadPage(resolve, streamObj.types[0], streamObj.sorts[0]);
        });
    },
    loadPage: function loadPage(resolver, type, sort, after) {
        stream.progress.update.pages();

        pds.fetch(`${pds.stream.baseUrl}/${type}.json?sort=${sort}${after ? `&after=${after}`: ''}`).then(function(data) {
            pds.stream.pages.count += data.data.after ? 1 : 0;
            pds.stream.pages.index ++;
            stream.progress.update.pages();

            if (data.data.after) {
                stream.loadPage(resolver, type, sort, data.data.after);
            } else {
                resolver();
            }
        });
    },
    progress: {
        update: {
            pages: function() {
                let el = document.querySelector('#stream-pages');
                if (el) {
                    el = el.children[0];
                    el.classList.remove('indeterminate');
                    el.classList.add('determinate');
                    el.setAttribute('style', `width: ${100 * pds.stream.pages.index / pds.stream.pages.count}%`);
                }
            }
        }
    }
}

stream.init();