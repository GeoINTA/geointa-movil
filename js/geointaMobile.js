angular.module('geointaApp', [
  "ngRoute",
  "ngTouch",
  "mobile-angular-ui",
  "geointa.controllers",
  'geointa.factories',
  'openlayersdirective',
]).config(['$routeProvider', function ($routeProvider) {
   $routeProvider.when('/ubication/:idUbication',{templateUrl: "./templates/detallesUbicaciones.html",controller: 'DetalleUbicacionesCtrl'});
   $routeProvider.when('/home/:lat?/:lng?/:zoom?',          {templateUrl: "./templates/home.html"});
   $routeProvider.when('/newubication',          {templateUrl: "./templates/newubication.html"});
   $routeProvider.when('/configuration',          {templateUrl: "./templates/configuration.html"});
   $routeProvider.otherwise({redirectTo: '/home'});
   
}]);

