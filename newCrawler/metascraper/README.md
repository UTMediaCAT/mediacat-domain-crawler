# Metascraper

The scripts here are used to retrieve the dates of the articles after it has been crawled.

to run the script: `node getDates.js`

The most recent pull request for the work done here: https://github.com/UTMediaCAT/mediacat-domain-crawler/pull/21

What it does esentially is loop through the database going through all the records that do not have dates yet, retrieves the date for the record and updates it. It actively searches in a loop so that when the database is populated with records from crawling, it can update the dates of new records as they are added into the database. 