var module = angular.module('BitbucketServerService', []);

module.service('BitbucketServerService', function($http,$q) {
	
	// commitId must be buffered between load/save data to detect concurrent modifications
	var sourceCommitIds = {};
	
    // bitbucket server, according to https://docs.atlassian.com/bitbucket-server/rest/5.8.0/bitbucket-rest.html
    // must use proxy because of CORS
	var baseUrl = "/bitbucketServerProxy/rest/api/1.0"
	
	function getApiRepoUrl(connectionParams) {
		// if project isn't specified, user name is taken as project
		var project = connectionParams.project || connectionParams.user;
		return baseUrl + "/projects/"+project+"/repos/"+connectionParams.repo;
	}
	
	function getCommitIdPromise(path,connectionParams) {
      console.log("getCommitIdPromise: "+path);
      return $http({
          method: 'GET',
          url: getApiRepoUrl(connectionParams)+"/commits?path="+path+"&until="+connectionParams.branch+"&limit=1",
          headers: { "Content-Type": "application/json", "Authorization": connectionParams.authVal }
      })
	  .then( function(response) {
		var lastCommitId = (response.data.values.size>0 ? response.data.values[0].id : null);
		return lastCommitId;
	  })		  
	}

	function getRawFilePromise(path,connectionParams) {
      console.log("getRawFilePromise: "+path);
      return $http({
          method: 'GET',
          url: getApiRepoUrl(connectionParams)+"/raw/"+path+"?at="+connectionParams.branch,
          headers: { "Content-Type": "application/json", "Authorization": connectionParams.authVal }
      });
	}
		
    this.loadJSONData = function(path,connectionParams) {
      if(!connectionParams.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");
      }
	  // get commitId first, then data
	  return getCommitIdPromise( path, connectionParams )
	  .then( function(commitId) {
		sourceCommitIds[path] = commitId;  
		return getRawFilePromise( path, connectionParams );
	  })		  
      .then( function(response) {
        console.log("loadJSONData then: "+path);
        if( angular.isObject(response.data)) return response.data;
        else return JSON.parse(response.data);
      })
      .catch( function(response) {  
        console.error("loadJSONData catch: "+path, response);
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+JSON.stringify(response.data)+")" : ""));
      });
    };

    this.saveJSONData = function(path,data,msg,connectionParams) {
      if(!connectionParams.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");
      }
      // prepare multipart form data
      var formData = new FormData();
      formData.append("content", JSON.stringify(data,undefined,2));
      formData.append("message", msg);
      formData.append("branch", connectionParams.branch);
	  formData.append("sourceCommitId", sourceCommitIds[path] );
      return $http( {
        method: "PUT",
        url: getApiRepoUrl(connectionParams)+"/browse/"+path,
        headers: { "Content-Type": undefined, "Authorization": connectionParams.authVal },
		data: formData })
      .then( function(response) {
		// update commitId for next commit
		sourceCommitIds[path] = response.data.id; 
		return response;
      })	
      .catch( function(response) {
        console.error("saveJSONData catch: "+path, response);
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+JSON.stringify(response.data)+")" : ""));
      });
    };

});
