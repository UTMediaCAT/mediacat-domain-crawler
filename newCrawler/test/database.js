const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testarticles', {useNewUrlParser: true, useUnifiedTopology: true});

const schema = new mongoose.Schema({
    title: String, 
    url: String,
    author_metadata: String,
    date: String,
    html_content: String,
    article_text: String,
    article_len: String,
    domain: String,
    found_urls: [{
        title: String,
        url: String
    }],

})
module.exports.metaModel = mongoose.model('metaModel',schema) 