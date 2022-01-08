const TAB_COUNT_COLOR_LIMIT = 10;
const TAB_COUNT_COLOR_LOW = '#28a745';
const TAB_COUNT_COLOR_HIGH ='#dc3545';
const markersKey = '__em-markers__';
const searchModeKey = '__em-search-mode__';
const tabCounterKey = '__em-tab-counter__';
const faviconMarkerKey = '__em-favicon-marker__';
const fontKey = '__em-font__';

/* generic error handler */
function onError(error) {
  console.log(error);
}

function updateCount(tabId, isOnRemoved) {
  browser.storage.sync.get(tabCounterKey).then((storedTabCounter) => {
    let storedTabCounterBool = storedTabCounter[tabCounterKey] || false;

    if (storedTabCounterBool) {
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
    } else {
      browser.browserAction.setBadgeText({ text: '' });
    }
  });
}

function updateContent(tabId) {
  if (tabId !== undefined) {
    browser.tabs.get(tabId).then((tab) => {
      if (tab.url !== '') {
        browser.storage.sync.get([
          fontKey,
          searchModeKey,
          markersKey,
          faviconMarkerKey
         ], function(options) {
          let fontString = options[fontKey] || '';
          let searchModeRegExp = options[searchModeKey] || false;
          let faviconMarker = options[faviconMarkerKey] || false;

          if (options[markersKey]) {
            for (let storedObject of options[markersKey]) {

              let urlFound = false;
              if (searchModeRegExp) {
                let regex = new RegExp(storedObject.settingUrl, 'iu');
                urlFound = regex.test(tab.url);
              } else {
                urlFound = (tab.url.indexOf(storedObject.settingUrl) !== -1);
              }

              if (urlFound) {
                browser.tabs.executeScript(tabId, {
                  file: '/js/content.min.js'
                }).then(() => {
                  browser.tabs.sendMessage(tabId, {
                    command: 'addRibbon',
                    url: storedObject.settingUrl,
                    color: storedObject.settingColor,
                    label: storedObject.settingLabel,
                    fontSize: storedObject.settingFontSize,
                    position: storedObject.settingPosition,
                    size: storedObject.settingSize,
                    font: fontString,
                    enableFaviconMarker: faviconMarker
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

        });
      }
    }, onError);
  }
}

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  updateCount(tabId, true);
});

browser.tabs.onCreated.addListener((tab) => {
  updateCount(tab.id, false);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run update once after the page is finished loading
  if (changeInfo.status === 'complete') {
    updateContent(tabId);
  }
});

updateCount();
