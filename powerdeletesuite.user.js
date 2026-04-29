// ==UserScript==
// @name         Power Delete Suite
// @namespace    pds
// @version      1
// @description  Add a power delete suite button to the reddit overview page.
// @author       ObiDriftKenobi
// @match        https://old.reddit.com/user/*/overview
// @grant        none
// ==/UserScript==

// GitHub URLs - Update these for new versions
var PDS_BOOKMARKLET_URL = "https://raw.githubusercontent.com/willsheppard/PowerDeleteSuite/keyword-filter/bookmarklet.js";

(function() {
    'use strict';

    fetch(PDS_BOOKMARKLET_URL).then(response => response.text()).then(response => {
        var scr = response;
        document.querySelector("#header-bottom-right > ul.flat-list").outerHTML += document.querySelector("#header-bottom-right > ul.flat-list").nextSibling.outerHTML; // dupe the separator
        document.querySelector("#header-bottom-right > ul.flat-list").nextSibling.outerHTML += '<a id="pd-delete" href="' + scr + '">PDS</a>' // yoink a button between the separators
    })
})();