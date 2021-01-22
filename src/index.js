let weather = {
    "apiKey": process.env.API_KEY_WEATHER,
    fetchWeather: function (city) {
        fetch(
            "http://api.openweathermap.org/data/2.5/weather?q=" 
            + city 
            + "&units=metric&appid=" 
            + this.apiKey
        )
            .then((response) => response.json())
            .then((data) => this.displayWeather(data));
    },
    displayWeather: function(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        const { lon,lat } = data.coord;
        //console.log(name,icon,description,temp,humidity,speed, lon, lat); //In case of test
        document.querySelector(".city").innerText = name;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h";
        document.querySelector(".lat").innerText = lat;
        document.querySelector(".lon").innerText = lon;
        document.querySelector(".weather").classList.remove("loading");
        document.body.style.backgroundImage = "url('https://source.unsplash.com/1920x1080/?"+ name +"')";
    },
    search: function(){
        this.fetchWeather(document.querySelector(".search-bar").value);
    }
};

let aqi = {
    "apiKey": process.env.API_KEY_AQI,
    fetchAqi: function (latitude,longitude) {
        fetch(
            "http://api.openweathermap.org/data/2.5/air_pollution?lat=" 
            + latitude
            + "&lon="  
            + longitude
            + "&appid="
            + this.apiKey 
        )
            .then((response) => response.json())
            .then((data) => this.displayAqi(data));
    },
    displayAqi: function(data) {
        const { pm2_5, pm10, o3, no2, so2, co } = data.list[0].components;
        const { aqi } = data.list[0].main;
        //console.log(aqi,pm25,pm10,o3,no2,so2,co); //In case of test
        document.querySelector(".air-quality").innerText = "Air Quality: " + aqi;
        document.querySelector(".pm25").innerText = "PM2.5: " + pm2_5 + " μg/m3";
        document.querySelector(".pm10").innerText = "PM10: " + pm10 + " μg/m3";
        document.querySelector(".o3").innerText = "O3: " + o3 + " μg/m3";
        document.querySelector(".no2").innerText = "NO2: " + no2 + " μg/m3";
        document.querySelector(".so2").innerText = "SO2: " + so2 + " μg/m3";
        document.querySelector(".co").innerText = "CO: " + co + " μg/m3";

        if (aqi==1){
            document.querySelector(".fa-circle").style.color = 'green';
        } else if(aqi==2) {
            document.querySelector(".fa-circle").style.color = 'yellow';
        } else if (aqi==3) {
            document.querySelector(".fa-circle").style.color = 'orange';
        } else if (aqi==4){
            document.querySelector(".fa-circle").style.color = 'red';
        } else if (aqi==5) {
            document.querySelector(".fa-circle").style.color = 'purple';
        }
    },
    search: function(){
        this.fetchAqi(document.querySelector(".lat").innerText, document.querySelector(".lon").innerText);
    }
};


let geocode = {
    reverseGeocode: function (latitude,longitude){
        var apikey = process.env.API_KEY_GEOCODE;

        var api_url = 'https://api.opencagedata.com/geocode/v1/json'

        var request_url = api_url
            + '?'
            + 'key=' + apikey
            + '&q=' + encodeURIComponent(latitude + ',' + longitude)
            + '&pretty=1'
            + '&no_annotations=1';

        // see full list of required and optional parameters:
        // https://opencagedata.com/api#forward

        var request = new XMLHttpRequest();
        request.open('GET', request_url, true);

        request.onload = function() {
            // see full list of possible response codes:
            // https://opencagedata.com/api#codes

            if (request.status === 200){ 
            // Success!
            var data = JSON.parse(request.responseText);
            //console.log(data.results[0].components.city); // print the location
            weather.fetchWeather(data.results[0].components.city);
            aqi.fetchAqi(latitude,longitude);

            } else if (request.status <= 500){ 
            // We reached our target server, but it returned an error
                                
            console.log("unable to geocode! Response code: " + request.status);
            var data = JSON.parse(request.responseText);
            console.log('error msg: ' + data.status.message);
            } else {
            console.log("server error");
            }
        };

        request.onerror = function() {
            // There was a connection error of some sort
            console.log("unable to connect to server");        
        };

        request.send();  // make the request
    },
    getLocation: function() {
        function success (data) {
            geocode.reverseGeocode(data.coords.latitude, data.coords.longitude);
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, console.error);
        }
        else {
            weather.fetchWeather("London");
        }
    }
}

document
.querySelector(".search button").addEventListener("click", function() {
    weather.search();
    aqi.search();
});

document
.querySelector(".search-bar").addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        weather.search();
        aqi.search();
    }
});

geocode.getLocation();