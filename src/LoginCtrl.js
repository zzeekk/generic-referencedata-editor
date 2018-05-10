import './ConnectionFactory.js';

var module = angular.module('LoginCtrl', ['ConnectionFactory']);

module.controller('LoginCtrl', function($scope, $location, ConnectionFactory) {

  function getSearchParam( param ) {
    var res = window.location.search.match( '(\\?|&)' + param + '=([^&]*)');
    if (res) return res[2];
    else return "";
  }

  $scope.providerList = ConnectionFactory.listProviders();
  $scope.provider = getSearchParam("provider") || ConnectionFactory.getProvider() || Object.keys($scope.providerList)[0];
  $scope.user = getSearchParam("user") || ConnectionFactory.getUser();
  $scope.project = getSearchParam("project") || ConnectionFactory.getProject();
  $scope.repo = getSearchParam("repo") || ConnectionFactory.getRepo();
  $scope.branch = getSearchParam("branch") || ConnectionFactory.getBranch();
  $scope.path = getSearchParam("path") || ConnectionFactory.getDataPath();
  $scope.formSubmit = function() {
    // get config
    ConnectionFactory.setParams( $scope.provider, $scope.user, $scope.project, $scope.repo, $scope.branch, $scope.path, $scope.password );
    ConnectionFactory.loadConfig()
    .then( function(config) { $location.path("/refedit"); })
    .catch( function(error) { $scope.error = error; });
  };
});
