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

            })
        }

        setInterval(fetchData,10000);


    });


}());