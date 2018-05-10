var module = angular.module('BitbucketCloudService', []);

module.service('BitbucketCloudService', function($http,$q) {

    // bitbucket cloud
	var baseUrl = "https://api.bitbucket.org/2.0";

	function getApiRepoUrl(connectionParams) {
		// if project isn't specified, user name is taken as project
		var project = connectionParams.project || connectionParams.user;
		return baseUrl + "/repositories/" + project + "/" + connectionParams.repo;
	}	
	
    this.loadJSONData = function(path,connectionParams) {
      if(!connectionParams.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");;
      }
      return $http({
          method: 'GET',
          url: getApiRepoUrl(connectionParams)+"/src/"+connectionParams.branch+"/"+path,
          headers: { "Content-Type": "application/json", "Authorization": connectionParams.authVal }
      })
      .catch( function(response) {
        console.error("loadJSONData catch: "+path, response);
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
      postData.append("branch", connectionParams.branch);
      return $http( {
        method: "POST",
        url: getApiRepoUrl(connectionParams)+"/src",
        data: postData,
        headers: { "Content-Type": undefined, "Authorization": connectionParams.authVal }})
      .catch( function(response) {
        console.error("saveJSONData catch: "+path, response);
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+response.data+")" : ""));
      });
    };

});
