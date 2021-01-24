let errorDuplicateMarker = browser.i18n.getMessage("errorDuplicateMarker");
let errorLabelEmpty = browser.i18n.getMessage("errorLabelEmpty");
let errorUrlEmpty = browser.i18n.getMessage("errorUrlEmpty");
let noticeSuccessExport = browser.i18n.getMessage("noticeSuccessExport");
let noticeSuccessImport = browser.i18n.getMessage("noticeSuccessImport");
let errorNoRibbonsToExport = browser.i18n.getMessage("errorNoRibbonsToExport");
let errorChooseFile = browser.i18n.getMessage("errorChooseFile");
let inputChooseFile = browser.i18n.getMessage("inputChooseFile");
let buttonExport = browser.i18n.getMessage("buttonExport");
let buttonImport = browser.i18n.getMessage("buttonImport");
let exportFile = null;

function onError(error) {
    console.log(error);
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

/* Add a setting to storage */
function saveSettings(urlIn, colorIn, labelIn, positionIn, sizeIn) {
    let settingUrl = urlIn,
        settingColor = colorIn,
        settingLabel = labelIn,
        settingPosition = positionIn,
        settingSize = sizeIn;

    if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
        browser.storage.local.get(settingUrl).then((result) => {
            let objTest = Object.keys(result);

            if (objTest.length < 1) {
                storeSetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize);
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
function storeSetting(settingUrl, settingColor, settingLabel, settingPosition, settingSize) {
    browser.storage.local.set({ [settingUrl] : [settingColor, settingLabel, settingSize] }).then(() => {
        // Success
    }, onError);
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
    browser.storage.local.get(null).then((results) => {
        let settingsUrls = Object.keys(results),
            configurations = [];

        if (settingsUrls.length > 0) {
            for (let settingUrl of settingsUrls) {
                configurations.push({
                    "url" : settingUrl,
                    "color" : results[settingUrl][0],
                    "label" : results[settingUrl][1],
                    "position" : results[settingUrl][2],
                    "size" : results[settingUrl][3]
                });
            }

            let configurations_json = JSON.stringify(configurations);
            let link = document.createElement('a');
            link.setAttribute('download', 'ribbons.json');
            link.href = makeJsonExportFile(configurations_json);
            document.body.appendChild(link);

            // wait for the link to be added to the document
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
    let importFileInput = document.getElementById("importFile"),
        importFile = importFileInput.files[0];

    if (importFile) {
        const reader = new FileReader();

        // This event listener will happen when the reader has read the file
        reader.addEventListener('load', function() {
            let import_config_obj = JSON.parse(reader.result); // Parse the result into an object

            if (import_config_obj.length > 0) {
                import_config_obj.forEach(function(arrayItem) {
                    saveSettings(arrayItem.url, arrayItem.color, arrayItem.label, arrayItem.position, arrayItem.size)
                });

                showMessage(noticeSuccessImport);
            }

            $('.import-file-label').html(inputChooseFile);
            importFileInput.value = '';
        });

        reader.readAsText(importFile); // Read the uploaded file
    } else {
        showMessage(errorChooseFile);
    }
}

$(document).ready(() => {
    $('.export').click(() => {
        exportConfig();
    });

    $('.import').click(() => {
        importConfig();
    });

    $('#importFile').change((event) => {
        if (event.target.files.length) {
            $('.import-file-label').html(event.target.files[0].name);
        }
    });

    $('.export').html('<i class="fas fa-download fa-lg"></i> ' + buttonExport);
    $('.import').html('<i class="fas fa-upload fa-lg"></i> ' + buttonImport);
    $('.import-file-label').html(inputChooseFile);
});
