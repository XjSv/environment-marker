let inputUrlFragmentPlaceholder = browser.i18n.getMessage("inputUrlFragmentPlaceholder"),
    inputUrlFragmentRegExpPlaceholder = browser.i18n.getMessage("inputUrlFragmentRegExpPlaceholder"),
    inputColorPlaceholder = browser.i18n.getMessage("inputColorPlaceholder"),
    inputLabelPlaceholder = browser.i18n.getMessage("inputLabelPlaceholder"),
    positionSelectTopLeft = browser.i18n.getMessage("positionSelectTopLeft"),
    positionSelectTopRight = browser.i18n.getMessage("positionSelectTopRight"),
    positionSelectBottomLeft = browser.i18n.getMessage("positionSelectBottomLeft"),
    positionSelectBottomRight = browser.i18n.getMessage("positionSelectBottomRight"),
    sizeSelectExtraSmall = browser.i18n.getMessage("sizeSelectExtraSmall"),
    sizeSelectSmall = browser.i18n.getMessage("sizeSelectSmall"),
    sizeSelectNormal = browser.i18n.getMessage("sizeSelectNormal"),
    sizeSelectLarge = browser.i18n.getMessage("sizeSelectLarge"),
    sizeSelectExtraLarge = browser.i18n.getMessage("sizeSelectExtraLarge"),
    noticeNoRibbons = browser.i18n.getMessage("noticeNoRibbons"),
    buttonClearAll = browser.i18n.getMessage("buttonClearAll"),
    buttonOptions = browser.i18n.getMessage("buttonOptions"),
    errorDuplicateMarker = browser.i18n.getMessage("errorDuplicateMarker"),
    errorLabelEmpty = browser.i18n.getMessage("errorLabelEmpty"),
    errorUrlEmpty = browser.i18n.getMessage("errorUrlEmpty"),
    colorPickerUiDialog = browser.i18n.getMessage("colorPickerUiDialog"),
    colorPickerBtnToggle = browser.i18n.getMessage("colorPickerBtnToggle"),
    colorPickerBtnSwatch = browser.i18n.getMessage("colorPickerBtnSwatch"),
    colorPickerBtnLastColor = browser.i18n.getMessage("colorPickerBtnLastColor"),
    colorPickerBtnSave = browser.i18n.getMessage("colorPickerBtnSave"),
    colorPickerBtnCancel = browser.i18n.getMessage("colorPickerBtnCancel"),
    colorPickerBtnClear = browser.i18n.getMessage("colorPickerBtnClear"),
    colorPickerAriaBtnSave = browser.i18n.getMessage("colorPickerAriaBtnSave"),
    colorPickerAriaBtnCancel = browser.i18n.getMessage("colorPickerAriaBtnCancel"),
    colorPickerAriaBtnClear = browser.i18n.getMessage("colorPickerAriaBtnClear"),
    colorPickerAriaInput = browser.i18n.getMessage("colorPickerAriaInput"),
    colorPickerAriaPalette = browser.i18n.getMessage("colorPickerAriaPalette"),
    colorPickerAriaHue = browser.i18n.getMessage("colorPickerAriaHue"),
    colorPickerAriaOpacity = browser.i18n.getMessage("colorPickerAriaOpacity"),
    displayAt = browser.i18n.getMessage("displayAt"),
    ariaLabelAlertClose = browser.i18n.getMessage("ariaLabelAlertClose");

let languageCode = browser.i18n.getUILanguage(),
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
const swatchesKey = '__em-swatches__';
const markersKey = '__em-markers__';
const dbVersionKey = '__em-version__';
const searchModeKey = '__em-search-mode__';
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

Pickr.prototype.getSwatches = function() {
  return this._swatchColors.reduce((arr, swatch) => {
    arr.push(swatch.color.toRGBA().toString(0));
    return arr
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
    return str
  }
  return str.slice(0, num) + '...'
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
  browser.storage.local.get(dbVersionKey).then((storedResult) => {
    let storedVersion = storedResult[dbVersionKey] || '',
        extensionVersion = browser.runtime.getManifest().version;

    if (storedVersion === '') {
      // This should process only once for people that have pre v2.3 installed
      // Pre v2.3 did not store the version in the db, therefore it should be empty
      browser.storage.local.get(null).then((storedResults) => {
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
              settingFontSize: storedResults[storedMarker][4]
            };
            convertedArray.push(storeObject);
          }

          // Initial data conversion for pre v2.3 (old data is cleared before inserting the new format)
          browser.storage.local.clear().then(() => {
            browser.storage.local.set({ [markersKey] : convertedArray }).then(() => {
              browser.storage.local.set({ [dbVersionKey] : extensionVersion }).then(() => {
                initializeDisplay();
              }, onError);
            }, onError);
          });
        } else {
          // No previous markers saved
          browser.storage.local.set({ [dbVersionKey] : extensionVersion }).then(() => {
            initializeDisplay();
          }, onError);
        }
      }, onError);
    } else {
      // Version is saved in the db
      //if (versionCompare(extensionVersion, storedVersion, {zeroExtend: true}) > 0) {
        // For future updates (when version number increases)
      //}
      initializeDisplay();
    }
  }, onError);
}

