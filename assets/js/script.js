var cityName = "";
var searchBar = document.querySelector("#city-name");
var searchBtn = document.querySelector("#search-button");
var todayInfo = document.querySelector(".display-area");

var apiKey = "62eb0d1b2578798b78921afefd59670e";

function displayWeatherInfo(event) {
    event.preventDefault();

    // check the input exists.
    if(searchBar.value === "") {
        alert("Please input a name of city for searching.");
    } else {
        cityName = searchBar.value.trim();
        console.log("city name: ", cityName);
    }
    weatherSearchData(cityName)
};


function weatherSearchData(wantCityName) {
    var longitude = 0;
    var latitude = 0;
    var cityName = "";
    var URLforLocation = `https://api.openweathermap.org/data/2.5/weather?q=${wantCityName}&appid=${apiKey}`;

    fetch(URLforLocation).then(response => {
        if(response.ok) {
            return response.json();
        } else {
            alert("Error: ", response.statusText);
            return
        }
    })
    .then((data) => {
        console.log('old data: ', data);
        longitude = data.coord.lon;
        latitude = data.coord.lat;
        cityName = data.name;
        weatherByLocation(latitude, longitude, cityName);
    });
};

function weatherByLocation(latitude, longitude, cityName) {
    var URLforInfo = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    console.log('latitude: ', latitude);
    console.log(URLforInfo);
    return fetch(URLforInfo).then(response => {
        if(response.ok) {
            return response.json();
        } else {
            alert("Error: ", response.statusText);
            return
        }
    })
    .then((data) => {
        console.log("new data: ", data);
        displayToday(data.daily[0], cityName);
        displayFuture(data);
    });
};


function displayToday(data, cityName) {
    todayInfo.innerHTML = "";
    var todayDate = moment().format("l");
    var template = `
    <div class="row display-today">
    <h3>${cityName} (${todayDate})</h3>
    <p>Temp: ${data.temp.day} °F</p>
    <p>Wind: ${data.wind_speed} MPH</p>
    <p>Humidity: ${data.humidity} %</p>
    <p>UV index: ${data.uvi}</p></div>`;
    todayInfo.innerHTML = template;
}

function displayFuture(data) {
    todayInfo.innerHTML += `
    <div class="row display-future justify-content-around">
        <h3>5-day forecast:</h3>`;
    var futureInfo = document.querySelector(".display-future");
    for (var i = 0; i < 5; i++) {
        var template = `
        <div class="col-2 bg-dark text-light">
            <h4>${moment().add(i+1,'days').format('l')}</h4> <br>
            <p>Temp: ${data.daily[i+1].temp.day}°F</p>
            <p>Wind: ${data.daily[i+1].wind_speed} MPH</p>
            <p>Humidity: ${data.daily[i+1].humidity}%</p></div>
        `;
        futureInfo.innerHTML += template;
    }
}

console.log("js works.")
searchBtn.addEventListener("click", displayWeatherInfo);