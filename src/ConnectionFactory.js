import './BitbucketCloudService.js';

var module = angular.module('ConnectionFactory', ['BitbucketCloudService']);

module.factory('ConnectionFactory', function($base64,$http,$q,BitbucketCloudService) {
    var prConfig = null; // Promise

    var providerList = { "bitbucketCloud": BitbucketCloudService, "bitbucketServer": "..." };
    function getProvider() {
      return providerList[sessionStorage.provider];
    };

    return {
      listProviders: function() { return providerList; },
      setParams: function(p_provider,p_user,p_repo,p_dataPath,p_password) {
        // save to session
        if (!providerList[p_provider]) console.error( "Provider " + p_provider + " unbekannt");
        sessionStorage.provider = p_provider;
        sessionStorage.user = p_user;
        sessionStorage.repo = p_repo;
        sessionStorage.dataPath = p_dataPath;
        if (!p_dataPath.match(/\.json+$/)) console.error( "Data path muss Extension .json haben.");
        sessionStorage.configPath = p_dataPath.replace(/\.json+$/, ".config.json"); // replace extension .json -> .config.json
        sessionStorage.authVal = "Basic " + $base64.encode( p_user + ":" + p_password );
      },
      loadConfig: function() {
        // buffer the promise as it is used multiple times...
        return this.prConfig || (this.prConfig = getProvider().loadJSONData( sessionStorage.configPath, sessionStorage ));
      },
      loadData: function() { return getProvider().loadJSONData( sessionStorage.dataPath, sessionStorage ); },
      saveData: function(data, msg) { return getProvider().saveJSONData( sessionStorage.dataPath, data, msg, sessionStorage ); },
      logout: function() { sessionStorage.removeItem("authVal"); },
      getProvider: function() { return sessionStorage.provider; },
      getUser: function() { return sessionStorage.user; },
      getRepo: function() { return sessionStorage.repo; },
      getDataPath: function() { return sessionStorage.dataPath; }
    }
});
