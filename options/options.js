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
    inputEnableTabCounter = browser.i18n.getMessage("inputEnableTabCounter"),
    inputEnableFaviconMarker = browser.i18n.getMessage("inputEnableFaviconMarker"),
    noticeSettingSaved = browser.i18n.getMessage("noticeSettingSaved"),
    ariaLabelAlertClose = browser.i18n.getMessage("ariaLabelAlertClose"),
    optionsSettingsSection = browser.i18n.getMessage("optionsSettingsSection"),
    optionsExportImportSection = browser.i18n.getMessage("optionsExportImportSection"),
    inputFontLabel = browser.i18n.getMessage("inputFontLabel"),
    inputFontHelpText = browser.i18n.getMessage("inputFontHelpText"),
    inputRegExpHelpText = browser.i18n.getMessage("inputRegExpHelpText"),
    inputTabCounterHelpText = browser.i18n.getMessage("inputTabCounterHelpText"),
    inputEnableFaviconMarkerHelpText = browser.i18n.getMessage("inputEnableFaviconMarkerHelpText"),
    errorFileEmptyOrFormat = browser.i18n.getMessage("errorFileEmptyOrFormat"),
    buttonOptions = browser.i18n.getMessage("buttonOptions"),
    exportFile = null;

let languageCode = browser.i18n.getUILanguage(),
    languageCodeTwoChar = languageCode.split('-')[0];
