
//node crawl.js https://www.nytimes.com/ https://www.aljazeera.com/ https://www.cnn.com/

const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
const fs = require('fs');

let number = 20
// let path = "/voyage_storage/mediacat-domain-crawler/newCrawler";
let path = "../../";

let db = require('./../../database.js')

let csvFolderPath = './test/crawl-test/csv/'

// remove the database current contents
db.metaModel.remove({}, function(err){
    console.log('collection removed'); 
});


// delete file named 'output.txt' in the very beginning
fs.unlink('output.txt', function (err) {
    if (err) {
        console.log(err);
    } else {
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    }
}); 


function getCrawlerTime (crawlType, number, path, file , nextTest ) {
    
    let ls = ""
    const t1 = performance.now();

    if (crawlType === "cheerio") {
        ls = spawn('node', ['crawlCheerio.js', '-f', file, '-n', number , '-t'], {cwd: path});
    } else {
        ls = spawn('node', ['crawl.js', '-f', file, '-n', number , '-t'], {cwd: path});
    }

    ls.stdout.on('data', (data) => {
    console.log(`${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    const t2 = performance.now();
    let message = `Call to crawler with ${number} links took ${t2/1000.0 - t1/1000.0} seconds. \n`
    console.log('\x1b[36m%s\x1b[0m', message );  //cyan
    fs.appendFile('output.txt', message , nextTest);

    });

}



function getCrawlerNumberOfLinks (crawlType, number, path, file , nextTest , url) {

    return new Promise (function (resolve, reject) {

        let ls = ""
        if (crawlType === "cheerio") {
            ls = spawn('node', ['crawlCheerio.js', '-f', file, '-n', number , '-t'], {cwd: path});
        } else {
            ls = spawn('node', ['crawl.js', '-f', file, '-n', number , '-t'], {cwd: path});
        }

        ls.stdout.on('data', (data) => {
            console.log(`${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            getDomainNumbers(url).then(domainNumber => {

                if (domainNumber === undefined || domainNumber.length == 0) {
                    console.log('\x1b[36m%s\x1b[0m', `FAIL: Domain ${url} has no urls \n`)
                    let output = `FAIL: Domain ${url} has no urls \n`
                    fs.appendFile('output.txt', output , nextTest);
                    reject(`FAIL: Domain ${url} has no urls`);
                } else if (domainNumber[0].count <= number) {
                    console.log('\x1b[36m%s\x1b[0m', `FAIL: Domain ${domainNumber[0]._id} has less urls as unexpected!`)
                    console.log(domainNumber[0].count)
                    let output = `Domain ${domainNumber[0]._id} has ${domainNumber[0].count} urls \n`
                    fs.appendFile('output.txt', output , nextTest);
                    resolve(domainNumber[0].count)
                } else {
                    console.log('\x1b[36m%s\x1b[0m',`PASS: Domain ${domainNumber[0]._id}`)
                    console.log(domainNumber[0].count)
                    let output = `Domain ${domainNumber[0]._id} has ${domainNumber[0].count} urls \n`
                    fs.appendFile('output.txt', output , nextTest);
                    resolve(domainNumber[0].count)
                }

            }).catch( (err) => {
                console.log(err)
                reject(err)
            });

        });

    })

}

function getDomainNumbers(url) {
    return new Promise((resolve, reject) => {
        let agg = db.metaModel.aggregate([

                {"$group" : {_id:"$domain", count:{$sum:1}}},
                {"$sort": {_id: 1}},
                {"$match": {_id: url}},

        ])
        agg.then((results) => {
            resolve(results)
        }).catch((err) => {
            reject(err)
        });
    })
}

// print this after the testing is done
function finish () {
    console.log("Testing finished!")
}


//call on nytimes 1, 20, 50 and 100 times
// i pass in callbacks so that the tests run synchrously

function testTime1 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 1, path, file, testTime2);
}

function testTime2 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 10, path, file, testTime3);
}

function testTime3 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 20, path, file, testTime4);
}


function testTime4 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 50, path, file, testTime5);
}

function testTime5 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 100, path, file, finish);
}

function testTime6 () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("crawl", 100, path, file, finish);
}



// call on domains that found only 1 link back

async function nytimes () {
    return new Promise (function(resolve, reject) {
        let file = csvFolderPath + "nytimes.csv"
        getCrawlerNumberOfLinks("crawl", 5, path, file, NineSevenTwoMag, "https://www.nytimes.com/").then( value => {
            resolve(value);
        }).catch((err) => {
            reject(err);
        });
    })
}



function NineSevenTwoMag () {
    return new Promise (function(resolve, reject) {
        let file = csvFolderPath + "nineseventwo.csv";
        getCrawlerNumberOfLinks("crawl", 5, path, file, finish, "http://972mag.com/").then( value => {
            resolve(value);
        }).catch( (err) => {
            reject(err);
        });
    })
}

//call on nytimes 1, 20, 50 and 100 times
// i pass in callbacks so that the tests run synchrously

function testTime1Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 1, path, file, testTime2Cheerio);
}

function testTime2Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 10, path, file, testTime3Cheerio);
}

function testTime3Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 20, path, file, testTime4Cheerio);
}


function testTime4Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 50, path, file, testTime5Cheerio);
}

function testTime5Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 100, path, file, finish);
}

function testTime6Cheerio () {
    let file = csvFolderPath + "nytimes.csv"
    getCrawlerTime("cheerio", 100, path, file, finish);
}



// call on domains that found only 1 link back

function nytimesCheerio () {
    return new Promise (function(resolve, reject) {
        let file = csvFolderPath + "nytimes.csv"
        getCrawlerNumberOfLinks("cheerio", 5, path, file, NineSevenTwoMagCheerio, "https://www.nytimes.com/").then( value => {
            resolve(value);
        }).catch((err) => {
            reject(err)
        });
    })
}


function NineSevenTwoMagCheerio () {
    return new Promise (function(resolve, reject) {
        let file = csvFolderPath + "nineseventwo.csv";
        getCrawlerNumberOfLinks("cheerio", 5, path, file, finish, "http://972mag.com/").then( value => {
            resolve(value);
        }).catch( (err) => {
            reject(err);
        });
    })
}


function main() {
    ///////////uncomment as needed/////////////////

    // testTime1() // test nytimes 1, 20, 50 and 100 links timer
    // nytimes() // test whether nytimes, 972 mag had 1 link


    /// test these below
    // testTime1Cheerio()

    nytimesCheerio().then( value => { // test nytimes and the next test, 972 afterwords
        console.log("finished crawling nytimes");
    }).catch( err => {
        console.log("crawled nytimes with an error...");
    }); // test whether nytimes, 972 mag had 1 link with cheerio
  }


main()