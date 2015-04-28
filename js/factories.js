'use strict';

(function () {



var urlMiddlewareGeoINTAMobile = 'http://movil.geointa.inta.gob.ar/gestor/mobileservice?callback=JSON_CALLBACK';

var localStorageConfiguration = "geoINTAMapConfiguration";
var localStorageUbications = "geoINTAUbications";
var bingKey = 'An980uGYXOk9yd-vHLUeV2J_ebho9xTXZObprH56yX3FQrhw_FxHYBPQVVvB4TG8';


var baseLayers =  {
      'Open Street Map':{
        construct:function(config){
            return new ol.layer.Tile({
              preload: 4,
              source: new ol.source.OSM(),
              visible:config.visible,
                opacity:config.opacity,
            })
        },
        'defaultConfig':{'visible':false,'opacity':1},
     },
    'Aereo con etiquetas':{
        construct:function(config){
            return new ol.layer.Tile({
                source: new ol.source.BingMaps({
                  key: bingKey,
                  imagerySet: 'AerialWithLabels'
                }),
                name:'BingAerialLabels',
                visible:config.visible,
                opacity:config.opacity,
            })
        },
        'defaultConfig':{'visible':true,'opacity':1},
     },
    'Aéreo':{
        construct:function(config){
            return new ol.layer.Tile({
                source: new ol.source.BingMaps({
                  key: bingKey,
                  imagerySet: 'Aerial'
                }),
                name:'BingAerial',
                visible:config.visible,
                opacity:config.opacity,
            })
        },
        'defaultConfig':{'visible':false,'opacity':1},
     },
}

var infoLayers =  {
     'LLuvias estaciones':{
        construct:function(config){
            return new ol.layer.Tile({
                source: new ol.source.TileWMS(/** @type {olx.source.TileWMSOptions} */ ({
                  url: 'http://geointa.inta.gov.ar/geoserver/geointa/wms',
                  params: {'LAYERS': 'geointa:lluvias_hoy','VERSION':'1.1.1','SRS':'900913','STYLES':'','BUFFER':48},
                  serverType: 'geoserver',
                })),
                name: 'stationsnobase',
                visible:config.visible,
                opacity:config.opacity,
              })
        },
        'defaultConfig':{'visible':true,'opacity':1},
     }

}



  var ubications = [
            {"id": 1,
             "name": "INTA Castelar",
             "description": "Ubicación dentro de INTA Castelar",
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
            },
            {"id": 2,
             "name": "INTA Rafaela",
             "description": "Datos Rafaela",
             "coords":[-7686034.3383348305,-4064828.6642276105],
                          "info": {
                    "Información Global":[
                        {"data":"Altura" ,"value":20},
                        {"data":"Lluvia" ,"value":60}
                    ],
                    "Información Regional":[
                        {"data":"Provincia" ,"value":"Buenos Aires"},
                        {"data":"Region" ,"value":"Region II"}
                    ],
                    "Información Local":[
                        {"data":"Poblacion" ,"value":32434},
                        {"data":"Densidad" ,"value":1.4}
                    ],
                },
            },
            {"id": 3,
             "name": "INTA Salta",
             "description": "Información INTA Salta",
             "coords": [-6624894.143027465,-4295082.328887408],
              "info": {
                    "Información Global":[
                        {"data":"Altura" ,"value":10},
                        {"data":"Lluvia" ,"value":200}
                    ],
                    "Información Regional":[
                        {"data":"Provincia" ,"value":"Salta"},
                        {"data":"Region" ,"value":"Region IV"}
                    ],
                },
            },
        ],


        traverseCollection = function(collection,callback){
            var l = collection.length, i;
            for (i = 0; i < l; i = i + 1) {
                callback(collection[i]);
            }
        },

        findUbicationById = function (id) {
            var ubications = getLocalStorageUbications();
            var ubication = null,
                l = ubications.length,
                i;
            for (i = 0; i < l; i = i + 1) {
                if (ubications[i].id === id) {
                    ubication = ubications[i];
                    break;
                }
            }
            return ubication;
        },


        getLocalStorageUbications = function(){
            var ubicationsStorage = JSON.parse(localStorage.getItem(localStorageUbications));
            if (ubicationsStorage == null){
                return [];
            }
            return ubicationsStorage;
        },


        getMapConfiguration = function(){
           return JSON.parse(localStorage.getItem(localStorageConfiguration)); 
        },


        // - Verificar que los layers existentes en localStorage estén sinconizados
        //    con las capas activas en la configuración global (las capas activas
        //    varian con el tiempo)
        //  - Las capas que ya tiene el cliente las dejo con las configuracion seteada por el mismo
        sincronizeLayersConfiguration = function() {
            var clientConfiguration = getMapConfiguration().layers; // configuracion en localStorage
            for (var layerName in baseLayers){
                if (!(layerName in clientConfiguration)){
                    // Agrego capa que no existe en el cliente, con la config por defecto
                    clientConfiguration[layerName] = baseLayers[layerName]['defaultConfig'];
                }
            }
            for (var clientLayer in clientConfiguration){
                if (!(clientLayer in baseLayers)){
                    // Elimino capas en el cliente que ya no existen en la config global
                    delete clientConfiguration[clientLayer];
                }
            }
            return clientConfiguration; // retorno nueva configuracion de las capas sincronizada
        }




angular.module('geointa.factories', [])
	.factory('Ubication', ['$http','$q',
            function ($http,$q) {
                return {
                    query: function () {
                        var ub = getLocalStorageUbications();
                        return (ub) ? ub : [];
                    },
                    get: function (ubication) {
                        var ubications = getLocalStorageUbications();
                        for (var i = ubications.length - 1; i >= 0; i--) {
                            if (ubications[i].id == ubication.idUbication){
                                return ubications[i];
                            }
                        };
                        return null;
                    },
                    requestCoordsInfo: function (params,callback) {
                        $http({
                            method: 'JSONP',
                            params: params,
                            url: urlMiddlewareGeoINTAMobile,
                        }).success(function(data, status, headers, config) {
                            callback(data);
                        }).error(function(data, status, headers, config) {
                            callback(null);
                        });
                        //return JSON.parse(localStorage.getItem("geointaUbications"));
                    },
                    persistNewUbication: function(ubication){
                        var ubicationList =  getLocalStorageUbications();
                        ubicationList.push(ubication);
                        localStorage.setItem(localStorageUbications,angular.toJson(ubicationList));
                    },
                    updateUbicationInfo: function(ubication){
                        var ubicationList =  getLocalStorageUbications();
                        console.log(ubicationList);
                        for (var i = 0; i < ubicationList.length; i++) {
                            if (ubicationList[i].id === ubication.id) {
                                ubicationList[i] = ubication;
                                break;
                            }
                         }
                         console.log(ubication);
                        //ubicationList.push(ubication);
                        localStorage.removeItem(localStorageUbications);
                        localStorage.setItem(localStorageUbications,JSON.stringify(ubicationList));
                    },
                    deleteUbication: function(id){
                        var ub =  getLocalStorageUbications();
                        for (var i = ub.length - 1; i >= 0; i--) {
                            if (ub[i].id == id){
                                var index = i;
                                break;
                            }
                        }
                        ub.splice(i,1);
                        localStorage.setItem(localStorageUbications,JSON.stringify(ub));
                    },
                    getNextID: function(){
                        var ub =  getLocalStorageUbications();
                        if (ub.length > 0){
                            return ub[ub.length-1].id + 1;
                        } else {
                            return 1;
                        }
                    }
                }

    }])
    .factory('GeoINTAMap', ['$rootScope',function($rootScope){

        function OLMap(target,center,zoom,initialMarkers,configuration){
            this.ubications = initialMarkers;
            this.configuration = configuration;
            this.vectorDefaultMarkerSource = null;
            this.vectorCurrentPosMarkerSource = null;
            this.iconDefaultStyle = new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 32],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: './img/marker-green-small.png'
                    }))
            });
            this.iconCurrentPosStyle = new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 32],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: './img/marker-blue-small.png'
                    }))
            });
            this.vectorUbicationsLayer = null;
            this.vectorCurrentPosLayer = null;
            this.view = new ol.View({
                  center: center,
                  zoom: zoom,
            })
            /// Inicializo vectores de marcadores.
            this.initVectorUbicationsLayer(); // Markers de ubicaciones guardadas
            this.initVectorCurrentPosLayer(); // Marker ubicacion actual
            ////
            //// Genero mapa
            this.map = new ol.Map({
                            target: target,
                            layers: [
                              this.initBaseLayers(),
                              this.initInfoLayers(),
                              this.vectorUbicationsLayer,
                              this.vectorCurrentPosLayer,
                            ],
                            view: this.view,
            })
            this.markerPopup =  new ol.Overlay({
                element: document.getElementById('popup'),
                positioning: 'bottom-center',
                stopEvent: false
            });
            this.map.addOverlay(this.markerPopup);
 
            $(this.map.getViewport()).on('mousemove', function(e) {
                  var pixel = $rootScope.map.map.getEventPixel(e.originalEvent);
                  var hit = $rootScope.map.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return true;
                  });
                  if (hit) {
                    $('#' + $rootScope.map.map.getTarget()).css( 'cursor', 'pointer' );
                  } else {
                    $('#' + $rootScope.map.map.getTarget()).css( 'cursor', '' );
                  }
            });


            //  Evento click en el mapa
            // Si se hace click en un marcador, muestra popup con información.
            // Sino, actualiza posicion actual

            this.map.on('singleclick', function(evt) {
                var feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    return feature;
                });
                if (feature) { // Click sobre marcador
                    /*var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    this.markerPopup.setPosition([-7686034.3383348305,-4064828.6642276105]);
                    $('#popup').popover({
                      'placement': 'top',
                      'html': true,
                      'content': feature.get('name')
                    });
                    $('#popup').popover('show');*/
                  } else {
                    $('#popup').popover('destroy');
                    this.updateCurrentPosMarker(evt.coordinate,evt.pixel);
                  }
            },this)



        } 

        // Agrega al mapa las capas bases (excluyentes entre si)
        OLMap.prototype.initBaseLayers = function(){
          var layers = [];
          for (var layerName in baseLayers){
                var layer = baseLayers[layerName].construct(this.configuration['layers'][layerName]);
                layers.push(layer);
          }
          var layersGroup = new ol.layer.Group({layers:layers});
          return layersGroup;

        }

        // Agrega al mapa capas no base
        OLMap.prototype.initInfoLayers = function(){
          var layers = [];
          for (var layerName in  infoLayers){
                var layer = infoLayers[layerName].construct(this.configuration['infoLayers'][layerName]);
                layers.push(layer);
          }
          var layersGroup = new ol.layer.Group({layers:layers});
          return layersGroup;
        }

        OLMap.prototype.initVectorCurrentPosLayer = function(){
            this.vectorCurrentPosMarkerSource = new ol.source.Vector({});
            if (this.configuration.currentUbication != null){
                 this.vectorCurrentPosMarkerSource.addFeature(this.createIcon("CURRENT",this.configuration.currentUbication,""));
            }
            this.vectorCurrentPosLayer = new ol.layer.Vector({
              source: this.vectorCurrentPosMarkerSource,
              style: this.iconCurrentPosStyle
            });
        }

        OLMap.prototype.initVectorUbicationsLayer = function(){
            this.vectorDefaultMarkerSource = new ol.source.Vector({});
            this.loadInitialUbications();
            this.vectorUbicationsLayer = new ol.layer.Vector({
              source: this.vectorDefaultMarkerSource,
              style: this.iconDefaultStyle
            });
        }

        OLMap.prototype.loadInitialUbications = function(){
            for (var i = 0; i < this.ubications.length; i++) {
                var currentMarker = this.ubications[i];
                this.vectorDefaultMarkerSource.addFeature(this.createIcon(currentMarker.name,currentMarker.coords,""));
            };
        }

        // Recibe una tupla lat,long con las coordenadas en la projeccion EPSG:EPSG:900913
        // Como segundo parámetro, recibe valor xy del punto con respecto al mapa (necesario para luego
        // pedir FeatureInfo al midddleware)
        OLMap.prototype.updateCurrentPosMarker = function(coords,xyPixel){
            if (this.vectorCurrentPosMarkerSource.getFeatures().length > 0){
                var currentPos = this.vectorCurrentPosMarkerSource.getFeatures()[0];
                currentPos.setGeometry(new  ol.geom.Point(coords));
            } else {
                this.vectorCurrentPosMarkerSource.addFeature(this.createIcon("CURRENT",coords,""));
            }
            // Guardo la posicion actual 
            this.configuration.currentUbication = coords;
            this.configuration.currentXY = xyPixel;
            this.updateMapConfiguration();
        }

        OLMap.prototype.removeCurrentPosMarker = function(){
            if (this.vectorCurrentPosMarkerSource.getFeatures().length > 0){
                var feature = this.vectorCurrentPosMarkerSource.getFeatures()[0];
                this.vectorCurrentPosMarkerSource.removeFeature(feature);
                this.configuration.currentUbication = null;
                this.updateMapConfiguration();
            }
        }

        OLMap.prototype.getCurrentPosCoords = function(){
            if (this.vectorCurrentPosMarkerSource.getFeatures().length > 0){
                var currentPos = this.vectorCurrentPosMarkerSource.getFeatures()[0];
                return currentPos.getGeometry().getCoordinates();
            } else {
                return null;
            }
        }

        OLMap.prototype.centerTo = function(coords,zoom){
            this.view.setCenter(coords);
            this.view.setZoom(10);
        }

        OLMap.prototype.createIcon = function(name,coords,opts){
            var iconFeature = new ol.Feature({
                geometry: new  ol.geom.Point(coords),
                name: name,
                });
            return iconFeature;
        }

        OLMap.prototype.updateMapConfiguration = function(configuration){
            var conf = (configuration) ? configuration : this.configuration;
            localStorage.setItem(localStorageConfiguration,JSON.stringify(conf));
        }

        OLMap.prototype.getMapExtent = function(){
            return this.view.calculateExtent(this.map.getSize());
        }

        return {
            getMap: function(target,center,zoom,ubications,configuration){
                return new OLMap(target,center,zoom,ubications,configuration);
            },
            getConfiguration: function(){
                var conf = getMapConfiguration();
                if (conf === null){
                     conf = {
                        'currentUbication': null,
                        'currentXY':null,
                        'mapCenter':[-6673603.47305675,-4154372.4878888335], // por defecto [-59.95,-34.93]
                        'mapZoom':'4',
                        'layers':{},
                        'infoLayers':{}
                    };
                    for (var layerName in baseLayers){
                        conf['layers'][layerName] = baseLayers[layerName]['defaultConfig'];
                    }
                    for (var layerName in infoLayers){
                        conf['infoLayers'][layerName] = infoLayers[layerName]['defaultConfig'];
                    }
                    // Persisto en localStorage la configuracion por defecto
                    localStorage.setItem(localStorageConfiguration,JSON.stringify(conf));
                } else {
                    // Si ya existe configuracion
                    // - Verificar que los layers existentes en localStorage estén sinconizados
                    //    con las capas activas en la configuración global (las capas activas
                    //    varian con el tiempo)
                    var sincronizedLayerConf = sincronizeLayersConfiguration();
                    conf.layers = sincronizedLayerConf;
                    localStorage.setItem(localStorageConfiguration,JSON.stringify(conf));
                    conf = getMapConfiguration();
                }
                return conf;
            }
        }
    }]);

}());