const markersKey = '__em-markers__';
const searchModeKey = '__em-search-mode__';
const tabCounterKey = '__em-tab-counter__';
const faviconMarkerKey = '__em-favicon-marker__';
const swatchesKey = '__em-swatches__';
const dbVersionKey = '__em-version__';
const fontKey = '__em-font__';
const exportFileName = 'environment-marker-export.json';

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
  let configurations = {
    markers: [],
    settings: []
  };

  browser.storage.sync.get(markersKey).then((storedResults) => {
    let markersStoredArray = storedResults[markersKey] || [];

    if (markersStoredArray.length == 0) {
      showMessage(errorNoRibbonsToExport, true);
    } else {
      browser.storage.sync.get([
        fontKey,
        searchModeKey,
        tabCounterKey,
        swatchesKey,
        faviconMarkerKey
       ]).then((options) => {
        let fontStoredString = options[fontKey] || '';
        let searchModeStoredBool = options[searchModeKey] || false;
        let tabCounterStoredBool = options[tabCounterKey] || false;
        let faviconMarkerStoredBool = options[faviconMarkerKey] || false;
        let colorSwatchesStoredArray = options[swatchesKey];

        for (let storedObject of markersStoredArray) {
          configurations.markers.push({
            "url": storedObject.settingUrl,
            "color": storedObject.settingColor,
            "label": storedObject.settingLabel,
            "position": storedObject.settingPosition,
            "size": storedObject.settingSize
          });
        }

        configurations.settings.push({
          "fontString": fontStoredString
        });

        configurations.settings.push({
          "searchModeBool": searchModeStoredBool
        });

        configurations.settings.push({
          "tabCounterBool": tabCounterStoredBool
        });

        configurations.settings.push({
          "faviconMarkerBool": faviconMarkerStoredBool
        });

        configurations.settings.push({
          "colorSwatchesArray": colorSwatchesStoredArray
        });

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
       });
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

      if (importConfigObjects.hasOwnProperty('markers') && importConfigObjects.hasOwnProperty('settings')) {
        let storedArray = [],
            errorMessages = '';

        if (importConfigObjects.settings.length > 0) {
          for (let importConfigObject of importConfigObjects.settings) {
            if (importConfigObject.hasOwnProperty('searchModeBool')) {
              browser.storage.sync.set({[searchModeKey]: importConfigObject.searchModeBool}).then(() => {
              }, onError);
            }

            if (importConfigObject.hasOwnProperty('tabCounterBool')) {
              browser.storage.sync.set({[tabCounterKey]: importConfigObject.tabCounterBool}).then(() => {
              }, onError);
            }

            if (importConfigObject.hasOwnProperty('faviconMarkerBool')) {
              browser.storage.sync.set({[faviconMarkerKey]: importConfigObject.faviconMarkerBool}).then(() => {
              }, onError);
            }

            if (importConfigObject.hasOwnProperty('fontString')) {
              browser.storage.sync.set({[fontKey]: importConfigObject.fontString}).then(() => {
              }, onError);
            }

            if (importConfigObject.hasOwnProperty('colorSwatchesArray')) {
              browser.storage.sync.set({[swatchesKey]: importConfigObject.colorSwatchesArray}).then(() => {
              }, onError);
            }
          }
        }

        if (importConfigObjects.markers.length > 0) {
          for (let importConfigObject of importConfigObjects.markers) {
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
        }

        $('.import-file-label').html(inputChooseFile);
        importFileInput.value = '';

        if (errorMessages !== '') {
          showMessage('<ul>' + errorMessages + '</ul>', true);
        } else {
          browser.storage.sync.set({[markersKey]: storedArray}).then(() => {
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

  browser.storage.sync.get(searchModeKey).then((storedSearchMode) => {
    let storedSearchModeBool = storedSearchMode[searchModeKey] || false;
    $('#enable-regexp').prop('checked', storedSearchModeBool);
  }, onError);

  $('#enable-regexp').change((event) => {
    let enableRegexpValue = $(event.target).is(':checked');
    browser.storage.sync.set({[searchModeKey]: enableRegexpValue }).then(() => {
      showMessage(noticeSettingSaved);
    }, onError);
  });

  browser.storage.sync.get(tabCounterKey).then((storedTabCounter) => {
    let storedTabCounterBool = storedTabCounter[tabCounterKey] || false;
    $('#enable-tab-counter').prop('checked', storedTabCounterBool);
  }, onError);

  $('#enable-tab-counter').change((event) => {
    let enableTabCounterValue = $(event.target).is(':checked');
    browser.storage.sync.set({[tabCounterKey]: enableTabCounterValue }).then(() => {
      showMessage(noticeSettingSaved);
    }, onError);
  });

  browser.storage.sync.get(faviconMarkerKey).then((storedFaviconMarker) => {
    let faviconMarkerBool = storedFaviconMarker[faviconMarkerKey] || false;
    $('#enable-favicon-marker').prop('checked', faviconMarkerBool);
  }, onError);

  $('#enable-favicon-marker').change((event) => {
    let enableFaviconMarkerValue = $(event.target).is(':checked');
    browser.storage.sync.set({[faviconMarkerKey]: enableFaviconMarkerValue }).then(() => {
      showMessage(noticeSettingSaved);
    }, onError);
  });

  exportButton.html('<i class="fas fa-download fa-lg"></i> ' + buttonExport);
  importButton.html('<i class="fas fa-upload fa-lg"></i> ' + buttonImport);
  $('.import-file-label').html(inputChooseFile);
  $('#import-warning').html(importWarning);
  $('#enable-regexp-label').html(inputEnableRegExp);
  $('#enable-tab-counter-label').html(inputEnableTabCounter);
  $('#enable-favicon-marker-label').html(inputEnableFaviconMarker);

  $('#settings-section-label').html('<i class="fas fa-cog"></i> ' + optionsSettingsSection);
  $('#export-import-section-label').html('<i class="fas fa-sync-alt"></i> ' + optionsExportImportSection);
  $('#font-label').html(inputFontLabel);
  $('#font-picker-help-block').html(inputFontHelpText);
  $('#enable-regexp-help-block').html(inputRegExpHelpText);
  $('#enable-tab-counter-help-block').html(inputTabCounterHelpText);
  $('#enable-favicon-marker-help-block').html(inputEnableFaviconMarkerHelpText);

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

      browser.storage.sync.set({[fontKey]: fontStoreValue}).then(() => {
        showMessage(noticeSettingSaved);
      }, onError);
    }
  });

  browser.storage.sync.get(fontKey).then((storedFont) => {
    let fontString = storedFont[fontKey] || '';

    if (fontString) {
      let fontTmp = fontString.split(':'),
          font = fontTmp[1],
          variant = fontTmp[2];

      $('#font-picker').val(font + ':' + variant).trigger('change');
    }
  });

  $('.fp-clear').click(() => {
    browser.storage.sync.set({[fontKey]: ''}).then(() => {
      showMessage(noticeSettingSaved);
    }, onError);
  });
});