function initializeDisplay() {
  browser.storage.local.get(markersKey).then((storedResults) => {
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
            storedArray[index].settingFontSize
        );
      }
    } else {
      showOrHideEmptyNotice(show);
    }
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
  browser.storage.local.set({ [swatchesKey] : swatches }).then(null, onError);
}

/* Show error or success messages */
function showMessage(textMsg, errorFlag = false) {
  let messageClass = errorFlag ? 'alert-danger' : 'alert-success';
  if ($('.alert-dismissible').length) {
    $(".alert-dismissible").alert('close');
  }

  $('.outer-wrapper .message-container').append(
    '<div class="alert ' + messageClass + ' alert-dismissible fade show col-12" role="alert">' + textMsg +
    '<button type="button" class="close" data-dismiss="alert" aria-label="' + ariaLabelAlertClose + '">' +
    '<span aria-hidden="true">&times;</span></button></div>'
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
      settingSize = $('.settings-input #size').val();

  if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
    browser.storage.local.get(markersKey).then((storedResults) => {
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

        storeSetting(storedResults, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize);
      } else {
        // Duplicate marker error message
        showMessage(errorDuplicateMarker, true);
      }
    }, onError);
  } else {
    // Empty input error message
    settingLabel === '' ? showMessage(errorLabelEmpty, true) : showMessage(errorUrlEmpty, true);
  }
}

/* Store a new setting in local storage */
function storeSetting(storedResults, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize) {
  let storedArray = storedResults[markersKey] || [];
  let storeObject = {
    settingUrl: settingUrl,
    settingColor: settingColor,
    settingLabel: settingLabel,
    settingPosition: settingPosition,
    settingSize: settingSize,
    settingFontSize: settingFontSize
  };

  storedArray.push(storeObject);
  let settingIndex =  storedArray.length + 1;

  browser.storage.local.set({ [markersKey] : storedArray }).then(() => {
    showOrHideEmptyNotice(hide);
    displaySetting(settingIndex, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize);
  }, onError);
}

/* Update settings */
function updateSetting(indexEditVal, settingUrl, newSettingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, replacePrevious) {
  browser.storage.local.get(markersKey).then((storedResults) => {
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
        }
        return true;
      });

      // Save in DB
      browser.storage.local.set({ [markersKey] : updatedArray }).then(() => {
        displaySetting(indexEditVal, newSettingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, replacePrevious);
      }, onError);
    } else {
      // Duplicate marker error message
      showMessage(errorDuplicateMarker, true);
    }
  }, onError);
}

function deleteSetting(settingUrl, settingIndex) {
  browser.storage.local.get(markersKey).then((storedResults) => {
    let storedArray = storedResults[markersKey] || [],
        settingExists = searchStoredMarkers(settingUrl, storedArray);

    settingIndex = Number(settingIndex);

    if (settingExists) {
      let filteredArray = storedArray.filter(function(currentObj, index) {
        return currentObj.settingUrl !== settingUrl && index !== settingIndex;
      });

      browser.storage.local.set({ [markersKey] : filteredArray }).then(() => {
        showOrHideEmptyNotice();
      }, onError);
    }
  }, onError);
}

/* Clear all settings from the display and storage */
function clearAll() {
  $('.settings-container .setting').each((index, element) => {
    $(element).remove();
  });
  browser.storage.local.set({ [markersKey] : [] }).then(null, onError);
  showOrHideEmptyNotice(show);
}

