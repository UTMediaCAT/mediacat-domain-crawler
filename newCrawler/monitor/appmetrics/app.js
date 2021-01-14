var dash = require('appmetrics-dash');
dash.attach();

var http = require('http');

const port = 3001;

const requestHandler = (request, response) => {  
  response.end('Hello')
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {  
  if (err) {
    return console.log('An error occurred', err)
  }
  console.log(`Server is listening on ${port}`)
});
