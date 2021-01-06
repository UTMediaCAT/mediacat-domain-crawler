const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')(),
    require('metascraper-lang')(),
]);
 
const linkFile = './link_title_list.json';
  
const got = require('got');
const mongoose = require('mongoose');
let db = require('./database.js')

mongoose.connection
  .once('open', () => console.log('Connected to DB'))
  .on('error', (error) => { 
      console.log("Your Error", error);
  });
exports.getDate = () => {
    ongoing = true;
    databaseLoop();
} 
function databaseLoop() {
        db.metaModel.find({'updated': false}, function (err, docs) {
            if (err) return handleError(err);
            // Checks the amount of links that weren't updated, if there aren't any, exits, otherwise applies recursion.
            if (docs.length != 0) {
                console.log(docs.length);
                promiseLoop(docs);
            } else {
                db.metaModel.find({'updated': true}, function (err, docs) {
                    if (err) return handleError(err);
                    console.log(docs.length);
                    mongoose.connection.close();
                });
                console.log('we are done! :)');
                
            }
            //mongoose.connection.close();
          });
}    

async function promiseLoop(json) {
    await promiseLoopAsync(json);
    databaseLoop();
}


async function promiseLoopAsync (json) {
    promises = []
    for (let i = 0; i < json.length; i++) {
        let article = json[i];
        promises.push(promiseDate(article));
    await Promise.allSettled(promises).then( (promiseResults) => {
            let articleListMetadata = [];
            promiseResults.forEach(
                async (result) => {
                    if (result.status === 'fulfilled') {
                        // change from list to object here TODO: Raiyan
                        newArticle = result.value;
                        let date = newArticle["date"];
                        console.log('Valid link ' + newArticle["url"]  + ' with date ' + date + ' with author ' + newArticle["author_metadata"] +
                        ' with title ' + newArticle["title"]);
                        await db.metaModel.updateOne({"_id":newArticle["_id"]},
                        {"date":date, "updated":true, "author_metascraper":newArticle["author_metascraper"], "title_metascraper":newArticle["title_metascraper"]});
                    } else {
                        console.log('Failed link ' + result.reason);
                        articleListMetadata.push(result.reason);
                    }
                }
            );
            
    }).catch ((e) =>
            // this part is supposed to be unreachable
            console.log(e)
    );

    }
}


// article is an array
function promiseDate (article) {
    
    let promise = new Promise ((resolve, reject) => {
        let link = article['url'];
        got(link)
            .on('request', request => setTimeout(() => request.destroy(), 20000))
            .then(({ body: html, url }) => {
                metascraper({ html, url }).then((metadata) => {
                    console.log('metadata : ', metadata);
                    console.log('Pass: '+link+ ' '+metadata['date']);
                    article['date'] = metadata['date'];
                    article['title_metascraper'] = metadata['title'];
                    article['author_metascraper'] = metadata['author'];
                    resolve(article); 
                }).catch ((e) => {
                    console.log('error : ', e.hostname);
                    console.log('Fail: '+link);
                    reject(article);
                }); 
            }).catch((e) => {
                console.log('error : ', e.hostname);
                console.log('Fail: at get request: ' + link);
                reject(article);
            });
    });
    return promise;
}
function handleError(err) {
    console.log(err);
}
if (require.main === module) {
    this.getDate();
}