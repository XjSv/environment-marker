let inputUrlFragmentPlaceholder = chrome.i18n.getMessage("inputUrlFragmentPlaceholder"),
    inputUrlFragmentRegExpPlaceholder = chrome.i18n.getMessage("inputUrlFragmentRegExpPlaceholder"),
    inputUrlFragmentDnsPlaceholder = chrome.i18n.getMessage("inputUrlFragmentDnsPlaceholder"),
    inputColorPlaceholder = chrome.i18n.getMessage("inputColorPlaceholder"),
    inputLabelPlaceholder = chrome.i18n.getMessage("inputLabelPlaceholder"),
    selectFontSizeLabel = chrome.i18n.getMessage("selectFontSizeLabel"),
    selectPositionLabel = chrome.i18n.getMessage("selectPositionLabel"),
    selectRibbonSizeLabel = chrome.i18n.getMessage("inputLabelPlaceholder"),
    buttonSaveLabel = chrome.i18n.getMessage("buttonSaveLabel"),
    positionSelectTopLeft = chrome.i18n.getMessage("positionSelectTopLeft"),
    positionSelectTopRight = chrome.i18n.getMessage("positionSelectTopRight"),
    positionSelectBottomLeft = chrome.i18n.getMessage("positionSelectBottomLeft"),
    positionSelectBottomRight = chrome.i18n.getMessage("positionSelectBottomRight"),
    sizeSelectExtraSmall = chrome.i18n.getMessage("sizeSelectExtraSmall"),
    sizeSelectSmall = chrome.i18n.getMessage("sizeSelectSmall"),
    sizeSelectNormal = chrome.i18n.getMessage("sizeSelectNormal"),
    sizeSelectLarge = chrome.i18n.getMessage("sizeSelectLarge"),
    sizeSelectExtraLarge = chrome.i18n.getMessage("sizeSelectExtraLarge"),
    searchModeNormal = chrome.i18n.getMessage("searchModeNormal"),
    searchModeRegExp = chrome.i18n.getMessage("searchModeRegExp"),
    searchModeDns = chrome.i18n.getMessage("searchModeDns"),
    noticeNoRibbons = chrome.i18n.getMessage("noticeNoRibbons"),
    buttonClearAll = chrome.i18n.getMessage("buttonClearAll"),
    buttonDisable = chrome.i18n.getMessage("buttonDisable"),
    buttonEnable = chrome.i18n.getMessage("buttonEnable"),
    buttonOptions = chrome.i18n.getMessage("buttonOptions"),
    errorDuplicateMarker = chrome.i18n.getMessage("errorDuplicateMarker"),
    errorLabelEmpty = chrome.i18n.getMessage("errorLabelEmpty"),
    errorUrlEmpty = chrome.i18n.getMessage("errorUrlEmpty"),
    colorPickerUiDialog = chrome.i18n.getMessage("colorPickerUiDialog"),
    colorPickerBtnToggle = chrome.i18n.getMessage("colorPickerBtnToggle"),
    colorPickerBtnSwatch = chrome.i18n.getMessage("colorPickerBtnSwatch"),
    colorPickerBtnLastColor = chrome.i18n.getMessage("colorPickerBtnLastColor"),
    colorPickerBtnSave = chrome.i18n.getMessage("colorPickerBtnSave"),
    colorPickerBtnCancel = chrome.i18n.getMessage("colorPickerBtnCancel"),
    colorPickerBtnClear = chrome.i18n.getMessage("colorPickerBtnClear"),
    colorPickerAriaBtnSave = chrome.i18n.getMessage("colorPickerAriaBtnSave"),
    colorPickerAriaBtnCancel = chrome.i18n.getMessage("colorPickerAriaBtnCancel"),
    colorPickerAriaBtnClear = chrome.i18n.getMessage("colorPickerAriaBtnClear"),
    colorPickerAriaInput = chrome.i18n.getMessage("colorPickerAriaInput"),
    colorPickerAriaPalette = chrome.i18n.getMessage("colorPickerAriaPalette"),
    colorPickerAriaHue = chrome.i18n.getMessage("colorPickerAriaHue"),
    colorPickerAriaOpacity = chrome.i18n.getMessage("colorPickerAriaOpacity"),
    displayAt = chrome.i18n.getMessage("displayAt"),
    ariaLabelEditRibbon = chrome.i18n.getMessage("ariaLabelEditRibbon"),
    ariaLabelDeleteRibbon = chrome.i18n.getMessage("ariaLabelDeleteRibbon"),
    ariaLabelAlertClose = chrome.i18n.getMessage("ariaLabelAlertClose");

