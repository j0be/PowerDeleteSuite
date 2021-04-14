javascript: (function() {
    window.debugging = true;
    let branch = 'alpha/';

    window.bookmarkver = '2.0';
    window.baseUrl = window.debugging ?
        'http://127.0.0.1:8080/' :
        'https://raw.githubusercontent.com/j0be/PowerDeleteSuite/' + branch;

    var isReddit = document.location.hostname.split('.').slice(-2).join('.').toLowerCase() === 'reddit.com';
    if (isReddit) {
        /*Run App*/
    } else if (confirm('This script is designed to run on reddit. Would you like to go there now?')) {
        document.location = 'https://www.reddit.com/u/me/';
    } else {
        alert('Please go to reddit before running this script');
    }
})();
