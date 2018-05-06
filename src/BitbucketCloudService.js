var module = angular.module('BitbucketCloudService', []);

module.service('BitbucketCloudService', function($http,$q) {

    this.loadJSONData = function(path,connectionParams) {
      if(!connectionParams.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");;
      }
      return $http({
          method: 'GET',
          // bitbucket server
          // url: "https://api.bitbucket.org/1.0/projects",
          // bitbucket cloud
          url: "https://api.bitbucket.org/2.0/repositories/" + connectionParams.user + "/" + connectionParams.repo + "/src/master/" + path,
          headers: { "Content-Type": "application/json", "Authorization": connectionParams.authVal }
      })
      .catch( function(response) {
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+response.data+")" : ""));
      })
      .then( function(response) {
        if( angular.isObject(response.data)) return response.data;
        else return JSON.parse(response.data);
      });
    };

    this.saveJSONData = function(path,data,msg,connectionParams) {
      if(!connectionParams.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");
      }
      // prepare http data
      var postData = new FormData();
      postData.append(path, JSON.stringify(data,undefined,2));
      postData.append("message", msg);
      postData.append("branch", "master");
      return $http( {
        method: "POST",
        // bitbucket server
        // url: "https://api.bitbucket.org/1.0/projects",
        // bitbucket cloud
        url: "https://api.bitbucket.org/2.0/repositories/" + connectionParams.user + "/" + connectionParams.repo + "/src",
        data: postData,
        headers: { "Content-Type": undefined, "Authorization": connectionParams.authVal }})
      .catch( function(response) {
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+response.data+")" : ""));
      });
    };

});