let languageCode = chrome.i18n.getUILanguage(),
    pickr = null,
    colorSwatches = [
      'rgba(244, 67,  54, 1)',
      'rgba(233, 30,  99, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(103, 58, 183, 1)',
      'rgba(63,  81, 181, 1)',
      'rgba(33, 150, 243, 1)',
      'rgba(3,  169, 244, 1)'
    ];
const extensionEnabledKey = '__em-enabled__';
const swatchesKey = '__em-swatches__';
const markersKey = '__em-markers__';
const dbVersionKey = '__em-version__';
const searchModeKey = '__em-search-mode__';
const dontSyncMarkerDataKey = '__em-dont-sync-marker-data__';
const maxSwatches = 7;
const hide = 'none';
const show = 'block';
const fontSizeMap = [
  {value: '10', label: '10px'},
  {value: '12', label: '12px'},
  {value: '14', label: '14px'},
  {value: '16', label: '16px'},
  {value: '18', label: '18px'},
];
const positionsMap = [
  {value: 'top-left', label: positionSelectTopLeft},
  {value: 'top-right', label: positionSelectTopRight},
  {value: 'bottom-left', label: positionSelectBottomLeft},
  {value: 'bottom-right', label: positionSelectBottomRight}
];
const sizesMap = [
  {value: 'extra-small', label: sizeSelectExtraSmall},
  {value: 'small', label: sizeSelectSmall},
  {value: 'normal', label: sizeSelectNormal},
  {value: 'large', label: sizeSelectLarge},
  {value: 'extra-large', label: sizeSelectExtraLarge}
];
const searchModeMap = [
  {value: 'normal', label: searchModeNormal},
  {value: 'regexp', label: searchModeRegExp},
  {value: 'dns', label: searchModeDns}
];
Pickr.prototype.getSwatches = function() {
  return this._swatchColors.reduce((arr, swatch) => {
    arr.push(swatch.color.toRGBA().toString(0));
    return arr;
  }, []);
}

Pickr.prototype.setSwatches = function(swatches) {
  if (!swatches.length) return;
  for (let i = this._swatchColors.length - 1; i > -1; i--) {
    this.removeSwatch(i);
  }
  swatches.forEach(swatch => this.addSwatch(swatch));
}

function onError(error) {
  console.log(error);
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

// Gist: https://gist.github.com/TheDistantSea/8021359
// a negative integer iff v1 < v2
// a positive integer iff v1 > v2
function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split('.'),
      v2parts = v2.split('.');
  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }
  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }
  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }
  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }
  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }
    if (v1parts[i] == v2parts[i]) {
      continue;
    }
    else if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    else {
      return -1;
    }
  }
  if (v1parts.length != v2parts.length) {
    return -1;
  }
  return 0;
}

function initialize() {
  chrome.storage.sync.get(dbVersionKey).then((storedResult) => {
    let storedVersion = storedResult[dbVersionKey] || '',
        extensionVersion = chrome.runtime.getManifest().version;

    if (storedVersion === '') {
      // This should process only once for people that have pre v2.3 installed
      // Pre v2.3 did not store the version in the db, therefore it should be empty
      chrome.storage.sync.get(null).then((storedResults) => {
        let storedArray = Object.keys(storedResults);

        if (storedArray.length > 0) {
          let convertedArray = [];
          for (let storedMarker of storedArray) {
            let storeObject = {
              settingUrl: storedMarker,
              settingColor: storedResults[storedMarker][0],
              settingLabel: storedResults[storedMarker][1],
              settingPosition: storedResults[storedMarker][2],
              settingSize: storedResults[storedMarker][3],
              settingFontSize: storedResults[storedMarker][4],
              settingSearchMode: storedResults[storedMarker][5]
            };
            convertedArray.push(storeObject);
          }

          // Initial data conversion for pre v2.3 (old data is cleared before inserting the new format)
          chrome.storage.sync.clear().then(() => {
            chrome.storage.sync.set({ [dontSyncMarkerDataKey]: false }).then(() => {
              let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

              const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

              storage.set({ [markersKey] : convertedArray }).then(() => {
                chrome.storage.sync.set({ [dbVersionKey] : extensionVersion }).then(() => {
                  initializeDisplay();
                }, onError);
              }, onError);
            }, onError);
          });
        } else {
          // No previous markers saved
          chrome.storage.sync.set({ [dbVersionKey] : extensionVersion }).then(() => {
            initializeDisplay();
          }, onError);
        }
      }, onError);
    } else {
      // Version is saved in the db
      if (versionCompare(extensionVersion, storedVersion, {zeroExtend: true}) > 0) {
        // For future updates (when version number increases)
        chrome.storage.sync.set({ [dbVersionKey] : extensionVersion }).then(() => {
          initializeDisplay();
        }, onError);
      } else {
        initializeDisplay();
      }
    }
  }, onError);
}

