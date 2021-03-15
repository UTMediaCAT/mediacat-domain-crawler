const mongoose = require('mongoose');
let db = require('./database.js')

mongoose.connection
  .once('open', () => console.log('Connected to DB'))
  .on('error', (error) => { 
      console.log("Your Error", error);
  });
function clearDB() {
    db.metaModel.deleteMany({}).then(function(){ 
        console.log("Data deleted"); // Success 
        mongoose.connection.close();
    }).catch(function(error){ 
        console.log(error); // Failure 
    });
}
// Resets all entries with updated value true to updated value being false
function resetUpdatedVar() {
    db.metaModel.find({'updated': true}, async function (err, docs) {
        if (err) return console.log(err);
        await db.metaModel.updateMany({}, {'updated': false});
        console.log("Data reset to updated = false")
        mongoose.connection.close();
    });
}
let arg = process.argv.slice(2)[0];
console.log(arg);
if (arg == 'clear') {
    clearDB();
}
else if (arg == 'reset') {
    resetUpdatedVar();
}
