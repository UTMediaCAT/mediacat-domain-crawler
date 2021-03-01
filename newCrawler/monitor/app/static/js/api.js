var api = (function(){
    "use strict";
    
    var module = {};

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    function sendCSV(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, xhr.responseText);
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-disposition', 'attachment; filename=listOfDomainHits.csv');
            xhr.set('Content-Type', 'text/csv');
            xhr.status(200).send(data);
        }
    }

    module.fetch = function(callback){
        send("GET", "/api/fetch/", null, callback);
    };

    module.downloadCSV = function(callback, data){
        sendCSV("GET", "/api/downloadCSV/", null, callback)
    }
    
    return module;
}());
