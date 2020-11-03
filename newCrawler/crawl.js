/* crawl.js
   Author: Raiyan Rahman
   Date: March 1st, 2020
   Description: This script takes in one or more urls and then crawls those
   dynamically rendered webpages and returns the JSON file containing lists
   of tuples of links and titles for each url.
   Use: "node crawl.js -l <url1> ..."
   Output: link_title_list.json, failed_link_list.json
*/
const Apify = require('apify');
const path = require('path');
let { Readability } = require('@mozilla/readability');
let JSDOM = require('jsdom').JSDOM;
const { v5: uuidv5 } = require('uuid');

let fs = require('fs');
let util = require('util');
let log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
let log_stdout = process.stdout;

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

};

function getParsedArticle(url, html) {
    let doc = new JSDOM(html, {
        url: url
      });
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    return article
}

Apify.main(async () => {
    // Get the urls from the command line arguments.
    let url_list = [];
    let is_url = false;
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

    // Create the JSON object to store the tuples of links and titles for each url.
    let output_dict = {};
    let incorrect_dict = {};

    const requestQueue = await Apify.openRequestQueue();
    // Crawl the deeper URLs recursively.
    const pseudoUrls = [];
    // Add the links to the queue of websites to crawl.
    for (let i = 0; i < url_list.length; i++) {
        await requestQueue.addRequest({ url: url_list[i] });
        // Add the domain to the pseudoURLs.
        let pseudoDomain = url_list[i];
        if (url_list[i][url_list[i].length - 1] !== "/") {
            pseudoDomain += "/[.*]";
        } else {
            pseudoDomain += "[.*]";
        }
        pseudoUrls.push(new Apify.PseudoUrl(pseudoDomain));
    }

    // Initialize the crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        launchPuppeteerOptions: {
            headless: true,
            stealth: false,
            useChrome: false,
        },
        handlePageFunction: async ({ request, page }) => {

            let general_regex = /(http(s)?:\/\/(www\.)?)([^.]+)((\.[a-zA-Z]+)+)/;
            let match = request.url.match(general_regex);
            let link_start = "";
            // Uncomment the line below if you want for the script to not include any links that have
            // anything before the domain name.
            //link_start = match[1];
            domainName = link_start+match[4]+ ".";


            const title = await page.title();   // Get the title of the page.
            // Get the HTML of the page and write it to a file.
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);   // Get the HTML content of the page.

            // Use readability.js to read information about the article.
            parsedArticle = getParsedArticle(request.url, bodyHTML);

            const hrefs = await page.$$eval('a', as => as.map(a => a.href));    // Get all the hrefs with the links.
            const titles = await page.$$eval('a', as => as.map(a => a.title));  // Get the titles of all the links.
            const texts = await page.$$eval('a', as => as.map(a => a.text));    // Get the text content of all the a tags.
            
            // Set the title of the link to be the text content if the title is not present.
            // Create the list of tuples for this url.
            let valid_links = [];
            let tuple_list = [];
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
            // Save a PDF of the page.
            console.log("Saving PDF of " + request.url);
            const pdfBuffer = await page.pdf({ format: 'A4' });
            let pdfName = uuidv5(request.url, uuidv5.URL);
            await Apify.setValue(pdfName, pdfBuffer, { contentType: 'application/pdf' });
            
            // Create the article information dictionary.
            let elem = {
                title: parsedArticle.title,
                author_metadata: parsedArticle.byline,
                date: '',
                html_content: parsedArticle.content,
                article_text: parsedArticle.textContent,
                article_len: parsedArticle.length,
                url: request.url,
                pdf_filename: pdfName + '.pdf',
                found_urls: tuple_list
            }
            // Add this list to the dict.
            output_dict[request.url] = elem;

            // Enqueue the deeper URLs to crawl.
            await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
        },
        // The max concurrency and max requests to crawl through.
        maxRequestsPerCrawl: 1,
        maxConcurrency: 10,
    });
    // Run the crawler.
    await crawler.run();
    
    // Delete the apify storage.
    // Note: If the apify_storage file is not removed, it doesn't crawl
    // during subsequent runs.
    // Implementation of rmdir.
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
    rmDir('./apify_storage/request_queues', true);

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