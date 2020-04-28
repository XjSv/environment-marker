const TAB_COUNT_COLOR_LIMIT = 10;
const TAB_COUNT_COLOR_LOW = '#28a745';
const TAB_COUNT_COLOR_HIGH ='#dc3545';

/* generic error handler */
function onError(error) {
  console.log(error);
}

function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({}).then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
        length--;
    }

    browser.browserAction.setBadgeText({ text: length.toString() });

    if (length > TAB_COUNT_COLOR_LIMIT) {
        browser.browserAction.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_HIGH });
    } else {
        browser.browserAction.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_LOW });
    }
  });
}

function updateContent(tabId) {
  if (tabId !== undefined) {
    browser.tabs.get(tabId).then((tab) => {
      if (tab.url !== '') {
        browser.storage.local.get(null).then((results) => {
          let settingsKeys = Object.keys(results);
          for (let urlValue of settingsKeys) {
            if (tab.url.indexOf(urlValue) !== -1) {

              browser.tabs.executeScript(tabId, {
                file: '/content-script.js'
              }).then(() => {

                browser.tabs.sendMessage(tabId, {
                  command: 'addRibbon',
                  url: urlValue,
                  color: results[urlValue][0],
                  label: results[urlValue][1],
                  position: results[urlValue][2]
                });
              }, onError);

              browser.tabs.insertCSS(tabId, {
                file: '/content-style.css'
              }).then(null, onError);

            }
          }
        }, onError);
      }
    }, onError);
  }
}

browser.tabs.onRemoved.addListener((tabId) => {
  updateCount(tabId, true);
});

browser.tabs.onCreated.addListener((tabId) => {
  updateCount(tabId, false);
});

browser.tabs.onUpdated.addListener((tabId) => {
  updateContent(tabId);
});

updateCount();
updateContent();
