import './ConnectionFactory.js';
import './CommitDialogCtrl.js';

var module = angular.module('RefEditCtrl', ['ConnectionFactory','ui.bootstrap','CommitDialogCtrl']);

module.controller('RefEditCtrl', function($scope, $timeout, $location, $uibModal, ConnectionFactory, DTOptionsBuilder, DTColumnBuilder) {

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
	$scope.tableName = "Referenzdaten"; // default name can be overriden by config.tableName
	$scope.formName = "Editieren"; // default name can be overriden by config.formName

  // check connection  
  if (!ConnectionFactory.isLoggedIn()) {
		console.log("connection missing, redirecting to login!");
		$location.path("/");
		return;
	}
	
	// init form functions
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
		.fromFnPromise( ConnectionFactory.loadData())
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
	// set table cols and title from config promise
	$scope.tableCols = ConnectionFactory.loadConfig().then( function(config) {
		if (config.tableName) $scope.tableName = config.tableName;
		return config.tableCols.map( function(v) { return DTColumnBuilder.newColumn(v).withTitle(v).withOption('defaultContent', '')});
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
	$scope.config = ConnectionFactory.loadConfig().then( function(config) {
		console.log("Form configuration", config);
		// set form config
		if (config.height) $scope.formStyle['min-height'] = config.height;
		if (config.formName) $scope.formName = config.formName;
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
		// show dialog for commit msg
		var dlg = $uibModal.open({ animation: false, backdrop: 'static', template: require('./CommitDialogCtrl.html'), controller: 'CommitDialogCtrl'})
		dlg.result.then(function(msg){
				ConnectionFactory.saveData($scope.tableInstance.DataTable.data().toArray(), msg)
				.then(function(data) {
					console.log("saved to storage");
					$scope.dataDirty = false;
				})
				.catch(function(error) {
					alert("Failed to save to storage: " + error);
				});
			});
		};
	};

	// get back to login page
	$scope.logout = function() {
		ConnectionFactory.logout();
		$location.path("/");
	};

	console.log("initialized");
});