function initializeDisplay() {
  chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

    storage.get(markersKey).then((storedResults) => {
      let storedArray = storedResults[markersKey] || [];

      if (storedArray.length > 0) {
        $('.setting').remove();
        showOrHideEmptyNotice(hide);

        for (let index in storedArray) {
          displaySetting(
              index,
              storedArray[index].settingUrl,
              storedArray[index].settingColor,
              storedArray[index].settingLabel,
              storedArray[index].settingPosition,
              storedArray[index].settingSize,
              storedArray[index].settingFontSize,
              storedArray[index].settingSearchMode
          );
        }
      } else {
        showOrHideEmptyNotice(show);
      }
    }, onError);
  }, onError);
}

function showOrHideEmptyNotice(action = null) {
  if (action === null) {
    // Only executes on delete
    initializeDisplay();
  } else {
    $('.empty-notice').css('display', action);
  }
}

function saveSwatches(swatches) {
  chrome.storage.sync.set({ [swatchesKey] : swatches }).then(null, onError);
}

/* Show error or success messages */
function showMessage(textMsg, errorFlag = false) {
  let messageClass = errorFlag ? 'alert-danger' : 'alert-success';
  if ($('.alert-dismissible').length) {
    $(".alert-dismissible").alert('close');
  }

  $('.outer-wrapper .message-container').append(
    '<div class="alert ' + messageClass + ' alert-dismissible fade show col-12" role="alert">' + textMsg +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="' + ariaLabelAlertClose + '"></button>' +
    '</div>'
  );

  window.setTimeout(function() {
    $(".alert-dismissible").alert('close');
  }, 3000);
}

/* Search stored array of object for the url */
function searchStoredMarkers(url, storedArray, notIndex = null) {
  if (notIndex) {
    notIndex = Number(notIndex);
  }

  for (let i = 0; i < storedArray.length; i++) {
    if (storedArray[i].settingUrl === url && i !== notIndex) {
      return storedArray[i];
    }
  }
}

/* Add a setting to the display and storage */
function saveSettings() {
  let settingUrl = $('.settings-input #url').val(),
      settingColor = pickr.getSelectedColor().toHEXA().toString(0),
      settingLabel = $('.settings-input #label').val(),
      settingFontSize = $('.settings-input #font-size').val(),
      settingPosition = $('.settings-input #position').val(),
      settingSize = $('.settings-input #size').val(),
      settingSearchMode = $('.settings-input #search-mode').val();

  if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
    chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
      let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

      const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

      storage.get(markersKey).then((storedResults) => {
        let storedArray = storedResults[markersKey] || [],
            objectExists = searchStoredMarkers(settingUrl, storedArray);

        if (!objectExists) {
          if ($('.alert-dismissible').length) {
            $(".alert-dismissible").alert('close');
          }

          // Reset input elements for the next entry
          $('.settings-input #url').val('');
          $('.settings-input #label').val('');
          $('.settings-input #font-size').val('14');
          $('.settings-input #position').val('top-left');
          $('.settings-input #size').val('normal');
          $('.settings-input #search-mode').val('normal');

          storeSetting(storedResults, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode);
        } else {
          // Duplicate marker error message
          showMessage(errorDuplicateMarker, true);
        }
      }, onError);
    }, onError);
  } else {
    // Empty input error message
    settingLabel === '' ? showMessage(errorLabelEmpty, true) : showMessage(errorUrlEmpty, true);
  }
}

