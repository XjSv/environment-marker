/* Inititalise constant */
const hide = 'none';
const show = 'block';
const positionsMap = [
  {value: 'top-left', label: 'Top Left'},
  {value: 'top-right', label: 'Top Right'},
  {value: 'bottom-left', label: 'Bottom Left'},
  {value: 'bottom-right', label: 'Bottom Right'}
];

/* Initialise variables */
let urlInput = document.querySelector('.settings-input #url'),
    colorInput = document.querySelector('.settings-input #color'),
    positionInput = document.querySelector('.settings-input #position'),
    settingsContainer = document.querySelector('.settings-container'),
    labelInput = document.querySelector('.settings-input #label'),
    clearBtn = document.querySelector('.clear'),
    saveBtn = document.querySelector('.save'),
    emptyNotice = document.querySelector('.empty-notice');

/* Add event listeners to buttons */
saveBtn.addEventListener('click', saveSettings);
clearBtn.addEventListener('click', clearAll);

document.onkeydown = (event) => {
  let keyCode = event.key;

  // Enter
  if (keyCode === 'Enter' || keyCode === 'NumpadEnter') {
    saveSettings();
  }

  // Escape
  if (keyCode === 'Escape') {
    window.close();
  } else {
    return true;
  }
};

/* Generic error handler */
function onError(error) {
  console.log(error);
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

/* Display previously saved markers on startup */
initialize();

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
      emptyNotice.style.display = settingsUrls.length > 0 ? 'none' : 'block';
    }, onError);
  } else {
    emptyNotice.style.display = action;
  }
}

/* Show error message */
function showErrorMessage(textMsg) {
  let messageContainer = document.querySelector('.outer-wrapper .message-container'),
      existingErrorMessage = document.querySelector('.outer-wrapper .message-container .error'),
      errorMessage = document.createElement('div');

  errorMessage.textContent = textMsg;
  errorMessage.setAttribute('class', 'error');

  if (existingErrorMessage !== null) {
    messageContainer.replaceChild(errorMessage, existingErrorMessage);
  } else {
    messageContainer.appendChild(errorMessage);
  }
}