/* Display a setting in the setting box */
function displaySetting(settingIndex, settingUrl, settingColor, settingLabel, settingPosition, settingSize, settingFontSize, replacePrevious = null) {
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
      innerSettingsContainer = $( "<div/>", { "class": "setting" }),
      displayContainer = $( "<div/>", { "class": "row no-gutters my-1 align-items-center display-container" }),
      displayString =
        '<div class="row d-flex align-items-center">' +
          '<div class="col-3 align-self-center"><b>' + truncateString(settingLabel, 30) + '</b></div>' +
          '<div class="col-4 align-self-center">' + settingUrlDisplayEncoded + '</div> ' +
          '<div class="col-5 align-self-center">' + settingFontSizeDisplay + ', ' + settingSizeDisplay + ' ' + displayAt + ' ' + settingPositionDisplay + '</div> ' +
        '</div>';

  let displayLabelUrl = $( "<div/>", {
    "class": "col-10 display-labelUrl",
    html: displayString,
    click: function() {
      displayContainer.hide();
      editContainer.show();
    }
  });

  let displayColor = $( "<div/>", {
    "class": "col-1 display-color",
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
    html: '<i class="fas fa-trash fa-lg"></i>',
    click: function() {
      $(this).parent().parent().parent().remove();
      deleteSetting(settingUrl, settingIndex);
    }
  });

  let editContainer = $( "<div/>", {
    "class": "row no-gutters my-3 edit-container",
    "style": "display: none;"
  });

  let editUrlInputContainer = $( "<div/>", {
    "class": "col-10 pr-1 mb-2 edit-url-container"
  });

  let editUrlInput = $( "<input/>", {
    "class": "form-control edit-url",
    "placeholder": inputUrlFragmentPlaceholder,
    value: settingUrl
  });

  let editIndexHiddenInput = $( "<input/>", {
    type: "hidden",
    value: settingIndex
  });

  let editColorInputContainer = $( "<div/>", {
    "class": "col-1 pr-1 mb-2 edit-color"
  });

  let editColorInput = $( "<input/>", {
    "class": "color-picker",
    value: settingColor
  });

  let editLabelInputContainer = $( "<div/>", {
    "class": "col-3 pr-2 edit-label-container"
  });

  let editLabelInput = $( "<input/>", {
    "class": "form-control edit-label",
    "placeholder": inputLabelPlaceholder,
    value: settingLabel
  });

  let optionsSelectFontSizeContainer = $( "<div/>", {
    "class": "col-2 pr-2 edit-font-size-container"
  });

  let optionsSelectFontSize = $( "<select/>", {
    "class": "form-control edit-font-size"
  });

  for (let i = 0; i < fontSizeMap.length; i++) {
    if (fontSizeMap[i].value === settingFontSize) {
      optionsSelectFontSize.append(new Option(fontSizeMap[i].label, fontSizeMap[i].value, true, true));
    } else {
      optionsSelectFontSize.append(new Option(fontSizeMap[i].label, fontSizeMap[i].value));
    }
  }

  let optionsSelectPositionContainer = $( "<div/>", {
    "class": "col-3 edit-position-container"
  });

  let optionsSelectPosition = $( "<select/>", {
    "class": "form-control edit-position"
  });

  for (let i = 0; i < positionsMap.length; i++) {
    if (positionsMap[i].value === settingPosition) {
      optionsSelectPosition.append(new Option(positionsMap[i].label, positionsMap[i].value, true, true));
    } else {
      optionsSelectPosition.append(new Option(positionsMap[i].label, positionsMap[i].value));
    }
  }

  let optionsSelectSizeContainer = $( "<div/>", {
    "class": "col-3 pr-2 edit-size-container"
  });

  let optionsSelectSize = $( "<select/>", {
    "class": "form-control edit-size"
  });

  for (let i = 0; i < sizesMap.length; i++) {
    if (sizesMap[i].value === settingSize) {
      optionsSelectSize.append(new Option(sizesMap[i].label, sizesMap[i].value, true, true));
    } else {
      optionsSelectSize.append(new Option(sizesMap[i].label, sizesMap[i].value));
    }
  }

  let updateBtnContainer = $( "<div/>", {
    "class": "col-1 mb-2 edit-delete"
  });

  let updateBtn = $( "<button/>", {
    "class": "btn btn-success btn-sm update",
    html: '<i class="fas fa-pencil-alt fa-lg"></i>',
    click: function() {
      let indexEditVal = editIndexHiddenInput.val(),
          urlEditVal = editUrlInput.val(),
          colorEditVal = editColorInput.val(),
          labelEditVal = editLabelInput.val(),
          fontSizeEditVal = optionsSelectFontSize.val(),
          positionEditVal = optionsSelectPosition.val(),
          sizeEditVal = optionsSelectSize.val();

      if (urlEditVal !== settingUrl ||
          colorEditVal !== settingColor ||
          labelEditVal !== settingLabel ||
          fontSizeEditVal !== settingFontSize ||
          positionEditVal !== settingPosition ||
          sizeEditVal !== settingSize) {
        updateSetting(indexEditVal, settingUrl, urlEditVal, colorEditVal, labelEditVal, positionEditVal, sizeEditVal, fontSizeEditVal, innerSettingsContainer);
      }
    }
  });

  let cancelBtnContainer = $( "<div/>", {
    "class": "col-1 edit-cancel"
  });

  let cancelBtn = $( "<button/>", {
    "class": "btn btn-secondary btn-sm cancel",
    html: '<i class="fas fa-times fa-lg"></i>',
    click: function() {
      displayContainer.show();
      editContainer.hide();
      editUrlInput.val(settingUrl);
      editColorInput.val(settingColor);
      editLabelInput.val(settingLabel);
      optionsSelectPosition.val(settingPosition);
      optionsSelectSize.val(settingSize);
      optionsSelectFontSize.val(settingFontSize);
    }
  });

  editUrlInputContainer.append(editUrlInput);
  editUrlInputContainer.append(editIndexHiddenInput);
  editColorInputContainer.append(editColorInput);
  optionsSelectFontSizeContainer.append(optionsSelectFontSize);
  optionsSelectPositionContainer.append(optionsSelectPosition);
  optionsSelectSizeContainer.append(optionsSelectSize);
  updateBtnContainer.append(updateBtn);
  editLabelInputContainer.append(editLabelInput);
  cancelBtnContainer.append(cancelBtn);

  editContainer.append(editUrlInputContainer);
  editContainer.append(editColorInputContainer);
  editContainer.append(updateBtnContainer);
  editContainer.append(editLabelInputContainer);
  editContainer.append(optionsSelectFontSizeContainer);
  editContainer.append(optionsSelectPositionContainer);
  editContainer.append(optionsSelectSizeContainer);
  editContainer.append(cancelBtnContainer);

  deleteBtnContainer.append(deleteBtn);

  displayContainer.append(displayLabelUrl);
  displayContainer.append(displayColor);
  displayContainer.append(deleteBtnContainer);

  innerSettingsContainer.append(displayContainer);
  innerSettingsContainer.append(editContainer);

  if (replacePrevious) {
    replacePrevious.replaceWith(innerSettingsContainer);
  } else {
    $('.settings-container').append(innerSettingsContainer);
  }

  browser.storage.local.get(swatchesKey).then((storedSwatchesArray) => {
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
      browser.storage.local.get(swatchesKey).then((storedSwatchesArray) => {
        if (storedSwatchesArray[swatchesKey]) {
          colorSwatches = storedSwatchesArray[swatchesKey]
        }
        pickr.setSwatches(colorSwatches);
      }, onError);
    });
  }, onError);
}