/* Store a new setting in local storage */
function storeSetting(storedResults, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode) {
  let storedArray = storedResults[markersKey] || [];
  let storeObject = {
    settingUrl: settingUrl,
    settingColor: settingColor,
    settingLabel: settingLabel,
    settingPosition: settingPosition,
    settingSize: settingSize,
    settingFontSize: settingFontSize,
    settingSearchMode: settingSearchMode
  };

  storedArray.push(storeObject);
  let settingIndex = storedArray.length + 1;

  chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

    storage.set({ [markersKey]: storedArray }).then(() => {
      showOrHideEmptyNotice(hide);
      displaySetting(settingIndex, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode);
    }, onError);
  }, onError);
}

/* Update settings */
function updateSetting(indexEditVal, settingUrl, newSettingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode, replacePrevious) {
  chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

    storage.get(markersKey).then((storedResults) => {
      let storedArray = storedResults[markersKey] || [],
          settingExists = searchStoredMarkers(newSettingUrl, storedArray, indexEditVal);

      indexEditVal = Number(indexEditVal);

      if (!settingExists) {
        let updatedArray = storedArray.filter(function(currentObj, index) {
          if (currentObj.settingUrl === settingUrl && index === indexEditVal) {
            currentObj.settingUrl = newSettingUrl;
            currentObj.settingColor = settingColor;
            currentObj.settingLabel = settingLabel;
            currentObj.settingFontSize = settingFontSize;
            currentObj.settingPosition = settingPosition;
            currentObj.settingSize = settingSize;
            currentObj.settingSearchMode = settingSearchMode;
          }
          return true;
        });

        storage.set({ [markersKey]: updatedArray }).then(() => {
          displaySetting(indexEditVal, newSettingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode, replacePrevious);
        }, onError);
      } else {
        // Duplicate marker error message
        showMessage(errorDuplicateMarker, true);
      }
    }, onError);
  }, onError);
}

function deleteSetting(settingUrl, settingIndex) {
  chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

    storage.get(markersKey).then((storedResults) => {
      let storedArray = storedResults[markersKey] || [],
          settingExists = searchStoredMarkers(settingUrl, storedArray);

      settingIndex = Number(settingIndex);

      if (settingExists) {
        let filteredArray = storedArray.filter(function(currentObj, index) {
          return currentObj.settingUrl !== settingUrl && index !== settingIndex;
        });

        storage.set({ [markersKey]: filteredArray }).then(() => {
          showOrHideEmptyNotice();
        }, onError);
      }
    }, onError);
  }, onError);
}

/* Clear all settings from the display and storage */
function clearAll() {
  $('.settings-container .setting').each((index, element) => {
    $(element).remove();
  });

  chrome.storage.sync.get(dontSyncMarkerDataKey).then((storedResults) => {
    let dontSyncMarkerData = storedResults[dontSyncMarkerDataKey] || false;

    const storage = dontSyncMarkerData ? chrome.storage.local : chrome.storage.sync;

    storage.set({ [markersKey]: [] }).then(() => {
      showOrHideEmptyNotice(show);
    }, onError);
  }, onError);
}

