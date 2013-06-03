angular.module('signage',[],[function(){


}])
.controller('SignageCtrl',['$log','$http','$scope','$timeout',function($log, $http, $scope,$timeout){
  $scope.message="Welcome to Northwest AHEC at Deacon Tower";

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
        $scope.signage.events.map(function(event){
          event.end = Date.parse(event.event_end_ts);
          event.start = Date.parse(event.event_start_ts);
          event.sessions.map(function(session){
            session.begin=Date.parse(session.session_begin_ts);
            session.end=Date.parse(session.session_end_ts);
          });
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

  $scope.loadEventData();
}])
.directive('signPage',['$parse','$log',function compileFn($parse,$log){
  return {
    restrict:'A',
    templateUrl:'signPage.tpl.html',
    transclude:true,
    scope:{
      signPageEvents:'='
    },
    link:function linkFn(scope,ele,atts){
      $log.info('linkFn');
    }//end link function
  };
}]);