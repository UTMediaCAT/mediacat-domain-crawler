
This README pertains to the crawling aspect of the application. The crawl script(s) would be located in the folder `/newCrawler/ `

Domain crawler take crawl domains such as https://www.nytimes.com/ or an crawl_scope.csv that contains those domains. 

**Filter**: Crawler will only crawl URL that match one domain from crawl_scope.csv or input domains. (ie: https://www.nytimes.com/some/page)

At the end of the crawl, it can notify by email whether the crawl stopped or not. The email aspect must be set up first before the crawl. (or ignored if not desired, it is commented out by default)

Input credentials in the crawl.js script under the transporter constant [here](https://github.com/UTMediaCAT/mediacat-domain-crawler/blob/497081ad10cddc03d618fd34d020552cff36973a/newCrawler/crawl.js#L137)

PLEASE do not EVER commit your password. As a future issue, we should probably make a seperate constant file that is git ignored.

## prereqs
- Python 3

- node v16

`cd newCrawler` to get to the masterCrawler.py script

`npm install` to install node dependencies

If on Arbutus server: `npm i puppeteer@13` to install puppeteer version 13.7.0

# run the master crawler
This script is run in a similar fashion as the other crawlers but receives an extra flag corresponding to the time period for which the crawler should be run after which the script will restart the crawler. This is to avoid browser timeouts and stack memory issues that are encountered on running the crawler for too long (> 30 hours). Here, the `-t` flag takes time in minutes.

**Note:** You need to run master crawler with one other crawler, the example below run masterCrawler with batchCrawler

`python3 masterCrawler.py batchCrawl.js -l https://www.nytimes.com/ -t 300`

For Graham Instance, run `python3 masterCrawler.py batchCrawl.js -n 1000 -m 20000 -l https://example.com/ -t 240` should optimize the crawler speed

# Run the batch crawler
`node batchCrawl.js -f ../../../mediacat-hidden/domain.csv`

- ## flags
  - l : links separated by spaces
  - f : csv file containing the scope
  - n : number of pages to crawl per round for each domain (default is 5)
  - r : the maximum number of rounds
  - pdf : use this parameter if PDFs are to be saved
  - log : custom name for the log file (default is debug.log)
  - m: the heap memory limit for the crawler (default is 4096mb)
  - e (`email`: string): enable crawler to send a email to `email` to when crawler finished or encounter too many error
  - stealth (`sleepTime`: integer): will set maxConcurrency to 2, ie: at most 2 tasks running in parallel. Crawler will also sleep for `sleepTime` ms       after each request. More about this can be found in **Crawl in Stealth** section.

  Some example usages are given below:

  node batchCrawl.js -f ../../../mediacat-hidden/domain.csv  
  node batchCrawl.js -n 10 -f ../../../mediacat-hidden/domain.csv  
  node batchCrawl.js -r 5 -f ../../../mediacat-hidden/domain.csv  
  node batchCrawl.js -pdf -f ../../../mediacat-hidden/domain.csv  
  node batchCrawl.js -l https://www.nytimes.com/ https://cnn.com/  
  node batchCrawl.js -l https://www.nytimes.com/ https://cnn.com/ -log logging.log

# Run the NYTimes archive crawler
`node nyCrawl.js -n 5000 -f full_scope.csv`

NYTimes archive crawler will crawl the given search archive here: https://www.nytimes.com/search?dropmab=true&query=&sort=newest and repeatedly clicking `show more` buttom then scroll down untill there is no more `show more` bottom. 

Cautious version (has stealth option to crawl slower, sleeps for a short time after each request, stops if too many failed requests):

`node nyCrawlcautious.js -n 200 -stealth 5000 -f full_scope.csv`

- ## flags
  - f (string) indicates the scope file. Note that all the search URLs in the scope file must follow this format: 

    `https://www.nytimes.com/search?dropmab=true&endDate={}&query={}[&sections={}]&sort=newest&startDate={}&types=article`

    [sections] is optional and {sort} must be neweast
  - n (integer) number of pages to crawl per round for each domain (default is 5000)
  - stealth (`sleepTime`: integer): will set maxConcurrency to 2, ie: at most 2 tasks running in parallel. Crawler will also sleep for `sleepTime` ms       after each request. More about this can be found in **Crawl in Stealth** section.
  - pdf : use this parameter if PDFs are to be saved
  - log : custom filename for the log file (default is debug.log)
  - e (`email`: string): enable crawler to send a email to `email` to when crawler finished

  Some example usages are given below:
  
  `node nyCrawl.js -n 5000 -e example@gmail.com -f full_scope.csv`
  

# Run the puppeteer crawler or cheerio crawler (not yet functional)
`node --max-old-space-size=7168 crawl.js -f ../../../mediacat-hidden/domain.csv -n inf`

`node --max-old-space-size=7168 crawlCheerio.js -f ../../../mediacat-hidden/domain.csv -n inf`

- ## flags
  - f (string) indicates the scope file
  - n (integer) indicates the maxrequests you would like to crawl, inf is infinity else give it an integer, default is 20
  - t () if the flag is present, use the test database
  - b (string) if b is present use the batch scope file to run a subset of the full scope. MUST appear with the -f flag
  - m () if the flag is present, manually crawl instead of using apify's automatic queue (to be implemented)
  - max-old-space-size is a node process flag that sets the process to mb amount of ram

  altogether it might look something like this

  `node --max-old-space-size=7168 crawl.js -f ../../mediacat-hidden/domain.csv -n inf -t -m -b ../../mediacat-hidden/batch.csv`

  or if you are just feeding single urls one by one 

  `node --max-old-space-size=7168 crawl.js -n 5 https://www.nytimes.com/ https://www.aljazeera.com/ https://www.cnn.com`

# Ouput
The output URL jsons will be stored under `/Results/https_example_com/`.

# Apify tips

When using Apify, it is important to know that when the crawler needs to be rerun without the previous queue, the apify_storage needs to deleted before running. Otherwise, it will continue from where it left off in the queue. Apify queue will be under `/newCrawler/apify_storage/`

# Crawl in Stealth

You might get error like `403 Forbidden` or `429 too many requests` during the crawl, especially for some small domain.

It is very likely that you crawl too fast so the domain blcok you. There are few strategies you can use to avoid this problem.

 - ## always do a testing crawl first
    Always run a small test crawl (about 2000 URLs) before crawl the whole domain. If you get errors in the test crawl, slow the crawler down.

 - ## use stealth flags
    Use `-stealth 2000` [flag](https://github.com/UTMediaCAT/mediacat-domain-crawler/edit/master/README.md#flags), increase the sleepTime if still getting error.
 
 - ## crawl in round
    Crawl multiple domains in one crawl. The crawler will loop through the domains to crawl n [`(-n flag)`](https://github.com/UTMediaCAT/mediacat-domain-crawler/edit/master/README.md#flags) pages from each domain in each round. You should keep `n` small (-n 200) for this to work.

 - ## the crawl break
    To avoid being completely blocked by the domain. The crawler will stop and send an email (if enable -e flag) when encouter too many errors. Default is 10. You can change this number by changing the variable `MAXIMUM_FAIL_TIME` in `/newCrawler/batchCrawl.js/`.
  

# testing
this [script](https://github.com/UTMediaCAT/mediacat-domain-crawler/tree/master/newCrawler/test) has been written to time how long it takes for the crawlers to crawl through a certain number of links. The user will have to uncomment or comment in which tests to run on main().

testTime1 or nytimes is the first of a chain of tests for the puppeteer crawler

similiarily, for testTime1Cheerio and nytimesCheerio

# monitoring the results
Instructions to monitor the results of the crawl are in the readme in the directory [monitor](https://github.com/UTMediaCAT/mediacat-domain-crawler/blob/master/newCrawler/monitor/README.md)

# Restarting the Crawl
A stopped or failed crawl can be restarted from where it left off by running the crawler again in the same directory. The apify crawler will use the requests stored in `newCrawler/apify_storage/request_queues` to restart the crawl.  

If you want to restart a crawl from scratch, delete the `newCrawler/apify_storage/` directory.

# forever.js

a script that helps restart the crawl if needed
