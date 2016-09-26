var pdApp;
pdApp = {
  init: function () {
    document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
    console.log('init');
    if (window.pd_processing !== true) {
      if (document.location.href.match('/user/') && $('.titlebox h1').first().text() === $('#header-bottom-right .user a').first().text()) {
        pdApp.config = {
          uh : $('#config').innerHTML ?
            $('#config').innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,'') :
            $('#config')[0].innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,''),
          user : $('#header-bottom-right .user a').first().text()
        };
        pdApp.prepDom();
        pdApp.bindUI();
        pdApp.parseSettings();
      } else {
        if (confirm('This script is designed to be run from your own user profile. Would you like to navigate there?')) {
          document.location = 'http://reddit.com/u/'+ $('#header-bottom-right .user a').first().text();
        }
      }
    }
  },
  prepDom: function () {
    $('.sitetable,.neverEndingReddit').remove();
    $('#pd__central,#pd__style').html(''); /*Debugging*/
    if ($('#pd__central').length === 0) {
      $('body>.content[role=\'main\']').append('<div id=\'pd__central\' />');
    }
    if ($('#pd__style').length === 0) {
      $('head').first().append('<style id=\'pd__style\' />');
    }
    pdApp.prepStyles();
    pdApp.prepCentral();

    $('#pd__central').wrapInner('<form id=\'pd__form\' />');
  },
  prepStyles: function () {
    $.ajax({
      url: 'https://www.reddit.com/r/PowerDeleteSuite/about/stylesheet/.json',
      context: $('#pd__style')
    }).then(function(data) {
      $(this)[0].innerHTML = data.stylesheet;
    }, function() {
      alert('Error retreiving CSS from /r/PowerDeleteSuite');
    });
  },
  prepCentral: function () {
    var c = $('#pd__central');
    c.append('<h2>Power Delete Suite</h2>');
    c.append('<p>Please review all options before pressing \'Process\'. This process is <b>NOT</b> reversible.</p>');
    c.append('<hr/>');

    c.append('<h3>Actions to perform</h3>');
    c.append('<div><input checked type=\'checkbox\' id=\'pd__submissions\' name=\'pd__submissions\'><label for=\'pd__submissions\'>Remove submissions</label></div>');
    c.append('<div><input checked type=\'checkbox\' id=\'pd__comments\' name=\'pd__comments\'><label for=\'pd__comments\'>Remove comments</label></div>');
    c.append('<div><input class=\'xt xtr\' type=\'checkbox\' id=\'pd__comments-edit\' name=\'pd__comments-edit\'><label for=\'pd__comments-edit\'>Edit comments / self posts</label><div id=\'edit-form\' class=\'xt\'><textarea placeholder=\'Enter text to edit comments or self posts to.\' id=\'pd__comments-edit-text\' name=\'pd__comments-edit-text\'></'+'textarea></div></div>');
    c.append('<hr/>');

    c.append('<h3>Filters</h3>');
    c.append('<div><input class=\'xt xtr\' type=\'checkbox\' id=\'pd__subreddits\' name=\'pd__subreddits\'><label for=\'pd__subreddits\'>Filter by subreddits</label><div id=\'pd__sub-list\' class=\'xt\'><b>Actions will be performed on any subreddit that is checked.</b></div></div>');
    c.append('<div><input checked type=\'checkbox\' id=\'pd__gilded\' name=\'pd__gilded\'><label for=\'pd__gilded\'>Do not process gilded</label></div>');
    c.append('<div><input checked type=\'checkbox\' id=\'pd__saved\' name=\'pd__saved\'><label for=\'pd__saved\'>Do not process saved</label></div>');
    if ($('#side-mod-list').length > 0) {
      c.append('<div><input checked type=\'checkbox\' id=\'pd__mod\' name=\'pd__mod\'><label for=\'pd__mod\'>Do not process mod distinguished</label></div>');
    }
    c.append('<hr/>');

    c.append('<div><button>Process</button><input checked type=\'checkbox\' id=\'pd__remember\' name=\'pd__remember\' class=\'ind\'><label for=\'pd__remember\' data-help=\'This will store data on your local computer. It will NOT transmit any of this data.\'>Remember Settings<a class=\'pd__q\'>?</a></label></div>');
    pdApp.prepSubs();
  },
  prepSubs: function () {
    var sub_arr = [], i, sid;
    $('#per-sr-karma tbody th').each(function () {
      sub_arr.push($(this).text());
    });
    sub_arr = sub_arr.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    for (i=0;i<sub_arr.length;i++) {
      sid = 'sub--'+sub_arr[i];
      $('#pd__sub-list').append('<div><input class=\'ind\' type=\'checkbox\' name=\''+sid+'\' id=\''+sid+'\'\'/><label class=\''+sid+'\' for=\''+sid+'\'>'+sub_arr[i]+'</label></div>');
    }
    $('#side-mod-list li').each(function() {
      $('.sub--'+$(this).text().replace('/r/','')).prepend('<b class=\'m\'>[M]</b>');
    });

    if (! localStorage.getItem('pd_storage')) {
      $('#pd__sub-list input').prop('checked',true);
    }
  },
  bindUI: function() {
    $('.pd__q').click(function(e) {e.preventDefault(); alert($(this).closest('[data-help]').attr('data-help'));});
    $('#pd__form').submit(function(e) {
      e.preventDefault();
      pdApp.saveSettings();
      pdApp.process.init();
    });
  },
  parseSettings: function () {
    if (localStorage.getItem('pd_storage')) {
      var i, temp_arr = JSON.parse(localStorage.getItem('pd_storage'));
      $('#pd__form input').prop('checked',false).val('');
      for (i=0;i<temp_arr.length;i++) {
        if (temp_arr[i]['value'] == 'on' || temp_arr[i]['value'] === '') {
          $('*[name=\''+temp_arr[i]['name']+'\']').prop('checked',true);
        } else {
          $('*[name=\''+temp_arr[i]['name']+'\']').val(temp_arr[i]['value']);
        }
      }
      if ($('#pd__sub-list input:checked').length === 0) {
        $('#pd__sub-list input:checked').prop('checked',true);
      }
    }
  },
  saveSettings: function () {
    if ($('#pd__remember').is(':checked')) {
      if (! $('#pd__subreddits').is(':checked')) {
        $('#pd__sub-list input').prop('checked',false);
      }
      localStorage.setItem('pd_storage',JSON.stringify($('#pd__form').serializeArray()));
    } else {
      localStorage.removeItem('pd_storage');
    }
  },
  process: {
    init: function () {
      window.pd_processing = true;
      var temp_settings = $('#pd__form').serializeArray(),
          settings_obj = {},
          i;
      settings_obj.subfilters = [];
      for (i=0; i<temp_settings.length; i++) {
        if (temp_settings[i]['name'].match('sub--')) {
          settings_obj.subfilters.push(temp_settings[i]['name'].replace('sub--',''));
        } else if (temp_settings[i]['name'] == 'pd__comments-edit-text') {
          settings_obj[temp_settings[i]['name'].replace('pd__','')] = temp_settings[i]['value'];
        } else {
          settings_obj[temp_settings[i]['name'].replace('pd__','')] = true;
        }
      }
      pdApp.config.settings = settings_obj;
      pdApp.processInfo = {
        num_pages : 0,
        comment_pages: 0,
        submission_pages: 0,
        done_pages: 0,
        done_individual: 0,
        num_individual: 0,
        after: false,
        ajax_calls: 0,
        pageSize: 0,

        prev_submit_ignored: -1,
        prev_comment_ignored: -1,
        this_submit_ignored: 0,
        this_comment_ignored: 0
      };

      if (settings_obj['submissions'] || settings_obj['comments-edit']) {
        pdApp.processInfo.num_pages += 2;
        pdApp.processInfo.submission_pages += 2;
      }
      if (settings_obj['comments'] || settings_obj['comments-edit']) {
        pdApp.processInfo.num_pages ++;
        pdApp.processInfo.comment_pages ++;
      }

      if (pdApp.processInfo.num_pages > 0) {
        $('#pd__central').html('');
        $('#pd__central').append('<h2>Power Delete Suite</h2>');
        $('#pd__central').append('<span class=\'label\'>Page Progress</span>');
        $('#pd__central').append('<div id=\'progress_page\' class=\'progress\'><span class=\'bar\'></span><span class=\'text\'></span></div>');
        $('#pd__central').append('<span class=\'label\'>Page Item Progress</span>');
        $('#pd__central').append('<div id=\'progress_item\' class=\'progress\'><span class=\'bar\'></span><span class=\'text\'></span></div>');
      }

      if (pdApp.processInfo.submission_pages > 0) {
        pdApp.process.submissions.init();
      } else if (pdApp.processInfo.comment_pages > 0) {
        pdApp.process.comments.init();
      } else {
        alert('Well, there\'s nothing to do, so I guess we\'re done? Try enabling one of the actions next time!');
      }
    },
    updateDisplay: function () {
      if (pdApp.processInfo.num_pages<=pdApp.processInfo.done_pages) {
        pdApp.processInfo.num_pages = pdApp.processInfo.done_pages + 1;
      }
      $('#progress_page .bar').css('width',(Math.round(1000*pdApp.processInfo.done_pages/pdApp.processInfo.num_pages)/10)+'%');
      $('#progress_page .text').text(pdApp.processInfo.done_pages + ' / ' + pdApp.processInfo.num_pages);
      if (pdApp.processInfo.num_individual > 0) {
        $('#progress_item .bar').css('width',(Math.round(1000*pdApp.processInfo.done_individual/pdApp.processInfo.num_individual)/10)+'%');
        $('#progress_item .text').text(pdApp.processInfo.done_individual + ' / ' + pdApp.processInfo.num_individual);
      }

      var main_percent = pdApp.processInfo.done_pages/pdApp.processInfo.num_pages,
          main_diff = (pdApp.processInfo.done_pages+1)/pdApp.processInfo.num_pages - main_percent,
          sub_percent = pdApp.processInfo.num_individual > 0 ? main_diff*(pdApp.processInfo.done_individual/(pdApp.processInfo.num_individual+1)) : 0;

      main_percent += sub_percent;
      document.title = pdApp.config.user + ' | ' + pdApp.processInfo.ajax_calls;
    },
    submissions: {
      init: function () {
        console.log(pdApp.processInfo.prev_submit_ignored,pdApp.processInfo.this_submit_ignored);
        if (pdApp.processInfo.prev_submit_ignored !== pdApp.processInfo.this_submit_ignored) {
          pdApp.processInfo.prev_submit_ignored = pdApp.processInfo.this_submit_ignored;
          pdApp.processInfo.this_submit_ignored = 0;
          pdApp.processInfo.submitPage = true;
          pdApp.processInfo.searchPage = true;
          pdApp.process.submissions.checkSubmitted();
        } else {
          pdApp.process.comments.init();
        }
      },
      checkSubmitted: function () {
        pdApp.process.updateDisplay();
        pdApp.processInfo.ajax_calls ++;
        $.ajax({
          url: 'https://www.reddit.com/user/'+pdApp.config.user+'/submitted/.json'+(pdApp.processInfo.after ? '?after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.submitPage = false;
            pdApp.process.submissions.checkSearch();
          }
        }, function(resp) {
          console.error(resp);
        });
      },
      checkSearch: function () {
        pdApp.process.updateDisplay();
        pdApp.processInfo.ajax_calls ++;
        $.ajax({
          url: 'https://www.reddit.com/search.json?q=author%3A'+pdApp.config.user+(pdApp.processInfo.after ? '&after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.searchPage = false;
            pdApp.process.comments.init();
          }
        }, function(resp) {
          console.error(resp);
        });
      }
    },
    comments: {
      init: function () {
        if (pdApp.config.settings['comments-edit'] || pdApp.config.settings['comments']) {
          if (pdApp.processInfo.prev_comment_ignored !== pdApp.processInfo.this_comment_ignored) {
            pdApp.processInfo.prev_comment_ignored = pdApp.processInfo.this_comment_ignored;
            pdApp.processInfo.this_comment_ignored = 0;
            pdApp.processInfo.commentPage = true;
            pdApp.process.comments.checkComments();
          } else {
            pdApp.done();
          }
        } else {
          pdApp.done();
        }
      },
      checkComments: function () {
        pdApp.process.updateDisplay();
        pdApp.processInfo.ajax_calls ++;
        $.ajax({
          url: 'https://www.reddit.com/user/'+pdApp.config.user+'/comments/.json'+(pdApp.processInfo.after ? '?after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.commentPage = false;
            pdApp.done();
          }
        }, function(resp) {
          console.error(resp);
        });
      }
    },
    handle: {
      items: function (data) {
        pdApp.process.updateDisplay();
        pdApp.processInfo.done_individual = 0;
        pdApp.processInfo.num_individual = data.length;
        pdApp.processInfo.pageSize = data.length;
        window.currentItems = data;
        pdApp.process.handle.item(window.currentItems[0], false);
      },
      next: function (item,edited,callIgnored) {
        pdApp.processInfo.done_individual ++;
        window.currentItems.shift();
        pdApp.process.handle.item(window.currentItems[0], edited);
        if (callIgnored) {
          pdApp.process.handle.updateIgnored(item);
        }
      },
      updateIgnored: function (item) {
        if (item.kind === 't1') {
          pdApp.processInfo.this_comment_ignored ++;
        } else {
          pdApp.processInfo.this_submit_ignored ++;
        }
        pdApp.processInfo.after = item.data.name;
      },
      item : function (item,edited) {
        if (item) {
          pdApp.process.updateDisplay();
          var settings = pdApp.config.settings;
          window.settings = settings;
          if (!settings.subreddits || (settings.subfilters.indexOf(item.data.subreddit) >= 0)) {
            if (!settings.gilded || item.data.gilded === 0) {
              if (!settings.saved || item.data.saved === false) {
                if (!settings.mod || !item.data.distinguished) {
                  if ((edited === false && settings['comments-edit']) &&
                      (item.kind === 't1' || item.data.is_self)) {
                    pdApp.processInfo.ajax_calls ++;
                    window.firstDone = false;
                    $.ajax({
                      url: 'https://www.reddit.com/api/editusertext',
                      method: 'post',
                      data: {
                        thing_id: item.data.name,
                        text: settings['comments-edit-text'],
                        id: '#form-'+item.data.name,
                        r: item.data.subreddit,
                        uh: pdApp.config.uh,
                        renderstyle: 'html'
                      }
                    }).then(function() {
                      if (settings['comments'] || settings['submissions']) {
                        pdApp.process.handle.next(item,true,false);
                      } else {
                        pdApp.process.handle.next(item,false,false);
                      }
                    }, function (resp) {
                      console.error(resp);
                    });
                  } else if (settings['comments'] || settings['submissions']) {
                    pdApp.processInfo.ajax_calls ++;
                    window.firstDone = false;
                    $.ajax({
                      url: 'https://www.reddit.com/api/del',
                      method: 'post',
                      data: {
                        id: item.data.name,
                        executed: 'deleted',
                        uh: pdApp.config.uh,
                        renderstyle: 'html'
                      }
                    }).then(function() {
                      pdApp.process.handle.next(item,false,false);
                    }, function (resp) {
                      console.error(resp);
                    });
                  } else {
                    pdApp.process.handle.next(item,false,true);
                  }
                } else {
                  pdApp.process.handle.next(item,false,true);
                }
              } else {
                pdApp.process.handle.next(item,false,true);
              }
            } else {
              pdApp.process.handle.next(item,false,true);
            }
          } else {
            pdApp.process.handle.next(item,false,true);
          }
        } else {
          pdApp.process.updateDisplay();
          if (pdApp.processInfo.submitPage) {
            if (pdApp.processInfo.this_submit_ignored === 0 && pdApp.processInfo.pageSize > 0) {
              pdApp.processInfo.after = false;
            }
            pdApp.process.submissions.checkSubmitted();
          } else if (pdApp.processInfo.searchPage) {
            if (pdApp.processInfo.this_submit_ignored === 0 && pdApp.processInfo.pageSize > 0) {
              pdApp.processInfo.after = false;
            }
            pdApp.process.submissions.checkSearch();
          } else if (pdApp.processInfo.commentPage) {
            if (pdApp.processInfo.this_comment_ignored === 0 && pdApp.processInfo.pageSize > 0) {
              pdApp.processInfo.after = false;
            }
            pdApp.process.comments.checkComments();
          } else {
            pdApp.done();
          }
        }
      }
    }
  },
  done: function () {
    if (pdApp.processInfo.prev_submit_ignored !== pdApp.processInfo.this_submit_ignored ||
        pdApp.processInfo.prev_comment_ignored !== pdApp.processInfo.this_comment_ignored) {
      if (pdApp.processInfo.submission_pages > 0) {
        pdApp.process.submissions.init();
      } else if (pdApp.processInfo.comment_pages > 0) {
        pdApp.process.comments.init();
      }
    } else {
      window.pd_processing = false;
      $('#pd__central').html('');
      $('#pd__central').append('<h2>Power Delete Suite</h2>');
      $('#pd__central').append('<p>Completed after making '+pdApp.processInfo.ajax_calls+' calls to the reddit servers.</p>');
      $('#pd__central').append('<p>If you need to re run the script, just click the bookmarklet again!</p>');
      document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
    }
  }
};
pdApp.init();
