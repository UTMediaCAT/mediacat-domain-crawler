/* crawl.js
   Author: Raiyan Rahman
   Date: March 1st, 2020
   Description: This script takes in one or more urls and then crawls those
   dynamically rendered webpages and returns the JSON file containing lists
   of tuples of links and titles for each url.
   Use: "node crawl.js -l <url1> ..."
   Output: link_title_list.json
*/

// set process environmental variable
process.env.APIFY_MEMORY_MBYTES = 2048

// let appmetrics = require('appmetrics');
const Apify = require('apify');
const path = require('path');
var { Readability } = require('@mozilla/readability');
var JSDOM = require('jsdom').JSDOM;

//email
let nodemailer = require('nodemailer');

let {mailOptions, mailError, mailOptionsCheerio, mailErrorCheerio} = require('./email')

const { v5: uuidv5 } = require('uuid');
const parse = require('csv-parse/lib/sync')
const { performance } = require('perf_hooks');

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
// const mongoose = require('mongoose');
// let db = require('./database.js')
let db = "";
let memInfo = require('./monitor/memoryInfo')

let argv = require('minimist')(process.argv.slice(2));

let maxRequests = 20;

const {log} = Apify.utils
log.setLevel(log.LEVELS.DEBUG)

// mongoose.connection
//   .once('open', () => console.log('Connected to DB'))
//   .on('error', (error) => { 
//       console.log("Your Error", error);
//   });

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

// Uncomment to see monitoring of the environment on the output

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


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mediacatut@gmail.com',
      pass: "DO NOT COMMIT THIS password"
    }
});

