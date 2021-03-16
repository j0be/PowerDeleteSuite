// ==UserScript==
// @name         Power Delete Suite
// @namespace    pds
// @version      1
// @description  Add a power delete suite button to the reddit overview page.
// @author       ObiDriftKenobi
// @match        https://old.reddit.com/user/*/overview
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    fetch("https://raw.githubusercontent.com/j0be/PowerDeleteSuite/master/bookmarklet.js").then(response => response.text()).then(response => {
        var scr = response;
        document.querySelector("#header-bottom-right > ul.flat-list").outerHTML += document.querySelector("#header-bottom-right > ul.flat-list").nextSibling.outerHTML; // dupe the separator
        document.querySelector("#header-bottom-right > ul.flat-list").nextSibling.outerHTML += '<a id="pd-delete" href="' + scr + '">PDS</a>' // yoink a button between the separators
    })
})();