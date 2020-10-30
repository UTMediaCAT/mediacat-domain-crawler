const metascraper = require('metascraper')([
  require('metascraper-date')(),
  require('metascraper-url')()
])

const got = require('got')
var fs = require('fs')
const { info } = require('console')

fs.readFile('link_title_list.json', function (err, data) {

    var json = JSON.parse(data)
    dateloop({},json, 0)
    //promiseloop(json);
});
function promiseloop(json) {
    newJson={}
    newCount = 0;
    for (key in json) {
        newJson[key] = {}
        articles = json[key]
        console.log(key, articles.length);
        promises = [];
        for(i=0; i < articles.length; i++) {
            articleLink = articles[i][0]
            promises.push(promiseStuff(articleLink));
        }
    }
    Promise.all(promises).then((link, metadata) => {
        newJson[key][link] = metadata
    }).catch((link)=> {
        newJson[key][link] = null
    }).finally(()=>{
        fs.writeFileSync("full_link_title_list.json", JSON.stringify(newJson), function(err) {
            if (err) throw err;
                console.log('complete');
            });
    })
}
function promiseStuffDeprecated(articleLink) {
    return new Promise((resolve, reject) => {
        try{
            new Promise(async(resolve,reject)=> {
                const { body: html, url } = await got(articleLink)
                promise = metascraper({ html, url });
                promise.then((metadata)=> {
                    resolve(metadata); 
                }).catch((e) => {
                    console.log("Fail: "+articleLink);
                    reject(articleLink);
                })
            }).then((metadata)=>{
                console.log("Pass: "+articleLink+ " "+metadata["date"]);
                resolve(articleLink, metadata);
            }).catch((link) => {
                console.log("fail")
                reject(link);
            } );
        } catch (err) {
            console.log("Fail: "+articleLink);
            console.log(err);
            reject(articleLink);
        }

    })
}
function promiseStuff(articleLink) {
        return new Promise(async(resolve,reject)=> {
                const { body: html, url } = await got(articleLink)
                promise = metascraper({ html, url });
                promise.then((metadata)=> {
                    resolve(metadata); 
                }).catch((e) => {
                    console.log("Fail: "+articleLink);
                    reject(articleLink);
                })
            }).then((metadata)=>{
                console.log("Pass: "+articleLink+ " "+metadata["date"]);
                resolve(articleLink, metadata);
            }).catch((link) => {
                console.log("Fail: "+link)
                reject(link);
            } );
}
function dateloop(newJson, json, currDomainIndex) {
    length = Object.keys(json).length;
    if (currDomainIndex >= length) {
        fs.writeFileSync("full_link_title_list.json", JSON.stringify(newJson), function(err) {
            console.log(newJson)
            if (err) throw err;
                console.log('complete');
            });
    }
    else {
        currName = Object.keys(json)[currDomainIndex];
        console.log(currDomainIndex, currName, length, json[currName].length)
        newValue = []
        for(i = 0;  i < json[currName].length; i++) {
            value = json[currName][i]
            targetUrl = value[0]
            ;(async () => {
                try {
                    const { body: html, url } = await got(targetUrl)
                    const metadata = await metascraper({ html, url })
                    console.log(currDomainIndex, newValue.length, metadata)
                    dict = {}
                    dict[metadata['url']] = metadata['date']
                    newValue.push(dict)
                    if (newValue.length >= json[currName].length) {
                        newJson[currName] = newValue;
                        dateloop(newJson, json, currDomainIndex+1)
                    }
                }
                catch (err) {
                    dict = {}
                    dict[targetUrl] = null
                    newValue.push(dict);
                    console.log(currDomainIndex, newValue.length, "Error");
                    if (newValue.length >= json[currName].length) {
                        newJson[currName] = newValue;
                        dateloop(newJson, json, currDomainIndex+1)
                    }
                }
              })()
        }        
    }
}