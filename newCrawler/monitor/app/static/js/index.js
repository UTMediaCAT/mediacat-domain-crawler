(function(){
    "use strict";

    window.addEventListener('load', function(){


        function fetchData() {
            api.fetch(function(err, res) {
                console.log(res);
                let line = document.createElement("p");
                line.innerText = `${res.messages} link(s) were found`;
                document.querySelector('#output').appendChild( line );
                document.querySelector('#outputChange').innerHTML = line.innerHTML;
                document.querySelector('#domainOutputChange').innerHTML = "";

                let i;
                for (i = 0; i < (res.links).length; i++) {
                    let countline = document.createElement("p");
                    countline.innerText = `Domain: ${res.links[i]._id} Count: ${res.links[i].count}`;
                    document.querySelector('#domainOutputChange').appendChild( countline );

                }

            })
        }

        setInterval(fetchData,10000);


    });


}());