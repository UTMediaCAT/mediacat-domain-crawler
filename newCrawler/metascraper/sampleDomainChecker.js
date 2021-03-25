const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')(),
    require('metascraper-lang')(),
]);
 
const linkFile = './domainTest.json';
  
const got = require('got');
var fs = require('fs') ;

exports.getDate = (file) => {
    readFile(file, promiseLoop);
}


function readFile(linkFile, callback){

    // callback
    fs.readFile(linkFile, function (err, data) {
        if (err) {
            throw err;
        }

        try {
            // json 
            let json = JSON.parse(data);
            // console.log(json);

            callback(json);
        } catch (e) {
            throw e;
        }

    });

}

async function promiseLoop(json) {
    let newJson = await promiseLoopAsync(json);
    for (key in newJson) {
        console.log(key+" has "+newJson[key][0]+" links with null dates out of "+newJson[key][1]+" given links");
    }
}


async function promiseLoopAsync (json) {

    let newJson = {};
    let key;

    for (key in json) {
        let articlesList = json[key];
        let promises = [];
        let i;
        for (i = 0; i < articlesList.length; i++) {
            let link = articlesList[i];
            promises.push(promiseDate(link));
        }
        await Promise.allSettled(promises).then( (promiseResults) => {
            let nullDates = 0
            promiseResults.forEach(
                (result) => {
                    if (result.status === 'fulfilled') {
                        // change from list to object here TODO: Raiyan
                        let nullLink = result.value;
                        nullDates = nullDates + nullLink;
                    } else {
                        // console.log("result : ", result)
                        console.log('Failed link ' + result.reason);
                        articleListMetadata.push(result.reason);
                    }
                }
            );

            newJson[key] = [nullDates, json[key].length];
            
        }).catch ((e) =>
            // this part is suppose to be unreachable
            console.log(e)
        );

    }

    return newJson;

}


// article is an array
function promiseDate (link) {
    
    let promise = new Promise ((resolve, reject) => {
        got(link)
            .on('request', request => setTimeout(() => request.destroy(), 20000))
            .then(({ body: html, url }) => {
                metascraper({ html, url }).then((metadata) => {
                    console.log('metadata : ', metadata);
                    console.log('Pass: '+link+ ' '+metadata['date']);
                    if (metadata['date'] == null) {
                        resolve(1);
                    } else resolve(0);
                }).catch ((e) => {
                    console.log('error : ', e.hostname);
                    console.log('Fail: '+link);
                    reject(-1);
                }); 
            }).catch((e) => {
                console.log('error : ', e.hostname);
                console.log('Fail: at get request: ' + link);
                reject(-1);
            });
    });
    return promise;
}

if (require.main === module) {
    this.getDate(linkFile);
}