$(document).ready(() => {
  /* Display previously saved markers on startup */
  initialize();

  $('html').attr('lang', languageCode);

  let clearButton = $('.clear'),
      optionsButton = $('.options');

  $('.save').click(() => {
    saveSettings();
  });

  clearButton.click(() => {
    clearAll();
  });

  optionsButton.click(() => {
    browser.runtime.openOptionsPage();
  });

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

  browser.storage.local.get(swatchesKey).then((storedSwatchesArray) => {
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
      browser.storage.local.get(swatchesKey).then((storedSwatchesArray) => {
        if (storedSwatchesArray[swatchesKey]) {
          colorSwatches = storedSwatchesArray[swatchesKey]
        }
        pickr.setSwatches(colorSwatches);
      }, onError);
    });

    pickr.on('init', instance => {
      $('.pcr-button').attr('tabindex', '2');
    });
  }, onError);

  $('.empty-notice').html(noticeNoRibbons);
  clearButton.html(buttonClearAll);
  optionsButton.html(buttonOptions);

  browser.storage.local.get(searchModeKey).then((storedSearchMode) => {
    let searchModeRegExp = storedSearchMode[searchModeKey] || false;
    if (searchModeRegExp) {
      $('#url').attr('placeholder', inputUrlFragmentRegExpPlaceholder);
    } else {
      $('#url').attr('placeholder', inputUrlFragmentPlaceholder);
    }
  });

  $('#color').attr('placeholder', inputColorPlaceholder);
  $('#label').attr('placeholder', inputLabelPlaceholder);

  $('#position option[value="top-left"]').html(positionSelectTopLeft);
  $('#position option[value="top-right"]').html(positionSelectTopRight);
  $('#position option[value="bottom-left"]').html(positionSelectBottomLeft);
  $('#position option[value="bottom-right"]').html(positionSelectBottomRight);

  $('#size option[value="extra-small"]').html(sizeSelectExtraSmall);
  $('#size option[value="small"]').html(sizeSelectSmall);
  $('#size option[value="normal"]').html(sizeSelectNormal);
  $('#size option[value="large"]').html(sizeSelectLarge);
  $('#size option[value="extra-large"]').html(sizeSelectExtraLarge);
});
