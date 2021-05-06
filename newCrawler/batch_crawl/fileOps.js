/* fileOps.js
   Author: Raiyan Rahman
   Date: May 6th, 2021
   Description: File related operations, including
   - rmdir: Remove the directory contents and the directory itself if not specified
   - mkdir: Make a directory with the given name, using error handling
*/
const fs = require('fs');
const path = require('path');

// Remove the given directory's contents,
// and the directory itself if not specified.
let rmDir = function (dirPath, removeSelf) {
    // If removeSelf was not specified, remove itself.
    if (removeSelf === undefined)
        removeSelf = true;
    // Try to read the the directory.
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        // throw e
        console.error(e);
    }
    // Remove the contents of the directory.
    if (files.length > 0)
        for (let i = 0; i < files.length; i++) {
        const filePath = path.join(dirPath, files[i]);
        // If this is a file.
        if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
        // If this is a directory, recursively delete.
        else
            rmDir(filePath);
        }
    // Remove the directory itself.
    if (removeSelf)
        fs.rmdirSync(dirPath);
};


// Make the directory with the given name.
// If the directory already exists, notify the user.
let mkDir = function(dirName) {
    if (!fs.existsSync(dirName)) {
        fs.mkdir(path.join(__dirname, dirName), (err) => { 
            if (err) { 
                return console.error(err);
            } 
            console.log(dirName + ' folder created.');
        });
    } else {
        console.log(dirName + ' already exists.');
    }
};

module.exports = { rmDir, mkDir };