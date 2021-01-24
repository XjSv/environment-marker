let inputUrlFragmentPlaceholder = browser.i18n.getMessage("inputUrlFragmentPlaceholder"),
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
    buttonImportExport = browser.i18n.getMessage("buttonImportExport"),
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
    colorPickerAriaOpacity = browser.i18n.getMessage("colorPickerAriaOpacity");

let pickr = null;
const hide = 'none';
const show = 'block';
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

function onError(error) {
  console.log(error);
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

function initialize() {
  browser.storage.local.get(null).then((results) => {
    let settingsUrls = Object.keys(results);
    settingsUrls.length > 0 ? showOrHideEmptyNotice(hide) : showOrHideEmptyNotice(show);
    for (let settingUrl of settingsUrls) {
      displaySetting(settingUrl, results[settingUrl][0], results[settingUrl][1], results[settingUrl][2], results[settingUrl][3]);
    }
  }, onError);
}

function showOrHideEmptyNotice(action = null) {
  if (action !== show && action !== hide) {
    browser.storage.local.get(null).then((results) => {
      let settingsUrls = Object.keys(results);
      $('.empty-notice').css('display', settingsUrls.length > 0 ? 'none' : 'block');
    }, onError);
  } else {
    $('.empty-notice').css('display', action);
  }
}

/* Show error message */
function showMessage(textMsg, errorFlag = false) {
  let messageClass = errorFlag ? 'alert-danger' : 'alert-success';
  if ($('.outer-wrapper .message-container .alert').length) {
    $('.outer-wrapper .message-container .alert').remove();
    $('.outer-wrapper .message-container').append('<div class="alert ' + messageClass + ' col-12">' + textMsg + '</div>');
  } else {
    $('.outer-wrapper .message-container').append('<div class="alert ' + messageClass + ' col-12">' + textMsg + '</div>');
  }
}

/* Add a setting to the display and storage */
function saveSettings() {
  let settingUrl = $('.settings-input #url').val(),
      settingColor = pickr.getSelectedColor().toHEXA().toString(0),
      settingLabel = $('.settings-input #label').val(),
      settingPosition = $('.settings-input #position').val(),
      settingSize = $('.settings-input #size').val();

  if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
    browser.storage.local.get(settingUrl).then((result) => {
      let objTest = Object.keys(result);

      if (objTest.length < 1) {
        if ($('.outer-wrapper .message-container .alert').length) {
          $('.outer-wrapper .message-container .alert').remove();
        }

        $('.settings-input #url').val('');
        $('.settings-input #label').val('');
        $('.settings-input #position').val('top-left');
        $('.settings-input #size').val('normal');

        storeSetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize);
      } else {
        // Duplicate marker error message
        showMessage(errorDuplicateMarker);
      }
    }, onError);
  } else {
    // Empty input error message
    settingLabel === '' ? showMessage(errorLabelEmpty) : showMessage(errorUrlEmpty);
  }
}

/* Store a new setting in local storage */
function storeSetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize) {
  browser.storage.local.set({ [settingUrl] : [settingColor, settingLabel, settingPosition, settingSize] }).then(() => {
    showOrHideEmptyNotice(hide);
    displaySetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize);
  }, onError);
}

