var module = angular.module('CommitDialogCtrl', ['ui.bootstrap']);

module.controller('CommitDialogCtrl',function($scope,$uibModalInstance){
  $scope.msg = '';

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');  
  };
  
  $scope.save = function(){
    $uibModalInstance.close($scope.msg);
  };
  
  $scope.hitEnter = function(evt){
    if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.name,null) || angular.equals($scope.name,''))) {
	  $scope.save();
	};
  };
});