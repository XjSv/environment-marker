const TAB_COUNT_COLOR_LIMIT = 10;
const TAB_COUNT_COLOR_LOW = '#28a745';
const TAB_COUNT_COLOR_HIGH ='#dc3545';
const extensionEnabledKey = '__em-enabled__';
const markersKey = '__em-markers__';
const searchModeKey = '__em-search-mode__';
const tabCounterKey = '__em-tab-counter__';
const faviconMarkerKey = '__em-favicon-marker__';
const dontSyncMarkerDataKey = '__em-dont-sync-marker-data__';
const fontKey = '__em-font__';

// Migration function for moving from global search mode to per-marker search mode
function migrateSearchMode() {
  chrome.storage.sync.get([searchModeKey, dontSyncMarkerDataKey]).then((storedResults) => {
    let globalSearchMode = storedResults[searchModeKey];
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    // If global search mode is enabled, we need to migrate
    if (globalSearchMode) {
      const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

      storage.get(markersKey).then((storedResults) => {
        let storedArray = storedResults[markersKey] || [];
        let updatedArray = storedArray.map(marker => {
          // Only update markers that don't have a search mode set
          if (!marker.settingSearchMode) {
            return {
              ...marker,
              settingSearchMode: 'regexp'
            };
          }
          return marker;
        });

        // Save updated markers
        storage.set({ [markersKey]: updatedArray }).then(() => {
          // Remove the old global setting
          chrome.storage.sync.remove(searchModeKey);
        }, onError);
      }, onError);
    }
  }, onError);
}

// Generic Error Handler
function onError(error) {
  console.log(error);
}

chrome.storage.sync.get(extensionEnabledKey).then((extensionEnabledValue) => {
  let extensionEnabled = extensionEnabledValue[extensionEnabledKey] === undefined ? true : extensionEnabledValue[extensionEnabledKey];
  if (!extensionEnabled) {
    removeListeners();
  }
}, onError);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.cmd === "toggleExtensionOnOff") {
      chrome.storage.sync.set({ [extensionEnabledKey] :  request.data.value }).then(() => {
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
  chrome.storage.sync.get(tabCounterKey).then((storedTabCounter) => {
    let storedTabCounterBool = storedTabCounter[tabCounterKey] || false;

    if (storedTabCounterBool) {
      chrome.tabs.query({}).then((tabs) => {
        let length = tabs.length;

        // onRemoved fires too early and the count is one too many.
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
        if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
          length--;
        }

        chrome.action.setBadgeText({ text: length.toString() });

        if (length > TAB_COUNT_COLOR_LIMIT) {
          chrome.action.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_HIGH });
        } else {
          chrome.action.setBadgeBackgroundColor({ 'color': TAB_COUNT_COLOR_LOW });
        }
      });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

function clearCount() {
  chrome.action.setBadgeText({ text: '' });
}

// CIDR matching utility function
function isIpInCidr(ip, cidr) {
  try {
    // Split CIDR into IP and prefix
    const [cidrIp, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix, 10);

    // Convert IPs to binary
    const ipToBinary = ip.split('.').map(octet =>
      parseInt(octet, 10).toString(2).padStart(8, '0')
    ).join('');

    const cidrIpToBinary = cidrIp.split('.').map(octet =>
      parseInt(octet, 10).toString(2).padStart(8, '0')
    ).join('');

    // Compare the first prefixLength bits
    return ipToBinary.substring(0, prefixLength) === cidrIpToBinary.substring(0, prefixLength);
  } catch (error) {
    console.error('CIDR matching error:', error);
    return false;
  }
}

// Check if DNS API is supported
function isDnsApiSupported() {
  return chrome.dns && chrome.dns.resolve;
}

function updateContent(tabId) {
  if (tabId !== undefined) {
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.url !== '') {
        chrome.storage.sync.get([
          fontKey,
          searchModeKey,
          faviconMarkerKey,
          dontSyncMarkerDataKey
        ]).then((options) => {
          let fontString = options[fontKey] || '';
          let searchModeRegExp = options[searchModeKey] || false;
          let faviconMarker = options[faviconMarkerKey] || false;
          let dontSyncMarkerData = options[dontSyncMarkerDataKey] || false;

          const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

          storage.get(markersKey).then((storedResults) => {
            let storedData = storedResults[markersKey] || [];

            if (storedData) {
              for (let storedObject of storedData) {
                let urlFound = false;

                switch (storedObject.settingSearchMode) {
                  case 'normal':
                    urlFound = (tab.url.indexOf(storedObject.settingUrl) !== -1);
                    break;
                  case 'regexp':
                    let regex = new RegExp(storedObject.settingUrl, 'iu');
                    urlFound = regex.test(tab.url);
                    break;
                  case 'dns':
                    if (isDnsApiSupported()) {
                      const url = new URL(tab.url);
                      const domain = url.hostname;

                      try {
                        chrome.dns.resolve(domain).then((record) => {
                          // Check if any of the resolved IPs match the marker's URL (CIDR or exact match)
                          urlFound = record.addresses.some(ip => {
                            // Check if the marker URL is in CIDR notation
                            if (storedObject.settingUrl.includes('/')) {
                              return isIpInCidr(ip, storedObject.settingUrl);
                            }
                            // Otherwise do exact match
                            return storedObject.settingUrl.includes(ip);
                          });

                          if (urlFound) {
                            applyMarker(tabId, storedObject, fontString, faviconMarker);
                          }
                        }).catch((error) => {
                          console.error('DNS resolution failed:', error);
                        });
                      } catch (error) {
                        console.error('DNS API not available:', error);
                      }
                    } else {
                      console.warn('DNS resolution not supported in this browser');
                      // Fallback to normal search mode
                      urlFound = (tab.url.indexOf(storedObject.settingUrl) !== -1);
                    }
                    break;
                }

                if (urlFound && storedObject.settingSearchMode !== 'dns') {
                  applyMarker(tabId, storedObject, fontString, faviconMarker);
                }
              }
            }
          }, onError);
        });
      }
    }, onError);
  }
}

// Helper function to apply marker styling
function applyMarker(tabId, marker, fontString, faviconMarker) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['/js/content.min.js']
  }).then(() => {
    chrome.tabs.sendMessage(tabId, {
      command: 'addRibbon',
      url: marker.settingUrl,
      color: marker.settingColor,
      label: marker.settingLabel,
      fontSize: marker.settingFontSize,
      position: marker.settingPosition,
      size: marker.settingSize,
      font: fontString,
      enableFaviconMarker: faviconMarker,
    }).catch(onError);
  }, onError);

  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ['/css/content.min.css'],
  }).catch(onError);
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
  chrome.tabs.onRemoved.addListener(onRemovedListener);
  chrome.tabs.onCreated.addListener(onCreatedListener);
  chrome.tabs.onUpdated.addListener(onUpdatedListener);
  updateCount();
  migrateSearchMode();
}

function removeListeners() {
  chrome.tabs.onRemoved.removeListener(onRemovedListener);
  chrome.tabs.onCreated.removeListener(onCreatedListener);
  chrome.tabs.onUpdated.removeListener(onUpdatedListener);
  clearCount();
}

initialize();
