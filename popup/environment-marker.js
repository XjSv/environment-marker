const hide = 'none';
const show = 'block';
const positionsMap = [
  {value: 'top-left', label: 'Top Left'},
  {value: 'top-right', label: 'Top Right'},
  {value: 'bottom-left', label: 'Bottom Left'},
  {value: 'bottom-right', label: 'Bottom Right'}
];
let pickr = null;

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
      displaySetting(settingUrl, results[settingUrl][0], results[settingUrl][1], results[settingUrl][2]);
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
function showErrorMessage(textMsg) {
  if ($('.outer-wrapper .message-container .error').length) {
    $('.outer-wrapper .message-container .error').remove();
    $('.outer-wrapper .message-container').append('<div class="error col-12">' + textMsg + '</div>');
  } else {
    $('.outer-wrapper .message-container').append('<div class="error col-12">' + textMsg + '</div>');
  }
}

/* Add a setting to the display and storage */
function saveSettings() {
  let settingUrl = $('.settings-input #url').val(),
      settingColor = pickr.getSelectedColor().toHEXA().toString(0),
      settingLabel = $('.settings-input #label').val(),
      settingPosition = $('.settings-input #position').val();

  if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
    browser.storage.local.get(settingUrl).then((result) => {
      let objTest = Object.keys(result);

      if (objTest.length < 1) {
        if ($('.outer-wrapper .message-container .error').length) {
          $('.outer-wrapper .message-container .error').remove();
        }

        $('.settings-input #url').val('');
        $('.settings-input #label').val('');
        $('.settings-input #position').val('top-left');

        storeSetting(settingUrl, settingColor, settingLabel, settingPosition);
      } else {
        // Duplicate marker error message
        showErrorMessage('Marker for this URL already exists!');
      }
    }, onError);
  } else {
    // Empty input error message
    settingLabel === '' ? showErrorMessage('Enter Label !') : showErrorMessage('Enter URL !');
  }
}

/* Store a new setting in local storage */
function storeSetting(settingUrl, settingColor, settingLabel, settingPosition) {
  browser.storage.local.set({ [settingUrl] : [settingColor, settingLabel, settingPosition] }).then(() => {
    showOrHideEmptyNotice(hide);
    displaySetting(settingUrl, settingColor, settingLabel, settingPosition);
  }, onError);
}

/* Display a setting in the setting box */
function displaySetting(settingUrl, settingColor, settingLabel, settingPosition) {
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

  let updateBtnContainer = $( "<div/>", {
    "class": "col-1 mb-2 edit-delete"
  });

  let updateBtn = $( "<button/>", {
    "class": "btn btn-success btn-sm update",
    html: '<i class="fas fa-pencil-alt fa-lg"></i>',
    click: function() {
      let urlEditVal = editUrlInput.val();
      let colorEditVal = editColorInput.val();
      let labelEditVal = editLabelInput.val();
      let positionEditVal = optionsSelect.val();

      if (urlEditVal !== settingUrl || colorEditVal !== settingColor || labelEditVal !== settingLabel || positionEditVal !== settingPosition) {
        updateSetting(settingUrl, urlEditVal, colorEditVal, labelEditVal, positionEditVal);
        innerSettingsContainer.remove();
      }
    }
  });

  let editLabelInputContainer = $( "<div/>", {
    "class": "col-6 pr-2 edit-label-container"
  });

  let editLabelInput = $( "<input/>", {
    "class": "form-control edit-label",
    value: settingLabel
  });

  let optionsSelectContainer = $( "<div/>", {
    "class": "col-5 pr-2 edit-position-container"
  });

  let optionsSelect = $( "<select/>", {
    "class": "form-control edit-position"
  });

  for (let i = 0; i < positionsMap.length; i++) {
    if (positionsMap[i].value === settingPosition) {
      optionsSelect.append(new Option(positionsMap[i].label, positionsMap[i].value, true, true));
    } else {
      optionsSelect.append(new Option(positionsMap[i].label, positionsMap[i].value));
    }
  }

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
      optionsSelect.val(settingPosition);
    }
  });

  editUrlInputContainer.append(editUrlInput);
  editColorInputContainer.append(editColorInput);
  optionsSelectContainer.append(optionsSelect);
  updateBtnContainer.append(updateBtn);
  editLabelInputContainer.append(editLabelInput);
  cancelBtnContainer.append(cancelBtn);

  editContainer.append(editUrlInputContainer);
  editContainer.append(editColorInputContainer);
  editContainer.append(updateBtnContainer);
  editContainer.append(editLabelInputContainer);
  editContainer.append(optionsSelectContainer);
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
    }
  });

  pickr.on('save', (color, instance) => {
    editColorInput.val(color.toHEXA().toString(0));
    instance.hide();
  });
}

/* Update settings */
function updateSetting(settingUrl, newSettingUrl, settingColor, settingLabel, settingPosition) {
  browser.storage.local.set({ [newSettingUrl] : [settingColor, settingLabel, settingPosition] }).then(() => {
    if (settingUrl !== newSettingUrl) {
      // Changed URL
      browser.storage.local.remove(settingUrl).then(() => {
        displaySetting(newSettingUrl, settingColor, settingLabel, settingPosition);
      }, onError);
    } else {
      // Change settings
      displaySetting(newSettingUrl, settingColor, settingLabel, settingPosition);
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
    }
  });

  pickr.on('save', (color, instance) => {
    //$('.settings-input #color').val(color.toHEXA().toString(0));
    instance.hide();
  });
});
