/*
 * This file is part of j0be/PowerDeleteSuite.
 *
 * j0be/PowerDeleteSuite is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * j0be/PowerDeleteSuite is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License version 2
 * along with j0be/PowerDeleteSuite.  If not, see <http://www.gnu.org/licenses/>.
 */

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