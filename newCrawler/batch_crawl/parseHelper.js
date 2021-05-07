/* parseHelper.js
   Author: Raiyan Rahman
   Date: May 6th, 2021
   Description: Contains helpers for parsing scope, and articles.
*/
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const parse = require('csv-parse/lib/sync')
const { Readability } = require('@mozilla/readability');


// Parse the CSV file to get a list of domains.
let parseCSV = function(file){
    var urls = [];
    // Read the file.
    var csv_file = fs.readFileSync(file, 'utf8');
    // Parse the file into a list of objects.
    const csv_list = parse(csv_file, {
        columns: true
    });
    // Format the data to only get the urls.
    for (let row of csv_list) {
        // Make sure that there is a slash at the end.
        let domain = row["Source"];
        if (domain[domain.length - 1] !== '/') {
            domain += '/';
        }
        // Push the domain to the list.
        urls.push(domain);
    }
    // Return the list of domain urls.
    return urls;
};

// Get the parsed article using readability.
let getParsedArticle = function(url, html) {
    var doc = new JSDOM(html, {
        url: url
      });
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    return article
};

module.exports = { parseCSV, getParsedArticle };