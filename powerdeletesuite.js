var pd = {
  version: '1.4.0',
  bookmarkver: '1.1',
  init : function() {
    pd.checks.versions();
    if (window.pd_processing !== true) {
      if (pd.checks.location()) {
        $('#pd__central').find('.complete,.processing').hide();
        $('#pd__form').show();
        pd.setup.basicSettings();
        pd.setup.applyDom();
      } else {
        if (confirm('This script is designed to be run from your own user profile. Would you like to navigate there?')) {
          document.location = 'http://reddit.com/u/me';
        }
      }
    }
  },
  checks: {
    versions: function () {
      function checkBookmarkletVersion() {
        if (typeof window.bookmarkver === 'undefined' || window.bookmarkver !== pd.bookmarkver) {
          if (confirm('There\'s been an update to the bookmarklet. Would you like to go to the Github repo in order to get the latest version?')) {
            document.location.href = 'https://github.com/j0be/PowerDeleteSuite';
            return false;
          }
        }
        return true;
      }
      function checkAppVersion() {
        pd.prevRunVersion = localStorage.getItem('pd_ver') ? localStorage.getItem('pd_ver') : '0';
        localStorage.setItem('pd_ver',pd.version);
        if (pd.version !== pd.prevRunVersion) {
          if (confirm('You\'ve gotten the latest update! You are now running PowerDeleteSuite v'+pd.version+'. Would you like to open the changelog in a new tab?')) {
            $.ajax({url: '/r/PowerDeleteSuite/new.json'}).then(function(data) {
              window.open('http://reddit.com'+data.data.children[0].data.permalink);
            }, function() {
              window.open('http://reddit.com/r/PowerDeleteSuite');
            });
          }
        }
        return true;
      }
      return pd.debugging || (checkBookmarkletVersion() && checkAppVersion());
    },
    location: function () {
      return document.location.hostname.split('.').slice(-2).join('.') == 'reddit.com' &&
          document.location.href.match('/user/') &&
          $('.titlebox h1').first().text() === $('#header-bottom-right .user a').first().text();
    }
  },
  setup: {
    basicSettings: function () {
      pd.config = {
        uh : $('#config').innerHTML ?
          $('#config').innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,'') :
          $('#config')[0].innerHTML.replace(/.*?modhash.{1}: .{1}/,'').replace(/[^a-z0-9].*/,''),
        user : $('#header-bottom-right .user a').first().text()
      };
      pd.endpoints = {
        'comments': '/user/'+pd.config.user+'/comments/.json',
        'submissions': '/user/'+pd.config.user+'/submitted/.json',
        'search': '/search.json',
      };
    },
    applyDom: function () {
      if (pd.debugging) {$('#pd__central,#pd__style').remove('');}
      document.title = pd.config.user +' | Power Delete Suite';
      window.onerror = pd.error;

      $('.sitetable,.neverEndingReddit').remove();
      if ($('#pd__central').length === 0) {
        $('body>.content[role=\'main\']').append('<div id=\'pd__central\' />');
      }
      if ($('#pd__style').length === 0) {
        $('head').first().append('<style id=\'pd__style\' />');
      }
      pd.setup.applyStyles();
      pd.setup.applyCentral();
    },
    applyStyles: function () {
      $.ajax({
        url: '/r/PowerDeleteSuite/about/stylesheet/.json',
        context: $('#pd__style')
      }).then(function(data) {
        $(this)[0].innerHTML = data.data.stylesheet;
        $('#pd__central').show();
      }, function() {
        alert('Error retreiving CSS from /r/PowerDeleteSuite');
      });
    },
    applyCentral: function () {
      $.ajax({
        url: '/r/PowerDeleteSuite/wiki/centralform.json',
        context: $('#pd__central')
      }).then(function(data) {
        $(this).html($("<textarea/>").html(data.data.content_md).text());
        if ($('#pd__stlye').html() === '') {
          $(this).hide();
        }
        if (pd.debugging) {
          $(this).find('.debugging').removeClass('debugging');
        }
        $(this).find('h2').first().text('Power Delete Suite v'+pd.version);
        pd.setup.applySubList();
        pd.setup.bindUI();
        pd.helpers.restoreSettings();
      }, function() {
        alert('Error retreiving markup from /r/PowerDeleteSuite');
      });
    },
    applySubList: function () {
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
        $('#pd__sub-list').append('<div><input class=\'ind\' data-sub=\''+sub_arr[i]+'\' type=\'checkbox\' name=\''+sid+'\' id=\''+sid+'\'\'/><label class=\''+sid+'\' for=\''+sid+'\'>'+sub_arr[i]+'</label></div>');
      }
      $('#side-mod-list li').each(function() {
        $('.sub--'+$(this).text().replace('/r/','')).prepend('<b class=\'m\'>[M]</b>');
      });
    },
    createProcessStream: function () {
      window.pd_processing = true;
      pd.exportItems = [];
      pd.exportIds = [];
      pd.task = {
        after: '',
        info: {
          numPages:
            Math.min((
                ($('#pd__submissions').is(':checked') ? 8 : 0) +
                ($('#pd__comments').is(':checked') ? 4 : 0) +
                ($('#pd__comments-edit').is(':checked') ? 12 : 0)
              ),12),
          numItems: 0,
          donePages: 0,
          doneItems: 0,

          pageCalls: 0,
          edited: 0,
          deleted: 0,
          errors: 0,
          ignored: 0,
          exported: 0,
          ignoreReasons: {
            subs: 0,
            gold: 0,
            saved: 0,
            mod: 0,
            score: 0,
            date: 0,
          }
        },
        config: {
          isExporting: $('#pd__export').is(':checked'),
          isRemovingPosts: $('#pd__submissions').is(':checked'),
          isRemovingComments: $('#pd__comments').is(':checked'),
          isEditing: $('#pd__comments-edit').is(':checked'),
          editText: $('#pd__comments-edit-text').val(),
        },
        paths: {
          sections: ! $('#pd__submissions').is(':checked') && ! $('#pd__export').is(':checked') ?
            ['comments','search','submissions'] : /* Search is actually more efficient than submissions if we're not handling submissions (`self:1`) */
            ['comments','submissions','search'],
          sorts : ['new','hot','top','controversial']
        }
      };
      pd.filters = {
        subs: {
          enabled: $('#pd__subreddits').is(':checked'),
          list: $('#pd__sub-list input' + ($('#pd__subreddits').is(':checked') ? ':checked' : '')).map(function() {return $(this).attr('data-sub');})
        },
        score: {
          enabled: $('#pd__score').is(':checked'),
          gt: $('#pd__score-dirtoggle').is(':checked'),
          num: parseFloat($('#pd__score-num').val())
        },
        date: {
          enabled: $('#pd__date').is(':checked'),
          gt: $('#pd__date-dirtoggle').is(':checked'),
          num: Math.floor((new Date).getTime()/1000)-(parseFloat($('#pd__date-num').val())*60)
        },
        gilded: $('#pd__gilded').is(':checked'),
        saved: $('#pd__saved').is(':checked'),
        mod: $('#pd__mod').is(':checked'),
      };
    },
    resetSorts: function () {
      pd.task.paths.sorts = ['new','hot','top','controversial'];
    },
    bindUI: function() {
      $('#pd__form').submit(function(e) {
        e.preventDefault();
        pd.setup.createProcessStream();
        var validation = pd.helpers.validate();
        window.pd_processing = validation.valid;
        if (validation.valid) {
          $('#pd__central .complete, #pd__form').hide();
          $('#pd__central .processing').show();
          pd.actions.page.next();
        } else {
          alert(validation.reason);
        }
      });
      $('.pd__q').click(function(e) {e.preventDefault(); alert($(this).closest('[data-help]').attr('data-help'));});
      $('#pd__form input').change(function() {
        pd.helpers.saveSettings();
      });
      $('.mass_sel').click(function() {
        $(this).closest('.xtr-section').find('input').prop('checked',$(this).hasClass('sel_all'));
        pd.helpers.saveSettings();
      });
      $('.gt-toggle').change(function() {
        var greaterThan = $(this).hasClass('greater');
        $(this).attr('class','gt-toggle hidden ' + (greaterThan ? 'less' : 'greater'));
      });
      $('.num-only').blur(function() {
        $(this).val($(this).val().replace(/[^\d-]/g,''));
        $(this).change();
      });
      $('.pd__insert').click(function() {
        $($(this).attr('data-target')).val($(this).attr('data-value')).change();
      });
    },
  },
  helpers: {
    validate: function () {
      if (pd.task.config.isEditing && pd.task.config.editText === '') {
        return {valid:false,reason:'Please enter something to edit your comments / self posts to.'};
      } else if (pd.filters.score && $('#pd_score-num').val() === '') {
        return {valid:false,reason:'Please enter a score to filter with.'};
      } else if (!(pd.task.config.isRemovingPosts || pd.task.config.isEditing || pd.task.config.isEditing || pd.task.config.isExporting)) {
        return {valid:false,reason:'There are no actions chosen, so we\'ve got nothing to do. Please select an action.'};
      }
      return {valid:true,reason:'valid'};
    },
    shouldBeActedOn: function (item) {
      var check = {
        subs: !pd.filters.subs.enabled ||
          (pd.filters.subs.enabled && $.inArray(item.data.subreddit,pd.filters.subs.list) >= 0),
        gold: !(pd.filters.gilded && item.data.gilded == 1),
        saved: !(pd.filters.saved && item.data.saved == true),
        mod: !(pd.filters.mod && item.data.distinguished != null),
        score: !pd.filters.score.enabled ||
          (pd.filters.score.enabled && (
            (pd.filters.score.gt === true && parseFloat(item.data.score) > pd.filters.score.num) ||
            (pd.filters.score.gt === false && parseFloat(item.data.score) < pd.filters.score.num)
          )),
        date: !pd.filters.date.enabled ||
          (pd.filters.date.enabled && (
            (pd.filters.date.gt === true && parseFloat(item.data.created_utc) > pd.filters.date.num) ||
            (pd.filters.date.gt === false && parseFloat(item.data.created_utc) < pd.filters.date.num)
          ))
      };
      for(var key in check) {if (! check[key]) {
          pd.task.info.ignoreReasons[key] ++;
          pd.task.items[0].pdIgnoreReasons = check;
      }}
      return check.subs && check.gold && check.saved && check.mod && check.score && check.date;
    },
    csvEscape: function(str) {
      return str.replace(/'/g,'"').replace(/"/g,'""');
    },
    csvCell: function(str) {
      return '"'+str+'",';
    },
    getSettings: function() {
      return localStorage.getItem('pd_storage') ? JSON.parse(localStorage.getItem('pd_storage')) : false;
    },
    restoreSettings: function () {
      var settings = pd.helpers.getSettings(),
        rememberSettings = $('#pd__remember').is(':checked');
      if (settings !== false && rememberSettings) {
        $('#pd__form input').prop('checked',false).val(''); //Reset all
        for (var i=0;i<settings.length;i++) {
          var setting = settings[i],
            selector = '*[name=\''+setting.name+'\']';
          if (setting.value == 'on' || setting.value === '') {
            $(selector).prop('checked',true);
          } else {
            $(selector).val(setting.value);
          }
        }
        $('.gt-toggle').not(':checked').change();
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
    page: {
      next: function() {
        if (pd.debugging && pd.task.info.donePages % 5 == 3) {
          pd.actions.page.shift();
        }
        if (pd.task.paths.sections.length > 0) {
          pd.ui.updateDisplay();
          pd.actions.page.handle();
        } else {
          pd.ui.done();
        }
      },
      shift: function () {
        pd.task.paths.sorts.splice(0,1);
        if (pd.task.paths.sorts.length === 0) {
          pd.setup.resetSorts();
          pd.task.paths.sections.splice(0,1);
        }
      },
      handle: function() {
        pd.task.pageCalls ++;
        $.ajax({
          url: pd.endpoints[pd.task.paths.sections[0]],
          data: {
            q: pd.task.paths.sections[0] == 'search' ?
              'author:'+pd.config.user + (! pd.task.config.isRemovingPosts && !pd.task.config.isExporting ? ' self:1' : '') :
              null,
            after: pd.task.after,
            sort: pd.task.paths.sorts[0],
            t: 'all',
          }
        }).then(function(resp) {
          if (resp.data) {
            var children = resp.data.children;
            pd.task.info.donePages ++;
            if (children.length > 0) {
              pd.task.info.doneItems = 0;
              pd.task.info.numItems = children.length;
              pd.task.items = children;
              pd.actions.children.handleGroup();
            } else {
              pd.task.after = '';
              pd.actions.page.shift();
              pd.actions.page.next();
            }
          } else {
            pd.task.info.errors++;
            if (confirm('Reddit seems to be under heavy load. Would you like to continue processing?')) {
              pd.actions.page.shift();
              pd.actions.page.handle();
            } else {
              pd.ui.done();
            }
          }
        }, function() {
          pd.task.info.errors++;
          if (confirm('Error getting '+pd.task.paths.sections[0]+' page. Would you like to retry?')) {
            pd.actions.page.handle();
          } else {
            pd.actions.page.shift();
            pd.actions.page.next();
          }
        });
      },
    },
    children: {
      handleGroup: function () {
        pd.ui.updateDisplay();
        if (pd.task.items.length > 0) {
          pd.actions.children.handleSingle();
        } else {
          pd.actions.page.next();
        }
      },
      handleSingle: function () {
        pd.ui.updateDisplay();
        var item = pd.task.items[0],
          shouldBeActedOn = pd.helpers.shouldBeActedOn(item),
          earlyExitNewItems = pd.task.paths.sorts[0] == 'new' && pd.filters.date.gt === true && pd.task.items[0].pdIgnoreReasons && !pd.task.items[0].pdIgnoreReasons.date;

        if (earlyExitNewItems) {
          console.log('Skipping the rest of the things sorted by new');
          pd.task.items[0].pdIgnored = true;
          pd.actions.children.finishItem();
          pd.actions.page.shift();
          pd.actions.page.next();
        } else if (shouldBeActedOn) {
          if (!item.pdEdited && ((item.data.is_self || item.kind == 't1') && pd.task.config.isEditing)) {
            pd.actions.edit(item);
          } else if (!item.pdDeleted && ((item.kind == 't3' && pd.task.config.isRemovingPosts) || (item.kind == 't1' && pd.task.config.isRemovingComments))) {
            pd.actions.delete(item);
          } else {
            pd.actions.children.finishItem();
            pd.actions.children.handleGroup();
          }
        } else {
          pd.task.items[0].pdIgnored = true;
          pd.actions.children.finishItem();
          pd.actions.children.handleGroup();
        }
      },
      finishItem: function () {
        pd.task.after = pd.task.items[0].pdDeleted ? pd.task.after : pd.task.items[0].data.name;
        pd.task.info.doneItems ++;
        pd.task.info.deleted += pd.task.items[0].pdDeleted ? 1 : 0;
        pd.task.info.edited += pd.task.items[0].pdEdited ? 1 : 0;
        pd.task.info.ignored += pd.task.items[0].pdIgnored ? 1 : 0;
        if (pd.task.config.isExporting && !pd.task.items[0].pdIgnored) {
          pd.actions.children.exportItem(pd.task.items[0]);
        }
        pd.task.items.splice(0,1);
      },
      exportItem: function(item) {
        var str = '';
        if (pd.exportItems.length == 0) {
          str += pd.helpers.csvCell('Title');
          str += pd.helpers.csvCell('Body');
          str += pd.helpers.csvCell('Permalink');
          str+= pd.helpers.csvCell('Actions');
          pd.exportItems.push(str);
        }

        if (pd.exportIds.indexOf(item.data.id) == -1) {
          str = '';
          str += pd.helpers.csvCell(pd.helpers.csvEscape(item.data.title ? item.data.title : ''));
          str += pd.helpers.csvCell(pd.helpers.csvEscape(item.data.body ? item.data.body : ''));
          str += pd.helpers.csvCell(item.data.permalink ? 
              'http://reddit.com'+item.data.permalink :
              'http://reddit.com/r/'+item.data.subreddit+'/comments/'+(item.data.link_id.replace(/^t\d_/,''))+'/x/'+item.data.id+'?context=3'
            );
          str+= pd.helpers.csvCell((item.pdEdited ? 'edited ' : '') + (item.pdDeleted ? 'deleted ' : ''));
          pd.exportItems.push(str);
          pd.exportIds.push(item.data.id);
          pd.task.info.exported ++;
        }
      }
    },
    delete: function (item) {
      if (pd.performActions) {
        $.ajax({
          url: '/api/del',
          method: 'post',
          data: {
            id: item.data.name,
            executed: 'deleted',
            uh: pd.config.uh,
            renderstyle: 'html'
          }
        }).then(function() {
          pd.task.items[0].pdDeleted = true;
          pd.actions.children.handleSingle();
        }, function () {
          pd.task.info.errors++;
          if (confirm('Error deleting '+(item.kind == 't3' ? 'post':'comment')+', would you like to retry?')) {
            pd.actions.children.handleSingle();
          } else {
            pd.actions.children.finishItem();
            pd.actions.children.handleGroup();
          }
        });
      } else {
        pd.task.items[0].pdDeleted = true;
        pd.task.after = pd.task.items[0].data.name;
        pd.actions.children.handleSingle();
      }
    },
    edit: function (item) {
      if (pd.performActions) {
        $.ajax({
          url: '/api/editusertext',
          method: 'post',
          data: {
            thing_id: item.data.name,
            text: pd.task.editText,
            id: '#form-'+item.data.name,
            r: item.data.subreddit,
            uh: pd.config.uh,
            renderstyle: 'html'
          }
        }).then(function() {
          pd.task.items[0].pdEdited = true;
          pd.actions.children.handleSingle();
        }, function () {
          pd.task.info.errors++;
          if (! confirm('Error editing '+(item.kind == 't3' ? 'post':'comment')+', would you like to retry?')) {
            item.pdEdited = true;
          }
          pd.actions.children.handleSingle();
        });
      } else {
        pd.task.items[0].pdEdited = true;
        pd.actions.children.handleSingle();
      }
    },
  },
  ui: {
    updateDisplay: function () {
      $('#pd__central h2').first().html('Power Delete Suite v'+pd.version+' <br/><small>'+pd.task.paths.sections[0]+'/'+pd.task.paths.sorts[0]+'</small>');
      pd.task.info.numPages = pd.task.info.donePages + ((pd.task.paths.sections.length - 1)*4) + (pd.task.paths.sorts.length);
      $('#progress_page .bar').css('width',(Math.round(1000*pd.task.info.donePages/pd.task.info.numPages)/10)+'%');
      $('#progress_page .text').attr('data-top', pd.task.info.donePages).attr('data-bottom',pd.task.info.numPages);
      if (pd.task.info.numItems > 0) {
        $('#progress_item .bar').css('width',(Math.round(1000*pd.task.info.doneItems/pd.task.info.numItems)/10)+'%');
        $('#progress_item .text').attr('data-top', pd.task.info.doneItems).attr('data-bottom',pd.task.info.numItems);
      }


      $('.progress__byline .edited').addClass(pd.task.info.edited > 0 ? 'visible' : '').find('.num').attr('data-num',pd.task.info.edited);
      $('.progress__byline .deleted').addClass(pd.task.info.deleted > 0 ? 'visible' : '').find('.num').attr('data-num',pd.task.info.deleted);
      $('.progress__byline .errors').addClass(pd.task.info.errors > 0 ? 'visible' : '').find('.num').attr('data-num',pd.task.info.errors);
      $('.progress__byline .exported').addClass(pd.task.info.exported > 0 ? 'visible' : '').find('.num').attr('data-num',pd.task.info.exported);
      $('.progress__byline .ignored').addClass(pd.task.info.ignored > 0 ? 'visible' : '').find('.num').attr('data-num',pd.task.info.ignored);
      for (var key in pd.task.info.ignoreReasons) {
        if (!!pd.task.info.ignoreReasons[key]) {
          if ($('.progress__byline .ignored .reasons .'+key).length == 0) {
            $('.progress__byline .ignored .reasons').prepend('<div class="'+key+'">'+key+': </div>');
          }
          $('.progress__byline .ignored .reasons .'+key).attr('data-num',pd.task.info.ignoreReasons[key]);
        }
      }

      $('#progress__item-output').attr('class', 
        pd.task.info.ignored > 0 && (pd.task.info.deleted > 0 || pd.task.info.edited > 0) ?
          'twocol': 'onecol');

      pd.task.info.ajaxCalls = pd.task.info.errors + pd.task.info.edited + pd.task.info.deleted + pd.task.info.donePages;
      document.title = pd.config.user + ' | ' + pd.task.info.ajaxCalls;
    },
    done: function () {
      pd.ui.updateDisplay();
      window.pd_processing = false;
      document.title = $('#header-bottom-right .user a').first().text()+' | Power Delete Suite';
      $('#pd__central h2').first().text('Power Delete Suite v'+pd.version);

      if (pd.task.info.edited + pd.task.info.deleted > 0 || pd.task.config.isExporting) {
        $('#pd__central .complete .summary').html('<p>Completed after making '+pd.task.info.ajaxCalls+' calls to the reddit servers.</p> <p>If you need to re run the script, <a class="restart">click here to go back to the beginning!</a></p>');
      } else {
        $('#pd__central .complete .summary').html('<p>All Done! It seems like all '+pd.task.info.ignored+' items we came across were ignored.</p> <p>If you need to re run the script, <a class="restart">click here to go back to the beginning!</a></p>');
      }
      $('#pd__central .complete .summary .restart').click(function() {
        pd.init();
      });

      var numSubs = $('#pd__sub-list input:checked').length;
      $('#pd__sub-list input').prop('checked',false);
      var debugInfo = JSON.stringify($('#pd__form').serializeArray()) + ' number of subreddits: '+numSubs;

      $('#pd__central .complete .goodbye').html(
        '<hr/><h3 class="submit-bug">'+
          '<div>Having trouble?</div>'+
          '<div><a href="https://www.reddit.com/message/compose?to=j0be&subject=PowerDeleteSuite%20Config&message='+encodeURIComponent(debugInfo)+'" target="_blank">Send /u/j0be a message with your current settings.</a></div>'+
          '<div><small>(for privacy, subreddit list is not included)</small></div>'+
        '</h3>');

      if (pd.task.config.isExporting && pd.exportItems.length > 0) {
        $('#pd__central .complete .goodbye').prepend('<hr/><a class="export-button" href=\'data:text/csv;charset=utf-8,'+pd.exportItems.join("%0A")+'\' download="PowerDeleteSuiteExport.csv">Download Exported Items</a>');
      }

      $('#pd__central .processing, #pd__form').hide();
      $('#pd__central .complete').show();
    }
  },
  error: function() {
    window.pd_processing = false;
    alert('We ran into an error. Why not tell /u/j0be what you were doing to break it?');
    pd.init();
  },
  performActions: true,
  debugging: false
};
pd.init();
