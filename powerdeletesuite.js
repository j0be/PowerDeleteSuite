var pdApp = {
  version: '1.2.0',
  init : function() {
    /* version alerts */
    pdApp.prevRunVersion = localStorage.getItem('pd_ver') ? localStorage.getItem('pd_ver') : '0';
    localStorage.setItem('pd_ver',pdApp.version);
    if (pdApp.version !== pdApp.prevRunVersion) {
      if (confirm('You\'ve gotten the latest update! You are now running PowerDeleteSuite v'+pdApp.version+'. Would you like to open the changelog in a new tab?')) {
        window.open('https://www.reddit.com/r/PowerDeleteSuite/');
      }
    }

    if (window.pd_processing !== true) {
      document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
      console.log('init');
      if (document.location.href.match('/user/') && $('.titlebox h1').first().text() === $('#header-bottom-right .user a').first().text()) {
        pdApp.config = {
          uh : $('#config').innerHTML ?
            $('#config').innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,'') :
            $('#config')[0].innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,''),
          user : $('#header-bottom-right .user a').first().text()
        };
        pdApp.setup.prepDom();
      } else {
        if (confirm('This script is designed to be run from your own user profile. Would you like to navigate there?')) {
          document.location = 'http://reddit.com/u/me';
        }
      }
      setTimeout(pdApp.helpers.restoreSettings,500);
      return pdApp.version;
    } else {
      return 'PowerDeleteSuite is already running';
    }
  },
  setup: {
    prepDom: function () {
      $('.sitetable,.neverEndingReddit').remove();
      $('#pd__central,#pd__style').remove(''); /*Debugging*/
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
        $(this).find('h2').first().text('Power Delete Suite v'+pdApp.version);
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
      $('#pd__sub-list').append('<div><a class="ind mass_sel sel_all">Select All</a><a class="ind mass_sel sel_none">Select None</a></div>');
      for (i=0;i<sub_arr.length;i++) {
        sid = 'sub--'+sub_arr[i];
        $('#pd__sub-list').append('<div><input class=\'ind\' type=\'checkbox\' name=\''+sid+'\' id=\''+sid+'\'\'/><label class=\''+sid+'\' for=\''+sid+'\'>'+sub_arr[i]+'</label></div>');
      }
      $('#side-mod-list li').each(function() {
        $('.sub--'+$(this).text().replace('/r/','')).prepend('<b class=\'m\'>[M]</b>');
      });
    },
    prepStream: function () {
      window.pd_processing = true;

      pdApp.process = {
        after: '',

        numPages:
          ($('#pd__submissions').is(':checked') ? 2 : 0) +
          ($('#pd__comments').is(':checked') ? 3 : 0),
        numItems: 0,
        donePages: 0,
        doneItems: 0,

        pageCalls: 0,
        edited: 0,
        deleted: 0,
        ignored: 0,
        errors: 0,

        isRemovingPosts: $('#pd__submissions').is(':checked'),
        isRemovingComments: $('#pd__comments').is(':checked'),
        isEditing: $('#pd__comments-edit').is(':checked'),
        editText: $('#pd__comments-edit-text').val(),
        sectionsRemaining: $('#pd__submissions').is(':checked') ?
          ['comments','submissions','search'] :
          ['comments','search','submissions'], /* Search is actually more efficient than submissions if we're not handling submissions (`self:1`) */
        itemArr: []
      };
      pdApp.process.numPages = Math.min(pdApp.process.numPages,3);

      pdApp.endpoints = {
        'comments': 'https://www.reddit.com/user/'+pdApp.config.user+'/comments/.json',
        'submissions': 'https://www.reddit.com/user/'+pdApp.config.user+'/submitted/.json',
        'search': 'https://www.reddit.com/search.json',
      };

      pdApp.filters = {
        subs: $('#pd__subreddits').is(':checked'),
        gilded: $('#pd__gilded').is(':checked'),
        saved: $('#pd__saved').is(':checked'),
        mod: $('#pd__mod').is(':checked')
      };
      if (pdApp.filters.subs) {
        pdApp.filters.subList = [];
        $('#pd__sub-list input:checked').each(function() {
          pdApp.filters.subList.push($(this).next().text());
        });
      }
    },
    bindUI: function() {
      $('.pd__q').click(function(e) {e.preventDefault(); alert($(this).closest('[data-help]').attr('data-help'));});
      $('#pd__form').submit(function(e) {
        e.preventDefault();
        pdApp.setup.prepStream();
        pdApp.actions.getPage();
      });
      $('#pd__form input').change(function() {
        pdApp.helpers.saveSettings();
      });
      $('.mass_sel').click(function() {
        if ($(this).hasClass('sel_all')) {
          $('#pd__sub-list input').prop('checked',true);
        } else {
          $('#pd__sub-list input').prop('checked',false);
        }
        pdApp.helpers.saveSettings();
      });
    },
  },
  helpers: {
    filterCheck: function (item) {
      /* return true to perform actions on it */
      function checkSubs()  {return !(pdApp.filters.subs && pdApp.filters.subList.indexOf(item.data.subreddit) >= 0);}
      function checkGold()  {return !(pdApp.filters.gilded && item.data.gilded == 1);}
      function checkSaved() {return !(pdApp.filters.saved && item.data.saved == true);}
      function checkMod()   {return !(pdApp.filters.mod && item.data.distinguished == true);}
      return checkSubs() && checkGold() && checkSaved() && checkMod();
    },
    getSettings: function() {
      return localStorage.getItem('pd_storage') ? JSON.parse(localStorage.getItem('pd_storage')) : false;
    },
    restoreSettings: function () {
      var i, temp_arr = pdApp.helpers.getSettings();
      if (temp_arr !== false) {
        $('#pd__form input').prop('checked',false).val('');
        for (i=0;i<temp_arr.length;i++) {
          if (temp_arr[i]['value'] == 'on' || temp_arr[i]['value'] === '') {
            $('*[name=\''+temp_arr[i]['name']+'\']').prop('checked',true);
          } else {
            $('*[name=\''+temp_arr[i]['name']+'\']').val(temp_arr[i]['value']);
          }
        }
        if ($('#pd__subreddits:checked').length === 0) {
          $('#pd__sub-list input:checked').prop('checked',true);
        }
      }
    },
    saveSettings: function() {
      if ($('#pd__remember').is(':checked')) {
        if (! $('#pd__subreddits').is(':checked')) {
          $('#pd__sub-list input').prop('checked',false);
        }
        localStorage.setItem('pd_storage',JSON.stringify($('#pd__form').serializeArray()));
      } else {
        localStorage.removeItem('pd_storage');
      }
    },
  },
  actions: {
    getPage: function () {
      pdApp.ui.updateDisplay();
      pdApp.process.pageCalls ++;

      if (pdApp.process.sectionsRemaining.length > 0) {
        $('#pd__central h2').first().text('Power Delete Suite v'+pdApp.version+' - '+pdApp.process.sectionsRemaining[0]);
        $.ajax({
          url: pdApp.endpoints[pdApp.process.sectionsRemaining[0]],
          data: {
            q: pdApp.process.sectionsRemaining[0] == 'search' ?
              'author:'+pdApp.config.user + (! pdApp.process.isRemovingPosts ? ' self:1' : '') :
              null,
            after: pdApp.process.after.length > 0 ? pdApp.process.after : null
          }
        }).then(function(resp) {
          pdApp.process.donePages ++;
          if (resp.data.children.length > 0) {
            pdApp.process.numPages ++;
            pdApp.process.doneItems = 0;
            pdApp.process.numItems = resp.data.children.length;
            pdApp.process.items = resp.data.children;
            pdApp.actions.processItems();
          } else {
            pdApp.process.after = '';
            pdApp.process.sectionsRemaining.splice(0,1);
            pdApp.actions.getPage();
          }
        }, function(resp) {
          pdApp.process.errors++;
          console.error(resp);
          if (! confirm('Error getting '+pdApp.process.sectionsRemaining[0]+' page. Would you like to retry?')) {
            pdApp.process.sectionsRemaining.splice(0,1);
          }
          pdApp.actions.getPage();
        });
      } else {
        pdApp.ui.done();
      }
    },
    processItems: function () {
      pdApp.ui.updateDisplay();
      if (pdApp.process.items.length > 0) {
        pdApp.actions.processItem(pdApp.process.items[0]);
      } else {
        pdApp.actions.getPage();
      }
    },
    processItem: function (item) {
      pdApp.ui.updateDisplay();
      if (pdApp.helpers.filterCheck(item)) {
        if ((item.data.is_self || item.kind == 't1') && pdApp.process.isEditing && ! item.pdEdited) {
          pdApp.actions.edit(item);
        } else if ((item.kind == 't3' && pdApp.process.isRemovingPosts) || (item.kind == 't1' && pdApp.process.isRemovingComments)) {
          pdApp.actions.delete(item);
        } else {
          pdApp.process.doneItems ++;
          pdApp.process.after = item.data.name;
          pdApp.process.items.splice(0,1);
          pdApp.actions.processItems();
        }
      } else {
        pdApp.process.doneItems ++;
        pdApp.process.ignored ++;
        pdApp.process.after = item.data.name;
        pdApp.process.items.splice(0,1);
        pdApp.actions.processItems();
      }
    },
    delete: function (item) {
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
        pdApp.process.deleted ++;
        pdApp.process.doneItems ++;
        pdApp.process.items.splice(0,1);
        pdApp.actions.processItems();
      }, function () {
        pdApp.process.errors++;
        if (confirm('Error deleting '+(item.kind == 't3' ? 'post':'comment')+', would you like to retry?')) {
          pdApp.actions.processItem(item);
        } else {
          pdApp.process.items.splice(0,1);
          pdApp.actions.processItems();
        }
      });
    },
    edit: function (item) {
      $.ajax({
        url: 'https://www.reddit.com/api/editusertext',
        method: 'post',
        data: {
          thing_id: item.data.name,
          text: pdApp.process.editText,
          id: '#form-'+item.data.name,
          r: item.data.subreddit,
          uh: pdApp.config.uh,
          renderstyle: 'html'
        }
      }).then(function() {
        pdApp.process.edited ++;
        item.pdEdited = true;
        pdApp.actions.processItem(item);
      }, function () {
        pdApp.process.errors++;
        if (! confirm('Error editing '+(item.kind == 't3' ? 'post':'comment')+', would you like to retry?')) {
          item.pdEdited = true;
        }
        pdApp.actions.processItem(item);
      });
    },
  },
  ui: {
    updateDisplay: function () {
      $('#pd__form').hide().next().show();
      $('#progress_page .bar').css('width',(Math.round(1000*pdApp.process.donePages/pdApp.process.numPages)/10)+'%');
      $('#progress_page .text').text(pdApp.process.donePages + ' / ' + pdApp.process.numPages);
      if (pdApp.process.numItems > 0) {
        $('#progress_item .bar').css('width',(Math.round(1000*pdApp.process.doneItems/pdApp.process.numItems)/10)+'%');
        $('#progress_item .text').text(pdApp.process.doneItems + ' / ' + pdApp.process.numItems);
      }
      $('#progress_desc').html(
        (pdApp.process.edited > 0 ? '<div>'+pdApp.process.edited + ' edited</div>' : '')+
        (pdApp.process.deleted > 0 ? '<div>'+pdApp.process.deleted + ' deleted</div>' : '')+
        (pdApp.process.ignored > 0 ? '<div>'+pdApp.process.ignored + ' ignored</div>' : '')+
        (pdApp.process.errors > 0 ? '<div>'+pdApp.process.errors + ' errors</div>' : '')
      );
      pdApp.process.ajaxCalls = pdApp.process.edited + pdApp.process.deleted + pdApp.process.pageCalls;
      document.title = pdApp.config.user + ' | ' + pdApp.process.ajaxCalls;
    },
    done: function () {
      window.pd_processing = false;
      $('#pd__central h2').first().text('Power Delete Suite v'+pdApp.version);
      $('#pd__central .processing').html(
        '<p>Completed after making '+pdApp.process.ajaxCalls+' calls to the reddit servers.</p>'+
        (pdApp.process.edited > 0 ? '<div class="ind">'+pdApp.process.edited + ' edited</div>' : '')+
        (pdApp.process.deleted > 0 ? '<div class="ind">'+pdApp.process.deleted + ' deleted</div>' : '')+
        (pdApp.process.ignored > 0 ? '<div class="ind">'+pdApp.process.ignored + ' ignored</div>' : '')+
        (pdApp.process.errors > 0 ? '<div class="ind">'+pdApp.process.errors + ' errors</div>' : '')+
        '<p>If you need to re run the script, just click the bookmarklet again!</p>'
      );
      document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
    }
  },
  filters: {},
};
pdApp.init();
