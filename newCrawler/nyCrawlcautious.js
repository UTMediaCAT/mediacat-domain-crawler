/* nyCrawl.js
   Author: Shengsong Xu, Gy Hong
   Date: Apr 16th, 2022
   Description: Crawl the NYTimes search archive here: https://www.nytimes.com/search?dropmab=true&query=&sort=newest
   Parameters: -f : csv file containing the scope
               -n : number of pages to crawl per round for each domain (default is 5000)
               -r : the maximum number of rounds
               -pdf : use this parameter if PDFs are to be saved
               -log : custom filename for the log file (default is debug.log)
               -e : crawler will send email to the recipients if get too many error or finished crawling
   Usage: "node nyCrawl.js -f full_scope.csv"
          "node nyCrawl.js -n 10 -f full_scope.csv"
          "node nyCrawl.js -r 5 -f full_scope.csv"
          "node nyCrawl.js -pdf -f full_scope.csv"
*/

// Imports.
const fs = require("fs");
const util = require("util");
const parseHelper = require("./parseHelper");
// const path = require('path');
const Apify = require("apify");
const { puppeteer } = Apify.utils;
// const { exit } = require('process');
// const { transform } = require('csv');
// const JSDOM = require('jsdom').JSDOM;
// const mongoose = require('mongoose');
// let appmetrics = require('appmetrics');
const { v5: uuidv5 } = require("uuid");
const { performance } = require("perf_hooks");

// Local imports.
const fileOps = require("./fileOps");
const email = require("./email");

const MAXIMUM_FAIL_TIME = 50;

// Database set up.
// let db = require('./database.js')
// let memInfo = require('./monitor/memoryInfo');
// const { url } = require('inspector');
// Open a connection to the database.
// mongoose.connection
//   .once('open', () => console.log('Connected to DB'))
//   .on('error', (error) => {
//       console.log("Your Error", error);
//   });

// Logging set up.
function logSetUp(filename) {
  // Check if the filename starts with a forward slash. Add one if not present.
  if (filename[0] !== "/") {
    filename = "/" + filename;
  }
  var log_file = fs.createWriteStream(__dirname + filename, {
    flags: "w",
  });
  var log_stdout = process.stdout;
  // Overwrite the console.log method.
  console.log = function (d) {
    log_file.write(util.format(d) + "\n");
    log_stdout.write(util.format(d) + "\n");
  };
}

