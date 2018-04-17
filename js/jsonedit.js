
// TODO: Popup für Commit message
// TODO: Fehleranzeige in statusbar popup (Toast)?
// TODO: Umstellen auf bitbucket-server
// TODO: packetize for release

var app = angular.module('jsonedit', ['schemaForm','base64','ngRoute','datatables','datatables.bootstrap']);

function getSearchParam( param ) {
  var res = window.location.search.match( '(\\?|&)' + param + '=([^&]*)');
  if (res) return res[2];
  else return "";
}

app.config(function($routeProvider) {
  $routeProvider
    .when("/jsonedit", {
        templateUrl : "template/jsonedit.html",
        controller : "AppCtrl"
    })
    .otherwise({
        templateUrl : "template/login.html",
        controller : "LoginCtrl"
    });
});

app.factory('connection', function($base64,$http,$q) {
    var prConfig = null;

    loadJSONData = function(path) {
      if(!sessionStorage.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");;
      }
      return $http({
          method: 'GET',
          // bitbucket server
          // url: "https://api.bitbucket.org/1.0/projects",
          // bitbucket cloud
          url: "https://api.bitbucket.org/2.0/repositories/" + sessionStorage.user + "/" + sessionStorage.repo + "/src/master/" + path,
          headers: { "Content-Type": "application/json", "Authorization": sessionStorage.authVal }
      })
      .catch( function(response) {
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+response.data+")" : ""));
      })
      .then( function(response) {
        if( angular.isObject(response.data)) return response.data;
        else return JSON.parse(response.data);
      });
    };

    saveJSONData = function(path,data,msg) {
      if(!sessionStorage.authVal) {
        return $q.reject( "Connection Parameter sind nicht gesetzt.");;
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
        url: "https://api.bitbucket.org/2.0/repositories/" + sessionStorage.user + "/" + sessionStorage.repo + "/src",
        data: postData,
        headers: { "Content-Type": undefined, "Authorization": sessionStorage.authVal }})
      .catch( function(response) {
        return $q.reject( "Http error " + response.status + (response.data!=""? " ("+response.data+")" : ""));
      });
    };

    var connectionService = {};
    connectionService.setParams = function(p_user,p_repo,p_dataPath,p_password) {
      // save to session
      sessionStorage.user = p_user;
      sessionStorage.repo = p_repo;
      sessionStorage.dataPath = p_dataPath;
      if (!p_dataPath.match(/\.json+$/)) console.error( "Data path muss Extension .json haben.");
      sessionStorage.configPath = p_dataPath.replace(/\.json+$/, ".config.json"); // replace extension .json -> .config.json
      sessionStorage.authVal = "Basic " + $base64.encode( p_user + ":" + p_password );
    }
    connectionService.loadConfig = function() {
      // buffer the promise as it is used multiple times...
      return prConfig || (prConfig = loadJSONData( sessionStorage.configPath ));
    };
    connectionService.loadData = function() { return loadJSONData( sessionStorage.dataPath ); };
    connectionService.saveData = function(data, msg) { return saveJSONData( sessionStorage.dataPath, data, msg ); };
    connectionService.logout = function() { sessionStorage.removeItem("authVal"); }
    connectionService.getUser = function() { return sessionStorage.user; }
    connectionService.getRepo = function() { return sessionStorage.repo; }
    connectionService.getDataPath = function() { return sessionStorage.dataPath; }

    return connectionService;
});

app.controller('LoginCtrl', function($scope, $location, connection) {
  $scope.user = getSearchParam("user") || connection.getUser();
  $scope.repo = getSearchParam("repo") || connection.getRepo();
  $scope.path = getSearchParam("path") || connection.getDataPath();
  $scope.formSubmit = function() {
    // get config
    connection.setParams( $scope.user, $scope.repo, $scope.path, $scope.password );
    connection.loadConfig()
    .then( function(config) { $location.path("/jsonedit"); })
    .catch( function(error) { $scope.error = error; });
  };
});