/* Add a setting to the display and storage */
function saveSettings() {
  let settingUrl = urlInput.value,
      settingColor = colorInput.value,
      settingLabel = labelInput.value,
      settingPosition = positionInput.value;

  if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
    browser.storage.local.get(settingUrl).then((result) => {
      let objTest = Object.keys(result);

      if (objTest.length < 1) {
        let existingErrorMessage = document.querySelector('.outer-wrapper .message-container .error');
        if (existingErrorMessage !== null) {
          existingErrorMessage.remove();
        }
        urlInput.value = '';
        labelInput.value = '';
        positionInput.value = 'top-left';
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
  /* Create setting display box */
  let settingContainer = document.createElement('div'),
      settingDisplay = document.createElement('div'),
      settingLabelUrlPositionDiv = document.createElement('div'),
      settingColorDiv = document.createElement('div'),
      deleteBtn = document.createElement('button'),
      clearFix = document.createElement('div'),
      settingColorDivBg = document.createElement('div');

  let settingPositionDisplay = positionsMap.reduce(function(accumulator, currentValue) {
    if (currentValue.value == settingPosition) {
      accumulator = currentValue.label;
    }

    return accumulator;
  }, {});

  settingContainer.setAttribute('class', 'setting');
  settingLabelUrlPositionDiv.setAttribute('class', 'display-labelUrl');
  settingColorDiv.setAttribute('class', 'display-color');
  settingColorDivBg.style.backgroundColor = settingColor;

  settingLabelUrlPositionDiv.textContent = settingLabel + ' (' + settingUrl + ') at ' + settingPositionDisplay;
  settingColorDiv.appendChild(settingColorDivBg);
  deleteBtn.setAttribute('class', 'delete');
  deleteBtn.innerHTML = '<i class="fas fa-trash fa-lg"></i>';
  clearFix.setAttribute('class', 'clearfix');

  settingDisplay.appendChild(settingLabelUrlPositionDiv);
  settingDisplay.appendChild(settingColorDiv);
  settingDisplay.appendChild(deleteBtn);
  settingDisplay.appendChild(clearFix);

  settingContainer.appendChild(settingDisplay);

  /* Add listener for the delete functionality */
  deleteBtn.addEventListener('click', (e) => {
    let evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
    browser.storage.local.remove(settingUrl);
    showOrHideEmptyNotice();
  });

  /* Create setting edit box */
  let settingEdit = document.createElement('div'),
      settingUrlEdit = document.createElement('input'),
      settingLabelEdit = document.createElement('input'),
      settingColorEdit = document.createElement('input'),
      settingPositionEdit = document.createElement('select'),
      clearFix2 = document.createElement('div'),
      updateBtn = document.createElement('button'),
      cancelBtn = document.createElement('button')
  ;

  for (let i = 0; i < positionsMap.length; i++) {
    let optionPositionEdit = document.createElement('option');

    optionPositionEdit.value = positionsMap[i].value;
    optionPositionEdit.text = positionsMap[i].label;

    settingPositionEdit.appendChild(optionPositionEdit)

    if (positionsMap[i].value === settingPosition) {
      settingPositionEdit.selectedIndex = i;
    }
  }

  updateBtn.setAttribute('class', 'update');
  updateBtn.textContent = 'Update';
  cancelBtn.setAttribute('class', 'cancel');
  cancelBtn.textContent = 'Cancel';

  settingEdit.setAttribute('class', 'edit-container');
  settingEdit.appendChild(settingLabelEdit);
  settingLabelEdit.value = settingLabel;
  settingLabelEdit.setAttribute('class', 'edit-label');
  settingEdit.appendChild(settingUrlEdit);
  settingUrlEdit.value = settingUrl;
  settingUrlEdit.setAttribute('class', 'edit-url');
  settingEdit.appendChild(settingColorEdit);
  settingColorEdit.setAttribute('class', 'color-picker');
  settingColorEdit.value = settingColor;
  settingEdit.appendChild(settingPositionEdit);
  settingPositionEdit.setAttribute('class', 'edit-position');

  settingEdit.appendChild(updateBtn);
  settingEdit.appendChild(cancelBtn);

  settingEdit.appendChild(clearFix2);
  clearFix2.setAttribute('class', 'clearfix');

  settingContainer.appendChild(settingEdit);

  settingsContainer.appendChild(settingContainer);
  settingEdit.style.display = 'none';

  /* Add listeners for the update functionality */
  settingLabelUrlPositionDiv.addEventListener('click', () => {
    settingDisplay.style.display = 'none';
    settingEdit.style.display = 'block';
  });

  settingColorDiv.addEventListener('click', () => {
    settingDisplay.style.display = 'none';
    settingEdit.style.display = 'block';
  });

  /* Add color picker to edit input */
  let pickr = Pickr.create({
    el: settingColorEdit,
    theme: 'nano',
    useAsButton: false,
    default: settingColor,
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
    settingColorEdit.value = color.toHEXA();
  });

  cancelBtn.addEventListener('click', () => {
    settingDisplay.style.display = 'block';
    settingEdit.style.display = 'none';
    settingUrlEdit.value = settingUrl;
    settingColorEdit.value = settingColor;
    settingLabelEdit.value = settingLabel;
  });

  updateBtn.addEventListener('click', () => {
    if (settingUrlEdit.value !== settingUrl || settingColorEdit.value !== settingColor || settingLabelEdit.value !== settingLabel || settingPositionEdit.value !== settingPosition) {
      updateSetting(settingUrl, settingUrlEdit.value, settingColorEdit.value, settingLabelEdit.value, settingPositionEdit.value);
      settingContainer.parentNode.removeChild(settingContainer);
    }
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
  document.querySelectorAll('.settings-container .setting').forEach((element) => {
    element.remove();
  });
  browser.storage.local.clear();
  showOrHideEmptyNotice(show);
}

document.addEventListener('DOMContentLoaded', function(event) {
  let pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano',
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
    colorInput.value = color.toHEXA();
    instance.hide();
  });
});
