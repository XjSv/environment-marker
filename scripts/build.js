// require modules
const fs = require('fs');
const archiver = require('archiver');

// create a file to stream archive data to
const output_chromium = fs.createWriteStream(__dirname + '/../build/environment-marker-chromium.zip');
const output_firefox = fs.createWriteStream(__dirname + '/../build/environment-marker-firefox.zip');

const archive_chromium = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

const archive_firefox = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output_chromium.on('close', function() {
    console.log(archive_chromium.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});
output_firefox.on('close', function() {
    console.log(archive_firefox.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output_chromium.on('end', function() {
    console.log('Data has been drained');
});

output_firefox.on('end', function() {
    console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive_chromium.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
});

archive_firefox.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
});

// good practice to catch this error explicitly
archive_chromium.on('error', function(err) {
    throw err;
});

archive_firefox.on('error', function(err) {
    throw err;
});

// Chrome
// pipe archive data to the file
archive_chromium.pipe(output_chromium);

// append a file
archive_chromium.file(__dirname + '/../manifest-chrome.json', { name: 'manifest.json' });

archive_chromium.file(__dirname + '/../js/background.min.js', { name: 'js/background.min.js' });
archive_chromium.file(__dirname + '/../js/content.min.js', { name: 'js/content.min.js' });
archive_chromium.file(__dirname + '/../css/content.min.css', { name: 'css/content.min.css' });

// append files from a sub-directory and naming it `new-subdir` within the archive
archive_chromium.directory(__dirname + '/../images/', 'images');
archive_chromium.directory(__dirname + '/../libraries/', 'libraries');

archive_chromium.file(__dirname + '/../popup/environment-marker.html', { name: 'popup/environment-marker.html' });
archive_chromium.file(__dirname + '/../popup/environment-marker.min.js', { name: 'popup/environment-marker.min.js' });
archive_chromium.file(__dirname + '/../popup/environment-marker.min.css', { name: 'popup/environment-marker.min.css' });

archive_chromium.file(__dirname + '/../options/options.html', { name: 'options/options.html' });
archive_chromium.file(__dirname + '/../options/options.min.js', { name: 'options/options.min.js' });
archive_chromium.file(__dirname + '/../options/options.min.css', { name: 'options/options.min.css' });

// Language files (i18n)
archive_chromium.directory(__dirname + '/../_locales/', '_locales');

//archive_chromium.directory(__dirname + '/../popup/', 'popup');
//archive_chromium.directory(__dirname + '/../options/', 'options');

// append files from a glob pattern
//archive_chromium.glob('subdir/*.txt');

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive_chromium.finalize();

// Firefox
// pipe archive data to the file
archive_firefox.pipe(output_firefox);

// append a file
archive_firefox.file(__dirname + '/../manifest-firefox.json', { name: 'manifest.json' });

archive_firefox.file(__dirname + '/../js/background.min.js', { name: 'js/background.min.js' });
archive_firefox.file(__dirname + '/../js/content.min.js', { name: 'js/content.min.js' });
archive_firefox.file(__dirname + '/../css/content.min.css', { name: 'css/content.min.css' });

// append files from a sub-directory and naming it `new-subdir` within the archive
archive_firefox.directory(__dirname + '/../images/', 'images');
archive_firefox.directory(__dirname + '/../libraries/', 'libraries');

archive_firefox.file(__dirname + '/../popup/environment-marker.html', { name: 'popup/environment-marker.html' });
archive_firefox.file(__dirname + '/../popup/environment-marker.min.js', { name: 'popup/environment-marker.min.js' });
archive_firefox.file(__dirname + '/../popup/environment-marker.min.css', { name: 'popup/environment-marker.min.css' });

archive_firefox.file(__dirname + '/../options/options.html', { name: 'options/options.html' });
archive_firefox.file(__dirname + '/../options/options.min.js', { name: 'options/options.min.js' });
archive_firefox.file(__dirname + '/../options/options.min.css', { name: 'options/options.min.css' });

// Language files (i18n)
archive_chromium.directory(__dirname + '/../_locales/', '_locales');

//archive_firefox.directory(__dirname + '/../popup/', 'popup');
//archive_firefox.directory(__dirname + '/../options/', 'options');

// append files from a glob pattern
//archive_firefox.glob('subdir/*.txt');

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive_firefox.finalize();
