var forever = require('forever-monitor');


//example script



let script = `./crawlCheerio.js`;
let maxNumberRetries = 10;

var child = new (forever.Monitor)(script, {
  max: maxNumberRetries,
  silent: false,
  args: ['https://www.nytimes.com/', '-n', '10']
});

child.on('exit', function () {
  console.log(` ${script} has exited after ${maxNumberRetries} restarts`);
});

child.start();