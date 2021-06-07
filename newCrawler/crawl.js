/* crawl.js
   Author: Raiyan Rahman
   Date: May 12th, 2021
   Description: Crawl the given urls or CSV of domains.
   Parameters: -l : links separated by spaces
               -f : csv file containing the scope
               -n : the number of requests to crawl through
   Usage: "node crawl.js -f full_scope.csv"
          "node crawl.js -n 50000 -f full_scope.csv"
          "node crawl.js -l https://www.nytimes.com/ https://cnn.com/"
*/


process.env.APIFY_MEMORY_MBYTES = 2048 // 30720


// Imports
var fs = require('fs');
var util = require('util');
const path = require('path');
const Apify = require('apify');
const { v5: uuidv5 } = require('uuid');
// let appmetrics = require('appmetrics');
const { performance } = require('perf_hooks');


// Local imports.
const fileOps = require('./fileOps');
const parseHelper = require('./parseHelper');


// Logging set up.
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
console.log = function(d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};


// // Email set up.
// let nodemailer = require('nodemailer');
// let {mailOptions, mailError} = require('./email')
// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'mediacatut@gmail.com',
//       pass: "DO NOT COMMIT THIS password"
//     }
// });


// // Database set up.
// const mongoose = require('mongoose');
// // let db = require('./database.js')
// let db = "";
// let memInfo = require('./monitor/memoryInfo')
// mongoose.connection
//   .once('open', () => console.log('Connected to DB'))
//   .on('error', (error) => { 
//       console.log("Your Error", error);
//   });


// Args set up.
let argv = require('minimist')(process.argv.slice(2));


// Default maximum number of requests to crawl.
let maxRequests = 20;


// Filter function.
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


// Monitor the environment.
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

    // Argument Parsing.
    // Get the urls from the command line arguments.
    var is_url = false;
    var url_list = []
    let batchScopeFile = []
    if ("f" in argv) {
        url_list = parseHelper.parseCSV(argv.f);
        batchScopeFile = url_list
    } else {
        // If the links are provided in the arguments.
        url_list = [];
        var links = argv._ // where the links are in the argv dic
        links.forEach(function (val, index, array) {
            url_list.push(val);
        });
        batchScopeFile = url_list
    }
    // Get the number of requests.
    if ("n" in argv) {
        var number = argv.n

        if (number === "Infinity" || number == "infinity" || number == "inf") {
            maxRequests = Infinity;
        } else {
            maxRequests = parseInt(number);
        }
    }
    // Configure the database.
    if ("t" in argv) {
        db = require('./test/crawl-test/database.js');
    } else {{
        db = require('./database.js');
    }}
    // Configure the batch scope.
    if ("b" in argv) {
        batchScopeFile = parseHelper.parseCSV(argv.b);
    }
    // Logging.
    console.log(argv); // output the arguments

    console.log(url_list);  // Ouput the links provided.


    // Create the JSON object to store the tuples of links and titles for each url.
    var output_dict = {};
    var incorrect_dict = {};
    const requestQueue = await Apify.openRequestQueue();
    
    // Crawl the deeper URLs recursively.
    const pseudoUrls = [];
    // Add the links to the queue of websites to crawl.
    for (var i = 0; i < batchScopeFile.length; i++) {
        await requestQueue.addRequest({ url: batchScopeFile[i] });
        // Add the domain to the pseudoURLs.
        let pseudoDomain = batchScopeFile[i];
        if (batchScopeFile[i][batchScopeFile[i].length - 1] !== "/") {
            pseudoDomain += "/[.*]";
        } else {
            pseudoDomain += "[.*]";
        }
        pseudoUrls.push(new Apify.PseudoUrl(pseudoDomain));
    }
    console.log('Making results directory...');

    // Create a directory to hold all the individual JSON files.
    fileOps.mkDir("Results");

    // Initialize the crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        launchPuppeteerOptions: {
            headless: true,
            stealth: true,
            useChrome: false,
        },
        handlePageFunction: async ({ request, page }) => {
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
            while (listIndex < batchScopeFile.length && !foundDomain) {
                dom_orig = batchScopeFile[listIndex];
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
                domain: batchScopeFile[listIndex],
                updated: false,
                found_urls: tuple_list,
                out_of_scope_urls: local_out_of_scope
            }

            // Create a JSON for this link with a uuid.
            let timestamp = new Date().getTime();
            let fileName = uuidv5(request.url, uuidv5.URL) + "_" + timestamp.toString() + ".json";
            fs.writeFileSync(path.join(__dirname, 'results', fileName), JSON.stringify(elem), function(err) {
                if (err) throw err;
                console.log('complete');
            });

            // //Write into a database

            // let metaObj = new db.metaModel(elem);

            // await metaObj.save();

            // // print memory stats about process
            // memInfo.getMemoryInfo(process.memoryUsage())

            // Add this list to the dict.
            output_dict[request.url] = elem;

            const t3 = performance.now();
            // Log the time for this request.
            console.log(`Call to "${request.url}" took ${t3/1000.0 - t2/1000.0} seconds.`);


            // Enqueue the deeper URLs to crawl manually
            for (var i = 0, l = tuple_list.length; i < l; i++) {
                await requestQueue.addRequest({ url: tuple_list[i].url });
            }

            // // Enqueue the deeper URLs to crawl.
            // await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
        },
        // The max concurrency and max requests to crawl through.
        maxRequestsPerCrawl: Infinity,
        maxRequestsPerCrawl: maxRequests,
        minConcurrency: 20,
        maxConcurrency: 100,
    });

    const t0 = performance.now();

    // Run the crawler.

    try {
        console.log('running the crawler...\n')
        await crawler.run();
        // await sendMail(mailOptions);

    } catch(e){
        console.log(e)
        // await sendMail(mailOptions);
    }

    const t1 = performance.now();
    // Log the time to run the crawler.
    console.log(`Call to run Crawler took ${t1/1000.0 - t0/1000.0} milliseconds.`);
    
    // Delete the apify storage.
    // Note: If the apify_storage file is not removed, it doesn't crawl
    // during subsequent runs.
    // console.log(JSON.stringify(output_dict));
    console.log("removing apify storage")
    fileOps.rmDir('./apify_storage/', true);
});


// function sendMail (mailOptions){
//     return new Promise(function (resolve, reject){
//        transporter.sendMail(mailOptions, (err, info) => {
//           if (err) {
//              console.log("error: ", err);
//              console.log("email could not be sent");
//              reject(err);
//           } else {
//              console.log(`Mail sent successfully!`);
//              resolve(info);
//           }
//        });
//     });

//  }
