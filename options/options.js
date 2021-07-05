let noticeSuccessExport = browser.i18n.getMessage("noticeSuccessExport"),
    noticeSuccessImport = browser.i18n.getMessage("noticeSuccessImport"),
    errorNoRibbonsToExport = browser.i18n.getMessage("errorNoRibbonsToExport"),
    errorChooseFile = browser.i18n.getMessage("errorChooseFile"),
    inputChooseFile = browser.i18n.getMessage("inputChooseFile"),
    buttonExport = browser.i18n.getMessage("buttonExport"),
    buttonImport = browser.i18n.getMessage("buttonImport"),
    importWarning = browser.i18n.getMessage("importWarning"),
    errorImportLabelEmpty = browser.i18n.getMessage("errorImportLabelEmpty"),
    errorImportUrlEmpty = browser.i18n.getMessage("errorImportUrlEmpty"),
    errorImportColorEmpty = browser.i18n.getMessage("errorImportColorEmpty"),
    inputEnableRegExp = browser.i18n.getMessage("inputEnableRegExp"),
    noticeSettingSaved = browser.i18n.getMessage("noticeSettingSaved"),
    ariaLabelAlertClose = browser.i18n.getMessage("ariaLabelAlertClose"),
    optionsSettingsSection = browser.i18n.getMessage("optionsSettingsSection"),
    optionsExportImportSection = browser.i18n.getMessage("optionsExportImportSection"),
    inputFontLabel = browser.i18n.getMessage("inputFontLabel"),
    inputFontHelpText = browser.i18n.getMessage("inputFontHelpText"),
    inputRegExpHelpText = browser.i18n.getMessage("inputRegExpHelpText"),
    errorFileEmptyOrFormat = browser.i18n.getMessage("errorFileEmptyOrFormat"),
    buttonOptions = browser.i18n.getMessage("buttonOptions"),
    exportFile = null;

let languageCode = browser.i18n.getUILanguage(),
    languageCodeTwoChar = languageCode.split('-')[0];
const markersKey = '__em-markers__';
const searchModeKey = '__em-search-mode__';
const fontKey = '__em-font__';
const exportFileName = 'ribbons.json';

function onError(error) {
  console.log(error);
}

/* Show error or success messages */
function showMessage(textMsg, errorFlag = false) {
  let messageClass = errorFlag ? 'alert-danger' : 'alert-success';
  if ($('.alert-dismissible').length) {
    $('.alert-dismissible').alert('close');
  }

  $('.outer-wrapper .message-container').append(
    '<div class="alert ' + messageClass + ' alert-dismissible fade show" role="alert">' + textMsg +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="' + ariaLabelAlertClose + '"></button>' +
    '</div>'
  );

  window.setTimeout(function() {
    $('.alert-dismissible').alert('close');
  }, 3000);
}

/* Make a URL Object from json text */
function makeJsonExportFile(text) {
  let data = new Blob([text], { type: 'application/json' });

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (exportFile !== null) {
    window.URL.revokeObjectURL(exportFile);
  }

  exportFile = window.URL.createObjectURL(data);
  return exportFile;
}

/* Get all configurations from the storage and output a json file */
function exportConfig() {
  browser.storage.local.get(markersKey).then((storedResults) => {
    let storedArray = storedResults[markersKey] || [],
        configurations = [];

    if (storedArray.length > 0) {
      for (let storedObject of storedArray) {
        configurations.push({
          "url" : storedObject.settingUrl,
          "color" : storedObject.settingColor,
          "label" : storedObject.settingLabel,
          "position" : storedObject.settingPosition,
          "size" : storedObject.settingSize
        });
      }

      let configurations_json = JSON.stringify(configurations);
      let link = document.createElement('a');
      link.setAttribute('download', exportFileName);
      link.href = makeJsonExportFile(configurations_json);
      document.body.appendChild(link);

      // Wait for the link to be added to the document
      window.requestAnimationFrame(function () {
        let event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);

        showMessage(noticeSuccessExport);
      });
    } else {
      showMessage(errorNoRibbonsToExport, true);
    }
  }, onError);
}

