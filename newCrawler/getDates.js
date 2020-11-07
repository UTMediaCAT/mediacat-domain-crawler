const metascraper = require('metascraper')([
    require('metascraper-date')(),
    require('metascraper-url')()
]);
 
const linkFile = './link_title_list.json';
  
const got = require('got');
var fs = require('fs') ;

function getDate() {
    readFile(linkFile, promiseLoop);
}


function readFile(linkFile, callback){

    // callback
    fs.readFile(linkFile, function (err, data) {
        // json 
        let json = JSON.parse(data);
        console.log(json)

        callback(json);
    });

}

function promiseLoop(json) {
    // let newJson = {};
    // let newCount = 0;
    let count = 0;
    let key;
    for (key in json) {
        let articlesList = json[key];
        let promises = [];
        count++; 
        let i;
        for (i = 0; i < articlesList.length; i++) {
            let article = articlesList[i]
            let link = article[0]
            promises.push(promiseDate(link))
        }
        Promise.allSettled(promises).then( (promiseResults) => {
            promiseResults.forEach(
                (result) => {
                    if (result.status === "fulfilled") {
                        console.log('Valid link ' + result.value["url"] + "with date " + result.value["date"]);
                    } else {
                        console.log('Failed link ' + result.reason);
                    }
                }
            )
            
        }).catch ((e) =>
            console.log(e)
        )

        console.log("is this non blocking?")

    }

}

function promiseDate (link) {
    let promise = new Promise ((resolve, reject) => {
        got(link)
        .on('request', request => setTimeout(() => request.destroy(), 20000))
        .then(({ body: html, url }) => {
            metascraper({ html, url }).then((metadata) => {
                console.log("Pass: "+link+ " "+metadata["date"]);
                resolve(metadata); 
            }).catch ((e) => {
                console.log("Fail: "+link);
                reject(link);
            }); 
        }).catch((e) => {
            console.log("Fail: at get request: " + link)
            reject(link);
        });
    });
    return promise
}

if (require.main === module) {
    getDate();
}