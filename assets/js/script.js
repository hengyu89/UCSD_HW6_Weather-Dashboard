var cityNameList = [];
var searchBar = document.querySelector("#city-name");
var searchBtn = document.querySelector("#search-button");
var todayInfo = document.querySelector(".display-area");
var historyBtn = document.querySelector(".search-history");
var historyLocation = {};
var searchTime = -1;

var apiKey = "62eb0d1b2578798b78921afefd59670e";


// active when click the "search" button
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


// input => city name, output => location(latitude, longitude)
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


// input => location, display all weather information.
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


// subfunction to display TODAY's weather.
function displayToday(data, cityName) {

    // display today's weather information
    todayInfo.innerHTML = "";
    var todayDate = moment().format("l");
    var template = `
    <div class="row display-today">
    <h3>${cityName} (${todayDate}) <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/> </h3>
    <p>Temp: ${data.temp.day} °F</p>
    <p>Wind: ${data.wind_speed} MPH</p>
    <p>Humidity: ${data.humidity} %</p>
    <p>UV index: <span id="uvindex">${data.uvi}</span></p></div>`;
    todayInfo.innerHTML = template;

    // add different colors to UV index with TODAY.
    if(data.uvi <= 2) {
        document.querySelector('#uvindex').setAttribute('style', 'background-color: green');
    } else if(data.uvi <= 5) {
        document.querySelector('#uvindex').setAttribute('style', 'background-color: yellow');
    } else if(data.uvi <= 7) {
        document.querySelector('#uvindex').setAttribute('style', 'background-color: orange');
    } else if(data.uvi <= 10) {
        document.querySelector('#uvindex').setAttribute('style', 'background-color: red');
    } else {
        document.querySelector('#uvindex').setAttribute('style', 'background-color: purple');
    }
}


// subfunction to display future 5 days weather.
function displayFuture(data) {

    // main layout of future 5 days title
    todayInfo.innerHTML += `
    <div class="row display-future justify-content-around">
        <h3>5-day forecast:</h3>`;

    // capture the tag of main layout, and put 5 days weather information in there.
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


// store weather information, for history buttons use.
function storeObject(data, cityName) {

    // store the information with same format as API, in order to work in display function.
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

    // add history buttons for searching.
    historyBtn.innerHTML += `
        <button type="submit" class="btn btn-primary history${searchTime}">${cityNameList[searchTime]}</button> <br>
        `;
    // add listener function to each buttons.
    addListener(historyLocation);
}


// add eventListener function to each history buttons.
function addListener(historyLocation) {
    // use loop to apply listener function to all history buttons.
    for (var i = 0; i < cityNameList.length; i++) {
        document.querySelector('.history'+i).addEventListener("click", function(event) {
            event.preventDefault();
            var name = capitalizeName(event.target.innerHTML); // name of city
            displayToday(historyLocation[name].daily[0], name);
            displayFuture(historyLocation[name]);
        })
    }
}

// capitalize the initial of city name. Example: "san diego" to "San Diego".
function capitalizeName(name) {
    var arr = name.split(' ');
    for( var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    };
    var capName = arr.join(" ");
    return capName;
}

searchBtn.addEventListener("click", displayWeatherInfo);