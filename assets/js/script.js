var apiKey = "3963db6ef6412955e434609dae8df9ba";
var searchedCities = [];
var storage = localStorage.getItem('cities');
var lastSearched = "";
var lsStorage = localStorage.getItem('lastSearched');

if (storage) {
    searchedCities = JSON.parse(storage);
}

if (lsStorage) {
    lastSearched = lsStorage;
}

function searchWeather(city) {
    // Build URL for the API
    // api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
    var api = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid="+apiKey
    $.get(api, function(data, status){
        displayWeatherData(data);
    });
}
function searchWeatherDaily(city, days) {
    // Build URL for the API
    // api.openweathermap.org/data/2.5/forecast?q={city name}&cnt={days}&appid={API key}
    var api = "https://api.openweathermap.org/data/2.5/forecast?q="+city+"&cnt="+days+"&units=metric&appid="+apiKey
    $.get(api, function(data, status){
        displayDailyWeatherData(data);
    });
}

function displayDailyWeatherData(data) {
    $('#FiveDayForcase > *').remove();
    var list = data.list;
    var row = $('<div class="row"></div>')
    for (let index = 0; index < list.length; index++) {
        var col = $('<div class="col"></div>')
        var day = $('<div class="daily-weather"></div>')
        var date = $('<p>'+dayjs.unix(list[index].dt).format('hh:mm - DD/MM/YYYY')+'</p>')
        var temp = $('<p>Temp: '+list[index].main.temp+'&#8451;</p>')
        var wind = $('<p>Wind: '+list[index].wind.speed+'</p>')
        var humidity = $('<p>Humidity: '+list[index].main.humidity+'%</p>')
        day.append(date, temp, wind, humidity)
        col.append(day)
        row.append(col)
    }
    $('#FiveDayForcase').append(row);
    console.log(data);
}

function displayWeatherData(data){
    // Remove all elements in Citydata
    $("#Citydata > *").remove();

    var row = $('<div class="row"></div>')
    var col = $('<div class="col"></div>')
    var title = $('<h2>'+data.name+'</h2>')
    var temp = $('<p>Temperature: '+data.main.temp+'&#8451;</p>')
    var wind = $('<p>Wind Speed: '+data.wind.speed+' meter/sec</p>')
    var humidity = $('<p>Humidity: '+data.main.humidity+'%</p>')

    col.append(title, temp, wind, humidity)
    row.append(col)
    $("#Citydata").append(row);
}

function previousSearches() {
    $("#previous-searches > *").remove();

    for (var i = 0; i < searchedCities.length; i++) {
        var button = $('<button></button>');
        button.text(searchedCities[i])
              .addClass('btn btn-secondary w-100 my-2 searched-city')
              .attr('data-city',searchedCities[i])
        $("#previous-searches").append(button);
    }
    var clearButton = $('<button></button>');
    clearButton.text('Clear')
               .addClass('btn btn-danger w-100 my-2')
               .attr('id', 'clearSearches')
    $("#previous-searches").append(clearButton);
}

$(document).ready(function(){
    $('#search').on('click', function(){
        var city = $('#city-search').val().toLowerCase();
        localStorage.setItem('lastSearched', city);
        // Clear Value
        $('#city-search').val("");
        searchWeather(city);
        searchWeatherDaily(city, 5);
        // Save list of Cities
        if (!searchedCities.includes(city)) {
            searchedCities.push(city);
            localStorage.setItem('cities',JSON.stringify(searchedCities));
        }
        // Update Previous Searches
        previousSearches();
    })

    $(document).on('click', '.searched-city', function(){
        var searchedCity = $(this).attr('data-city');
        localStorage.setItem('lastSearched', searchedCity);
        searchWeather(searchedCity);
        searchWeatherDaily(searchedCity, 5);
        // Update Previous Searches
        previousSearches();
    })

    $(document).on('click', '#clearSearches', function(){
        localStorage.clear();
        searchedCities = [];
        lastSearched = '';
        $('#FiveDayForcase > *').remove();
        $('#Citydata > *').remove();
        previousSearches();
    })

    previousSearches();
    if (lastSearched) {
        console.log(lastSearched);
        searchWeather(lastSearched);
        searchWeatherDaily(lastSearched, 5);
    }
})