# Prerequisite

npm install

Note that the input file is dependent on the output that the crawler spits out.

# Execute 
It will take the input file named `link_title_list.json`

change the constant `linkFile` in `getDates.js` if you want it to read from a different file

run `node getDates.js`


The output will be in a file named metadata_modified_list.json


{
    "https://www.christianitytoday.com": [
        [
            "https://www.christianitytoday.org/",
            "",
            {
                "author": "Read Story",
                "date": null,
                "description": "Christianity Today | global media ministry | Church News & Leadership\nOfficial ministry website of Christianity Today: Christian thought journalism & reporting; global church news; pastor, preaching, & church leadership tools; Bible study, discipleship & small group resources",
                "publisher": "ChristianityToday.org",
                "title": "ChristianityToday.org",
                "url": "https://www.christianitytoday.org"
            }
        ],
        [
            "https://www.christianitytoday.org/who-we-are/",
            "Who We Are",
            {
                "author": "H.B. Charles",
                "date": null,
                "description": "Christianity Today | global media ministry | Church News & Leadership\nOfficial ministry website of Christianity Today: Christian thought journalism & reporting; global church news; pastor, preaching, & church leadership tools; Bible study, discipleship & small group resources",
                "publisher": "ChristianityToday.org",
                "title": "Our Ministry",
                "url": "https://www.christianitytoday.org/who-we-are/our-ministry/"
            }
        ]
    ],
    "https://www.washingtonpost.com": [
        [
            "https://www.washingtonpost.com/elections/?nid=top_nav_election%202020",
            "Election 2020",
            {
                "author": "Ashley Parker, Josh Dawsey, Matt Viser and Michael Scherer",
                "date": null,
                "description": "Everything you need to know about the 2020 election, plus the news, opinion and video of the day",
                "publisher": "The Washington Post",
                "title": "Election 2020: Latest news, vote counts, and results - The Washington Post",
                "url": "https://www.washingtonpost.com/elections/elections"
            }
        ],
        [
            "https://www.washingtonpost.com/coronavirus/?nid=top_nav_coronavirus",
            "Coronavirus",
            {
                "author": "Antonia Noori Farzan",
                "date": "2020-11-11T18:22:53.000Z",
                "description": "News and updates about the coronavirus pandemic: Cases in the US, death toll, what you need to know about the virus, how to prepare, how to get tested.",
                "publisher": "The Washington Post",
                "title": "Coronavirus",
                "url": "https://www.washingtonpost.com/coronavirus/"
            }
        ]
    ]
}