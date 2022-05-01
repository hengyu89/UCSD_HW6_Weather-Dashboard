var cityNameList = [];
var searchBar = document.querySelector("#city-name");
var searchBtn = document.querySelector("#search-button");
var todayInfo = document.querySelector(".display-area");
var historyBtn = document.querySelector(".search-history");
var historyLocation = {};
var searchTime = -1;

var apiKey = "62eb0d1b2578798b78921afefd59670e";

function displayWeatherInfo(event) {
    event.preventDefault();
    searchTime ++;

    // check the input exists.
    if(searchBar.value === "") {
        alert("Please input a name of city for searching.");
    } else {
        cityNameList[searchTime] = searchBar.value.trim();
    }
    weatherSearchData(cityNameList[searchTime])
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
        longitude = data.coord.lon;
        latitude = data.coord.lat;
        cityName = data.name;
        weatherByLocation(latitude, longitude, cityName);
    });
};


function weatherByLocation(latitude, longitude, cityName) {
    var URLforInfo = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    return fetch(URLforInfo).then(response => {
        if(response.ok) {
            return response.json();
        } else {
            alert("Error: ", response.statusText);
            return
        }
    })
    .then((data) => {

        // display the weather for TODAY and FUTURE
        displayToday(data.daily[0], cityName);
        displayFuture(data);

        // store to local storage
        storeObject(data, cityName);
    });
};


function displayToday(data, cityName) {
    todayInfo.innerHTML = "";
    var todayDate = moment().format("l");
    var template = `
    <div class="row display-today">
    <h3>${cityName} (${todayDate}) <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/> </h3>
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
            <h4>${moment().add(i+1,'days').format('l')}</h4> 
            <img src="http://openweathermap.org/img/wn/${data.daily[i+1].weather[0].icon}@2x.png"/><br>
            <p>Temp: ${data.daily[i+1].temp.day}°F</p>
            <p>Wind: ${data.daily[i+1].wind_speed} MPH</p>
            <p>Humidity: ${data.daily[i+1].humidity}%</p></div>
        `;
        futureInfo.innerHTML += template;
    }
}

function storeObject(data, cityName) {
    // Create object for local storage
    var thisLocation = {daily:[]}
    for (var i = 0; i < 6; i++) {
        thisLocation.daily[i] = {
            temp: {
                day: data.daily[i].temp.day
            },
            wind_speed: data.daily[i].wind_speed,
            humidity: data.daily[i].humidity,
            uvi: data.daily[i].uvi,
            weather: [
                {icon: data.daily[i].weather[0].icon}
            ]
        }
    }
    historyLocation[cityName] = thisLocation;
    historyBtn.innerHTML += `
        <button type="submit" class="btn btn-primary history${searchTime}">${cityNameList[searchTime]}</button> <br>
        `;

    addListener(historyLocation);
}

function addListener(historyLocation) {
    for (var i = 0; i < cityNameList.length; i++) {
        document.querySelector('.history'+i).addEventListener("click", function(event) {
            event.preventDefault();
            var name = event.target.innerHTML; // name of city
            displayToday(historyLocation[name].daily[0], name);
            displayFuture(historyLocation[name]);
        })
    }
}

searchBtn.addEventListener("click", displayWeatherInfo);