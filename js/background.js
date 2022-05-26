const TAB_COUNT_COLOR_LIMIT = 10;
const TAB_COUNT_COLOR_LOW = '#28a745';
const TAB_COUNT_COLOR_HIGH ='#dc3545';
const extensionEnabledKey = '__em-enabled__';
const markersKey = '__em-markers__';
const searchModeKey = '__em-search-mode__';
const tabCounterKey = '__em-tab-counter__';
const faviconMarkerKey = '__em-favicon-marker__';
const fontKey = '__em-font__';

// Generic Error Handler
function onError(error) {
  console.log(error);
}

browser.storage.sync.get(extensionEnabledKey).then((extensionEnabledValue) => {
  let extensionEnabled = extensionEnabledValue[extensionEnabledKey] === undefined ? true : extensionEnabledValue[extensionEnabledKey];
  if (extensionEnabled) {
    initialize();
  }
}, onError);

browser.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.cmd === "toggleExtensionOnOff") {
      browser.storage.sync.set({ [extensionEnabledKey] :  request.data.value }).then(() => {
        if (request.data.value) {
          initialize();
        } else {
          removeListeners();
        }
      }, onError);
    }
  }
);

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

        browser.action.setBadgeText({ text: length.toString() });

        if (length > TAB_COUNT_COLOR_LIMIT) {
            browser.action.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_HIGH });
        } else {
            browser.action.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_LOW });
        }
      });
    } else {
      browser.action.setBadgeText({ text: '' });
    }
  });
}

function clearCount() {
  browser.action.setBadgeText({ text: '' });
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
          ]).then((options) => {
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
                browser.scripting.executeScript({
                  target: {tabId: tabId},
                  files: ['/js/content.min.js']
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

let onRemovedListener = function(tabId, removeInfo) {
  updateCount(tabId, true);
};

let onCreatedListener = function(tab) {
  updateCount(tab.id, false);
};
let onUpdatedListener = function(tabId, changeInfo, tab) {
  // Only run update once after the page is finished loading
  if (changeInfo.status === 'complete') {
    updateContent(tabId);
  }
};

function initialize() {
  browser.tabs.onRemoved.addListener(onRemovedListener);
  browser.tabs.onCreated.addListener(onCreatedListener);
  browser.tabs.onUpdated.addListener(onUpdatedListener);
  updateCount();
}

function removeListeners() {
  browser.tabs.onRemoved.removeListener(onRemovedListener);
  browser.tabs.onCreated.removeListener(onCreatedListener);
  browser.tabs.onUpdated.removeListener(onUpdatedListener);
  clearCount();
}