/* Read import file and load all settings into the stoage */
function importConfig() {
  let importFileInput = document.getElementById('importFile'),
      importFile = importFileInput.files[0];

  if (importFile) {
    const reader = new FileReader();

    // This event listener will happen when the reader has read the file
    reader.addEventListener('load', function() {
      let importConfigObjects = JSON.parse(reader.result); // Parse the result into an object

      if (importConfigObjects.length > 0 && importConfigObjects[0].hasOwnProperty('url')) {
        let storedArray = [],
            errorMessages = '';

        for (let importConfigObject of importConfigObjects) {
          if (importConfigObject.url !== '' && importConfigObject.color !== '' && importConfigObject.label !== '') {
            let storeObject = {
              settingUrl: importConfigObject.url,
              settingColor: importConfigObject.color,
              settingLabel: importConfigObject.label,
              settingPosition: importConfigObject.position,
              settingSize: importConfigObject.size
            };
            storedArray.push(storeObject);
          } else {
            // Empty field error messages
            if (importConfigObject.url === '') {
              errorMessages += '<li>' + errorImportUrlEmpty + '</li>';
            }
            if (importConfigObject.label === '') {
              errorMessages += '<li>' + errorImportLabelEmpty + '</li>';
            }
            if (importConfigObject.color === '') {
              errorMessages += '<li>' + errorImportColorEmpty + '</li>';
            }
          }
        }

        $('.import-file-label').html(inputChooseFile);
        importFileInput.value = '';

        if (errorMessages !== '') {
          showMessage('<ul>' + errorMessages + '</ul>', true);
        } else {
          browser.storage.local.set({ [markersKey] : storedArray }).then(() => {
            showMessage(noticeSuccessImport);
          }, onError);
        }
      } else {
        showMessage(errorFileEmptyOrFormat, true);
      }
    });

    reader.readAsText(importFile); // Read the uploaded file
  } else {
    showMessage(errorChooseFile, true);
  }
}

$(document).ready(() => {
  $('html').attr('lang', languageCode);
  document.title = 'Environment Marker - ' + buttonOptions;

  let exportButton = $('.export'),
      importButton = $('.import');

  exportButton.click(() => {
    exportConfig();
  });

  importButton.click(() => {
    importConfig();
  });

  $('#importFile').change((event) => {
    if (event.target.files.length) {
      $('.import-file-label').html(event.target.files[0].name);
    }
  });

  browser.storage.local.get(searchModeKey).then((storedSearchMode) => {
    let storedSearchModeBool = storedSearchMode[searchModeKey] || false;
    $('#enable-regexp').prop('checked', storedSearchModeBool);
  }, onError);

  $('#enable-regexp').change((event) => {
    let enableRegexpValue = $(event.target).is(':checked');
    browser.storage.local.set({ [searchModeKey] : enableRegexpValue }).then(() => {
      showMessage(noticeSettingSaved);
    }, onError);
  });

  exportButton.html('<i class="fas fa-download fa-lg"></i> ' + buttonExport);
  importButton.html('<i class="fas fa-upload fa-lg"></i> ' + buttonImport);
  $('.import-file-label').html(inputChooseFile);
  $('#import-warning').html(importWarning);
  $('#enable-regexp-label').html(inputEnableRegExp);

  $('#settings-section-label').html('<i class="fas fa-cog"></i> ' + optionsSettingsSection);
  $('#export-import-section-label').html('<i class="fas fa-sync-alt"></i> ' + optionsExportImportSection);
  $('#font-label').html(inputFontLabel);
  $('#font-picker-help-block').html(inputFontHelpText);
  $('#enable-regexp-help-block').html(inputRegExpHelpText);

  $('#font-picker').fontpicker({
    lang: languageCodeTwoChar,
    variants: true,
    lazyLoad: true,
    showClear: true,
    nrRecents: 0,
    localFonts: {
      "Arial": {
        "category": "sans-serif",
        "variants": "400,400i,600,600i"
      },
      "Georgia": {
        "category": "serif",
        "variants": "400,400i,600,600i"
      },
      "Times New Roman": {
        "category": "serif",
        "variants": "400,400i,600,600i"
      },
      "Verdana": {
        "category": "sans-serif",
        "variants": "400,400i,600,600i",
      }/*,
      "Action Man": {},
      "Bauer": {
        "category": "display",
        "variants": "400,400i,600,600i",
        "subsets": "latin-ext,latin"
      },
      "Bubble": {
        "category": "display",
        "variants": "400,400i,600,600i",
        "subsets": "latin-ext,latin"
      }*/
    },
    localFontsUrl: '/libraries/fontpicker/fonts/',
    onSelect: function(fontObject) {
      let fontStoreValue = fontObject.fontType + ':' + fontObject.fontSpec;

      browser.storage.local.set({[fontKey] : fontStoreValue}).then(() => {
        showMessage(noticeSettingSaved);
      });
    }
  });

  browser.storage.local.get(fontKey).then((storedFont) => {
    let fontString = storedFont[fontKey] || '';

    if (fontString) {
      let fontTmp = fontString.split(':'),
          font = fontTmp[1],
          variant = fontTmp[2];

      $('#font-picker').val(font + ':' + variant).trigger('change');
    }
  });

  $('.fp-clear').click(() => {
    browser.storage.local.set({[fontKey] : ''}).then(() => {
      showMessage(noticeSettingSaved);
    });
  });
});
