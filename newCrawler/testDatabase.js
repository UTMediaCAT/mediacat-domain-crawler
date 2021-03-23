/*
prints out the number of found articles per domain
mongod needs to be running
*/

const mongoose = require('mongoose');
let db = require('./database.js')


async function funct() {

    let agg = await db.metaModel.aggregate([
        {"$group" : {_id:"$domain", count:{$sum:1}}}
    ])

    console.log(agg)
    
}

funct()

