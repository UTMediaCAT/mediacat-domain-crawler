const express = require('express');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');

const dir = '../../results/';

app.use(express.static('static'));


const http = require('http');
const PORT = 3030;


const { Parser } = require('json2csv');

const fields = ['_id', 'count'];
const opts = { fields };

// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const csvWriter = createCsvWriter({
//     path: 'links.csv',
//     header: [
//       {id: 'numberOfLinks', title: 'NumberOfLinks'}
//     ],
//     append: true
//   });


let csvWriter = require('csv-write-stream')
let writer = csvWriter()


let db = require('../../database.js')

let path = require('path');

let EXTENSION = '.json';

let finalPathFile = './links.csv';

let finalPathFileNames = './linkNames.txt';

let listOfDomainHits = 'linkHits.csv'

let watch = require('watch');

function filterfunction(f, stat) {
    if (f) {
        return !(/(^|\/)\.[^\/\.]/g).test(f);
    } else {
        return false;
    }
}


watch.createMonitor(dir, {filter: filterfunction} , function (monitor) {
    
    monitor.on("created", function (f, stat) {
        if (stat.isDirectory()) {
            let line = `created dir: ${f} \n`
            fs.appendFile(finalPathFileNames, line, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log(line);
            }); 
            
        } else {
            let line = `created file: ${f} \n`
            fs.appendFile(finalPathFileNames, line, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log(line);
            }); 
        }
    })

    monitor.on("changed", function (f, curr, prev) {
        let line = `changed file: ${f} \n`
        fs.appendFile(finalPathFileNames, line, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(line);
        }); 
    });

    monitor.on("removed", function (f, stat) {
        let line = `removed dir/file: ${f} \n`
        fs.appendFile(finalPathFileNames, line, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(line);
        }); 
    });
});


app.get('/api/fetch', function(req, res, next) {
    fs.readdir(dir, (err, files) => {
        // filter the hidden files
        //files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));

        //filter for only json files

        var targetFiles = files.filter(function(file) {
            return path.extname(file).toLowerCase() === EXTENSION;
        });
        
        let data = targetFiles.length;

        // fs.appendFile("./links", `${data} link(s) were saved \n`, function(err) {
        //     if(err) {
        //         return res.json({messages: err});
        //     }
        //     return res.json({messages: data});
        // }); 


        // const dataCSV = [
        //     {numberOfLinks: data}
        // ] 
        // csvWriter.writeRecords(dataCSV).then(()=> console.log('The CSV file was written successfully'));

        if (!fs.existsSync(finalPathFile))
            writer = csvWriter({ headers: ["numberOfLinks"]});
        else
            writer = csvWriter({sendHeaders: false});

        writer.pipe(fs.createWriteStream(finalPathFile, {flags: 'a'}));
        writer.write({
            numberOfLinks: data,
            });
        writer.end();

        writer.on('end', function () {
            console.log( "number of links in directory " + data);

            database().then(domainNumber => {
                // MAKE DB HERE
                
                return res.json({links: domainNumber, messages: data});
            }).catch( (err) => {
                console.log(err)
            });
            
          });

      });
    
});

app.get('/api/downloadCSV', function(req, res, next) {
    database().then(domainNumber => {

        console.log(domainNumber)

        let fileName = 'listOfDomainHits.csv';

        try {
            const parser = new Parser(opts);
            const csv = parser.parse(domainNumber);
            // fs.writeFile(fileName, csv, function(err){
            //     if (err) throw err;
            //     console.log('File Saved!')
            //     console.log(csv);
            // })
            fs.writeFileSync(fileName, csv);

            console.log(csv);

            // res.setHeader('Content-disposition', 'attachment; filename=listOfDomainHits.csv');
            // res.set('Content-Type', 'text/csv');
            res.status(200)
            return res.download(fileName);


        } catch (err) {
            console.error(err);
            return res.send(err)
        }

    }).catch( (err) => {
        console.log("ERROR")
        return res.send(err)
    });
});


http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

function database() {
    return new Promise((resolve, reject) => {
        let agg = db.metaModel.aggregate([

                {"$group" : {_id:"$domain", count:{$sum:1}}},
                {"$sort": {_id: 1}}

        ])
        agg.then((results) => {
            resolve(results)
        }).catch((err) => {
            reject(err)
        });
    })   
}
