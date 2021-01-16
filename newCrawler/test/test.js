
//node crawl.js https://www.nytimes.com/ https://www.aljazeera.com/ https://www.cnn.com/

const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
let number = 20
let path = "/voyage_storage/mediacat-domain-crawler/newCrawler";




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
    let message = `Call to crawler with ${number} links took ${t2/1000.0 - t1/1000.0} seconds.`
    console.log('\x1b[36m%s\x1b[0m', message );  //cyan
    nextTest()
    });

}



//call on nytimes

function test1 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(1, path, file, test2);
}

function test2 () {
    let file = "./test/csv/nytimes.csv"
    getCrawlerTime(20, path, file, test3);
}


function test3 () {
    console.log("Testing finished!")
}

test1()
