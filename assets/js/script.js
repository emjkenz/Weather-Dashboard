// Variables such as API keys and local storage
var apiKey = "3963db6ef6412955e434609dae8df9ba";
var searchedCities = [];
var storage = localStorage.getItem('cities');
var lastSearched = "";
var lsStorage = localStorage.getItem('lastSearched');
var city = "";

// Get a list of past searches
if (storage) {
    searchedCities = JSON.parse(storage);
}

// Get the last searched city
if (lsStorage) {
    lastSearched = lsStorage;
}

// Function to get the current data for the API for the 
function searchWeather(city) {
    // Build URL for the API
    // api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
    var api = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid="+apiKey
    $.get(api, function(data, status){
        // Pass the resulting data through to be displayed on the page
        displayWeatherData(data);
    });
}

// Function to get 5 days worth of data from the api
// The days paramater is the ammout of days you want
function searchWeatherDaily(city, days) {

    // Build URL for the API
    // api.openweathermap.org/data/2.5/forecast?q={city name}&cnt={days}&appid={API key}
    var api = "https://api.openweathermap.org/data/2.5/forecast?q="+city+/*"&cnt="+days+*/"&units=metric&appid="+apiKey
    $.get(api, function(data, status){

        // Pass the resulting data through to be displayed on the page
        displayDailyWeatherData(data, days);
    });
}

// Display the weather for the ammount of days specified by the limit
function displayDailyWeatherData(data, limit) {

    // Removed all elements from the page before adding new ones
    $('#FiveDayForcase > *').remove();

    // Temporary variables for the ammount of days added 
    // to the page and the date of the listed weather
    var list = data.list;
    var ammount = 0;
    var lastDay = 0;

    // Filter data
    var row = $('<div class="row"></div>')
    for (let index = 0; index < list.length; index++) {

        // Check to make sure you're not listing the same day or greater than the limit
        if (dayjs.unix(list[index].dt).format('DD') !== lastDay && ammount < limit) {

            // Create the elements to display the weather
            var col = $('<div class="col"></div>')
            var icon = $('<img src="https://openweathermap.org/img/wn/'+list[index].weather[0].icon+'@2x.png" alt="'+list[index].weather[0].main+'">')
            var day = $('<div class="daily-weather p-3"></div>')
            var date = $('<p>'+dayjs.unix(list[index].dt).format('DD/MM/YYYY')+'</p>')
            var temp = $('<p>Temp: '+list[index].main.temp+'&#8451;</p>')
            var wind = $('<p>Wind: '+list[index].wind.speed+'</p>')
            var humidity = $('<p>Humidity: '+list[index].main.humidity+'%</p>')

            // Add the elements to eachother
            day.append(date, icon, temp, wind, humidity)
            col.append(day)
            row.append(col)

            // Incriment the ammount to stop at the limit
            ammount++;
        }

        // Update last day with currently listed day
        lastDay = dayjs.unix(list[index].dt).format('DD');
    }
    // Add to the page
    $('#FiveDayForcase').append(row);
}

// Display todays weather
function displayWeatherData(data){

    // Removed todays weather before adding new data
    $("#Citydata > *").remove();

    // Create the elements to display the weather
    var row = $('<div class="row"></div>')
    var col = $('<div class="col"></div>')
    var title = $('<h2>'+data.name+'</h2>')
    var temp = $('<p>Temperature: '+data.main.temp+'&#8451;</p>')
    var wind = $('<p>Wind Speed: '+data.wind.speed+' meter/sec</p>')
    var humidity = $('<p>Humidity: '+data.main.humidity+'%</p>')

    // Add the elements to eachother
    col.append(title, temp, wind, humidity)
    row.append(col)

    // Add to the page
    $("#Citydata").append(row);
}

// Show all previous searches as a button
function previousSearches() {

    // Remove the list before updating the elements with search buttons
    $("#previous-searches > *").remove();

    for (var i = 0; i < searchedCities.length; i++) {

        // Create a button with a data attribut of the city
        var button = $('<button></button>');
        button.text(searchedCities[i])
              .addClass('btn btn-secondary w-100 my-2 searched-city')
              .attr('data-city',searchedCities[i])

        // Add the buttion to the page
        $("#previous-searches").append(button);
    }

    // Add a button to the bottom of the list to remove
    // all previous searches
    var clearButton = $('<button></button>');
    clearButton.text('Clear')
               .addClass('btn btn-danger w-100 my-2')
               .attr('id', 'clearSearches')
    $("#previous-searches").append(clearButton);
}

$(document).ready(function(){

    // Listen for search button click
    $('#search').on('click', function(){
        city = $('#city-search').val().toLowerCase();

        // Dont do anything if the search is empty
        if (city === ""){
            return
        }
        
        // Update local storage with the last searched city
        localStorage.setItem('lastSearched', city);

        // Clear the search box
        $('#city-search').val("");

        // Call the API and display the data
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

    // Listen for previous searches click
    $(document).on('click', '.searched-city', function(){

        // Use the data attribute to get the city name
        var searchedCity = $(this).attr('data-city');
        localStorage.setItem('lastSearched', searchedCity);

        // Get the data from the API
        searchWeather(searchedCity);
        searchWeatherDaily(searchedCity, 5);

        // Update Previous Searches
        previousSearches();
    })

    // Listen for a click on the clear searches button
    $(document).on('click', '#clearSearches', function(){

        // Clear saved searches
        localStorage.clear();

        // Reset variables
        searchedCities = [];
        lastSearched = '';

        // Reset all UI elements
        $('#FiveDayForcase > *').remove();
        $('#Citydata > *').remove();

        // Update the previous searches bar with reset data
        previousSearches();
    })

    // Update the previous searches bar with reset data
    previousSearches();
    if (lastSearched) {

        // Use locally saved search to avoid re-searching
        searchWeather(lastSearched);
        searchWeatherDaily(lastSearched, 5);
    }
})