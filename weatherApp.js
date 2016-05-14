//Update HTML with info from location and weather APIs
function updateToday(w,data){
  //convert date with the function
  $(".today").html(futureDateToDayCapitalize(new Date(),0))
  $(".city").html(w.city);
  $(".country").html(data.sys.country);
  //round temp and wind speed to tenths
  $(".temperature").html(Math.floor(w.temp * 10) / 10 + " °C");
  $(".windSpeed").html(Math.floor(w.windS * 10) / 10 + " m/s");
  $(".description").html("<div><img class='weatherIcon'src='" + "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png" + "'alt=''></div>" + data.weather[0].description);
  backgroundChange(w);  //updating background according to temp
}

//Update HTML with forecast data according to the numnber of days from the dropdown option
function updateForecast(w){
  //clean previous forecast information
  var forecastText = "";
  for(var i = 0; i < w.selectedNumberDays; i++){
    forecastText += "<div class='col-md-3'>";
    forecastText += "<div class='forDate'>" + futureDateToDayCapitalize(new Date(),i) + "</div>";
    forecastText += "<div class='forDescription'>" + "<div><img class='weatherIcon' src='" + "http://openweathermap.org/img/w/" + w.forecastData.list[i].weather[0].icon + ".png" + "'alt=''></div>" + w.forecastData.list[i].weather[0].description + "</div>";
    forecastText += "<div class='forTemperature'>" + Math.floor(w.forecastData.list[i].temp.day * 10)/10 + w.unitsTemp + "</div>"
    forecastText += "</div>";
  }
  //give JS engine enough time to update variables
  setTimeout(function() {
      //update HTML with the forecast info
      $(".row").html(forecastText)
      //display the forecast data on the page
      $("#effect").show("blind", 500);
  }, 300);
}

//Object with background pictures
var background = {
   zeroDegrees: "https://images.unsplash.com/photo-1452302372225-a5ba1edd65ca?crop=entropy&fit=crop&fm=jpg&h=950&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925",
   tenDegrees: "https://images.unsplash.com/photo-1445561696415-deadc6a2adaa?crop=entropy&fit=crop&fm=jpg&h=950&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925",
   twentyDegrees: "https://images.unsplash.com/photo-1418225043143-90858d2301b4?crop=entropy&fit=crop&fm=jpg&h=950&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925",
   thirtyDegrees: "https://images.unsplash.com/uploads/14121010130570e22bcdf/e1730efe?crop=entropy&fit=crop&fm=jpg&h=950&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925",
   moreDegrees: "https://images.unsplash.com/reserve/unsplash_529f1a3f2f5ed_1.JPG?crop=entropy&fit=crop&fm=jpg&h=950&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925",
};

//Change the background according to the temperature
function backgroundChange(w){
  var bg;
  if(w.temp < 0){
    bg = background.zeroDegrees;
  }
  else if(w.temp <= 10){
    bg = background.tenDegrees;;
  }
  else if(w.temp <= 20){
    bg = background.twentyDegrees;;
  }
  else if(w.temp <= 30){
    bg = background.thirtyDegrees;;
  }
  else{
    bg = background.moreDegrees;;
  }
  //upgrade HTML page with particular background
  $("body").css("background", "url(" + bg + ") no-repeat center center fixed");
}

// Change the unit type by clicking on the particular button
$("#metric").on("click", function(){
  //change the forecast units
  if(weatherInfo.units !== "metric"){
    weatherInfo.unitsTemp = " °C";
    weatherInfo.units = "metric";
    //make API call with different units
    weatherAPI.getForecastData(weatherInfo, function(w){
      updateForecast(w)
    });
  }
  //change the today's units
  $(".temperature").text(weatherInfo.temp + " °C");
  $(".windSpeed").text(weatherInfo.windS + " m/s");
});

$("#imperial").on("click", function(){
  //change the forecast units
  weatherInfo.unitsTemp = " °F";
  weatherInfo.units = "imperial";
  //make API call only if the dropdown menu is not set to the default value
  if($(".form-control").find("option:selected").text() !== "Choose the number of days"){
    weatherAPI.getForecastData(weatherInfo, function(w){
      updateForecast(w)
    });
  }
  //change the today's units (using math that converts units)
  $(".temperature").text(Math.floor((weatherInfo.temp * 9/5 + 32) * 10) / 10 + " °F");
  $(".windSpeed").text(Math.floor((weatherInfo.windS * 2.23694) * 10) / 10 + " mph");
});

//converts today's date to the future date, convert it into the day of the week in the user's language and capitalize the first letter
function futureDateToDayCapitalize(dateString, days){
    //store current date
    var newDate = new Date(dateString);
    //get future date
    var updateDate = new Date(newDate.getTime() + days*24*60*60*1000)
    //convert date to the day of the week in the user's language
    var translatedDay = updateDate.toLocaleString(window.navigator.language, {weekday: 'long'});
    //capitalize the first letter
    return translatedDay.charAt(0).toUpperCase() + translatedDay.slice(1)
}

//when the value (number) from the dropdown menu is selected, it is stored in the variable
$(".form-control").change(function(){
  weatherInfo.selectedNumberDays = $(this).find("option:selected").text();
  //if the default value is selected from the dropdown menu, hide the forecast info 
  if($(".form-control").find("option:selected").text() === "Choose the number of days"){
    $("#effect").hide("blind", 500);
  }
  //if the number is selected, HTML page is updated with the forecast information
  else {
    weatherAPI.getForecastData(weatherInfo, function(w){
      updateForecast(w)
    });
  }
})

