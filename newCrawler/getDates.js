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
        // console.log(json);

        callback(json);
    });

}

async function promiseLoop(json) {
    let newJson = await promiseLoopAsync(json);
    console.log(newJson);

    console.log("we are done! :)");

    fs.writeFile("metadata_modified_list.json", JSON.stringify(newJson), function(err) {
        // console.log(newJson)
        if (err) {
            console.log("The date json has been processed with an error")
            console.log(err)
        } else {
            console.log("complete!")
        }
    });
}


async function promiseLoopAsync (json) {

    let newJson = {};
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
            promises.push(promiseDate(article))
        }
        await Promise.allSettled(promises).then( (promiseResults) => {
            let articleListMetadata = []
            promiseResults.forEach(
                (result) => {
                    if (result.status === "fulfilled") {
                        let link = result.value[0]
                        let date = result.value[result.value.length - 1]
                        // console.log("result : ", result)
                        console.log('Valid link ' + link  + "with date " + date);
                        articleListMetadata.push(result.value);
                    } else {
                        // console.log("result : ", result)
                        console.log('Failed link ' + result.reason);
                        articleListMetadata.push(result.reason);
                    }
                }
            )

            newJson[key] = articleListMetadata
            
        }).catch ((e) =>
            console.log(e)
        )

    }

    return newJson

}


// article is an array
function promiseDate (article) {
    
    let promise = new Promise ((resolve, reject) => {
        let link = article[0];
        got(link)
        .on('request', request => setTimeout(() => request.destroy(), 20000))
        .then(({ body: html, url }) => {
            metascraper({ html, url }).then((metadata) => {
                console.log("metadata : ", metadata);
                console.log("Pass: "+link+ " "+metadata["date"]);
                article.push(metadata["date"])
                resolve(article); 
            }).catch ((e) => {
                console.log("error : ", e.hostname);
                console.log("Fail: "+link);
                article.push("")
                reject(article);
            }); 
        }).catch((e) => {
            console.log("error : ", e.hostname);
            console.log("Fail: at get request: " + link)
            article.push("")
            reject(article);
        });
    });
    return promise
}

if (require.main === module) {
    getDate();
}