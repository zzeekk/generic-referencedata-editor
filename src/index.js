
// TODO: Popup für Commit message
// TODO: Fehleranzeige in statusbar popup (Toast)?
// TODO: Umstellen auf bitbucket-server
// TODO: packetize for release

// css
import '../node_modules/bootstrap3/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap3/dist/css/bootstrap-theme.min.css';
import '../node_modules/bootstrap-vertical-tabs/bootstrap.vertical-tabs.min.css';
import '../node_modules/angular-datatables/dist/css/angular-datatables.min.css';
import '../node_modules/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css';
import './index.css';

// scripts
import datatables from 'datatables.net';
import angular from 'angular';
import 'angular-sanitize';
import 'angular-route';
import 'angular-base64';
import 'angular-ui-bootstrap';
import 'angular-datatables';
import '../node_modules/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js';
//the following bug isn't yet fixed on master: https://github.com/json-schema-form/angular-schema-form/pull/672/commits/e78ecc890d329aa824ffc86cb894a1f7a4cec124
//we now use develop version with bootstrap extensions for collapsible fieldset/tabarray @ https://github.com/zzeekk/angular-schema-form-bootstrap.git#develop
//the file angular-schema-form-bootstrap-bundled.min.js as angular-schema-form bundled
import schemaForm from '../node_modules/angular-schema-form-bootstrap/dist/angular-schema-form-bootstrap-bundled.js';

// application modules
import './LoginCtrl.js';
import './RefEditCtrl.js';

var dt = datatables( window, $ ) // initialize datatables (must be done before angular-datatables)
var app = angular.module('refedit', ['schemaForm','base64','ngRoute','datatables','datatables.bootstrap','LoginCtrl','RefEditCtrl','ConnectionFactory']);

app.config(function($routeProvider) {
  $routeProvider
    .when("/refedit", {
        template : require("./refedit.html"),
        controller : "RefEditCtrl"
    })
    .otherwise({
        template : require("./login.html"),
        controller : "LoginCtrl"
    });
});
