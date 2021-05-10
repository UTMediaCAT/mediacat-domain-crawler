/* batchCrawl.js
   Author: Raiyan Rahman
   Date: May 7th, 2021
   Description: Crawl the given urls in batches.
   Use: "node batchCrawl.js -f full_scope.csv"
*/

// Imports.
const fs = require('fs');
const util = require('util');
const path = require('path');
const Apify = require('apify');
const { exit } = require('process');
const { transform } = require('csv');
const JSDOM = require('jsdom').JSDOM;
// const mongoose = require('mongoose');
// let appmetrics = require('appmetrics');
const { v5: uuidv5 } = require('uuid');
const { performance } = require('perf_hooks');
// const { performance } = require('perf_hooks');

// Local imports.
const fileOps = require('./fileOps');
const parseHelper = require('./parseHelper');


// Database set up.
// let db = require('./database.js')
// let memInfo = require('./monitor/memoryInfo');
const { url } = require('inspector');
// Open a connection to the database.
// mongoose.connection
//   .once('open', () => console.log('Connected to DB'))
//   .on('error', (error) => { 
//       console.log("Your Error", error);
//   });


// Logging set up.
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
// Overwrite the console.log method.
console.log = function(d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

// Filter function.
function Filter(url, domain_url, valid_links) {
    // Checks that the url has the domain name, it is not a repetition or it is not the same as the original url
    return !valid_links.includes(url) && (url != domain_url)
}


// Monitor the environment.
// process.env.APIFY_MEMORY_MBYTES = 2048 // 30720
// var monitoring = appmetrics.monitor();
// monitoring.on('initialized', function (env) {
//     env = monitoring.getEnvironment();
//     for (var entry in env) {
//         console.log(entry + ':' + env[entry]);
//     };
// });
// monitoring.on('cpu', function (cpu) {
//     console.log('[' + new Date(cpu.time) + '] CPU: ' + cpu.process);
// });


Apify.main(async () => {

    // Get the urls from the command line arguments.
    var is_url = false;
    // If a CSV file is given, parse it.
    if (process.argv[2] == "-f") {
        var url_list = parseHelper.parseCSV(process.argv[3]);
    } else {
        var url_list = [];
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
    }

    
    // Create the JSON object to store the tuples of links and titles for each url.
    var output_dict = {};
    var incorrect_dict = {};
    // Create a directory to hold all the individual JSON files.
    fileOps.mkDir('Results');


    // Keep track of the number of passes across the domains.
    let round = 1;
    let i = 0;
    // Loop through the scope and crawl each domain.
    while (true) {
        // If all urls are complete, begin the next round.
        if (i == url_list.length) {
            i = 0;
            round++;
        }
        // Get the domain url.
        domainURL = url_list[i];
        // Print out the domain that is currently being crawled.
        console.log('//////////////////////////////////////////////////////////');
        console.log("ROUND: " + round + ", CRAWLING: " + domainURL);
        console.log('//////////////////////////////////////////////////////////');
        // Convert the domain URL to be safe to be used as a folder name.
        safeDomain = domainURL.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        // Open the key-value store for this domain.
        const store = await Apify.openKeyValueStore(safeDomain);
        // Open the request queue associated with this domain.
        const requestQueue = await Apify.openRequestQueue(safeDomain);
        // Add the url to the request queue.
        await requestQueue.addRequest({ url: domainURL });
        // Create the list to store pseudourls.
        const pseudoUrls = [];
        // Add the domain to the pseudoURLs.
        let pseudoDomain = domainURL;
        if (domainURL[domainURL.length - 1] !== "/") {
            pseudoDomain += "/[.*]";
        } else {
            pseudoDomain += "[.*]";
        }
        pseudoUrls.push(new Apify.PseudoUrl(pseudoDomain));


        /** CRAWLER CODE START */
        // Initialize the crawler.
        const crawler = new Apify.PuppeteerCrawler({
            requestQueue,
            launchPuppeteerOptions: {
                headless: true,
                stealth: true,
                useChrome: false,
            },
            gotoFunction: async ({request, page}) => {
                // Blacklisted domains.
                blacklisted_domains = ["https://www.derstandard.at/"];
                // Check if this domain is blacklisted.
                let blacklist = false;
                blacklisted_domains.forEach(function(domain) {
                    // Check if the current url belongs to the domain.
                    if (request.url.startsWith(domain)) {
                        blacklist = true;
                    }
                });
                if (!blacklist) {
                    // Set the request interception to true.
                    await page.setRequestInterception(true);
                    // Create the list of different resources that should be blocked.
                    let blockedResources = ['image', 'stylesheet', 'media'];
                    // On loading the request.
                    page.on('request', request => {
                        // If the request is a blocked resource, abort. Load otherwise.
                        if (blockedResources.includes(request.resourceType()))
                        request.abort();
                        else
                        request.continue();
                    });
                }
                // Navigate to the page.
                await page.goto(request.url);
            },
            handlePageFunction: async ({ request, page }) => {
                if (request.loadedUrl == 'https://apps.derstandard.at/privacywall/') {
                    await page.$eval('button.privacy-button-secondary-dark', el => el.click());
                }
                const t2 = performance.now();
                const title = await page.title();   // Get the title of the page.
                let domainNameIndex = 5;
                let general_regex = /(http(s)?:\/\/((w|W){3}\.)?)([^.]+)((\.[a-zA-Z]+)+)/;
                let match = request.url.match(general_regex);
                domainName = match[4]+ "";
                let twitter_url = /(^http(s)?:\/\/(www\.)?)twitter.com(.*)$/;
                var domainRegex = new RegExp("(http(s)?:\/\/(www\\.)?)([a-zA-Z]+\\.)*"+domainName+"\\.(.*)");

                console.log(`Title of "${request.url}" is "${title}"`);
                // Get the HTML of the page and write it to a file.
                let bodyHTML = await page.evaluate(() => document.body.innerHTML);   // Get the HTML content of the page.

                // Use readability.js to read information about the article.
                parsedArticle = parseHelper.getParsedArticle(request.url, bodyHTML);

                const hrefs = await page.$$eval('a', as => as.map(a => a.href));    // Get all the hrefs with the links.
                const titles = await page.$$eval('a', as => as.map(a => a.title));  // Get the titles of all the links.
                const texts = await page.$$eval('a', as => as.map(a => a.text));    // Get the text content of all the a tags.
                

                // Create the list of tuples for this url.
                var valid_links = [];
                var tuple_list = [];
                var local_out_of_scope = [];
                // Set the title of the link to be the text content if the title is not present.
                for (let i = 0; i < hrefs.length; i++) {
                    hrefLink = hrefs[i];
                    // Checks that the link is a part of domain.
                    let inscope = false;
                    
                    for (let l_i = 0; l_i < url_list.length; l_i++) {
                        dom_orig = url_list[l_i];
                        match = dom_orig.match(general_regex);
                        if (match != null && match.length > 5) {
                            domainName = match[domainNameIndex];
                            //console.log("Links: "+domainName+" "+hrefLink);
                            domainRegex = new RegExp("(http(s)?:\/\/(www\\.)?)([a-zA-Z]+\\.)*"+domainName+"\\.(.*)");
                            //if(hrefLink.includes("www.")) {
                            //    console.log(hrefLink+" "+domainName+" "+dom_orig + " https://www.cnn.com "+"https://www.cnn.com".match(general_regex)[domainNameIndex]);
                            //}
                            if (domainRegex.test(hrefLink) || twitter_url.test(hrefLink)) {
                                inscope = true;
                            }
                        }
                    }
                    if (inscope) {
                        if (Filter(hrefLink, request.url, valid_links)) {
                            if (titles[i].length === 0) {
                                hrefTitle = texts[i].replace(/ +(?= )/g,'');
                            } else {
                                hrefTitle = titles[i];
                            }
                            // Add the tuple to the list.
                            let found_elem = {
                                title: hrefTitle,
                                url: hrefLink
                            }
                            tuple_list.push(found_elem);
                            valid_links.push(hrefLink);
                        }
                    }
                    else {
                        out_of_scope_match = hrefLink.match(general_regex)
                        if (out_of_scope_match != null) {
                            out_of_scope_domain = out_of_scope_match[domainNameIndex];
                        
                            if (out_of_scope_domain in incorrect_dict) {
                                incorrect_dict[out_of_scope_domain].push(hrefLink);
                            }
                            else {
                                incorrect_dict[out_of_scope_domain] = [hrefLink];
                            }
                        }
                        // Check if this domain name already exists inside.
                        local_out_of_scope.push(hrefLink);
                    }
                }
                // Get the domain.
                let listIndex = 0;
                let foundDomain = false;
                while (listIndex < url_list.length && !foundDomain) {
                    dom_orig = url_list[listIndex];
                    match = dom_orig.match(general_regex);
                    if (match != null && match.length > 5) {
                        domainName = match[domainNameIndex];
                        domainRegex = new RegExp("(http(s)?:\/\/(www\\.)?)([a-zA-Z]+\\.)*"+domainName+"\\.(.*)");
                        if (domainRegex.test(request.url)) {
                            foundDomain = true;
                        } else {
                            listIndex++;
                        }
                    } else {
                        listIndex++;
                    }
                }

                let elem = {
                    title: parsedArticle.title,
                    title_metascraper: '',
                    url: request.url,
                    author_metadata: parsedArticle.byline,
                    author_metascraper: '',
                    date: '',
                    html_content: parsedArticle.content,
                    article_text: parsedArticle.textContent,
                    article_len: parsedArticle.length,
                    domain: url_list[listIndex],
                    updated: false,
                    found_urls: tuple_list
                }
                
                let folderName = "results/" + url_list[listIndex].replace(/[^a-z0-9]/gi, '_').toLowerCase() + "/"

                // Create a directory to hold all this domain's files.
                fileOps.mkDir(folderName);

                // Create a JSON for this link with a uuid.
                let fileName = uuidv5(request.url, uuidv5.URL) + ".json";
                fs.writeFileSync(folderName + fileName, JSON.stringify(elem), function(err) {
                    if (err) throw err;
                    console.log('complete');
                });

                // Save a PDF of the page.
                console.log("Saving PDF of " + request.url);
                const pdfBuffer = await page.pdf({ format: 'A4' });
                let pdfName = uuidv5(request.url, uuidv5.URL);
                await store.setValue(pdfName, pdfBuffer, { contentType: 'application/pdf' });
                //Write into a database

                // let metaObj = new db.metaModel(elem);

                // await metaObj.save();

                // print memory stats about process
                // memInfo.getMemoryInfo(process.memoryUsage())

                // Add this list to the dict.
                output_dict[request.url] = elem;

                const t3 = performance.now();
                // Log the time for this request.
                console.log(`Call to "${request.url}" took ${t3/1000.0 - t2/1000.0} seconds.`);

                // Enqueue the deeper URLs to crawl.
                await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
            },
            // The max concurrency and max requests to crawl through.
            // maxRequestsPerCrawl: Infinity,
            maxRequestsPerCrawl: 5 * round,
            maxConcurrency: 50,
        });
        /** CRAWLER CODE END */


        // Start time.
        const t0 = performance.now();
        // Run the crawler.
        await crawler.run();
        // End time.
        const t1 = performance.now();
        // Log the time to run the crawler.
        console.log(`Finished crawling ${url_list[i]} ${t1/1000.0 - t0/1000.0} milliseconds.`);
        // Increment the index of the current url.
        i++;
    }

});