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
const { v5: uuidv5 } = require('uuid');
const parse = require('csv-parse/lib/sync')

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

function parseCSV(file){
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
    // Asynchronous method below.
    // fs.createReadStream(file)
    // .pipe(csv())
    // .on('data', (row) => {
    //   urls.push(row["Source"]);
    // //   console.log(row);
    // })
    // .on('end', () => {
    //   // print CSV file successfully processed
    //   console.log('CSV file successfully processed');
    // //   console.log(urls);
    //   return urls;
    // });
}

Apify.main(async () => {
    // Get the urls from the command line arguments.
    var is_url = false;
    // If a CSV file is given, parse it.
    if (process.argv[2] == "-f") {
        var url_list = parseCSV(process.argv[3]);
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
    console.log(url_list);  // Ouput the links provided.

    // Create the JSON object to store the tuples of links and titles for each url.
    var output_dict = {};
    var incorrect_dict = {};
    const requestQueue = await Apify.openRequestQueue();
    // Crawl the deeper URLs recursively.
    const pseudoUrls = [];
    // Add the links to the queue of websites to crawl.
    for (var i = 0; i < url_list.length; i++) {
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

    // Create a directory to hold all the individual JSON files.
    fs.mkdir(path.join(__dirname, 'results'), (err) => { 
        if (err) { 
            return console.error(err);
        } 
        console.log('Results folder created.'); 
    }); 

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
            parsedArticle = getParsedArticle(request.url, bodyHTML);

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
                url: request.url,
                author_metadata: parsedArticle.byline,
                date: '',
                html_content: parsedArticle.content,
                article_text: parsedArticle.textContent,
                article_len: parsedArticle.length,
                domain: url_list[listIndex],
                found_urls: tuple_list,
                out_of_scope_urls: local_out_of_scope
            }

            // Create a JSON for this link with a uuid.
            let fileName = uuidv5(request.url, uuidv5.URL) + ".json";
            fs.writeFileSync("results/" + fileName, JSON.stringify(elem), function(err) {
                if (err) throw err;
                console.log('complete');
            });
            // Add this list to the dict.
            output_dict[request.url] = elem;

            // Enqueue the deeper URLs to crawl.
            await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
        },
        // The max concurrency and max requests to crawl through.
        // maxRequestsPerCrawl: 20,
        maxConcurrency: 20,
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

});