app.controller('AppCtrl', function($scope, $timeout, $location, connection, DTOptionsBuilder, DTColumnBuilder) {
  // init vars
  $scope.angular = angular;
  $scope.config = {};
  $scope.dataDirty = false;
  $scope.selectedRow = null;
  $scope.selectedObj = {};
  $scope.editObj = {};
  $scope.editObjDirty = false;
  $scope.formDef = [ "*", {type: "submit", title: "Save"}];
  $scope.formSchema = {};
  $scope.formStyle = {};
  $scope.toggles = {};

  $scope.toggle = function( v ) {
    console.log( "toggling "+v );
    $scope.toggles[v] = !$scope.toggles[v] || false;
  }

  $scope.getTabName = function(value, field, index) {
    console.log(value,field,index);
    if(value[field].lenght>0) return value[field];
    else return 'Tab ' + index;
  }

  // init table
  $scope.tableOptions = DTOptionsBuilder
    .fromFnPromise( connection.loadData())
    .withBootstrap()
    .withPaginationType('numbers')
    .withOption('scrollX', '100%')
    .withOption('rowCallback', rowCallback);
  // table selection change handler
  function rowCallback(row, obj) {
    // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
    $('td', row).unbind('click');
    $('td', row).bind('click', function() {
      $scope.$apply(function() {
        if($scope.selectedRow) $($scope.selectedRow).removeClass('success');
        if($scope.selectedRow==row) {
          $scope.selectedRow = null;
          $scope.selectedObj = {};
          $scope.editObj = {};
          // table header is not resized correctly when size is changed because of form showing
          $timeout( adjustTableSize, 10);
        } else {
          $(row).addClass('success');
          $scope.selectedRow = row;
          $scope.selectedObj = obj;
          // make a copy of data element for form
          $scope.editObj = angular.copy( $scope.selectedObj,  );
          // table header is not resized correctly when size is changed because of form showing
          $timeout( adjustTableSize, 10);
        }
      });
    });
    return row;
  };
  function adjustTableSize() { $scope.tableInstance.DataTable.columns.adjust().draw(); };
  // set table cols from config promise
  $scope.tableCols = connection.loadConfig().then( function(config) {
    return config.tableCols.map( function(v) { return DTColumnBuilder.newColumn(v).withTitle(v); });
  });
  $scope.tableInstance = {};

  // init form
  // recursive functions to map schema fields to form definition
  function extractFormDef( schema, prefix ) {
    var fields = Object.entries(schema);
    var i = 0;
    var formDef = fields.map( function(field) {
      i++;
      var fieldName = field[0];
      var fieldDef = field[1];
      if (fieldDef.type == "array") {
        if (fieldDef.items.type == "object") {
          var children = extractFormDef(fieldDef.items.properties, prefix + fieldName + "[].");
          var firstChildName = children[0]["key"].split(".").slice(-1)[0];
          return { key: prefix + fieldName, type: "tabarray", remove: "entfernen"
                 // Inhalt vom ersten Feld als Tabname setzen, wenn definiert
                 , title: "{{ (value."+firstChildName+" == null || value."+firstChildName+" === '' ? 'Tab '+$index : value."+firstChildName+" )}}"
                 , items: children, collapsed: fieldDef.collapsed || true
                 , htmlClass: "has-success" /*make sure label is always green, there is some special case on top-level which i dont unterstand*/ };
        } else {
          alert("array items.type must be object!");
        }
      } else if (fieldDef.type == "object") {
        var children = extractFormDef(fieldDef.properties, prefix + fieldName + ".");
        return { key: prefix + fieldName, type: "fieldset"
               , title: fieldName, items: children, collapsed: fieldDef.collapsed || true
               , htmlClass: "has-success" /*make sure label is always green, there is some special case on top-level which i dont unterstand*/ };
      } else {
        return { key: prefix + fieldName };
      }
    });
    return formDef;
  }

  // load config from promise
  $scope.config = connection.loadConfig().then( function(config) {
    console.log("Form configuration", config);
    // set form config
    if (config.height) $scope.formStyle['min-height'] = config.height;
    $scope.formSchema = config.schema;
    // extract form definition from schema
    var formDefAuto = extractFormDef( config.schema.properties, "" );
    console.log( "Form definition", formDefAuto );
    $scope.formDef = formDefAuto
    return config;
  });
  // watch if form is dirty
  $scope.$watch( "editObj", function () {
    $scope.editObjDirty = !angular.equals($scope.selectedObj,$scope.editObj);
  }, true);
  // decorator for schema form.
  $scope.decorator = 'bootstrap-decorator';

  // update edited data element
  $scope.updateObj = function(form) {
    // First we broadcast an event so all fields validate themselves
    $scope.$broadcast('schemaFormValidate');
    // Then we check if the form is valid
    //console.log(JSON.stringify($scope.editObj,undefined,2));
    if (form.$valid) {
      // update data-array and table
      $scope.selectedObj = angular.copy( $scope.editObj ); // this updates the corresponding entry in data array.
      $scope.tableInstance.DataTable.row($scope.selectedRow).data($scope.selectedObj).draw();
      $scope.dataDirty = true;
      $scope.editObjDirty = false;
    } else {
      alert( "Validierung der Formularinhalte ist fehlgeschlagen. Bitte die Eingaben überprüfen.");
    }
  };

  // save data array back to storage
  $scope.save = function() {
    if ($scope.formDirty) {
      alert( "Formulardaten sind noch nicht übernommen!");
    } else {
      connection.saveData($scope.tableInstance.DataTable.data().toArray(), "testing")
      .then(function(data) {
        console.log("saved to storage");
        $scope.dataDirty = false;
      })
      .catch(function(error) {
        alert("Failed to save to storage: " + error);
      });
    };
  };

  // get back to login page
  $scope.logout = function() {
    connection.logout();
    $location.path("/");
  };

  console.log("initialized");

});
