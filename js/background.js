const TAB_COUNT_COLOR_LIMIT = 10;
const TAB_COUNT_COLOR_LOW = '#28a745';
const TAB_COUNT_COLOR_HIGH ='#dc3545';
const markersKey = '__em-markers__';

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
        browser.storage.local.get(markersKey).then((storedArray) => {
          if (storedArray[markersKey]) {
            for (let storedObject of storedArray[markersKey]) {

              let regex = new RegExp(storedObject.settingUrl, 'iu'),
                  urlFound = regex.test(tab.url);

              if (urlFound) {
                browser.tabs.executeScript(tabId, {
                  file: '/js/content.min.js'
                }).then(() => {
                  browser.tabs.sendMessage(tabId, {
                    command: 'addRibbon',
                    url: storedObject.settingUrl,
                    color: storedObject.settingColor,
                    label: storedObject.settingLabel,
                    position: storedObject.settingPosition,
                    size: storedObject.settingSize
                  }).then(response => {
                    //console.log("Message from the content script:");
                    //console.log(response.response);
                  }).catch(onError);
                }, onError);

                browser.tabs.insertCSS(tabId, {
                  file: '/css/content.min.css'
                }).then(null, onError);
              }
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
