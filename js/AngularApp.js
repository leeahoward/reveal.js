angular.module('signage',['WeatherClock'],[function(){


}])
.controller('SignageCtrl',['$log','$http','$scope','$timeout',function($log, $http, $scope,$timeout){
  $scope.message="Welcome to Northwest AHEC at Deacon Tower";
  $scope.data = {currentTime:new Date()};

  $scope.signage = {
    sharepoint:[],
    events:[]
  };




  $scope.loadEventData = function(){
    $log.info('loading Data');
    $http({
      url: '/rest/index.cfm/splist/new.json',
      method:'GET'
    }).
    success(function(data) {
      $log.info('done');
      $log.info(data);
      $scope.signage.sharepoint.length = 0;
      $scope.signage.events.length = 0;
      $scope.signage.sharepoint = data.DATA;
      //data.DATA = data.ALL;
      if(data.DATA.map){
        data.DATA.map(function(item){
          $log.info('mapping');
          var itemx = {type:'mapped'};
          itemx.event_name=item.session_name;
          itemx.event_start_ts=item.session_begin_ts;
          itemx.event_end_ts=item.session_end_ts;
          itemx.sessions = [{
            session_begin_ts:item.session_begin_ts,
            session_end_ts:item.session_end_ts,
            session_name:item.session_name,
            room:{
              name:item.room&&item.room.name?item.room.name:'No Room'
            }
          }];
          $scope.signage.events.push(itemx);
        });
      }

      if($scope.signage.events.map){
        $scope.signage.events = $scope.signage.events.map(function(event){
          event.end = Date.parse(event.event_end_ts);
          event.start = Date.parse(event.event_start_ts);
          event.sessions.map(function(session){
            session.begin=Date.parse(session.session_begin_ts);
            session.end=Date.parse(session.session_end_ts);
          });
          return event;
        }).filter(function(event){
          var d = new Date();
          $log.info(event);
          $log.info(d.getTime());
          if(event.end>d.getTime() && event.start<d.getTime()){
            return true;
          }
          return false;
        });
      }

      /*if($scope.signage.events.sort){
        $scope.signage.events.sort(nwahec.sortBySessionStart);
        //nwahec.log(nwahec.model.signage.events);
      }*/
      $timeout(function(){
        $scope.loadEventData();
      },1000*60*30);//success reload every 30 minutes
      //},1000*10);//success reload every 30 minutes
    })
    .error(function(){
      $log.info('error!');
      $timeout(function(){
        $scope.loadEventData();
      },1000*60);// error retry in 1 minute
    });//end success
  }  

  $scope.loadWeatherData = function(){

    $log.info('loading Data');
    return $http({
      url: '/moodle/jdigiclock/lib/proxy/php/proxy.php?location=NAM|US|NC|WINSTON-SALEM&metric=0',
      method:'GET'
    })
    .success(
      function(response){
        $log.info(response);
      }
    ).error(
      function(){

      }
    );
  }

  $scope.loadEventData();
  //$scope.loadWeatherData();

  /*
  function updateTime(){
    $timeout(function(){
      $scope.data.currentTime = new Date();
      updateTime();
    },60000);
  }
  updateTime();
  */
}])
.directive('signPage',['$parse','$log',function compileFn($parse,$log){
  return {
    restrict:'A',
    templateUrl:'partials/signPage.tpl.html',
    transclude:true,
    scope:{
      signPageEvents:'='
    },
    link:function linkFn(scope,ele,atts){
      $log.info('linkFn');
    }//end link function
  };
}]).filter('classroomImage', ['$log',function($log) {
  return function(val){
    var tmp = val.replace(/\s+/g,'') + '.jpg'; 
    $log.info(tmp);
    return tmp;
  }
}]);
