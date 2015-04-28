

var getInfoPosActualError = ["ERROR","No ha definido su posición actual. Para hacerlo, haga click sobre un punto del mapa o sobre el icono de geolocalización de la barra inferior del sitio."];
var middlewareNoRouteError = ["ERROR","No ha sido posible comunicarse con el servidor GeoINTA. Por favor, intente nuevamente mas tarde"];
var requestingGeolocation = ["Geolocalización","Pidiendo ubicación del usuario"];
var requestingGeolocationError = ["Error de geolocalización","No se ha podido pedir la ubicación del usuario. Chequee que ha proporcionado el permiso para utilizar esta opción"];
var requestingCurrentUbicationInfo = ["Pidiendo información de la posición actual","Por favor, espere hasta que se complete la operación"];
var requestGeolocationServerError = ["ERROR","No se ha podido pedir información acerca de la ubicación actual"];
var geolocationNotSupported = ["ERROR","El navegador no soporta la geolocalización"];
var exportBrowserError = ["ERROR","El navegador actual no soporta la operación de exportación de datos"];
var exportDataEmpty = ["ERROR","No existen datos para exportar"];
var middlewareGenericError = ["ERROR","Ha ocurrido un error en el servidor"];
var infoMiddlewareTimeout = ["ERROR","Los servidores no están disponibles en este momento, por favor, intente nuevamente mas tarde"];
var infoMiddlewareBadRequest = ["ERROR","Ha ocurrido un error mientras se pedían los datos"];
var infoMiddlewareNoData = ["NO HAY DATOS","Lo sentimos, no hay información disponible para la ubicación seleccionada"]


var HOME_PATH = "/home";

var defaultMapCenter = [-6673603.47305675,-4154372.4878888335];
var defaultMapZoom = 4;

/*var extraUbication = {
             "coords":[-8059626.28615,-3854142.48339],
             "info": {
                    "Información Global":[
                        {"data":"Altura" ,"value":30},
                        {"data":"Lluvia" ,"value":50},
                        {"data":"Altura" ,"value":30},
                        {"data":"Lluvia" ,"value":50},
                    ],
                    "Información Regional":[
                        {"data":"Provincia" ,"value":"Buenos Aires"},
                        {"data":"Region" ,"value":"Region I"}
                    ],
                    "Información Local":[
                        {"data":"Poblacion" ,"value":30000},
                        {"data":"Densidad" ,"value":3.5}
                    ],
                },
            }*/


