[![Build Status](https://travis-ci.org/UTMediaCAT/mediacat-domain-crawler.svg?branch=master)](https://travis-ci.org/UTMediaCAT/mediacat-domain-crawler)
# mediacat-domain-crawler

This README pertains to the crawling aspect of the application. The crawl script(s) would be located in the folder `/newCrawler/ `

At the end of the crawl, it can notify by email whether the crawl stopped or not. The email aspect must be set up first before the crawl. (or ignored if not desired, it is commented out by default)

Input credentials in the crawl.js script under the transporter constant [here](https://github.com/UTMediaCAT/mediacat-domain-crawler/blob/497081ad10cddc03d618fd34d020552cff36973a/newCrawler/crawl.js#L137)

PLEASE do not EVER commit your password. As a future issue, we should probably make a seperate constant file that is git ignored.

## prereqs
- Python 3

- node v14.15.3 (make sure to have this installed, or switch to it if needed `nvm use v14.15.3`)

`cd newCrawler` to get to the masterCrawler.py script

`npm install` to install node dependencies

# run the master crawler
This script is run in a similar fashion as the other crawlers but receives an extra flag corresponding to the time period for which the crawler should be run after which the script will restart the crawler. This is to avoid browser timeouts and stack memory issues that are encountered on running the crawler for too long (> 30 hours). Here, the `-t` flag takes time in minutes.

`python3 masterCrawler.py batchCrawl.js -l https://www.nytimes.com/ -t 300`

# run the puppeteer crawler 
`node --max-old-space-size=7168 crawl.js -f ../../../mediacat-hidden/domain.csv -n inf`

# run the cheerio crawler 
`node --max-old-space-size=7168 crawlCheerio.js -f ../../../mediacat-hidden/domain.csv -n inf`

# run the batch crawler
`node batchCrawl.js -f ../../../mediacat-hidden/domain.csv`

# flags (puppeteer and cheerio)
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

# flags (batch)
- l : links separated by spaces
- f : csv file containing the scope
- n : number of pages to crawl per round for each domain (default is 5)
- r : the maximum number of rounds
- pdf : use this parameter if PDFs are to be saved
- log : custom name for the log file (default is debug.log)

Some example usages are given below:

node batchCrawl.js -f ../../../mediacat-hidden/domain.csv  
node batchCrawl.js -n 10 -f ../../../mediacat-hidden/domain.csv  
node batchCrawl.js -r 5 -f ../../../mediacat-hidden/domain.csv  
node batchCrawl.js -pdf -f ../../../mediacat-hidden/domain.csv  
node batchCrawl.js -l https://www.nytimes.com/ https://cnn.com/  
node batchCrawl.js -l https://www.nytimes.com/ https://cnn.com/ -log logging.log

# monitoring the results
Instructions to monitor the results of the crawl are in the readme in the directory [monitor](https://github.com/UTMediaCAT/mediacat-domain-crawler/blob/master/newCrawler/monitor/README.md)

# Apify tips

When using Apify, it is important to know that when the crawler needs to be rerun without the previous queue, the apify_storage needs to deleted before running. Otherwise, it will continue from where it left off in the queue.

# testing
this [script](https://github.com/UTMediaCAT/mediacat-domain-crawler/tree/master/newCrawler/test) has been written to time how long it takes for the crawlers to crawl through a certain number of links. The user will have to uncomment or comment in which tests to run on main().

testTime1 or nytimes is the first of a chain of tests for the puppeteer crawler

similiarily, for testTime1Cheerio and nytimesCheerio

# forever.js

a script that helps restart the crawl if needed
