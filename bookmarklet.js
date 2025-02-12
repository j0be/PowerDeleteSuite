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

javascript: (function () {
  window.bookmarkver = "1.4";
  var isReddit =
    document.location.hostname.split(".").slice(-2).join(".") === "reddit.com";
  var isOverview = document.location.href.match(/\/overview\b/);
  if (isReddit && isOverview) {
    var cachBustUrl = `?${new Date().getDate()}`;
    var cachBustUrl = 'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/master/powerdeletesuite.js?' + (new Date().getDate());
    // var cachBustUrl = "https://raw.githubusercontent.com/saandman/PowerDeleteSuite/master/powerdeletesuite.js?" + (new Date().getDate());
    fetch(cachBustUrl)
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        var script = document.createElement("script");
        script.id = "pd-script";
        script.innerHTML = data;
        document.getElementsByTagName("head")[0].appendChild(script);
      })
      .catch(function () {
        alert("Error retrieving PowerDeleteSuite from github");
      });
  } else if (
    confirm(
      "This script can only be run from your own user profile on reddit. Would you like to go there now?"
    )
  ) {
    document.location = "https://old.reddit.com/u/me/overview";
  } else {
    alert("Please go to your reddit profile before running this script");
  }
})();