//Update page according to the user's input
document.querySelector('#enterCity').addEventListener('keydown', function(e) {
  //when enter is pressed
  if(e.keyCode === 13){
    //hide the forecast
    $("#effect").hide("blind", 500);
    //store the input
    weatherInfo.city = $("input").val();
    //clear the input
    $("input").val("");
    //set units to default metric units
    weatherInfo.units = "metric";
    weatherInfo.unitsTemp = " °C";
    //create a query string object
    weatherInfo.dataSendWeat = {
      q:  weatherInfo.city,
      units: weatherInfo.units,
      lang: weatherInfo.lang,
      appid: "2d065d4d45046e640c6a38edf52812ce"
    }
    // update HTML page
    weatherAPI.getWeatherData(weatherInfo, function(w, dataWeat){
      updateToday(w, dataWeat);
    });
    weatherAPI.getForecastData(weatherInfo, function(w){
      updateForecast(w)
    });
  }
});



//Object weatherInfo stores weather object and location information object
var weatherInfo = {};

//Object that stores all the weather API calls
var weatherAPI = {
  //Get weather data according to the retrieved location data with two arguments - object and function
  getWeatherData: function(w, callback){
    $.getJSON("http://api.openweathermap.org/data/2.5/weather?", w.dataSendWeat, function(dataWeat){
      w.temp = dataWeat.main.temp;
      w.windS = dataWeat.wind.speed;
      //metric units are set as default for this app
      weatherInfo.unitsTemp = " °C";
      callback(w, dataWeat);    //call updateToday as a callback function
    });
  },

  getForecastData: function(w, callback){
    //hide the previous forecast info
    $("#effect").hide("blind", 500);
    //getting forecast data with AJAX
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          w.forecastData = JSON.parse(xhr.responseText);
            callback(w);  //run updateForecast (w as an object weatherInfo)
        }
        //when the API call is unsuccessful...
        else{
          $(".form-control").attr("disabled", "disabled");
          $(".form-control").html("<option selected='selected' value='0'>Reload the page please</option>");
        }
      } // end of if statement
    };// end of onreadystatechange
    //sending API request to the server
    var city = "q=" + weatherInfo.city;
    var mode = "&mode=json";
    var units = "&units=" + weatherInfo.units;
    var lang = "&lang=" + weatherInfo.lang;
    var daysNumber = "&cnt=" + w.selectedNumberDays;
    var apiId = "&appid=2d065d4d45046e640c6a38edf52812ce";
    xhr.open("GET","http://api.openweathermap.org/data/2.5/forecast/daily?" + city + mode + units + lang + daysNumber + apiId);
    xhr.send();
  } // end of getForecastData function
} //end of weatherAPI object

// Object storing location API call
var locationAPI = {
  //function that makes API call for location data with two arguments - object and function
  getLocation: function(w, callback){
    //Detecting user's browser language preference with IIFE
    (function (){
      var language = window.navigator.userLanguage || window.navigator.language;
      //openweather API needs "cz" for Czech language
      if(language === "cs"){
        w.lang = "cz"
      }
      else{
        w.lang = language;
      }
    }());
    // Get location data of the user
    $.getJSON("http://ip-api.com/json", function getDataLoc(dataLoc){
      w.city = dataLoc.city;
	 //metric units are default units for this app
      w.units = "metric";
      //store some of the data in the variable to be send to the weather server with AJAX
      w.dataSendWeat = {
        lat: dataLoc.lat,
        lon: dataLoc.lon,
        units: w.units,
        lang: w.lang,
        appid: "2d065d4d45046e640c6a38edf52812ce"
      }
      callback(w);  //call getWeatherData as a callback function
    });
  }
} //end of getLocation object


//Autocomplete city name when typing in the input
$("#enterCity").autocomplete({
  source: function(request,response){
    //use user's languge for autocomplete
    var language = window.navigator.userLanguage || window.navigator.language;
    $.ajax({
      url: "http://api.geonames.org/search?",
      data: {
        maxRows: 3,
        lang : language,
        username: "dejvicek@gmail.com",
        name_startsWith: request.term,
        type: "json"
      },
      success:function(cityData){
        response($.map( cityData.geonames, function(item){
          return {
            label: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName,
            value: item.name
          }
        }));
      }
    });
  }
});

//Starting the whole process
locationAPI.getLocation(weatherInfo, function(w){
  weatherAPI.getWeatherData(w, updateToday);
})
//v argumentu nemuzu primo volat funkce protože ty by se hned zavolaly misto toho aby se zavolaly potom, co doběhne prislusny proces
// v poslednim pripade nemusim pouzivat anonymni funkci protoze argumenty pro updateToday jsou uz v callbacku u funkce getWeatherData

// "http://api.openweathermap.org/data/2.5/forecast?q=" + weatherInfo.city + "&mode=json" + "&units=" + weatherInfo.units + "&lang=" + weatherInfo.lang + "&appid=2d065d4d45046e640c6a38edf52812ce";
// "http://api.openweathermap.org/data/2.5/forecast?q=London,us&mode=json&appid=b1b15e88fa797225412429c1c50c122a"


// Get location of the user with geolocation
// function getLocation(){
//   if (navigator.geolocation){
//     navigator.geolocation.getCurrentPosition(showPosition);g
//   }
//   else{
//     alert("Geolocation is not available")
//   }
// }
//
// function showPosition(position){
//   latitude  = position.coords.latitude;
//   longitude = position.coords.longitude;
//   getWeather()
// }

// Testing URLs
  // var url = "http://api.openweathermap.org/data/2.5/weather?lat=50.132096399999995&lon=14.4872164&appid=44db6a862fba0b067b1930da0d769e98"
  // var url = "http://api.geonames.org/search?maxRows=10&style=LONG&lang=cs&username=demo&name_startsWith=Praha&type=json"