/* Display a setting in the setting box */
function displaySetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize) {
  let settingPositionDisplay = positionsMap.reduce(function(accumulator, currentValue) {
    if (currentValue.value == settingPosition) {
      accumulator = currentValue.label;
    }
    return accumulator;
  }, {});

  let innerSettingsContainer = $( "<div/>", { "class": "setting" });
  let displayContainer = $( "<div/>", { "class": "row no-gutters mb-2 display-container" });

  let displayLabelUrl = $( "<div/>", {
    "class": "col-10 pr-2 display-labelUrl",
    text: truncateString(settingLabel, 35) + ' (' + truncateString(settingUrl, 35) + ') at ' + settingPositionDisplay,
    click: function() {
      displayContainer.hide();
      editContainer.show();
    }
  });

  let displayColor = $( "<div/>", {
    "class": "col-1 pr-2 display-color",
    html: '<div style="background-color: ' + settingColor + ';"></div>',
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
      browser.storage.local.remove(settingUrl);
      showOrHideEmptyNotice();
    }
  });

  let editContainer = $( "<div/>", {
    "class": "row no-gutters mb-2 edit-container",
    "style": "display: none;"
  });

  let editUrlInputContainer = $( "<div/>", {
    "class": "col-10 pr-1 mb-2 edit-url-container"
  });

  let editUrlInput = $( "<input/>", {
    "class": "form-control edit-url",
    value: settingUrl
  });

  let editColorInputContainer = $( "<div/>", {
    "class": "col-1 pr-1 mb-2 edit-color"
  });

  let editColorInput = $( "<input/>", {
    "class": "color-picker",
    value: settingColor
  });

  let editLabelInputContainer = $( "<div/>", {
    "class": "col-5 pr-2 edit-label-container"
  });

  let editLabelInput = $( "<input/>", {
    "class": "form-control edit-label",
    value: settingLabel
  });

  let optionsSelectPositionContainer = $( "<div/>", {
    "class": "col-3 pr-2 edit-position-container"
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
    // For backwards compatibility for users that already have ribbons configured.
    // @TODO: Remove sometime in the future
    if (settingSize === undefined) {
      settingSize = 'normal'
    }

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
      let urlEditVal = editUrlInput.val(),
          colorEditVal = editColorInput.val(),
          labelEditVal = editLabelInput.val(),
          positionEditVal = optionsSelectPosition.val(),
          sizeEditVal = optionsSelectSize.val();

      if (urlEditVal !== settingUrl ||
          colorEditVal !== settingColor ||
          labelEditVal !== settingLabel ||
          positionEditVal !== settingPosition ||
          sizeEditVal !== settingSize) {
        updateSetting(settingUrl, urlEditVal, colorEditVal, labelEditVal, positionEditVal, sizeEditVal);
        innerSettingsContainer.remove();
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
    }
  });

  editUrlInputContainer.append(editUrlInput);
  editColorInputContainer.append(editColorInput);
  optionsSelectPositionContainer.append(optionsSelectPosition);
  optionsSelectSizeContainer.append(optionsSelectSize);
  updateBtnContainer.append(updateBtn);
  editLabelInputContainer.append(editLabelInput);
  cancelBtnContainer.append(cancelBtn);

  editContainer.append(editUrlInputContainer);
  editContainer.append(editColorInputContainer);
  editContainer.append(updateBtnContainer);
  editContainer.append(editLabelInputContainer);
  editContainer.append(optionsSelectPositionContainer);
  editContainer.append(optionsSelectSizeContainer);
  editContainer.append(cancelBtnContainer);

  deleteBtnContainer.append(deleteBtn);

  displayContainer.append(displayLabelUrl);
  displayContainer.append(displayColor);
  displayContainer.append(deleteBtnContainer);

  innerSettingsContainer.append(displayContainer);
  innerSettingsContainer.append(editContainer);

  $('.settings-container').append(innerSettingsContainer);

  let pickr = Pickr.create({
    el: editColorInput[0],
    theme: 'nano',
    default: settingColor,
    useAsButton: false,
    swatches: [
      'rgba(244, 67,  54, 1)',
      'rgba(233, 30,  99, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(103, 58, 183, 1)',
      'rgba(63,  81, 181, 1)',
      'rgba(33, 150, 243, 1)',
      'rgba(3,  169, 244, 1)'
    ],
    components: {
      preview: true,
      opacity: false,
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
    instance.hide();
  });
}

/* Update settings */
function updateSetting(settingUrl, newSettingUrl, settingColor, settingLabel, settingPosition, settingSize) {
  browser.storage.local.set({ [newSettingUrl] : [settingColor, settingLabel, settingPosition, settingSize] }).then(() => {
    if (settingUrl !== newSettingUrl) {
      // Changed URL
      browser.storage.local.remove(settingUrl).then(() => {
        displaySetting(newSettingUrl, settingColor, settingLabel, settingPosition, settingSize);
      }, onError);
    } else {
      // Change settings
      displaySetting(newSettingUrl, settingColor, settingLabel, settingPosition, settingSize);
    }
  }, onError);
}

/* Clear all settings from the display and storage */
function clearAll() {
  $('.settings-container .setting').each((index, element) => {
    element.remove();
  });
  browser.storage.local.clear();
  showOrHideEmptyNotice(show);
}

$(document).ready(() => {
  /* Display previously saved markers on startup */
  initialize();

  $('.save').click(() => {
    saveSettings();
  });

  $('.clear').click(() => {
    clearAll();
  });

  $('.import-export').click(() => {
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

  pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano',
    useAsButton: false,
    swatches: [
      'rgba(244, 67,  54, 1)',
      'rgba(233, 30,  99, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(103, 58, 183, 1)',
      'rgba(63,  81, 181, 1)',
      'rgba(33, 150, 243, 1)',
      'rgba(3,  169, 244, 1)'
    ],
    components: {
      preview: true,
      opacity: false,
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
    instance.hide();
  });

  $('.empty-notice').html(noticeNoRibbons);
  $('.clear').html(buttonClearAll);
  $('.import-export').html(buttonImportExport);

  $('#url').attr('placeholder', inputUrlFragmentPlaceholder);
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
