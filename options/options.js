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

/* Add a setting to the display and storage */
function saveSettings(urlIn, colorIn, labelIn, positionIn) {
    let settingUrl = urlIn,
        settingColor = colorIn,
        settingLabel = labelIn,
        settingPosition =  positionIn;

    if (settingUrl !== '' && settingColor !== '' && settingLabel !== '') {
        browser.storage.local.get(settingUrl).then((result) => {
            let objTest = Object.keys(result);

            if (objTest.length < 1) {
                storeSetting(settingUrl, settingColor, settingLabel, settingPosition);
            } else {
                // Duplicate marker error message
                showMessage('Marker for this URL already exists!', true);
            }
        }, onError);
    } else {
        // Empty input error message
        settingLabel === '' ? showMessage('Enter Label !', true) : showMessage('Enter URL !', true);
    }
}

/* Store a new setting in local storage */
function storeSetting(settingUrl, settingColor, settingLabel, settingPosition) {
    browser.storage.local.set({ [settingUrl] : [settingColor, settingLabel, settingPosition] }).then(() => {
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
                    "position" : results[settingUrl][2]
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

                showMessage('Export successful!');
            });
        } else {
            showMessage('Nothing to export!', true);
        }
    }, onError);
}

/* Read import file and load all settings into the stoage */
function importConfig() {
    let importFileInput = document.getElementById("importFile"),
        importFile = importFileInput.files[0];
    const reader = new FileReader();

    // This event listener will happen when the reader has read the file
    reader.addEventListener('load', function() {
        let import_config_obj = JSON.parse(reader.result); // Parse the result into an object

        if (import_config_obj.length > 0) {
            import_config_obj.forEach(function(arrayItem) {
                saveSettings(arrayItem.url, arrayItem.color, arrayItem.label, arrayItem.position)
            });

            showMessage('Imported successfully!');
        }

        importFileInput.value = "";
    });

    reader.readAsText(importFile); // Read the uploaded file
}

$(document).ready(() => {
    $('.export').click(() => {
        exportConfig();
    });

    $('.import').click(() => {
        importConfig();
    });
});