angular.module('geointa.controllers', [])
    .controller('IndexController', ['$scope', '$rootScope','$routeParams', function ($scope, $rootScope,$routeParams) {
          $rootScope.showWelcomeOverlay = true;
     }]) 
    .controller('MainController', ['$scope', '$rootScope','$routeParams', '$window', '$location','Ubication','GeoINTAMap', function ($scope, $rootScope,$routeParams, $window, $location,Ubication,GeoINTAMap) {
        $rootScope.ubications = Ubication.query();
        $rootScope.mapConfiguration = GeoINTAMap.getConfiguration();
        $rootScope.sidebarScope = null;

        // ----- FUNCIONES GLOBALES   -------  //
        $rootScope.go = function(path){
              $location.url(path);
        }

        $rootScope.updateMapConfiguration = function(){
          $rootScope.map.updateMapConfiguration($rootScope.mapConfiguration);
          $rootScope.go(HOME_PATH);
        }


      $rootScope.getSidebarRight = function(){
        return './templates/sidebarRight.html';
      }

      // Metodo invocado al cambiar la configuracion de las capas del mapa (seccion configuration)
      // Se debe tener en cuenta que las capas bases son excluyentes,
      // por lo tanto, en todo momento debe existir solo una capa base activa.
      $rootScope.layerConfigurationChange = function(layerChangedName,isBaseLayer){
        if (isBaseLayer){
          var layerChangedState = $scope.mapConfiguration.layers[layerChangedName].visible;
          if (layerChangedState){ // Se acaba de activar una capa
              $.each($scope.mapConfiguration.layers, function(layerName, value) {
                  if (layerName != layerChangedName){
                      $scope.mapConfiguration.layers[layerName].visible = false;
                  }
              }); 
          } else { // Se desactivo la capa que estaba activa, activo otra
              var count = 0;
              $.each($scope.mapConfiguration.layers, function(layerName, value) {
                  // Activo la primer capa que encuentro
                  if (layerName != layerChangedName){
                    count += 1;
                    $scope.mapConfiguration.layers[layerName].visible = true;
                    return false;
                  }
              });
              if (count == 0){ // Si existe una unica capa, no dejo que se desactive
                  $scope.mapConfiguration.layers[layerChangedName].visible = true
              }
          }
        }
      }


      $rootScope.persistNewUbication = function(){
            $rootScope.newUbication.coords = ol.proj.transform($rootScope.newUbication.coords, 'EPSG:4326', 'EPSG:900913'); // al cliente se las mostre en 4326, pero las guardo en 900913
            Ubication.persistNewUbication($rootScope.newUbication);
            $rootScope.map.removeCurrentPosMarker();
            $scope.ubications = Ubication.query();
            delete $rootScope.newUbication.name;
            delete $rootScope.newUbication.description;
            $rootScope.go(HOME_PATH);
       }

       $rootScope.deleteUbication = function(id){
          Ubication.deleteUbication(id);
          $rootScope.go(HOME_PATH);
       }

       // Centra el mapa en las coordenadas pasadas como parámetro 
       // Coords deben estar en 900913
       $rootScope.updateMapCenter = function(coords,zoom){
          zoom = zoom || 4;
          if ($location.path() != HOME_PATH){
             var publicCoords = ol.proj.transform(coords, 'EPSG:900913', 'EPSG:4326');
             $rootScope.go(HOME_PATH + "/" + publicCoords[0] + "/" + publicCoords[1] + "/" + zoom);
          } else {
            $rootScope.map.centerTo(newCoords);
          }
       }





        $rootScope.updateOverlayInfo = function(data,showOverlay,showButtons){
           $rootScope.overlayTitle = data[0];
           $rootScope.overlayMessage = data[1];
           if (showOverlay){
              $scope.showOverlayButton = true;
              $rootScope.showOverlay('on',showButtons);
           }
        }


        $rootScope.showOverlay = function(status,showButtons){
            $rootScope.toggle('generalOverlay', status);
        }

        $rootScope.getCurrentLocation = function(callback,errorCallback){
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callback,errorCallback);
          } else {
              $rootScope.updateOverlayInfo(geolocationNotSupported,true,true);
          }
        }


        $rootScope.testing = function(){
          console.log("HOLA");
        }


        $rootScope.callScope = function(sidebarScope){
          $rootScope.sidebarScope = {"scope": sidebarScope};
          
        }

        $rootScope.receiveUbicationInfo = function(coords,data){
          if (data){ // Se recibio un JSON con informacion de una ubicacion
            console.log(data);
            data.timestamp = $rootScope.getTimestamp();
            $rootScope.newUbication = data;
            $rootScope.newUbication.coords = ol.proj.transform(coords, 'EPSG:900913', 'EPSG:4326');
            $rootScope.newUbication.id = Ubication.getNextID();
            $rootScope.newUbication.extent = $rootScope.map.getMapExtent();
            $rootScope.newUbication.mapSize = $rootScope.map.map.getSize();
            $rootScope.newUbication.xy = GeoINTAMap.getConfiguration().currentXY;
            //$rootScope.newUbication.id = Ubication.getNextID();
            $rootScope.showOverlay('off');
            $rootScope.go('/newubication');
            //Ubication.addNewUbication(extraUbication);
          } else {
            $rootScope.updateOverlayInfo(requestGeolocationServerError,true,true);
          }
        } 
        
        $rootScope.getTimestamp = function(){
          var now     = new Date(); 
          var year    = now.getFullYear();
          var month   = now.getMonth()+1; 
          var day     = now.getDate();
          var hour    = now.getHours();
          var minute  = now.getMinutes();
          var second  = now.getSeconds(); 
          if(month.toString().length == 1) {
              var month = '0'+month;
          }
          if(day.toString().length == 1) {
              var day = '0'+day;
          }   
          if(hour.toString().length == 1) {
              var hour = '0'+hour;
          }
          if(minute.toString().length == 1) {
              var minute = '0'+minute;
          }
          if(second.toString().length == 1) {
              var second = '0'+second;
          }   
          var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
           return dateTime;
        }

        $rootScope.getCurrentPositionInfo = function(){
            var coords;
            if (coords = $rootScope.map.getCurrentPosCoords()){
                params = $scope.getMapExtentParams(coords,$rootScope.map.getMapExtent(),GeoINTAMap.getConfiguration().currentXY,$rootScope.map.map.getSize());
                $rootScope.updateOverlayInfo(requestingCurrentUbicationInfo,true);
                Ubication.requestCoordsInfo(params,function(response){
				if (response){ // Se recibio respuesta
					if (response.code == 200){
					  $rootScope.receiveUbicationInfo(coords,response); // coordenadas en 900913
					} else {
					  $rootScope.showMiddlewareResponseError(response);
					}
				} else { // No se alcanzo al middleware o hubo un error
                    $rootScope.updateOverlayInfo(middlewareNoRouteError,true,true);
                }
              });
            } else {
              $rootScope.updateOverlayInfo(getInfoPosActualError,true,true);
            }
        }

        // Metodo que se encarga de mostrar al usuario un overlay luego de recibir
        // desde el middleware una respuesta con codigo distinto al 200
        // response debe tener al menos un codigo de error {code} y un mensaje
        //{info}
        $rootScope.showMiddlewareResponseError = function(response){
            switch(response.code){
                case 500: // Error genérico
                           $rootScope.updateOverlayInfo(infoMiddlewareGenericError,true,true);
                           break;
                case 504: // TIMEOUT_ERROR . Los servidores no han respondido
                           $rootScope.updateOverlayInfo(infoMiddlewareTimeout,true,true);
                           break;
			         case 501: // NO_DATA . Los servidores no retornaron informacion para esa ubicacion
          						   $rootScope.updateOverlayInfo(infoMiddlewareNoData,true,true);
          						   break;
                case 400: // BAD_REQUEST_CODE. El cliente realizo una mala peticion (faltan parametros)
                           $rootScope.updateOverlayInfo(infoMiddlewareBadRequest,true,true);
                           break;                           
            }
        }

        $rootScope.requestUserGeolocation = function() {
          $rootScope.updateOverlayInfo(requestingGeolocation,true);
          $rootScope.getCurrentLocation(function(position){		  
            var newCoords = ol.proj.transform([position.coords.longitude,position.coords.latitude], 'EPSG:4326', 'EPSG:900913');
            var mapSize = $rootScope.map.map.getSize();
            var xy = [mapSize[0]/2,mapSize[1]/2];
            $rootScope.map.updateCurrentPosMarker(newCoords,xy);
            $rootScope.map.centerTo(newCoords);
            $rootScope.showOverlay('off');
          },function(){ // Callback error
              $rootScope.showOverlay('off');
              $rootScope.updateOverlayInfo(["1","2"],false);

          });
        }

      $rootScope.getMapBaseLayersGroup = function() {
          var response;
          $rootScope.map.map.getLayers().forEach(function(layer,i){
              if (layer instanceof ol.layer.Group){
                  response = layer;
                  // HACER BREAK ACA!. No puedo hacer break dentro de forEach de angular
              }
          })
          return response;
        }

        // Se supone que todas las capas base forman parte de un grupo,
        // Todas las otras capas no forman parte de un grupo
        $rootScope.getMapBaseLayers = function() {
            return $rootScope.mapConfiguration.layers;
        }

        $rootScope.getMapInfoLayers = function(){
          return $rootScope.mapConfiguration.infoLayers;
        }


        // Recibe un extent [minx,miny,maxx,maxy] y lo convierte en un bbox
        // en formato "minx,miny,maxx,maxy" (String)
        $rootScope.extentToBBOX = function(extent){
          return extent.join();
        }

        // Metodo que recibe un extent, y retorna un objeto (clave->valor),
        // con todas las propiedades que son necesarios para hacer una peticion
        // GetFeatureInfo a un servidor WMS
        $scope.getMapExtentParams = function(coords,extent,xy,mapSize){
          var params = {};
          var coords = ol.proj.transform(coords, 'EPSG:900913', 'EPSG:4326');
	  
          params.lng = coords[0];
          params.lat = coords[1];
          params.bbox = $rootScope.extentToBBOX(extent);
          params.width = mapSize[0];
          params.height = mapSize[1];
          params.x = Math.round(xy[0]);
          params.y = Math.round(xy[1]);
          return params;
        }



      ////////////// EXPORT DATA ////////////////////////7

       // Metodo que genera un objeto en formato GeoJSON, e inicia accion
       // para ser descargado por el cliente 
       $rootScope.exportUbicationsData = function(){
          try {
              var isFileSaverSupported = !!new Blob; // ¿El navegador puede exportar?
              var ubications = Ubication.query();
              if (ubications && ubications.length > 0){
                var data = $rootScope.prepareUbicationsGeoJSON(ubications);
                console.log(data);
                var blob = new Blob([JSON.stringify(data)], {type: "application/json"});
                saveAs(blob, "data.json");
              } else {
                $rootScope.updateOverlayInfo(exportDataEmpty,true,true);
              }
          } catch (e) { // EL navegador no puede exportar 
            $rootScope.updateOverlayInfo(exportBrowserError,true,true);
          }
       }

       // Genera GeoJSON a partir de las ubicaciones presentes en {ubications}
       $rootScope.prepareUbicationsGeoJSON = function(ubications){
          var data = { "type": "FeatureCollection","features": []};
          for (index in ubications){
              var ubData = ubications[index];
              var newFeature = {
                "type":"Feature",
                "geometry":{"type":"Point","coordinates":ol.proj.transform(ubData.coords, 'EPSG:900913', 'EPSG:4326')},
                "properties":{"name":ubData.name,"description":ubData.description},
              }
              for (type in ubData.info){
                for (layer in ubData.info[type]){
                  for (params in ubData.info[type][layer]){
                    key = type + "." + params;
                    newFeature["properties"][key] = ubData.info[type][layer][params]; 
                  } 
                }
              }
              data.features.push(newFeature);
          }
          return data;
       }


      $rootScope.noSort = function(obj){
        if (!obj) {
            return [];
        }
        return Object.keys(obj);
      }

      /////////////// CARGA DEL MAPA ///////////////////////////////////

      var mapCenter;
      if ($routeParams.lat && $routeParams.lng){
        var latlng = [parseFloat($routeParams.lat),parseFloat($routeParams.lng)];
          mapCenter  = ol.proj.transform(latlng,'EPSG:4326', 'EPSG:900913');
      } else {
          mapCenter = $rootScope.mapConfiguration.currentUbication || defaultMapCenter; // Centro en ubicacion actual o sino en la ubic por defecto
      }
      var mapZoom = ($routeParams.zoom) ? $routeParams.zoom : defaultMapZoom;

      // Inicio mapa
      $rootScope.map = GeoINTAMap.getMap('geointamap',mapCenter,mapZoom,$rootScope.ubications,$rootScope.mapConfiguration);

      // Muestro overlay de bienvenida
      if ($rootScope.showWelcomeOverlay){
        $rootScope.toggle('welcomeOverlay', 'on');
        $rootScope.showWelcomeOverlay = false;
      }

      
      ////////////////////////////////////////////////////////////////////

     }]) // Termina MainController


    .controller('DetalleUbicacionesCtrl', ['$scope', '$rootScope','$routeParams','Ubication', function ($scope,$rootScope, $routeParams,Ubication) {
        $scope.ubication = Ubication.get({idUbication: $routeParams.idUbication});


        $scope.reloadUbicationsInfo = function(ubication){
          params = $scope.getMapExtentParams(ubication.coords,ubication.extent,ubication.xy,ubication.mapSize);
            $rootScope.updateOverlayInfo(requestingCurrentUbicationInfo,true);
            Ubication.requestCoordsInfo(params,function(response){
              // callback success 
              if (response){ // Se recibio respuesta
				  if (response.code == 200){
					  ubication.info = response.info;
					  ubication.timestamp = $rootScope.getTimestamp();
					  Ubication.updateUbicationInfo(ubication);
					  $rootScope.showOverlay('off');
					  $scope.ubication = ubication;
				  } else {
					$rootScope.showMiddlewareResponseError(response);
				  }
			  } else {
				  $rootScope.updateOverlayInfo(middlewareNoRouteError,true,true);
			  }
          });
        }
    }]) // Termina DetalleUbicacionesCtrl
