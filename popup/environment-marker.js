/* initialise variables */
let urlInput = document.querySelector('.settings-input #url'),
    colorInput = document.querySelector('.settings-input #color'),
    settingsContainer = document.querySelector('.settings-container'),
    clearBtn = document.querySelector('.clear'),
    saveBtn = document.querySelector('.save'),
    emptyNotice = document.querySelector('.empty-notice');

/* add event listeners to buttons */
saveBtn.addEventListener('click', saveSettings);
clearBtn.addEventListener('click', clearAll);

/* generic error handler */
function onError(error) {
  console.log(error);
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

/* display previously-saved stored notes on startup */
initialize();

function initialize() {
  browser.storage.local.get(null).then((results) => {
    let settingsKeys = Object.keys(results);
    for (let settingUrl of settingsKeys) {
      let settingColor = results[settingUrl];
      hideEmptyNotice();
      displaySetting(settingUrl, settingColor);
    }
  }, onError);
}

/* function to hide the empty notice */
function hideEmptyNotice() {
  emptyNotice.style.display = 'none';
}

/* function to show the empty notice */
function showEmptyNotice() {
  emptyNotice.style.display = 'block';
}

/* Add a setting to the display, and storage */
function saveSettings() {
  let settingUrl = urlInput.value,
      settingColor = colorInput.value;

  browser.storage.local.get(settingUrl).then((result) => {
    let objTest = Object.keys(result);
    if (objTest.length < 1 && settingUrl !== '' && settingColor !== '') {
      urlInput.value = '';
      //colorInput.value = '';
      storeSetting(settingUrl, settingColor);
    }
  }, onError);
}

/* function to store a new setting in storage */
function storeSetting(settingUrl, settingColor) {
  browser.storage.local.set({ [settingUrl] : settingColor }).then(() => {
    hideEmptyNotice();
    displaySetting(settingUrl, settingColor);
  }, onError);
}

/* function to display a setting in the setting box */
function displaySetting(settingUrl, settingColor) {
  /* create setting display box */
  let settingContainer = document.createElement('div'),
      settingDisplay = document.createElement('div'),
      settingUrlDiv = document.createElement('div'),
      settingColorDiv = document.createElement('div'),
      deleteBtn = document.createElement('button'),
      clearFix = document.createElement('div'),
      settingColorDivBg = document.createElement('div');

  settingContainer.setAttribute('class', 'setting');
  settingUrlDiv.setAttribute('class', 'display-url');
  settingColorDiv.setAttribute('class', 'display-color');
  settingColorDivBg.style.backgroundColor = settingColor;

  settingUrlDiv.textContent = truncateString(settingUrl, 35);
  settingColorDiv.appendChild(settingColorDivBg);
  deleteBtn.setAttribute('class', 'delete');
  deleteBtn.innerHTML = '<i class="fas fa-trash fa-lg"></i>';
  clearFix.setAttribute('class', 'clearfix');

  settingDisplay.appendChild(settingUrlDiv);
  settingDisplay.appendChild(settingColorDiv);
  settingDisplay.appendChild(deleteBtn);
  settingDisplay.appendChild(clearFix);

  settingContainer.appendChild(settingDisplay);

  /* set up listener for the delete functionality */
  deleteBtn.addEventListener('click', (e) => {
    let evtTgt = e.target;
    evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
    browser.storage.local.remove(settingUrl);
    showEmptyNotice();
  });

  /* create setting edit box */
  let settingEdit = document.createElement('div'),
      settingUrlEdit = document.createElement('input'),
      settingColorEdit = document.createElement('input'),
      clearFix2 = document.createElement('div'),
      updateBtn = document.createElement('button'),
      cancelBtn = document.createElement('button');

  updateBtn.setAttribute('class', 'update');
  updateBtn.textContent = 'Update';
  cancelBtn.setAttribute('class', 'cancel');
  cancelBtn.textContent = 'Cancel';

  settingEdit.appendChild(settingUrlEdit);
  settingEdit.setAttribute('class', 'edit-container');
  settingUrlEdit.value = settingUrl;
  settingUrlEdit.setAttribute('class', 'edit-url');
  settingEdit.appendChild(settingColorEdit);
  settingColorEdit.setAttribute('class', 'color-picker');
  settingColorEdit.value = settingColor;
  settingEdit.appendChild(updateBtn);
  settingEdit.appendChild(cancelBtn);

  settingEdit.appendChild(clearFix2);
  clearFix2.setAttribute('class', 'clearfix');

  settingContainer.appendChild(settingEdit);

  settingsContainer.appendChild(settingContainer);
  settingEdit.style.display = 'none';

  /* set up listeners for the update functionality */
  settingUrlDiv.addEventListener('click', () => {
    settingDisplay.style.display = 'none';
    settingEdit.style.display = 'block';
  });

  settingColorDiv.addEventListener('click', () => {
    settingDisplay.style.display = 'none';
    settingEdit.style.display = 'block';
  });

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
  });

  updateBtn.addEventListener('click', () => {
    if (settingUrlEdit.value !== settingUrl || settingColorEdit.value !== settingColor) {
      updateSetting(settingUrl, settingUrlEdit.value, settingColorEdit.value);
      settingContainer.parentNode.removeChild(settingContainer);
    }
  });
}

/* function to update settings */
function updateSetting(settingUrl, newSettingUrl, settingColor) {
  browser.storage.local.set({ [newSettingUrl] : settingColor }).then(() => {
    if (settingUrl !== newSettingUrl) {
      let removingSetting = browser.storage.local.remove(settingUrl);
      removingSetting.then(() => {
        displaySetting(newSettingUrl, settingColor);
      }, onError);
    } else {
      displaySetting(newSettingUrl, settingColor);
    }
  }, onError);
}

/* Clear all settings from the display/storage */
function clearAll() {
  document.querySelectorAll('.settings-container .setting').forEach((element) => {
    element.remove();
  });
  browser.storage.local.clear();
  showEmptyNotice();
}

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
