/* internetArchiveCrawler.js
   Author: Raazia Hashim
   Date: October 1st, 2023
   Description: Crawl data from the Internet Archive.
   Parameters: --scope : domain scope of the crawl in string format

   Usage: "node internetArchiveCrawler.js --scope https://mondoweiss.net/"

   Note that regular expressions are used to filter valid URLs from the archive's snapshots
   Edit the pattern on 63 as needed to match each scope
   - Mondoweiss: /^(https?:\/\/)+([a-z0-9]+)(.[a-z]+\/)(\d{4}\/)(\d{2}\/)([a-zA-Z0-9-]+\/)$/
*/

const fs = require("fs");
const fetch = require("node-fetch");

const parseHelper = require("./parseHelper");
const path = require('path');

const JSDOM = require('jsdom').JSDOM;
const { v4: uuidv4 } = require("uuid");

var total_valid_urls = 0;

function processInputDomain() {
    // Process the input domain that is the scope of the crawl.
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Please provide the scope domain using the "--scope" argument.');
        return [];
    }

    const argumentIndex = args.indexOf('--scope');
    const scopeDomain = args[argumentIndex + 1];

    console.log(`The input domain is ${scopeDomain}.\n`);

    return scopeDomain;
};

async function getAllUrls(mainUrl) {
    // Return all urls that have url as the prefix captured in the Internet Archive.
    var fullUrl = `http://web.archive.org/cdx/search/cdx?url=${mainUrl}&matchType=prefix&filter=statuscode:200` 
    try {
        const response = await fetch(fullUrl);
      
        if (!response.ok) {
          // Handle non-successful HTTP response (e.g., 404 Not Found, 500 Internal Server Error)
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const data = await response.text();
      
        // process text response
        const lines = data.trim().split('\n');
        const urls = lines.map(line => line.split(' ')[2]);

        // remove duplicates
        var urlsUnique = new Set(urls);

        // this regex is specific to the domain that the crawler is currently being run on
        const pattern = /^(https?:\/\/)+([a-z0-9]+)(.[a-z]+\/)(\d{4}\/)(\d{2}\/)([a-zA-Z0-9-]+\/)$/

        const validURLs = new Set();
        for (const url of urlsUnique) {
            if (pattern.test(url)) {
                validURLs.add(url);
            }
        }

        total_valid_urls = validURLs.size - 1;
        console.log(`There are ${total_valid_urls} unique URL snapshots in Internet Archive relating to the input domain.\n`);
        return validURLs;

    } catch (error) {
        // Handle errors
        console.error("Error during fetch:", error);
        return [];
    }
};

async function getLatestSnapshot(url) {
    // Return the latest saved snapshot html of the given URL in the Internet Archive.
    try {
        var fullUrl = `http://archive.org/wayback/available?url=${url}`;
        const response = await fetch(fullUrl);
      
        if (!response.ok) {
          throw new Error(`Failed to fetch data for URL: ${url}`);
        }
      
        const data = await response.json();
      
        if (data && data.archived_snapshots && data.archived_snapshots.closest) {
          const secondUrl = data.archived_snapshots.closest.url;
      
          const htmlResponse = await fetch(secondUrl);
      
          if (!htmlResponse.ok) {
            throw new Error(`Failed to fetch HTML content for URL: ${secondUrl}`);
          }
      
          const htmlText = await htmlResponse.text();
          return [htmlText, secondUrl];
        } else {
          console.log("URL not found on Internet Archive.");
          return ["", ""];
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
        return ["", ""];
    }  
};

async function getReferencedUrls(htmlContent, url) {
    // Return all embedded links in the given HTML content.
    var array = [];
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    var links = document.getElementsByTagName("a");
    if (links.length === 0) {
        return array;
    }

    for(var i=0, max=links.length; i<max; i++) {
        const link = links[i].href;

        // extract url from iAUrl, this is a general regex for Internet Archive
        const matchResult = link.match(/\/web\/(\d+)\/(.+)/);
        
        if (!matchResult) {
            continue;
        } 

        const extractedUrl = matchResult[2];

        try {
            const getTitleAtUrl = await import('get-title-at-url');
            const { title } = await getTitleAtUrl.default(link);

            array.push({"title": title ? title : "", 
                        "url": extractedUrl});
            
        } catch (error) {
            array.push({"title": "", 
                        "url": extractedUrl});
            continue;
        }
    }

    return array;
}

async function parseHTML(htmlContent, iAUrl, mainURL) {
    // Parse the html content to extract the title, author, text and datetime values.
    const parsedDict = await parseHelper.parseHTML(iAUrl, htmlContent);

    const found_urls = await getReferencedUrls(parsedDict.html_content);

    // extract url from iAUrl, this is a general regex for Internet Archive
    const url = (iAUrl.match(/\/web\/(\d+)\/(.+)/))[2];

    return {"title": parsedDict.title, 
            "url": url, 
            "bodyHTML": parsedDict.html_content,
            "author": parsedDict.author,
            "date": parsedDict.date,
            "article_text": parsedDict.article_text,
            "domain": mainURL,
            "updated": false, 
            "found_urls": found_urls
        };
};

function delay(ms) {
    // Sleep system for a desired amount of time.
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function iaCrawler() {
    var start_date  = new Date();

    const mainURL = processInputDomain();

    const response = await getAllUrls(mainURL);
    if (!response) {
        return;
    }
    let index = 1;
    var successful_so_far = 0;

    for (const subURL of response) {
        if (subURL != mainURL) {
            console.log(`Parsing URL ${index}: ${subURL}.\n`);

            const data = await getLatestSnapshot(subURL);

            if (data[0] == "" && data[1] == "") {
                index++;
                continue;
            }
            const html = data[0];
            const iAUrl = data[1];
            const subDict = await parseHTML(html, iAUrl, mainURL);
        
            const jsonData = JSON.stringify(subDict, null, 4);
            const folderPath = 'IAResults'; 
            const filename = uuidv4() + '.json';
            const filePath = path.join(folderPath, filename);

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            fs.appendFile(filePath, jsonData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                }
            });
            index++;
            successful_so_far++;

            await delay(200); 
        }
    };

    var end_date  = new Date();

    const timeDifference = end_date - start_date;
    const resultsPerSecond = total_valid_urls / (timeDifference / 1000);
    const resultsPerDay = resultsPerSecond * 60 * 60 * 24;

    console.log(`The input domain is ${mainURL}.\n`);
    console.log(`This crawl was started on ${start_date.toLocaleString("en-US")} and ended on ${end_date.toLocaleString("en-US")}.\n`);
    console.log(`There were a total of ${total_valid_urls} valid unique URLs, out of which ${successful_so_far} were successful.\n`);
    console.log(`The speed of the current crawl is ${resultsPerDay} results per day.\n`)
};

async function main() {
    // Main workflow of the Internet Archive Crawler.
    await iaCrawler();
}
  
main();
