const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/articles', {useNewUrlParser: true, useUnifiedTopology: true});

const schema = new mongoose.Schema({
    title: String, 
    title_metascraper: String,
    url: String,
    author_metadata: String,
    author_metascraper: String,
    date: String,
    html_content: String,
    article_text: String,
    article_len: String,
    domain: String,
    updated: Boolean,
    found_urls: [{
        title: String,
        date: String,
        url: String
    }],

})
module.exports.metaModel = mongoose.model('metaModel',schema) 