
//node crawl.js https://www.nytimes.com/ https://www.aljazeera.com/ https://www.cnn.com/

const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
const fs = require('fs');

let number = 20
let path = "/voyage_storage/mediacat-domain-crawler/newCrawler";

let db = require('./database.js')

// remove the database current contents
db.metaModel.remove({}, function(err){
    console.log('collection removed'); 
});


// delete file named 'output.txt' in the very beginning
fs.unlink('output.txt', function (err) {
    if (err) {
        console.log(err);
    } 
    // if no error, file has been deleted successfully
    console.log('File deleted!');
}); 


function getCrawlerTime (number, path, file , nextTest ) {

    const t1 = performance.now();
    const ls = spawn('node', ['crawl.js', '-f', file, '-n', number ], {cwd: path});

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



function getCrawlerNumberOfLinks (number, path, file , nextTest , url) {

    const ls = spawn('node', ['crawl.js', '-f', file, '-n', number , '-t'], {cwd: path});

    ls.stdout.on('data', (data) => {
    console.log(`${data}`);
    });

    ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);

        getDomainNumbers(url).then(domainNumber => {

            
                
            if (domainNumber[0].count <= number) {
                console.log('\x1b[36m%s\x1b[0m', `FAIL: Domain ${domainNumber[0]._id} has less urls as unexpected!`)
                console.log(domainNumber[0].count)
            } else {
                console.log('\x1b[36m%s\x1b[0m',`PASS: Domain ${domainNumber[0]._id}`)
                console.log(domainNumber[0].count)
            }

            fs.appendFile('output.txt', domainNumber[0].toString() , nextTest);

        }).catch( (err) => {
            console.log(err)
        });


        // fs.appendFile('output.txt', message , nextTest);

    });

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
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(1, path, file, testTime2);
}

function testTime2 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(10, path, file, testTime3);
}

function testTime3 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(20, path, file, testTime4);
}


function testTime4 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(50, path, file, testTime5);
}

function testTime5 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(100, path, file, testTime6);
}

function testTime6 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(100, path, file, finish);
}



// call on domains that found only 1 link back




async function nytimes () {
    let file = "./test/csv/nytimes.csv"
    let result = await getCrawlerNumberOfLinks(5, path, file, NineSevenTwoMag, "https://www.nytimes.com/");
}

async function NineSevenTwoMag () {
    let file = "./test/csv/nineseventwo.csv"
    let result = await getCrawlerNumberOfLinks(5, path, file, finish, "http://972mag.com/");
}


///////////uncomment as needed/////////////////

testTime1() // test nytimes 1, 20, 50 and 100 links timer
// nytimes() // test whether nytimes, 972 mag had 1 link
