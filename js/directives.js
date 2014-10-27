'use strict';

(function () {

angular.module('openlayersdirective', [])
	.directive('openlayersmap', function(){
   		return {
	        restrict: 'E',
	        replace: true,
	        scope: {map:'='},
	        template: '<div></div>',
	        link: function(scope, element, attrs) {
		        var map = new ol.Map({
		                target: element[0],
		                layers: [
		                  new ol.layer.Tile({
		                    source: new ol.source.MapQuest({layer: 'sat'})
		                  }),
		                  
		                ],
		                view: new ol.View({
		                  center: ol.proj.transform([-34.57911,-58.4307337], 'EPSG:4326', 'EPSG:3857'),
		                  zoom: 3
		                })
		          })
		        
	            
	        }
    	};
	}); // ends directive

}());