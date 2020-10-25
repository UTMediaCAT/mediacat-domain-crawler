/* crawl.js
   Author: Raiyan Rahman
   Date: March 1st, 2020
   Description: This script takes in one or more urls and then crawls those
   dynamically rendered webpages and returns the JSON file containing lists
   of tuples of links and titles for each url.
   Use: "node crawl.js -l <url1> ..."
   Output: link_title_list.json
*/
const Apify = require('apify');
const path = require('path');
var { Readability } = require('@mozilla/readability');
var JSDOM = require('jsdom').JSDOM;

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
function Filter(url, domain_url, valid_links) {
    // Checks that the url has the domain name, it is not a repetition or it is not the same as the original url
    result = !valid_links.includes(url) && (url != domain_url)
    // Uncomment for debugging
    /*if (!result) {
        console.log(url)
        if(!url.includes(domainName)) {
            console.log("Doesn't fit domain name");
        } else if (valid_links.includes(url)) {
            console.log("Repeat");
        } else if (url == domain_url) {
            console.log("Same as domain")
        }
    }*/
    return result
}

function getParsedArticle(url, html) {
    var doc = new JSDOM(html, {
        url: url
      });
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    return article
}

function getParsedArticle(url, html) {
    var doc = new JSDOM(html, {
        url: url
      });
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    return article
}

Apify.main(async () => {
    // Get the urls from the command line arguments.
    var url_list = [];
    var is_url = false;
    process.argv.forEach(function (val, index, array) {
        // Add the links.
        if(is_url) {
            url_list.push(val);
        }
        // If it is a flag for the link.
        if (val === "-l") {
            is_url = true;
        }
      });
    console.log(url_list);  // Ouput the links provided.

    // Create the JSON object to store the tuples of links and titles for each url.
    var output_dict = {};
    var incorrect_dict = {};
    const requestQueue = await Apify.openRequestQueue();
    // Add the links to the queue of websites to crawl.
    for (var i = 0; i < url_list.length; i++) {
        await requestQueue.addRequest({ url: url_list[i] });
    }
    // Crawl the deeper URLs recursively.
    // const pseudoUrls = [new Apify.PseudoUrl('https://www.idf.il/en/[.*]')];

    // Initialize the crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        launchPuppeteerOptions: {
            headless: true,
            stealth: false,
            useChrome: false,
        },
        handlePageFunction: async ({ request, page }) => {
            const title = await page.title();   // Get the title of the page.
            let general_regex = /(http(s)?:\/\/(www\.)?)([^.]+)((\.[a-zA-Z]+)+)/;
            let match = request.url.match(general_regex);
            let link_start = "";
            // Uncomment the line below if you want for the script to not include any links that have
            // anything before the domain name.
            //link_start = match[1];
            domainName = link_start+match[4]+ ".";
            console.log(`Title of "${request.url}" is "${title}"`);
            // Get the HTML of the page and write it to a file.
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);   // Get the HTML content of the page.

            // Use readability.js to read information about the article.
            parsedArticle = getParsedArticle(request.url, bodyHTML);
            console.log("");
            console.log("URL: " + request.url);
            console.log("Article Title: " + parsedArticle.title);
            console.log("Article Byline: " + parsedArticle.byline);
            console.log("Article Text Content: " + parsedArticle.textContent);
            console.log("Article Length: " + parsedArticle.length);
            console.log("Article Excerpt: " + parsedArticle.excerpt);
            console.log("Article HTML Content: " + parsedArticle.content);
            console.log("");

            const hrefs = await page.$$eval('a', as => as.map(a => a.href));    // Get all the hrefs with the links.
            const titles = await page.$$eval('a', as => as.map(a => a.title));  // Get the titles of all the links.
            const texts = await page.$$eval('a', as => as.map(a => a.text));    // Get the text content of all the a tags.
            
            // Create the list of tuples for this url.
            var valid_links = [];
            var tuple_list = [];
            // Set the title of the link to be the text content if the title is not present.
            for (let i = 0; i < hrefs.length; i++) {
                hrefLink = hrefs[i];
                // Checks that the link is a part of the domain.
                if (hrefLink.includes(domainName)) {
                    if (Filter(hrefLink, request.url, valid_links)) {
                        if (titles[i].length === 0) {
                            hrefTitle = texts[i].replace(/ +(?= )/g,'');
                        } else {
                            hrefTitle = titles[i];
                        }
                        // Add the tuple to the list.
                        tuple_list.push([hrefLink, hrefTitle]);
                        valid_links.push(hrefLink);
                    }
                }
                else {
                    out_of_scope_match = hrefLink.match(general_regex)
                    if (out_of_scope_match != null) {
                        out_of_scope_domain = out_of_scope_match[4];
                    
                        if (out_of_scope_domain in incorrect_dict) {
                            incorrect_dict[out_of_scope_domain].push(hrefLink);
                        }
                        else {
                            incorrect_dict[out_of_scope_domain] = [hrefLink];
                        }
                    }

                }
            }
            // Add this list to the dict.
            output_dict[request.url] = tuple_list;

            // Enqueue the deeper URLs to crawl.
            await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
        },
        // The max concurrency and max requests to crawl through.
        maxRequestsPerCrawl: 5,
        maxConcurrency: 10,
    });
    // Run the crawler.
    await crawler.run();
    
    // Delete the apify storage.
    // Note: If the apify_storage file is not removed, it doesn't crawl
    // during subsequent runs.
    // Implementation of rmdir.
    console.log(JSON.stringify(output_dict));
    const rmDir = function (dirPath, removeSelf) {
    if (removeSelf === undefined)
        removeSelf = true;
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        // throw e
        return;
    }
    if (files.length > 0)
        for (let i = 0; i < files.length; i++) {
        const filePath = path.join(dirPath, files[i]);
        if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
        else
            rmDir(filePath);
        }
    if (removeSelf)
        fs.rmdirSync(dirPath);
    };
    rmDir('./apify_storage/', true);

    // Create a JSON file from the tuples in the output list.
    // Overwrites if it already exists.
    fs.writeFileSync("link_title_list.json", JSON.stringify(output_dict), function(err) {
        if (err) throw err;
        console.log('complete');
        });
    fs.writeFileSync("failed_links_list.json", JSON.stringify(incorrect_dict), function(err) {
        if (err) throw err;
        console.log('complete');
        });
});