# Prerequisite

- `npm install`

Note that the input file is dependent on the output that the crawler spits out.

# Execute 
Output jsons will be stored under `Output/https__example_com/`
Here is an example URL json:

```
{
  "title_metascraper": "",
  "url": "https://www.972mag.com/netzah-yehuda-israeli-army-abuse/",
  "author_metascraper": "",
  "date": "",
  "raw_content": "uits</span></a><span style=\"font-weight: 400;\">.) But Netzah Yehuda itself — which today consists primarily of Haredi, Hardali (Zionist-Haredi), and religious-Zionist recruits — has been specifically and consistently involved in many notorious incidents of violence, including torture, as well as other improper conduct.</span>\n\n<span style=\"font-weight: 400;\">For example, in separate incidents in 2015 just a few months apart, a Netzah Yehuda sniper </span><a href=\"https://www.mako.co.il/pzm-soldiers/Article-69858a56a82fd41006.htm\"><span style=\"font-weight: 400;\">shot</span></a><span style=\"font-weight: 400;\"> a seemingly unarmed Palestinian with live ammunition during a protest in Silwad near Ramallah...",
  "html_content": "",
  "article_text": "",
  "domain": "https://www.972mag.com/netzah-yehuda-israeli-army-abuse/",
  "updated": false,
  "found_urls": [
    { "title": "+972 Magazine", "url": "https://www.972mag.com/" },
    {
      "title": "\n Amnesty report ",
      "url": "https://www.972mag.com/topic/amnesty/"
    },
    {
      "title": "\n Sheikh Jarrah ",
      "url": "https://www.972mag.com/topic/sheikh-jarrah/"
    },
    
    {
      "title": "Privacy Policy",
      "url": "https://www.972mag.com/privacy-policy-2/"
    }
  ]
}

```

**Note:** `title_metascraper, author_metascraper, date, html_content, article_text` are all empty. Run Output jsons through [metascraper](https://github.com/UTMediaCAT/mediacat-backend/tree/master/utils/metascraper) to populate those feilds.



# testing

Please ensure that the crawl.js has been set up for testing

## testMetascraper.js

`node testMetascraper.js` to execute the test script. `npm install` if you haven't already.
The mongod client must be running already.

uncomment the constant targetUrl you are interested in 

## testDatabase.js

`node testDatabase.js`lists all the domains and how many articles/hits has been found.