Apify.main(async () => {
    // Get the urls from the command line arguments.
    var is_url = false;

    if ("f" in argv) {
        var url_list = parseCSV(process.argv[3]);
    } else {
        var url_list = [];

        var links = argv._ // where the links are in the argv dic

        links.forEach(function (val, index, array) {
            url_list.push(val);
        });
    }

    if ("n" in argv) {
        var number = argv.n

        if (number === "Infinity" || number == "infinity" || number == "inf") {
            maxRequests = Infinity
        } else {
            maxRequests = parseInt(number)
        }
    }
    
    if ("t" in argv) {
        db = require('./test/crawl-test/database.js')
    } else {{
        db = require('./databaseCheerio.js')
    }}

    console.log(argv); // output the arguments

    console.log(url_list);  // Ouput the links provided.

    // Create the JSON object to store the tuples of links and titles for each url.
    var output_dict = {};
    var incorrect_dict = {};
    const requestQueue = await Apify.openRequestQueue();
    // Crawl the deeper URLs recursively.
    const pseudoUrls = [];
    // Add the links to the queue of websites to crawl.
    for (var i = 0; i < url_list.length; i++) {
        console.log("requestQueue will add...")
        console.log({ url: url_list[i] });
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

    console.log("making results directory....");

    // Create a directory to hold all the individual JSON files.

    try {
        fs.mkdirSync(path.join(__dirname, 'results')); 
        console.log("finished making results directory...");
    } catch(e){
        console.error(e);
        console.log("error in creating results folder");

    }


    // Initialize the crawler.
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        // launchPuppeteerOptions: {
        //     headless: true,
        //     stealth: true,
        //     useChrome: false,
        // },
        handlePageFunction: async ({ request, response, body, contentType, $ }) => {
            const t2 = performance.now();

            const data = [];

            // const title = await page.title();   // Get the title of the page.
            
            const title = $('title').text();

            log.debug(`Processing ${request.url}`)

            let domainNameIndex = 5;
            let general_regex = /(http(s)?:\/\/((w|W){3}\.)?)([^.]+)((\.[a-zA-Z]+)+)/;
            let match = request.url.match(general_regex);
            domainName = match[4]+ "";
            let twitter_url = /(^http(s)?:\/\/(www\.)?)twitter.com(.*)$/;
            var domainRegex = new RegExp("(http(s)?:\/\/(www\\.)?)([a-zA-Z]+\\.)*"+domainName+"\\.(.*)");

            console.log(`Title of "${request.url}" is "${title}"`);


            // Get the HTML of the page and write it to a file.
            // let bodyHTML = await page.evaluate(() => document.body.innerHTML);   // Get the HTML content of the page.
            let bodyHTML = $.html();   // Get the HTML content of the page.

            // Use readability.js to read information about the article.
            parsedArticle = getParsedArticle(request.url, bodyHTML);

            // CHANGE THIS PART!!!!!!



            let extractlist = Apify.utils.extractUrls(
                {
                    string: $.html()

                }
            )

            // console.log("EXTRACTER")
            // console.log(extractlist)



            let hrefs = []
            let titles = []
            let texts = []

            let links = $('a'); 

            // console.log("title");
            // console.log(title);
            // console.log("page links over here!!!!!");
            // console.log(links);

            // console.log("page links over here2!!!!!");
            // console.log($(links));


            // console.log("request queue")
            // console.log(requestQueue)


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

            $(links).each(function(i, link){
                texts.push($(link).text());

                if ($(link).attr('href') !== undefined) {

                    // relative links
                    if ($(link).attr('href').startsWith('/')){

                        hrefs.push(url_list[listIndex].replace(/\/$/, "") + '/' + $(link).attr('href').replace(/^\/+/g, ''));
                        // console.log(url_list[listIndex].replace(/\/$/, "") + '/' + $(link).attr('href').replace(/^\/+/g, ''));
                        
                    // absolute links
                    } else if ($(link).attr('href').startsWith('http')){
                        hrefs.push($(link).attr('href'));
                    } else {
                        hrefs.push('');
                    }

                } else {
                    hrefs.push('');
                }


                if ( typeof $(link).attr('title') !== 'undefined' && $(link).attr('title') ) {
                    titles.push($(link).attr('title'));
                } else {
                    titles.push('');
                }
                
            });       
            
            
            //const hrefs = await page.$$eval('a', as => as.map(a => a.href));    // Get all the hrefs with the links.
            //const titles = await page.$$eval('a', as => as.map(a => a.title));  // Get the titles of all the links.
            //const texts = await page.$$eval('a', as => as.map(a => a.text));    // Get the text content of all the a tags.
            
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
            /*
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
            */

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
                out_of_scope_urls: local_out_of_scope,
                extractor: extractlist
            }

            //save data onto dataset

            await Apify.pushData(elem);

            // Create a JSON for this link with a uuid.
            let fileName = uuidv5(request.url, uuidv5.URL) + ".json";
            fs.writeFileSync(path.join(__dirname, 'results', fileName), JSON.stringify(elem), function(err) {
                if (err) throw err;
                console.log('complete');
            });

            //Write into a database

            let metaObj = new db.metaModel(elem);

            await metaObj.save();

            // print memory stats about process
            memInfo.getMemoryInfo(process.memoryUsage())

            // Add this list to the dict.
            output_dict[request.url] = elem;

            const t3 = performance.now();
            // Log the time for this request.
            console.log(`Call to "${request.url}" took ${t3/1000.0 - t2/1000.0} seconds.`);


            // Enqueue the deeper URLs to crawl manually

            for (var i = 0, l = tuple_list.length; i < l; i++) {
                await requestQueue.addRequest({url: tuple_list[i].url})
            }

            // // Enqueue the deeper URLs to crawl.
            // await Apify.utils.enqueueLinks({ $, pseudoUrls, requestQueue, baseUrl: request.loadedUrl });
        },
        // The max concurrency and max requests to crawl through.
        maxRequestsPerCrawl: maxRequests,
        minConcurrency: 20,
        maxConcurrency: 100,
    });

    const t0 = performance.now();

    // Run the crawler.
    try {
        console.log("running the cheerio crawler...\n")
        await crawler.run();
        await sendMail(mailOptionsCheerio);

    } catch(e){
        console.error(e);
        await sendMail(mailErrorCheerio);
    }  

    const t1 = performance.now();
    // Log the time to run the crawler.
    console.log(`Call to run Crawler took ${t1/1000.0 - t0/1000.0} milliseconds.`);
    
    // Delete the apify storage.
    // Note: If the apify_storage file is not removed, it doesn't crawl
    // during subsequent runs.
    // Implementation of rmdir.
    // console.log(JSON.stringify(output_dict));

    console.log("removing apify storage")
    rmDir('./apify_storage/', true);

});  


function sendMail (mailOptionsCheerio){
    return new Promise(function (resolve, reject){
       transporter.sendMail(mailOptionsCheerio, (err, info) => {
          if (err) {
             console.log("error: ", err);
             console.log("email could not be sent");
             reject(err);
          } else {
             console.log(`Mail sent successfully!`);
             resolve(info);
          }
       });
    });
 
 }

function rmDir (dirPath, removeSelf){
    if (removeSelf === undefined)
        removeSelf = true;
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        // throw e
        console.error(e);
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
