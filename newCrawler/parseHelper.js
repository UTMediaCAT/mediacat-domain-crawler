/* parseHelper.js
   Author: Raiyan Rahman
   Date: May 6th, 2021
   Description: Contains helpers for parsing scope, and articles.
*/
const fs = require("fs");
const parse = require("csv-parse/lib/sync");
const { Readability, isProbablyReaderable } = require("@mozilla/readability");
const JSDOM = require("jsdom").JSDOM;
const metascraper = require("metascraper")([
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-title")(),
]);

// Parse the CSV file to get a list of domains.
let parseCSV = function (file) {
  var urls = [];
  // Read the file.
  var csv_file = fs.readFileSync(file, "utf8");
  // Parse the file into a list of objects.
  const csv_list = parse(csv_file, {
    columns: true,
  });
  // Format the data to only get the urls.
  for (let row of csv_list) {
    // Make sure that there is a slash at the end.
    let domain = row["Source"];
    // If this row contains data.
    if (domain.length > 0) {
      // if (domain[domain.length - 1] !== '/') {
      //     domain += '/';
      // }
      // Push the domain to the list.
      urls.push(domain);
    }
  }
  console.log(urls);
  // Return the list of domain urls.
  return urls;
};

let parseHTML = async function (url, html) {
  try {
    const metadata = await metascraper({
      html,
      url,
    });
    var doc = new JSDOM(html, {
      url: url,
    });
    if (isProbablyReaderable(doc.window.document)) {
      let reader = new Readability(doc.window.document);
      var parsed = reader.parse();
      var html_content = parsed.content;
      var article_text = parsed.textContent;
    } else {
      var html_content = "not readable";
      var article_text = "not readable";
    }

    var parsed_dict = {
      html_content: html_content,
      article_text: article_text,
      author: metadata["author"] != null ? metadata["author"] : "",
      title: metadata["title"] != null ? metadata["title"] : "",
      date: metadata["date"] != null ? metadata["date"] : "",
    };
    return parsed_dict;
  } catch (error) {
    console.log(error);
    return {
      html_content: "",
      article_text: "",
      author: "",
      title: "",
      date: "",
    };
  }
};

module.exports = {
  parseCSV,
  parseHTML,
};