/* Display a setting in the setting box */
function displaySetting(settingIndex, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, settingSearchMode, replacePrevious = null) {
  // For backwards compatibility for users that already have ribbons configured.
  // @TODO: Remove sometime in the future
  let settingFontSizeDisplay = '14px';
  if (settingFontSize !== undefined) {
    settingFontSizeDisplay = fontSizeMap.reduce(function(accumulator, currentValue) {
      if (currentValue.value === settingFontSize) {
        accumulator = currentValue.label;
      }
      return accumulator;
    }, {});
  } else {
    settingFontSize = '14';
  }

  let settingPositionDisplay = positionsMap.reduce(function(accumulator, currentValue) {
    if (currentValue.value === settingPosition) {
      accumulator = currentValue.label;
    }
    return accumulator;
  }, {});

  let settingSearchModeDisplay = searchModeMap.reduce(function(accumulator, currentValue) {
    if (currentValue.value === settingSearchMode) {
      accumulator = currentValue.label;
    }
    return accumulator;
  }, {});

  // For backwards compatibility for users that already have ribbons configured.
  // @TODO: Remove sometime in the future
  let settingSizeDisplay = sizeSelectNormal;
  if (settingSize !== undefined) {
    settingSizeDisplay = sizesMap.reduce(function(accumulator, currentValue) {
      if (currentValue.value === settingSize) {
        accumulator = currentValue.label;
      }
      return accumulator;
    }, {});
  } else {
    settingSize = 'normal';
  }

  let settingUrlDisplay = truncateString(settingUrl, 30),
      settingUrlDisplayEncoded = he.encode(settingUrlDisplay),
      innerSettingsContainer = $("<div/>", { "class": "setting" }),
      displayContainer = $("<div/>", { "class": "my-1 align-items-center display-container" }),
      displayString =
        '<div class="d-flex align-items-center">' +
          '<div class="col-3 align-self-center"><b>' + truncateString(settingLabel, 30) + '</b></div>' +
          '<div class="col-4 align-self-center">' + settingUrlDisplayEncoded + '</div> ' +
          '<div class="col-5 align-self-center">' + settingFontSizeDisplay + ', ' + settingSizeDisplay + ' ' + displayAt + ' ' + settingPositionDisplay + ' ' + settingSearchModeDisplay + '</div> ' +
        '</div>';

  let displayLabelUrl = $( "<div/>", {
    "class": "col-10 display-labelUrl",
    "tabindex": "0",
    "aria-label": ariaLabelEditRibbon,
    "aria-pressed": "false",
    "aria-controls": "edit-container-" + settingIndex,
    html: displayString,
    click: function() {
      displayContainer.hide();
      editContainer.show();
    }
  });

  let displayColor = $( "<div/>", {
    "class": "col-1 display-color",
    "tabindex": "0",
    "aria-label": ariaLabelEditRibbon,
    "aria-pressed": "false",
    "aria-controls": "edit-container-" + settingIndex,
    html: '<div class="display-color-color" style="background-color: ' + settingColor + ';"></div>',
    click: function() {
      displayContainer.hide();
      editContainer.show();
    }
  });

  let deleteBtnContainer = $( "<div/>", {
    "class": "col-1 display-delete"
  });

  let deleteBtn = $( "<button/>", {
    "class": "btn btn-danger btn-sm delete",
    "aria-label": ariaLabelDeleteRibbon,
    html: '<i class="fas fa-trash fa-lg"></i>',
    click: function() {
      $(this).parent().parent().parent().remove();
      deleteSetting(settingUrl, settingIndex);
    }
  });

  let editContainer = $( "<div/>", {
    "class": "my-3 edit-container",
    "id": "edit-container-" + settingIndex,
    "style": "display: none;"
  });

  // First row elements
  let editFirstRow = $( "<div/>", { "class": "d-flex mb-2" });

  let editUrlInputContainer = $( "<div/>", { "class": "w-50 pe-1" });
  let editUrlInput = $( "<input/>", {
    "class": "form-control",
    "placeholder": inputUrlFragmentPlaceholder,
    value: settingUrl
  });

  let editLabelInputContainer = $( "<div/>", { "class": "w-50" });
  let editLabelInput = $( "<input/>", {
    "class": "form-control",
    "placeholder": inputLabelPlaceholder,
    value: settingLabel
  });

  // Second row elements
  let editSecondRow = $( "<div/>", { "class": "d-flex" });

  let editSearchModeContainer = $( "<div/>", { "class": "pe-1" });
  let editSearchMode = $( "<select/>", { "class": "form-select" });
  for (let i = 0; i < searchModeMap.length; i++) {
    if (searchModeMap[i].value === settingSearchMode) {
      editSearchMode.append(new Option(searchModeMap[i].label, searchModeMap[i].value, true, true));
    } else {
      editSearchMode.append(new Option(searchModeMap[i].label, searchModeMap[i].value));
    }
  }

  let editFontSizeContainer = $( "<div/>", { "class": "pe-1" });
  let editFontSize = $( "<select/>", { "class": "form-select" });
  for (let i = 0; i < fontSizeMap.length; i++) {
    if (fontSizeMap[i].value === settingFontSize) {
      editFontSize.append(new Option(fontSizeMap[i].label, fontSizeMap[i].value, true, true));
    } else {
      editFontSize.append(new Option(fontSizeMap[i].label, fontSizeMap[i].value));
    }
  }

  let editPositionContainer = $( "<div/>", { "class": "pe-1" });
  let editPosition = $( "<select/>", { "class": "form-select" });
  for (let i = 0; i < positionsMap.length; i++) {
    if (positionsMap[i].value === settingPosition) {
      editPosition.append(new Option(positionsMap[i].label, positionsMap[i].value, true, true));
    } else {
      editPosition.append(new Option(positionsMap[i].label, positionsMap[i].value));
    }
  }

  let editSizeContainer = $( "<div/>", { "class": "pe-1" });
  let editSize = $( "<select/>", { "class": "form-select" });
  for (let i = 0; i < sizesMap.length; i++) {
    if (sizesMap[i].value === settingSize) {
      editSize.append(new Option(sizesMap[i].label, sizesMap[i].value, true, true));
    } else {
      editSize.append(new Option(sizesMap[i].label, sizesMap[i].value));
    }
  }

  let editColorContainer = $( "<div/>", { "class": "flex-shrink-1 pe-1" });
  let editColorInput = $( "<input/>", {
    "class": "form-control color-picker",
    value: settingColor
  });

  let editButtonContainer = $( "<div/>", { "class": "flex-grow-1" });
  let updateBtn = $( "<button/>", {
    "class": "btn btn-success btn-sm update",
    html: '<i class="fas fa-pencil-alt fa-lg"></i>',
    click: function() {
      let indexEditVal = settingIndex,
          urlEditVal = editUrlInput.val(),
          colorEditVal = editColorInput.val(),
          labelEditVal = editLabelInput.val(),
          fontSizeEditVal = editFontSize.val(),
          positionEditVal = editPosition.val(),
          sizeEditVal = editSize.val(),
          searchModeEditVal = editSearchMode.val();

      if (urlEditVal !== settingUrl ||
          colorEditVal !== settingColor ||
          labelEditVal !== settingLabel ||
          fontSizeEditVal !== settingFontSize ||
          positionEditVal !== settingPosition ||
          sizeEditVal !== settingSize ||
          searchModeEditVal !== settingSearchMode) {
        updateSetting(indexEditVal, settingUrl, urlEditVal, colorEditVal, labelEditVal, positionEditVal, sizeEditVal, fontSizeEditVal, searchModeEditVal, innerSettingsContainer);
      }
    }
  });

  // Assemble first row
  editUrlInputContainer.append(editUrlInput);
  editLabelInputContainer.append(editLabelInput);
  editFirstRow.append(editUrlInputContainer);
  editFirstRow.append(editLabelInputContainer);

  // Assemble second row
  editSearchModeContainer.append(editSearchMode);
  editFontSizeContainer.append(editFontSize);
  editPositionContainer.append(editPosition);
  editSizeContainer.append(editSize);
  editColorContainer.append(editColorInput);
  editButtonContainer.append(updateBtn);

  editSecondRow.append(editSearchModeContainer);
  editSecondRow.append(editFontSizeContainer);
  editSecondRow.append(editPositionContainer);
  editSecondRow.append(editSizeContainer);
  editSecondRow.append(editColorContainer);
  editSecondRow.append(editButtonContainer);

  // Assemble edit container
  editContainer.append(editFirstRow);
  editContainer.append(editSecondRow);

  // Assemble display container
  deleteBtnContainer.append(deleteBtn);
  displayContainer.append(displayLabelUrl);
  displayContainer.append(displayColor);
  displayContainer.append(deleteBtnContainer);

  // Assemble final container
  innerSettingsContainer.append(displayContainer);
  innerSettingsContainer.append(editContainer);

  if (replacePrevious) {
    replacePrevious.replaceWith(innerSettingsContainer);
  } else {
    $('.settings-container').append(innerSettingsContainer);
  }

  // Initialize color picker
  chrome.storage.sync.get(swatchesKey).then((storedSwatchesArray) => {
    if (storedSwatchesArray[swatchesKey]) {
      colorSwatches = storedSwatchesArray[swatchesKey]
    }

    let pickr = Pickr.create({
      el: editColorInput[0],
      theme: 'nano',
      default: settingColor,
      useAsButton: false,
      swatches: colorSwatches,
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: false,
          rgba: false,
          hsla: false,
          hsva: false,
          cmyk: false,
          input: true,
          clear: false,
          save: true
        }
      },
      i18n: {
        'ui:dialog': colorPickerUiDialog,
        'btn:toggle': colorPickerBtnToggle,
        'btn:swatch': colorPickerBtnSwatch,
        'btn:last-color': colorPickerBtnLastColor,
        'btn:save': colorPickerBtnSave,
        'btn:cancel': colorPickerBtnCancel,
        'btn:clear': colorPickerBtnClear,
        'aria:btn:save': colorPickerAriaBtnSave,
        'aria:btn:cancel': colorPickerAriaBtnCancel,
        'aria:btn:clear': colorPickerAriaBtnClear,
        'aria:input': colorPickerAriaInput,
        'aria:palette': colorPickerAriaPalette,
        'aria:hue': colorPickerAriaHue,
        'aria:opacity': colorPickerAriaOpacity
      }
    });

    pickr.on('save', (color, instance) => {
      editColorInput.val(color.toHEXA().toString(0));

      // Add color to the swatch and remove the last color
      let swatchList = pickr.getSwatches();
      let swatchExists = swatchList.includes(color.toRGBA().toString(0));
      if (!swatchExists) {
        if (swatchList.length === maxSwatches) {
          swatchList.pop();
        }
        swatchList.unshift(color.toRGBA().toString(0));
        pickr.setSwatches(swatchList);
        saveSwatches(swatchList);
      }

      instance.hide();
    });

    pickr.on('show', () => {
      chrome.storage.sync.get(swatchesKey).then((storedSwatchesArray) => {
        if (storedSwatchesArray[swatchesKey]) {
          colorSwatches = storedSwatchesArray[swatchesKey]
        }
        pickr.setSwatches(colorSwatches);
      }, onError);
    });
  }, onError);
}

