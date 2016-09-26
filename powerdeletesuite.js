var pdApp = {
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
        pdApp.setup.prepDom();
        pdApp.getSettings();
      } else {
        if (confirm('This script is designed to be run from your own user profile. Would you like to navigate there?')) {
          document.location = 'http://reddit.com/u/'+ $('#header-bottom-right .user a').first().text();
        }
      }
    }
  },
  setup: {
    prepDom: function () {
      $('.sitetable,.neverEndingReddit').remove();
      $('#pd__central,#pd__style').html(''); /*Debugging*/
      if ($('#pd__central').length === 0) {
        $('body>.content[role=\'main\']').append('<div id=\'pd__central\' />');
      }
      if ($('#pd__style').length === 0) {
        $('head').first().append('<style id=\'pd__style\' />');
      }
      pdApp.setup.prepStyles();
      pdApp.setup.prepCentral();
    },
    prepStyles: function () {
      $.ajax({
        url: 'https://www.reddit.com/r/PowerDeleteSuite/about/stylesheet/.json',
        context: $('#pd__style')
      }).then(function(data) {
        $(this)[0].innerHTML = data.data.stylesheet;
        $('#pd__central').show();
      }, function() {
        alert('Error retreiving CSS from /r/PowerDeleteSuite');
      });
    },
    prepCentral: function () {
      $.ajax({
        url: 'https://www.reddit.com/r/PowerDeleteSuite/wiki/centralform.json',
        context: $('#pd__central')
      }).then(function(data) {
        $(this).html($("<textarea/>").html(data.data.content_md).text());
        if ($('#pd__stlye').html() === '') {
          $(this).hide();
        }
        pdApp.setup.prepSubs();
        pdApp.setup.bindUI();
      }, function() {
        alert('Error retreiving markup from /r/PowerDeleteSuite');
      });
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
        pdApp.setup.process.init();
      });
    },
  },
  getSettings: function () {
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
        done_pages: 0,
        done_individual: 0,
        num_individual: 0,
        submission_pages: 0,
        comment_pages: 0,
        after: false
      };

      if (settings_obj['submissions'] || settings_obj['comments-edit']) {
        pdApp.processInfo.num_pages += 2;
        pdApp.processInfo.submission_pages += 2;
        pdApp.processInfo.checkSubmitted = true;
        pdApp.processInfo.checkSearch = true;
      }
      if (settings_obj['comments'] || settings_obj['comments-edit']) {
        pdApp.processInfo.num_pages ++;
        pdApp.processInfo.comment_pages ++;
        pdApp.processInfo.checkComments = true;
      }

      if (pdApp.processInfo.num_pages > 0) {
        $('#pd__central form').hide();
        $('#pd__central .processing').show();
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
        if (pdApp.processInfo.checkSubmitted !== false) {
          pdApp.process.submissions.checkSubmitted();
        } else {
          pdApp.process.submissions.checkSearch();
        }
      },
      checkSubmitted: function () {
        pdApp.process.updateDisplay();
        $.ajax({
          url: 'https://www.reddit.com/user/'+pdApp.config.user+'/submitted/.json'+(pdApp.processInfo.after ? '?after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.checkSubmitted = false;
            pdApp.process.submissions.checkSearch();
          }
        }, function(resp) {
          console.error(resp);
        });
      },
      checkSearch: function () {
        pdApp.process.updateDisplay();
        $.ajax({
          url: 'https://www.reddit.com/search.json?q=author%3A'+pdApp.config.user+(pdApp.processInfo.after ? '&after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.checkSearch = false;
            pdApp.process.comments.init();
          }
        }, function(resp) {
          console.error(resp);
        });
      }
    },
    comments: {
      init: function () {
        pdApp.process.comments.checkComments();
      },
      checkComments: function () {
        pdApp.process.updateDisplay();
        $.ajax({
          url: 'https://www.reddit.com/user/'+pdApp.config.user+'/comments/.json'+(pdApp.processInfo.after ? '?after='+pdApp.processInfo.after : '')
        }).then(function(resp) {
          pdApp.processInfo.done_pages ++;
          if (resp.data.children.length > 0) {
            pdApp.processInfo.num_pages ++;
            pdApp.process.handle.items(resp.data.children);
          } else {
            pdApp.processInfo.after = false;
            pdApp.processInfo.checkComments = false;
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
        pdApp.process.handle.item(data, false);
      },
      next: function (items,edited,ignored) {
        if (edited === false) {
          items = items.shift();
        }
        if (ignored) {
          pdApp.processInfo.after = items[0].data.name;
        }

        if (items.length > 0) {
          pdApp.process.handle.item(items,edited);
        } else {
          pdApp.process.updateDisplay();
          pdApp.processInfo.after = false;
          if (pdApp.processInfo.checkSubmitted !== false) {
            pdApp.process.submissions.checkSubmitted();
          } else if (pdApp.processInfo.checkSearch !== false) {
            pdApp.process.submissions.checkSearch();
          } else if (pdApp.processInfo.checkComments !== false) {
            pdApp.process.comments.checkComments();
          } else {
            pdApp.done();
          }
        }
      },
      item : function (items,edited) {
        pdApp.process.updateDisplay();
        var settings = pdApp.config.settings,
          item = items[0];

        if (!settings.subreddits || (settings.subfilters.indexOf(item.data.subreddit) >= 0)) {
          if (!settings.gilded || item.data.gilded === 0) {
            if (!settings.saved || item.data.saved === false) {
              if (!settings.mod || !item.data.distinguished) {
                if ((edited === false && settings['comments-edit']) && (item.kind === 't1' || item.data.is_self)) {
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
                      pdApp.process.handle.next(items,true,false);
                    } else {
                      pdApp.process.handle.next(items,false,false);
                    }
                  }, function (resp) {
                    console.error(resp);
                  });
                } else if (settings['comments'] || settings['submissions']) {
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
                    pdApp.process.handle.next(items,false,false);
                  }, function (resp) {
                    console.error(resp);
                  });
                } else {
                  pdApp.process.handle.next(items,false,true);
                }
              } else {
                pdApp.process.handle.next(items,false,true);
              }
            } else {
              pdApp.process.handle.next(items,false,true);
            }
          } else {
            pdApp.process.handle.next(items,false,true);
          }
        } else {
          pdApp.process.handle.next(items,false,true);
        }
      }
    }
  },
  done: function () {
    window.pd_processing = false;
    $('#pd__central .processing').html('');
    $('#pd__central .processing').append('<p>Completed after making a ton calls to the reddit servers.</p>');
    $('#pd__central .processing').append('<p>If you need to re run the script, just click the bookmarklet again!</p>');
    document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
  }
};
pdApp.init();