// Filter function.
function Filter(url, domain_url, valid_links) {
  // Checks that the url has the domain name, it is not a repetition or it is not the same as the original url
  return !valid_links.includes(url) && url != domain_url;
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

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

Apify.main(async () => {
  // Argument Parsing.
  // Get the urls from the command line arguments.
  var is_url = false;
  var f_index = process.argv.indexOf("-f");
  var l_index = process.argv.indexOf("-l");
  var e_index = process.argv.indexOf("-e");
  var stealth_index = process.argv.indexOf("-stealth");
  if (s_index != -1) {
    var needScroll = true;
  } else {
    var needScroll = false;
  }
  if (stealth_index != -1) {
    console.log("use stealth mode");
    var maxConcurrency = 1;
    var waitRad = parseInt(process.argv[stealth_index + 1]);
  } else {
    var maxConcurrency = 20;
  }
  // If a CSV file is given, parse it.
  if (f_index != -1) {
    var url_list = parseHelper.parseCSV(process.argv[f_index + 1]);
  } else if (l_index != -1) {
    var url_list = [];
    process.argv.forEach(function (val, index, array) {
      // Add the links.
      if (is_url) {
        url_list.push(val);
      }
      // If it is a flag for the link.
      if (val === "-l") {
        is_url = true;
      }
    });
  }
  // Check if there is a given number of pages to crawl in each round for each domain.
  var pagesPerRound = 5;
  var n_index = process.argv.indexOf("-n");
  if (n_index != -1) {
    pagesPerRound = parseInt(process.argv[n_index + 1]);
  }
  if (e_index != -1) {
    var sendEmail = true;
    var recipients = process.argv[e_index + 1];
    console.log(`will send email to ${recipients}`);
  } else {
    var sendEmail = false;
  }
  // Check if there is a given number of rounds to run the crawler for.
  var maxRounds = -1;
  var infiniteRounds = true;
  var r_index = process.argv.indexOf("-r");
  if (r_index != -1) {
    infiniteRounds = false;
    maxRounds = parseInt(process.argv[r_index + 1]);
  }
  // Check if PDFs should be saved.
  var savePDF = false;
  var pdf_index = process.argv.indexOf("-pdf");
  if (pdf_index != -1) {
    savePDF = true;
  }

  // Check for a custom log filename.
  var debugLogFilename = "/debug.log";
  var logFilename_index = process.argv.indexOf("-log");
  if (logFilename_index != -1) {
    debugLogFilename = process.argv[logFilename_index + 1];
  }
  // Set up the logging.
  logSetUp(debugLogFilename);

  // // Create the JSON object to store the tuples of links and titles for each url. Uses up a lot of memory when used.
  // var output_dict = {};
  // var incorrect_dict = {};

  // Create a directory to hold all the individual JSON files.
  fileOps.mkDir("Results");

  // Timestamp for the beginning of the crawl.
  let startTime = Date.now();

  // Keep track of the number of passes across the domains.
  let round = 1;
  let i = 0;
  // initialize failed_request_count
  let failed_request_count = 0;
  // Loop through the scope and crawl each domain.
  while (infiniteRounds || round <= maxRounds) {
    // Get the domain url.
    domainURL = url_list[i];
    // Get the time.
    let currTime = Math.floor((Date.now() - startTime) / 1000);
    // Print out the domain that is currently being crawled.
    console.log(
      "//////////////////////////////////////////////////////////////////////////////////////////////////////////////"
    );
    console.log(
      `[Elapsed Time: ${new Date(currTime * 1000)
        .toISOString()
        .substr(11, 8)}] ROUND ${round}, CRAWLING URL ${i + 1} of ${
        url_list.length
      }: ${domainURL}`
    );
    console.log(
      "//////////////////////////////////////////////////////////////////////////////////////////////////////////////"
    );
    // Convert the domain URL to be safe to be used as a folder name.
    safeDomain = domainURL.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    if (i === 0) {
      var sreach_url = safeDomain;
      console.log("here:" + sreach_url);
    }
    // Open the key-value store for this domain.
    const store = await Apify.openKeyValueStore(safeDomain);
    // Open the request queue associated with this domain.
    const requestQueue = await Apify.openRequestQueue(safeDomain);
    // Add the url to the request queue.
    await requestQueue.addRequest({
      url: domainURL,
    });

    // Create the list to store pseudourls.
    const pseudoUrls = [];

    // Add the domain to the pseudoURLs. These automatically created pseudo URLs will match all pages within the domain.
    let pseudoDomain = domainURL;
    if (domainURL[domainURL.length - 1] !== "/") {
      pseudoDomain += "/[.*]";
    } else {
      pseudoDomain += "[.*]";
    }
    pseudoUrls.push(
      new Apify.PseudoUrl(
        /https:\/\/www\.nytimes\.com\/[0-9]{4}\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*/
      )
    );
    // open a dataset
    await Apify.openDataset();

    // For only specific parts of the domain to be crawled, custom REGEX expressions can be added here.
    // Make sure that the automatically generated pseudo URL is not in the list in this case or it will still match all URLs from the domain.
    // pseudoUrls.push(new Apify.PseudoUrl(/https:\/\/www\.nytimes\.com\/[a-zA-Z0-9\/]*\/world\/middleeast\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/));    // NYTimes Middle East Section REGEX
    // pseudoUrls.push(new Apify.PseudoUrl(/https:\/\/www\.nytimes\.com\/[a-zA-Z0-9\/]*\/politics\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/));    // NYTimes Politics Section REGEX

    // get current date for end_date //
    var endDate = new Date();
    const year = endDate.getFullYear().toString();
    let month = 0;
    if (endDate.getMonth() >= 9) {
      month = (1 + endDate.getMonth()).toString();
    } else {
      month = "0" + (1 + endDate.getMonth()).toString();
    }
    let date = 0;
    if (endDate.getDate() >= 10) {
      date = endDate.getDate().toString();
    } else {
      date = "0" + endDate.getDate().toString();
    }
    var endDateStr = year + month + date;

    /** CRAWLER CODE START */
    // Initialize the crawler.
    const crawler = new Apify.PuppeteerCrawler({
      requestQueue,
      launchContext: {
        useChrome: false,
        stealth: false,
        launchOptions: {
          headless: true,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
      },
      // gotoFunction: async ({
      //     request,
      //     page
      // }) => {
      //     // Blacklisted domains.
      //     blacklisted_domains = ["https://www.derstandard.at/"];
      //     // Check if this domain is blacklisted.
      //     let blacklist = false;
      //     blacklisted_domains.forEach(function (domain) {
      //         // Check if the current url belongs to the domain.
      //         if (request.url.startsWith(domain)) {
      //             blacklist = true;
      //         }
      //     });
      //     if (!blacklist) {
      //         // Set the request interception to true.
      //         await page.setRequestInterception(true);
      //         // Create the list of different resources that should be blocked.
      //         let blockedResources = ['image', 'stylesheet', 'media'];
      //         // On loading the request.
      //         page.on('request', request => {
      //             // If the request is a blocked resource, abort. Load otherwise.
      //             if (blockedResources.includes(request.resourceType()))
      //                 request.abort();
      //             else
      //                 request.continue();
      //         });
      //     }
      //     // Navigate to the page.
      //     await page.goto(request.url);
      // },
      browserPoolOptions: {
        useFingerprints: true,
      },
      handlePageFunction: async ({ request, page, response }) => {
        // sleep random seconds before crawl to avoid 403 block in stealth mode
        if (maxConcurrency === 1) {
          const waitTime = Math.floor(Math.random() * waitRad);
          await delay(waitTime + waitRad);
        }

        if (request.loadedUrl === "https://apps.derstandard.at/privacywall/") {
          await page.$eval("button.privacy-button-secondary-dark", (el) =>
            el.click()
          );
        }
        const t2 = performance.now();

        if (+response._status >= 400 && +response._status !== 404) {
          console.log(
            `failed at ${request.url} with ${response._status}, ${failed_request_count}/10`
          );
          // failed_request_count++;
          throw response._status;
        }

        // scroll down the page if needed
        if (needScroll) {
          await autoScroll(page);
        }

        if (request.url.includes("https://www.nytimes.com/search?")) {
          const ti0 = performance.now();
          var j = 0;
          while (j < 35) {
            // await Apify.utils.enqueueLinks({
            //     page,
            //     selector: 'a',
            //     pseudoUrls,
            //     requestQueue
            // });

            const button = await page.$(
              "[data-testid='search-show-more-button']"
            );
            await page.waitForTimeout(500);
            if (!button) {
              console.log("we have a problem here");
              await email.mailCrawlError(recipients, safeDomain);
              // add double check here
              var currNum = await page.$eval(
                '[data-testid="SearchForm-status"]',
                (el) => el.textContent
              );
              currNum = currNum.match(/Showing ([0-9]+) results[\s\S]*/)[1];
              console.log(`amount is : ${currNum} and j is ${j}`);
              if (j === 0 && parseInt(currNum) > 10) {
                throw "not finished yet";
              }
              break;
            }
            await button.click();
            await puppeteer.infiniteScroll(page);
            // await autoScroll(page)

            console.log(j);
            j++;
          }

          const ti1 = performance.now();

          console.log(
            `scroll down took ${ti1 / 1000.0 - ti0 / 1000.0} seconds`
          );
        }

        // await puppeteer.infiniteScroll(page, {
        //     buttonSelector: '[data-testid="search-show-more-button"]'
        // })

        // if (page.$$eval('[data-testid=\'search-show-more-button\']')) {
        //     console.log('true')
        // }

        const title = await page.title(); // Get the title of the page.
        let domainNameIndex = 5;
        let general_regex =
          /(http(s)?:\/\/((w|W){3}\.)?)([^.]+)((\.[a-zA-Z]+)+)/;
        let match = request.url.match(general_regex);
        domainName = match[4] + "";
        let twitter_url = /(^http(s)?:\/\/(www\.)?)twitter.com(.*)$/;
        var domainRegex = new RegExp(
          "(http(s)?://(www\\.)?)([a-zA-Z]+\\.)*" + domainName + "\\.(.*)"
        );

        // parsed metadata (title, author, date), plain text and html content
        var bodyHTML = await page.content();
        if (bodyHTML.includes("429 Too Many Requests")) {
          console.log(
            `429 Too Many Requests for ${request.url}, ${failed_request_count}/10`
          );
          await delay(10000);
          throw "429 Too Many Requests";
        }

        // const bodyHTML = await page.content();
        const hrefs = await page.$$eval("a", (as) => as.map((a) => a.href)); // Get all the hrefs with the links.
        const titles = await page.$$eval("a", (as) => as.map((a) => a.title)); // Get the titles of all the links.
        const texts = await page.$$eval("a", (as) => as.map((a) => a.text)); // Get the text content of all the a tags.

        // Create the list of tuples for this url.
        var valid_links = [];
        var tuple_list = [];
        var local_out_of_scope = [];
        // Set the title of the link to be the text content if the title is not present.
        for (let i = 0; i < hrefs.length; i++) {
          hrefLink = hrefs[i];

          // check if need to update endDate
          var re = hrefLink.match(
            /https:\/\/www\.nytimes\.com\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})*/
          );
          if (
            re != null &&
            request.url.includes("https://www.nytimes.com/search?")
          ) {
            console.log(re[1] + re[2] + re[3]);
            var articleDate = new Date(
              re[1],
              (parseInt(re[2]) - 1).toString(),
              re[3]
            );
            if (articleDate.getTime() < endDate.getTime()) {
              endDate = articleDate;
              endDateStr = re[1] + re[2] + re[3];
            }
          }
          // Checks that the link is a part of domain.
          let inscope = false;

          for (let l_i = 0; l_i < url_list.length; l_i++) {
            dom_orig = url_list[l_i];
            match = dom_orig.match(general_regex);
            if (match != null && match.length > 5) {
              domainName = match[domainNameIndex];
              //console.log("Links: "+domainName+" "+hrefLink);
              domainRegex = new RegExp(
                "(http(s)?://(www\\.)?)([a-zA-Z]+\\.)*" + domainName + "\\.(.*)"
              );
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
                hrefTitle = texts[i].replace(/ +(?= )/g, "");
              } else {
                hrefTitle = titles[i];
              }
              // Add the tuple to the list.
              let found_elem = {
                title: hrefTitle,
                url: hrefLink,
              };
              tuple_list.push(found_elem);
              valid_links.push(hrefLink);
            }
          } else {
            out_of_scope_match = hrefLink.match(general_regex);
            if (out_of_scope_match != null) {
              out_of_scope_domain = out_of_scope_match[domainNameIndex];

              // Keep track of all out of scope links. Uses up a lot of memory when used.
              // if (out_of_scope_domain in incorrect_dict) {
              //     incorrect_dict[out_of_scope_domain].push(hrefLink);
              // }
              // else {
              //     incorrect_dict[out_of_scope_domain] = [hrefLink];
              // }
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
            domainRegex = new RegExp(
              "(http(s)?://(www\\.)?)([a-zA-Z]+\\.)*" + domainName + "\\.(.*)"
            );
            if (domainRegex.test(request.url)) {
              foundDomain = true;
            } else {
              listIndex++;
            }
          } else {
            listIndex++;
          }
        }

        // get domain
        var href = new URL(url_list[i]);
        domain = href.origin;

        // reset end_date to fetch more articles if there is 'show more' button
        if (request.url.includes("https://www.nytimes.com/search?")) {
          // Enqueue the deeper URLs to crawl.
          await Apify.utils.enqueueLinks({
            page,
            selector: "a",
            pseudoUrls,
            requestQueue,
          });
          const button = await page.$(
            "[data-testid='search-show-more-button']"
          );
          if (button) {
            href.searchParams.set("endDate", endDateStr);
            console.log("new page: " + href.toString());
            await requestQueue.addRequest({ url: href.toString() });
          }
        }

        // remove position, ie. https://www.nytimes.com/2022/04/13/world/europe/finland-sweden-nato-russia-ukraine.html?searchResultPosition=1
        var origin_url = request.url;
        if (!request.url.includes("https://www.nytimes.com/search?")) {
          origin_url = request.url.split("?")[0];
        }

        let elem = {
          title: "",
          url: origin_url,
          bodyHTML: bodyHTML,
          author: "",
          date: "",
          html_content: "",
          article_text: "",
          domain: domain,
          updated: false,
          found_urls: tuple_list,
        };

        let folderName =
          "Results/" +
          url_list[listIndex].replace(/[^a-z0-9]/gi, "_").toLowerCase() +
          "/";

        // Create a directory to hold all this domain's files.
        fileOps.mkDir(folderName);

        // Create a JSON for this link with a uuid.
        let timestamp = new Date().getTime();

        let fileName = uuidv5(origin_url, uuidv5.URL) + ".json";
        fs.writeFileSync(
          folderName + fileName,
          JSON.stringify(elem),
          function (err) {
            if (err) throw err;
          }
        );

        // Save a PDF of the page.
        if (savePDF) {
          console.log("Saving PDF of " + request.url);
          const pdfBuffer = await page.pdf({
            format: "A4",
          });
          let pdfName =
            uuidv5(request.url, uuidv5.URL) + "_" + timestamp.toString();
          await store.setValue(pdfName, pdfBuffer, {
            contentType: "application/pdf",
          });
        }

        //Write into a database

        // let metaObj = new db.metaModel(elem);

        // await metaObj.save();

        // print memory stats about process
        // memInfo.getMemoryInfo(process.memoryUsage())

        // // Add this list to the dict. Uses up a lot of memory when used.
        // output_dict[request.url] = elem;

        const t3 = performance.now();
        // Log the time for this request.
        // console.log(`Call to "${request.url}" took ${t3/1000.0 - t2/1000.0} seconds.`);

        // sleep for a short time
        const waitTime = Math.floor(Math.random() * 1000);
        await delay(waitTime + 500);
      },
      handleFailedRequestFunction: async ({ request }) => {
        // This function is called when the crawling of a request failed too many times
        // console.log(`crawl ${request.url} caused ${request.errorMessages}`);
        // for (const [url, fail_count] of Object.entries(err_dict)) {
        //     if (url === request.url) {
        //         needAdd = false;
        //         if (fail_count < 3) {
        //             // add url back to the queue
        //             console.log(`recrawl ${request.url} the ${fail_count} times`);
        //             const requestQueue = await Apify.openRequestQueue(safeDomain);
        //             await requestQueue.addRequest({
        //                 url: url,
        //             });
        //             err_dict.url++;
        //             break;
        //         }
        //         break;
        //     }
        // }
        // console.log(`add fail request ${request.url}`);
        const error_code = request.errorMessages[0].substring(
          0,
          request.errorMessages[0].indexOf("\n") === -1
            ? request.errorMessages[0].length
            : request.errorMessages[0].indexOf("\n")
        );
        console.log(
          `--failed at ${request.url} with ${error_code} -- ${failed_request_count}`
        );

        const err_arr = ["429", "403", "401", "451"];
        var needWait = false;
        err_arr.forEach((e) => {
          if (error_code.includes(e)) {
            needWait = true;
          }
        });
        if (needWait) {
          failed_request_count++;
          await delay(180000);
        }

        const dataset = await Apify.openDataset("default");
        await dataset.pushData({
          url: request.url,
          succeeded: false,
          errors: request.errorMessages,
        });
      },
      // The max concurrency and max requests to crawl through.
      maxRequestsPerCrawl: pagesPerRound * round,
      // maxConcurrency: 50,
      maxConcurrency: maxConcurrency,
      handlePageTimeoutSecs: 3000,
      maxRequestRetries: 0,
    });
    /** CRAWLER CODE END */

    // Start time.
    const t0 = performance.now();
    // Run the crawler.
    await crawler.run();

    // End time.
    const t1 = performance.now();
    // Log the time to run the crawler.
    currTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(
      `[Elapsed Time: ${new Date(currTime * 1000)
        .toISOString()
        .substr(11, 8)}] Finished crawling ${url_list[i]} ${
        t1 / 1000.0 - t0 / 1000.0
      } seconds.`
    );
    // Increment the index of the current url.
    i++;
    // If fail too many time exit
    if (failed_request_count >= MAXIMUM_FAIL_TIME) {
      console.log("encounter too much failed request, send an email");
      if (sendEmail) {
        await email.mailCrawlError(recipients, safeDomain);
      }
      process.exit(1);
    }
    // console.log(`[Elapsed Time: ${new Date(currTime * 1000).toISOString().substr(11, 8)}] Finished crawling ${url_list[i]} ${t1/1000.0 - t0/1000.0} seconds.`);
    // If all urls are complete, begin the next round.
    const requestQueue_fin = await Apify.openRequestQueue(safeDomain);
    const crawl_finished = await requestQueue_fin.isFinished();
    if (crawl_finished) {
      console.log("crawl has finished all the request");
      if (sendEmail) {
        await email.mailCrawlEnd(recipients, safeDomain);
      }
      process.exit(0);
    }

    if (i === url_list.length) {
      i = 0;
      round++;
    }
  }
});