function updateUrlInputPlaceholder(url_input) {
  let searchMode = $('#search-mode').val();
  switch (searchMode) {
    case 'regexp':
      url_input.attr('placeholder', inputUrlFragmentRegExpPlaceholder);
      url_input.attr('aria-label', inputUrlFragmentRegExpPlaceholder);
      break;
    case 'dns':
      url_input.attr('placeholder', inputUrlFragmentDnsPlaceholder);
      url_input.attr('aria-label', inputUrlFragmentDnsPlaceholder);
      break;
    default:
      url_input.attr('placeholder', inputUrlFragmentPlaceholder);
      url_input.attr('aria-label', inputUrlFragmentPlaceholder);
      break;
  }
}


$(document).ready(() => {
  /* Display previously saved markers on startup */
  initialize();

  $('html').attr('lang', languageCode);

  // Check if DNS API is supported
  const isDnsSupported = chrome.dns && chrome.dns.resolve;

  // Only show DNS option if supported
  if (!isDnsSupported) {
    $('#search-mode option[value="dns"]').remove();
  }

  let clearButton = $('.clear'),
      toggleButton = $('.toggle'),
      optionsButton = $('.options');

  $('.save').click(() => {
    saveSettings();
  });

  clearButton.click(() => {
    clearAll();
  });

  optionsButton.click(() => {
    chrome.runtime.openOptionsPage();
  });

  toggleButton.click(() => {
    chrome.storage.sync.get(extensionEnabledKey).then((extensionEnabledValue) => {
      let extensionEnabled = extensionEnabledValue[extensionEnabledKey] === undefined ? true : extensionEnabledValue[extensionEnabledKey];
      chrome.storage.sync.set({ [extensionEnabledKey] : !extensionEnabled }).then(() => {
        let btnLabel = !extensionEnabled ? buttonDisable : buttonEnable;
        toggleButton.html(btnLabel);
        toggleButton.attr('class', `btn btn-sm btn-${!extensionEnabled ? 'danger' : 'success'} toggle`);

        chrome.runtime.sendMessage({cmd: "toggleExtensionOnOff", data: {value: !extensionEnabled}});
      }, onError);
    }, onError);
  });

  chrome.storage.sync.get(extensionEnabledKey).then((extensionEnabledValue) => {
    let extensionEnabled = extensionEnabledValue[extensionEnabledKey] === undefined ? true : extensionEnabledValue[extensionEnabledKey];
    let btnLabel = extensionEnabled ? buttonDisable : buttonEnable;
    toggleButton.html(btnLabel);
    toggleButton.attr('class', `btn btn-sm btn-${extensionEnabled ? 'danger' : 'success'} toggle`);
  }, onError);

  $(document).keydown(function(event) {
    // Enter
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
      saveSettings();
    }

    // Escape
    if (event.key === 'Escape') {
      window.close();
    } else {
      return true;
    }
  });

  chrome.storage.sync.get(swatchesKey).then((storedSwatchesArray) => {
    if (storedSwatchesArray[swatchesKey]) {
      colorSwatches = storedSwatchesArray[swatchesKey]
    }

    pickr = Pickr.create({
      el: '.color-picker',
      theme: 'nano',
      useAsButton: false,
      swatches: colorSwatches,
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: false,
          rgba: false,
          hsla: false,
          hsva: false,
          cmyk: false,
          input: true,
          clear: false,
          save: true
        }
      },
      i18n: {
        'ui:dialog': colorPickerUiDialog,
        'btn:toggle': colorPickerBtnToggle,
        'btn:swatch': colorPickerBtnSwatch,
        'btn:last-color': colorPickerBtnLastColor,
        'btn:save': colorPickerBtnSave,
        'btn:cancel': colorPickerBtnCancel,
        'btn:clear': colorPickerBtnClear,
        'aria:btn:save': colorPickerAriaBtnSave,
        'aria:btn:cancel': colorPickerAriaBtnCancel,
        'aria:btn:clear': colorPickerAriaBtnClear,
        'aria:input': colorPickerAriaInput,
        'aria:palette': colorPickerAriaPalette,
        'aria:hue': colorPickerAriaHue,
        'aria:opacity': colorPickerAriaOpacity
      }
    });

    pickr.on('save', (color, instance) => {
      //$('.settings-input #color').val(color.toHEXA().toString(0));

      // Add color to the swatch and remove the last color
      let swatchList = pickr.getSwatches();
      let swatchExists = swatchList.includes(color.toRGBA().toString(0));
      if (!swatchExists) {
        if (swatchList.length === maxSwatches) {
          swatchList.pop();
        }
        swatchList.unshift(color.toRGBA().toString(0));
        pickr.setSwatches(swatchList);
        saveSwatches(swatchList);
      }

      instance.hide();
    });

    pickr.on('show', () => {
      chrome.storage.sync.get(swatchesKey).then((storedSwatchesArray) => {
        if (storedSwatchesArray[swatchesKey]) {
          colorSwatches = storedSwatchesArray[swatchesKey]
        }
        pickr.setSwatches(colorSwatches);
      }, onError);
    });

    pickr.on('init', (instance) => {
      $('.pcr-button').attr('tabindex', '2');
    });
  }, onError);

  $('.empty-notice').html(noticeNoRibbons);
  clearButton.html(buttonClearAll);
  //toggleButton.html(buttonDisable);
  optionsButton.html(buttonOptions);

  let url_input = $('#url'),
      color_input = $('#color'),
      label_input = $('#label');

  updateUrlInputPlaceholder(url_input);
  // Listen for changes in the search mode
  $('#search-mode').change(() => {
    updateUrlInputPlaceholder(url_input);
  });

  color_input.attr('placeholder', inputColorPlaceholder);
  color_input.attr('aria-label', inputColorPlaceholder);
  label_input.attr('placeholder', inputLabelPlaceholder);
  label_input.attr('aria-label', inputLabelPlaceholder);

  $('#font-size').attr('aria-label', selectFontSizeLabel);
  $('#position').attr('aria-label', selectPositionLabel);
  $('#size').attr('aria-label', selectRibbonSizeLabel);
  $('#save').attr('aria-label', buttonSaveLabel);

  $('#position option[value="top-left"]').html(positionSelectTopLeft);
  $('#position option[value="top-right"]').html(positionSelectTopRight);
  $('#position option[value="bottom-left"]').html(positionSelectBottomLeft);
  $('#position option[value="bottom-right"]').html(positionSelectBottomRight);

  $('#size option[value="extra-small"]').html(sizeSelectExtraSmall);
  $('#size option[value="small"]').html(sizeSelectSmall);
  $('#size option[value="normal"]').html(sizeSelectNormal);
  $('#size option[value="large"]').html(sizeSelectLarge);
  $('#size option[value="extra-large"]').html(sizeSelectExtraLarge);

  $('#search-mode option[value="normal"]').html(searchModeNormal);
  $('#search-mode option[value="regexp"]').html(searchModeRegExp);
  $('#search-mode option[value="dns"]').html(searchModeDns);

  // browser.runtime.getBrowserInfo().then((info) => {
  //   if (info.name === 'Firefox') {
  //     // Enable the option specific to Firefox
  //   } else {
  //     // Enable the option for other browsers
  //   }
  // });
});
