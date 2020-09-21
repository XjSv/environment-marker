// require modules
const fs = require('fs');
const archiver = require('archiver');

// create a file to stream archive data to
const output_chrome = fs.createWriteStream(__dirname + '/../build/environment-marker-chrome.zip');
const output_firefox = fs.createWriteStream(__dirname + '/../build/environment-marker-firefox.zip');

const archive_chrome = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

const archive_firefox = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output_chrome.on('close', function() {
    console.log(archive_chrome.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});
output_firefox.on('close', function() {
    console.log(archive_firefox.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output_chrome.on('end', function() {
    console.log('Data has been drained');
});

output_firefox.on('end', function() {
    console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive_chrome.on('warning', function(err) {
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
archive_chrome.on('error', function(err) {
    throw err;
});

archive_firefox.on('error', function(err) {
    throw err;
});

// Chrome
// pipe archive data to the file
archive_chrome.pipe(output_chrome);

// append a file
archive_chrome.file(__dirname + '/../background.js', { name: 'background.js' });
archive_chrome.file(__dirname + '/../browser-polyfill.js', { name: 'browser-polyfill.min.js' });
archive_chrome.file(__dirname + '/../content.css', { name: 'content.css' });
archive_chrome.file(__dirname + '/../content.js', { name: 'content.js' });
archive_chrome.file(__dirname + '/../manifest-chrome.json', { name: 'manifest.json' });

// append files from a sub-directory and naming it `new-subdir` within the archive
archive_chrome.directory(__dirname + '/../images/', 'images');
archive_chrome.directory(__dirname + '/../popup/', 'popup');

// append files from a glob pattern
//archive_chrome.glob('subdir/*.txt');

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive_chrome.finalize();


// Firefox
// pipe archive data to the file
archive_firefox.pipe(output_firefox);

// append a file
archive_firefox.file(__dirname + '/../background.js', { name: 'background.js' });
archive_firefox.file(__dirname + '/../browser-polyfill.js', { name: 'browser-polyfill.min.js' });
archive_firefox.file(__dirname + '/../content.css', { name: 'content.css' });
archive_firefox.file(__dirname + '/../content.js', { name: 'content.js' });
archive_firefox.file(__dirname + '/../manifest-firefox.json', { name: 'manifest.json' });

// append files from a sub-directory and naming it `new-subdir` within the archive
archive_firefox.directory(__dirname + '/../images/', 'images');
archive_firefox.directory(__dirname + '/../popup/', 'popup');

// append files from a glob pattern
//archive_firefox.glob('subdir/*.txt');

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive_firefox.finalize();
