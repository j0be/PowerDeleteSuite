# Power Delete Suite

 Why use the Power Delete Suite instead of the other mass reddit deletion scripts?

 1. There is complete privacy built in. There are no callbacks to any personal servers, no tracking, or logging. You don't even have to enter your password. EVER. *\*ahem, shreddit\** You are completely anonymous.
 2. There is NO NEED to use never ending reddit to load as many comments / submissions. This script uses the actual Reddit API endpoints to edit and delete instead of automating clicks on delete and edit buttons. *\*ahem, reddit overwrite\**
 3. It's pretty damn thorough. It will first load up your comments page(s), then load your submissions page(s), then do searches with the reddit search api. With EACH of those, it sorts by new, then hot, then top, then controversial. And if we're sorting by top or controversial, it will loop through the timeframes as well (all, year, month, week, day, hour). This makes sure to grab everything it can possibly find.
 4. It has FILTERS! You can make choices about what you want deleted. Filters include:
  * choosing which subreddits to perform actions on
  * filtering based on the item's score
  * filtering based on the item's date time
  * excluding gilded comments and posts
  * excluding saved comments and posts
  * excluding mod distinguished comments and posts
 5. When editing comments, you choose what you want it to be edited to. I'm not going to do some self promo bullshit on your account. What you edit it to is your own business. *\*ahem, reddit overwrite\**
  * If you are both editing AND deleting, it makes sure to edit the comment or self post BEFORE deleting it.
  * Many subreddits have Automoderator configs that could be triggered when you edit, so avoid putting anything unsavory or overly paranoid in your edits
 6. You can do an export of all the content you filter, whether or not you're deleting or editing!
 7. It pulls the latest version from github, so whenever I add new features or fix bugs, you have it instantly!
 8. It was built by /u/j0be, a well known reddit user with a long reddit history and moderates several large subreddits. This means you don't just have to implicitly trust "some random person you can't track down." *\*ahem, reddit overwrite\**

## Screenshots
 
 ![Power Delete Suite Control Center](http://i.imgur.com/Fh5HsAD.png)
 
## Installation

***Firefox***: Open the Hamburger menu> Bookmarks --> Manage Bookmarks --> Right Click on empty space --> Add Bookmark --> Paste the code below into the URL section --> Save --> Done!

***Chromium/Chrome***: Go to `chrome://bookmarks/` --> Right click on empty space --> Add new bookmark --> Paste the code below into the URL section --> Save --> Done!

***Edge***: Press the three dots --> Favorites --> Star with a plus icon --> Right click the new favorite --> Edit --> Paste the code below into the URL section --> Save --> Done!

***Brave***: Go to `chrome://bookmarks` --> Right click on empty space -->  Add new bookmark --> Paste the code below into the URL section --> Save --> Done!

```
javascript:(function() { window.bookmarkver = '1.4'; var isReddit = document.location.hostname.split('.').slice(-2).join('.') === 'reddit.com'; var isOverview = !! document.location.href.match(/\/overview\b/i); if (isReddit && isOverview) { var cachBustUrl = 'https://raw.githubusercontent.com/mykola2312/PowerDeleteSuite/master/powerdeletesuite.js?' + (new Date().getDate()); fetch(cachBustUrl).then(function(response) { return response.text(); }).then(function(data) { var script = document.createElement('script'); script.id = 'pd-script'; script.innerHTML = data; document.getElementsByTagName('head')[0].appendChild(script); }).catch(function() { alert('Error retrieving PowerDeleteSuite from GitHub'); }); } else if (confirm('This script can only be run from your own user profile on Reddit. Would you like to go there now?')) { document.location = 'https://old.reddit.com/u/me/overview'; } else { alert('Please go to your Reddit profile before running this script'); } })();
```

## Usage

- Go to your [account overview.](https://old.reddit.com/u/me/overview)

- Click on the bookmark you made while focused on the account overview tab. 

- Adjust settings to your prefrences. 
 
## Bugs / Issues?
 
Feel free to subscribe to [/r/PowerDeleteSuite/](https://www.reddit.com/r/PowerDeleteSuite/) where I will make a post every time that I make an update to the script!
 
