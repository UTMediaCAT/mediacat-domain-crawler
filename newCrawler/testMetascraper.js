
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/articles', {useNewUrlParser: true});

const schema = new mongoose.Schema({date: String, url: String})
const metaModel = mongoose.model('metaModel',schema) 


mongoose.connection
  .once('open', () => console.log('Connected to DB'))
  .on('error', (error) => { 
      console.log("Your Error", error);
  });


const metascraper = require('metascraper')([
    require('metascraper-date')(),
    require('metascraper-url')()
  ])
  
  const got = require('got')
  
//   const targetUrl = 'https://www.washingtonpost.com/subscribe/signin/?case=ereplica'
//   const targetUrl = 'https://www.algemeiner.com/2020/07/13/celebrating-the-banai-family-and-the-history-of-israel-in-jerusalem/'
  const targetUrl = 'https://www.christianitytoday.com/ct/2020/october-web-only/persecution-coronavirus-churches-closed-religious-freedom.html'
//   const targetUrl = 'https://www.christianitytoday.com/scot-mcknight/2020/october/legacy-of-willow-creek-3.html'
  
  ;(async () => {
    const { body: html, url } = await got(targetUrl) //.on('request', request => setTimeout(() => request.destroy(), 50));
    const metadata = await metascraper({ html, url })

    let metaObj = new metaModel({ date: metadata.date, url: metadata.url });

    await metaObj.save();
    mongoose.connection.close()

    console.log(metadata)


  })()