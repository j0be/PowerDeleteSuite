window.pds.stream = window.pds.stream || {
    username: null,
    baseUrl: {
        search: '/search.json?include_over_18=on&t=all&q=author%3A',
        default: '/user/me'
    },
    subreddits: {},
    items: {
        submissions: [],
        comments: []
    },
    pages: {
        count: 0,
        index: 0
    },
    types: ['overview', 'comments', 'submitted', 'search'],
    sorts: ['new', 'hot', 'top', 'controversial']
};

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

        pds.stream.done = false;
        return stream.loadType({
            types: pds.stream.types.slice(0),
            sorts: pds.stream.sorts.slice(0)
        }).then(function() {
            console.log('DONE!');
            pds.stream.done = true;
        });
    },
    loadType: function loadType(streamObj) {
        return new Promise(function(resolve, reject) {
            stream.loadPages(streamObj).then(function() {
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

        let base = pds.stream.baseUrl[type] ?
            `${pds.stream.baseUrl[type]}${pds.stream.username}`:
            `${pds.stream.baseUrl.default}/${type}.json?`;

        pds.fetch(`${base}&sort=${sort}${after ? `&after=${after}`: ''}`).then(function(data) {
            pds.stream.pages.count += data.data.after ? 1 : 0;
            pds.stream.pages.index ++;
            stream.progress.update.pages();

            //A bit ugly, I know
            if (!pds.stream.username) {
                pds.stream.username = data.data.children[0].data.author;
                pds.stream.baseUrl.default = pds.stream.baseUrl.default.replace('/me', `/${pds.stream.username}`)
            }

            if (data.data.after) {
                stream.process.items(data.data.children);
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
                    let bar = el.children[0];
                    bar.classList.remove('indeterminate');
                    bar.classList.add('determinate');
                    bar.setAttribute('style', `width: ${100 * pds.stream.pages.index / pds.stream.pages.count}%`);

                    console.log('Loading pages: ', 100 * pds.stream.pages.index / pds.stream.pages.count);

                    let label = el.parentNode.querySelector('label');
                    if (label) {
                        label.textContent = `${label.getAttribute('data-prefix')}${pds.stream.pages.index}/${pds.stream.pages.count}`;
                    }
                }
            }
        }
    },
    process: {
        mapper: {
            t1: 'comment',
            t3: 'submission'
        },
        map: function(item){
            let returnItem = {};
            Object.keys(item.data).filter(function(key) {
                return stream.itemKeys.includes(key);
            }).forEach(function(key) {
                returnItem[key] = item.data[key];
            });

            return returnItem;
        },
        items: function(items) {
            items.forEach(function(item) {
                stream.process.subreddit(item);

                let callback = stream.process.mapper[item.kind];
                if (callback) {
                    stream.process[callback](item);
                } else {
                    console.error(`I don't have a process mapper for ${item.kind} items`);
                }
            });
        },
        subreddit: function(item) {
            if (!pds.stream.hasOwnProperty(item.data.subreddit)) {
                pds.stream[item.data.subreddit] = {
                    banned: item.data.subreddit_type === 'restricted',
                    mod: item.data.can_mod_post,
                    public: item.data.subreddit_type === 'public'
                };
            }
        },
        submission: function(item) {
            pds.stream.items.submissions.push(stream.process.map(item));
        },
        comment: function(item) {
            pds.stream.items.comments.push(stream.process.map(item));
        }
    }
}

if (pds.stream.done !== false) {
    debugger;
    stream.init();
}