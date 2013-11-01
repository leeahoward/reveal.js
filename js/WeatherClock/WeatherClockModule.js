'use strict'
angular.module('WeatherClock',[])
.controller('WeatherClock',['$parse','$log',function($parse,$log){

}])
.directive('weatherClock',['$timeout','$parse','$log','$http','$filter',function compileFn( $timeout, $parse, $log, $http, $filter ){
  return {
    restrict:'A',
    templateUrl:'js/weatherclock/clock.tpl.html',
    transclude:true,
    scope:{
      weatherUrl:'@'
    },
    controller:function controllerFn($scope){
      function getTimeAsString(){
        return $filter('date')((new Date()),'hhmma').split('');
      }
      $scope.loadingWeather=true;
      $scope.weather={};
      $scope.time=getTimeAsString();
      $scope.currentDate=new Date();
      function loadWeatherData(){
        $scope.time=getTimeAsString();
        return $http({
          url:$scope.weatherUrl,
          method:'get'
        }).success(
          function(result){
            $log.info(result);
            angular.extend($scope.weather,result);
            $scope.loadingWeather=false;
          }
        );
      } 
      //loadWeatherData();
      function loadTimer(){
        loadWeatherData().then(
          function(){
            $log.info('weather data loaded!');
            $timeout(loadTimer,60000);
          },
          function(){
            $log.info('weather failed to load.  Trying again');
            $timeout(loadTimer,1000);
          }
        );
      }
      loadTimer();
    },
    link:function linkFn(scope,ele,atts){
      $log.info('linkFn');
    }//end link function
  };
}]);