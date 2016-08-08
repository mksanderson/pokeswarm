var Application;
(function (Application) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['Client']);
    });
})(Application || (Application = {}));
/// <reference path="../typings/index.d.ts"/>
var Application;
(function (Application) {
    angular.module('Client', [
        'ngRoute',
        'offClick'
    ]);
})(Application || (Application = {}));
var Application;
(function (Application) {
    var LocationProvider = (function () {
        function LocationProvider(LocationProvider) {
            this.LocationProvider = LocationProvider;
        }
        return LocationProvider;
    }());
    Application.LocationProvider = LocationProvider;
    angular
        .module('Client')
        .config(['$locationProvider', LocationProvider]);
})(Application || (Application = {}));
var Application;
(function (Application) {
    var RouteProvider = (function () {
        function RouteProvider(RouteProvider) {
            this.RouteProvider = RouteProvider;
            RouteProvider
                .when('/', {
                templateUrl: '/templates/map.html'
            });
        }
        return RouteProvider;
    }());
    Application.RouteProvider = RouteProvider;
    angular
        .module('Client')
        .config(['$routeProvider', RouteProvider]);
})(Application || (Application = {}));
var Application;
(function (Application) {
    /**
     * Core controller for global functions
     *
     * @class ApplicationController
     * @implements {IApplicationController}
     */
    var ApplicationController = (function () {
        function ApplicationController(FirebaseService) {
            this.FirebaseService = FirebaseService;
            FirebaseService.configure();
        }
        ApplicationController.$inject = [
            'FirebaseService'
        ];
        return ApplicationController;
    }());
    angular
        .module('Client')
        .controller('ApplicationController', ApplicationController);
})(Application || (Application = {}));
var Application;
(function (Application) {
    /**
     * (description)
     *
     * @class MapController
     * @implements {IMapController}
     */
    var MapController = (function () {
        function MapController(FirebaseService, GeolocationService, MapService, WindowService) {
            var _this = this;
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            this.WindowService = WindowService;
            GeolocationService.get().then(function (response) {
                MapService.createMap(document.getElementById('map'), response.coords.latitude, response.coords.longitude, 16).then(function (response) {
                    _this.loaded = response;
                });
                MapService.addGeoMarker(response);
            }).catch(function (reason) {
                MapService.createMap(document.getElementById('map'), 27, 153, 2);
            }).then(function () {
                FirebaseService.get('/').then(function (response) {
                    var markers = [];
                    for (var i = 0; i < response.length; i++) {
                        markers.push(response[i].val());
                    }
                    MapService.addMarkers(markers);
                    MapService.addHeatmap();
                });
            });
        }
        /**
         * Filter the map items based on the search model
         *
         * @param {string} [search] (description)
         */
        MapController.prototype.filter = function (search) {
            var _this = this;
            this.MapService.filterMarkers(search).then(function () {
                _this.MapService.filterHeatMap();
            });
        };
        /**
         * Reload the entire map to check for updates
         */
        MapController.prototype.reload = function () {
            this.WindowService.location.reload();
        };
        /**
         * Reset the map state
         */
        MapController.prototype.reset = function () {
            this.MapService.reset();
            this.search = '';
        };
        /**
         * Relocate the user
         */
        MapController.prototype.relocate = function () {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                _this.MapService.removeGeoMarkers();
                _this.MapService.addGeoMarker(response);
            });
        };
        /**
         * (description)
         *
         * @param {Sighting} record (description)
         */
        MapController.prototype.submit = function (name) {
            var _this = this;
            this.MapService.getGeoPosition().then(function (response) {
                var position = response;
                _this.FirebaseService.push({
                    'position': {
                        'coords': {
                            'latitude': position.lat(),
                            'longitude': position.lng()
                        },
                        'timestamp': Math.floor(Date.now())
                    },
                    'name': name
                }).then(function (response) {
                    _this.FirebaseService.get('/').then(function (response) {
                        var markers = [];
                        for (var i = 0; i < response.length; i++) {
                            markers.push(response[i].val());
                        }
                        _this.MapService.addMarkers(markers);
                        alert(_this.name + ' has been added to the map! Thank you!');
                        _this.name = '';
                    });
                });
            });
        };
        MapController.$inject = [
            'FirebaseService',
            'GeolocationService',
            'MapService',
            '$window'
        ];
        return MapController;
    }());
    angular
        .module('Client')
        .controller('MapController', MapController);
})(Application || (Application = {}));
var Application;
(function (Application) {
    var FirebaseService = (function () {
        function FirebaseService(QService) {
            this.QService = QService;
            this.sightings = new Array();
        }
        /**
         * Set up connection to database
         */
        FirebaseService.prototype.configure = function () {
            var config = {
                apiKey: "AIzaSyCX8F3OCazrx8A0XlNA4j3KgZmOOuyPbNQ",
                authDomain: "poketrends-1469778144301.firebaseapp.com",
                databaseURL: "https://poketrends-1469778144301.firebaseio.com",
                storageBucket: "poketrends-1469778144301.appspot.com"
            };
            this.firebase = firebase.initializeApp(config);
        };
        /**
         * (description)
         *
         * @param {string} path (description)
         * @returns {*} (description)
         */
        FirebaseService.prototype.get = function (path) {
            var deferred = this.QService.defer(), result = [];
            this.firebase.database().ref(path).on('value', (function (response) {
                response.forEach(function (sighting) {
                    result.push(sighting);
                });
                deferred.resolve(result);
            }));
            return deferred.promise;
        };
        /**
         * (description)
         *
         * @param {Sighting} record (description)
         */
        FirebaseService.prototype.push = function (record) {
            var deferred = this.QService.defer();
            deferred.resolve(this.firebase.database().ref().push(record));
            return deferred.promise;
        };
        FirebaseService.$inject = [
            '$q'
        ];
        return FirebaseService;
    }());
    Application.FirebaseService = FirebaseService;
    angular
        .module('Client')
        .service('FirebaseService', FirebaseService);
})(Application || (Application = {}));
var Application;
(function (Application) {
    /**
     * Fetch and use geolocation
     *
     * @class LocationService
     * @implements {ILocationService}
     */
    var GeolocationService = (function () {
        function GeolocationService(q, window) {
            this.q = q;
            this.window = window;
        }
        /**
         * (description)
         *
         * @returns {ng.IPromise<Position>} (description)
         */
        GeolocationService.prototype.get = function () {
            var deferred = this.q.defer();
            if (!this.window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            }
            else {
                this.window.navigator.geolocation.getCurrentPosition(function (position) {
                    deferred.resolve(position);
                }, function (error) {
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        };
        GeolocationService.$inject = [
            '$q',
            '$window'
        ];
        return GeolocationService;
    }());
    Application.GeolocationService = GeolocationService;
    angular
        .module('Client')
        .service('GeolocationService', GeolocationService);
})(Application || (Application = {}));
var Application;
(function (Application) {
    /**
     * (description)
     *
     * @class MapService
     * @implements {IMapService}
     */
    var MapService = (function () {
        function MapService(FilterService, HttpService, QService) {
            this.FilterService = FilterService;
            this.HttpService = HttpService;
            this.QService = QService;
            this.geoMarkers = new Array();
            this.geoCircles = new Array();
            this.heatmap = new google.maps.visualization.HeatmapLayer;
            this.heatmapPoints = new Array();
            this.infoWindows = new Array();
            this.markers = new Array();
            this.markerCircles = new Array();
        }
        /**
         * Add markers from API to the map
         *
         * @param {Array<Marker>} markers (description)
         */
        MapService.prototype.addMarkers = function (markers) {
            for (var i = 0; i < markers.length; i++) {
                this.marker = new google.maps.Marker({
                    icon: {
                        scaledSize: new google.maps.Size(60, 60),
                        url: '/api/pokemon/icons/' + markers[i].name + '.ico'
                    },
                    position: new google.maps.LatLng(markers[i].position.coords.latitude, markers[i].position.coords.longitude),
                    map: this.instance,
                    title: markers[i].name,
                    zIndex: 1
                });
                this.infoWindow = new google.maps.InfoWindow({
                    content: markers[i].name + ' (Added ' + this.FilterService('date')(markers[i].position.timestamp) + ')'
                });
                this.infoWindows.push(this.infoWindow);
                this.markers.push(this.marker);
                this.openInfoWindow(this.marker, this.infoWindow);
            }
        };
        /**
         * Add a marker for users current position.
         * Depends on the GeolocationService
         *
         * @param {Marker} marker (description)
         */
        MapService.prototype.addGeoMarker = function (position) {
            var _this = this;
            this.geoMarker = new google.maps.Marker({
                draggable: true,
                icon: {
                    fillColor: '#039be5',
                    fillOpacity: 0.35,
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    strokeWeight: 2
                },
                position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                map: this.instance
            });
            this.geoMarker.setAnimation(google.maps.Animation.DROP);
            this.geoMarkers.push(this.geoMarker);
            this.geoMarker.addListener('dragend', function () {
                _this.getGeoPosition(_this.geoMarker);
            });
            // this.geoCircle = new google.maps.Circle({
            // 	center: new google.maps.LatLng(
            // 		position.coords.latitude,
            // 		position.coords.longitude
            // 	),
            // 	fillColor: '#039be5',
            // 	fillOpacity: 0.15,
            // 	map: this.instance,
            // 	radius: position.coords.accuracy * 3,
            // 	strokeColor: '#039be5',
            // 	strokeOpacity: 0.35,
            // 	strokeWeight: 2
            // });
            // this.geoCircles.push(this.geoCircle);
            this.instance.setCenter(this.geoMarker.getPosition());
        };
        /**
         * Add a heatmap to the map instance by
         * passing in map points
         *
         * @param {Array<Marker>} markers (description)
         */
        MapService.prototype.addHeatmap = function () {
            for (var i = 0; i < this.markers.length; i++) {
                this.heatmapPoints.push(this.markers[i].getPosition());
            }
            this.heatmap = new google.maps.visualization.HeatmapLayer({
                data: this.heatmapPoints,
                radius: 50
            });
            this.heatmap.setMap(this.instance);
        };
        /**
         * (description)
         *
         * @param {Element} dom (description)
         * @param {number} lat (description)
         * @param {number} lng (description)
         * @param {number} zoom (description)
         */
        MapService.prototype.createMap = function (dom, lat, lng, zoom) {
            var _this = this;
            var deferred = this.QService.defer();
            this.dom = dom;
            this.instance = new google.maps.Map(this.dom, {
                center: new google.maps.LatLng(lat, lng),
                disableDefaultUI: true,
                maxZoom: 16,
                minZoom: 14,
                styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }],
                zoom: zoom
            });
            google.maps.event.addListener(this.instance, 'tilesloaded', function () {
                var result;
                google.maps.event.clearListeners(_this.instance, 'tilesloaded');
                result = true;
                deferred.resolve(result);
            });
            return deferred.promise;
        };
        /**
         * Filter the visible markers by a matching value
         *
         * @param {Array<google.maps.Marker>} markers (description)
         */
        MapService.prototype.filterMarkers = function (search) {
            var deferred = this.QService.defer();
            if (search) {
                for (var i = 0; i < this.markers.length; i++) {
                    if (this.markers[i].getTitle().toLowerCase() === search.toLowerCase()) {
                        this.markers[i].setVisible(true);
                    }
                    else {
                        this.markers[i].setVisible(false);
                    }
                }
                deferred.resolve();
            }
            else {
                for (var i = 0; i < this.markers.length; i++) {
                    this.markers[i].setVisible(true);
                }
            }
            return deferred.promise;
        };
        /**
         * Useful when markers change to reflect those changes
         * in the heatmapping
         *
         * @param {Array<google.maps.Marker>} markers (description)
         */
        MapService.prototype.filterHeatMap = function () {
            this.heatmapPoints.length = 0;
            for (var i = 0; i < this.markers.length; i++) {
                if (this.markers[i].getVisible()) {
                    this.heatmapPoints.push(this.markers[i].getPosition());
                }
            }
            this.heatmap.setMap(this.instance);
        };
        /**
         * (description)
         *
         * @returns {ng.IPromise<Position>} (description)
         */
        MapService.prototype.getGeoPosition = function (marker) {
            var deferred = this.QService.defer(), result;
            result = this.geoMarker.getPosition();
            deferred.resolve(result);
            return deferred.promise;
        };
        /**
         * Get markers from endpoint
         *
         * @param {string} path API endpoint
         * @returns {ng.IPromise<<Array<Marker>>} An array of markers
         */
        MapService.prototype.getMarkers = function (path) {
            var result = this.HttpService.get(path).then(function (response) {
                return response.data;
            });
            return result;
        };
        /**
         * Open infowindow, close others
         *
         * @param {google.maps.Marker} marker (description)
         * @param {google.maps.InfoWindow} infoWindow (description)
         */
        MapService.prototype.openInfoWindow = function (marker, infoWindow) {
            var _this = this;
            marker.addListener('click', function () {
                for (var i = 0; i < _this.infoWindows.length; i++) {
                    _this.infoWindows[i].close();
                }
                infoWindow.open(_this.instance, marker);
            });
        };
        /**
         * (description)
         */
        MapService.prototype.removeGeoMarkers = function () {
            for (var i = 0; i < this.geoMarkers.length; i++) {
                this.geoMarkers[i].setMap(null);
            }
            for (var i = 0; i < this.geoCircles.length; i++) {
                this.geoCircles[i].setMap(null);
            }
        };
        /**
         * Reset markers
         */
        MapService.prototype.reset = function () {
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setVisible(true);
            }
        };
        MapService.$inject = [
            '$filter',
            '$http',
            '$q'
        ];
        return MapService;
    }());
    Application.MapService = MapService;
    angular
        .module('Client')
        .service('MapService', MapService);
})(Application || (Application = {}));
var Application;
(function (Application) {
    /**
     * (description)
     *
     * @class PokemonService
     * @implements {IPokemonService}
     */
    var PokemonService = (function () {
        function PokemonService(HttpService) {
            this.HttpService = HttpService;
        }
        /**
         * (description)
         *
         * @param {string} path (description)
         * @returns {ng.IHttpPromise<Array<Pokemon>>} (description)
         */
        PokemonService.prototype.get = function (path) {
            var result = this.HttpService.get(path).then(function (response) {
                return response.data;
            });
            return result;
        };
        PokemonService.$inject = [
            '$http'
        ];
        return PokemonService;
    }());
    Application.PokemonService = PokemonService;
    angular
        .module('Client')
        .service('PokemonService', PokemonService);
})(Application || (Application = {}));
var Dropdown;
(function (Dropdown) {
    /**
     * (description)
     *
     * @class DropdownController
     * @implements {IDropdownController}
     */
    var DropdownController = (function () {
        function DropdownController() {
            this.state = false;
        }
        DropdownController.prototype.toggle = function () {
            this.state = !this.state;
        };
        DropdownController.$inject = [];
        return DropdownController;
    }());
    /**
     * (description)
     *
     * @class DropdownDirective
     * @implements {ng.IDirective}
     */
    var DropdownDirective = (function () {
        function DropdownDirective() {
            this.bindToController = {
                left: '@',
                object: '@',
                right: '@'
            };
            this.controller = DropdownController;
            this.controllerAs = 'Dropdown';
            this.replace = true;
            this.scope = true;
            this.templateUrl = '/directives/dropdown/views/dropdown.html';
            this.transclude = {
                title: '?dropdownTitle',
                result: '?dropdownResult'
            };
        }
        /**
         * (description)
         *
         * @static
         * @returns {ng.IDirective} (description)
         */
        DropdownDirective.instance = function () {
            return new DropdownDirective();
        };
        /**
         * (description)
         *
         * @param {ng.IScope} scope (description)
         * @param {ng.IAugmentedJQuery} element (description)
         */
        DropdownDirective.prototype.link = function (scope, element) {
        };
        return DropdownDirective;
    }());
    angular
        .module('Client')
        .directive('dropdown', DropdownDirective.instance);
})(Dropdown || (Dropdown = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9NYXBDb250cm9sbGVyLnRzIiwic2VydmljZXMvRmlyZWJhc2VTZXJ2aWNlLnRzIiwic2VydmljZXMvR2VvbG9jYXRpb25TZXJ2aWNlLnRzIiwic2VydmljZXMvTWFwU2VydmljZS50cyIsInNlcnZpY2VzL1Bva2Vtb25TZXJ2aWNlLnRzIiwiZGlyZWN0aXZlcy9kcm9wZG93bi9jb250cm9sbGVycy9Ecm9wZG93bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBSXBCO0FBSkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLEVBSlMsV0FBVyxLQUFYLFdBQVcsUUFJcEI7QUNKRCw2Q0FBNkM7QUFDN0MsSUFBVSxXQUFXLENBTXBCO0FBTkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdEI7UUFDQyxTQUFTO1FBQ1QsVUFBVTtLQUNWLENBQUMsQ0FBQztBQUNMLENBQUMsRUFOUyxXQUFXLEtBQVgsV0FBVyxRQU1wQjtBQ1BELElBQVUsV0FBVyxDQWFwQjtBQWJELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFFdEI7UUFDQywwQkFDUSxnQkFBc0M7WUFBdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFzQjtRQUc5QyxDQUFDO1FBQ0YsdUJBQUM7SUFBRCxD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QixJQUFJLEVBQUUsR0FBRztnQkFDVCxNQUFNLEVBQUUsR0FBRztnQkFDWCxLQUFLLEVBQUUsR0FBRzthQUNWLENBQUE7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsMENBQTBDLENBQUE7WUFDN0QsSUFBSSxDQUFDLFVBQVUsR0FBRztnQkFDakIsS0FBSyxFQUFFLGdCQUFnQjtnQkFDdkIsTUFBTSxFQUFFLGlCQUFpQjthQUN6QixDQUFDO1FBQ0gsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ksMEJBQVEsR0FBZjtZQUNDLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ksZ0NBQUksR0FBWCxVQUFZLEtBQWdCLEVBQUUsT0FBNEI7UUFFMUQsQ0FBQztRQUNGLHdCQUFDO0lBQUQsQ0E3Q0EsQUE2Q0MsSUFBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLFNBQVMsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsQ0FBQyxFQWhGUyxRQUFRLEtBQVIsUUFBUSxRQWdGakIiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cdFx0YW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnQ2xpZW50J10pO1xyXG5cdH0pO1xyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvaW5kZXguZC50c1wiLz5cclxubmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnQ2xpZW50JywgXHJcblx0XHRbXHJcblx0XHRcdCduZ1JvdXRlJyxcclxuXHRcdFx0J29mZkNsaWNrJ1xyXG5cdFx0XSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdFxyXG5cdGV4cG9ydCBjbGFzcyBMb2NhdGlvblByb3ZpZGVye1xyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHB1YmxpYyBMb2NhdGlvblByb3ZpZGVyOiBuZy5JTG9jYXRpb25Qcm92aWRlclxyXG5cdFx0KXtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJGxvY2F0aW9uUHJvdmlkZXInLCBMb2NhdGlvblByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBSb3V0ZVByb3ZpZGVye1xyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHB1YmxpYyBSb3V0ZVByb3ZpZGVyOiBuZy5yb3V0ZS5JUm91dGVQcm92aWRlclxyXG5cdFx0KXtcclxuXHRcdFx0Um91dGVQcm92aWRlclxyXG5cdFx0XHRcdC53aGVuKCcvJywge1xyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIFJvdXRlUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBnbG9iYWwgZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJQXBwbGljYXRpb25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGRhdGE6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdEZpcmViYXNlU2VydmljZS5jb25maWd1cmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignQXBwbGljYXRpb25Db250cm9sbGVyJywgQXBwbGljYXRpb25Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBsb2FkZWQ6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgbG9jYXRpb246IFBvc2l0aW9uO1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBzZWFyY2g6IHN0cmluZztcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0R2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZS5jb29yZHMubGF0aXR1ZGUsIHJlc3BvbnNlLmNvb3Jkcy5sb25naXR1ZGUsIDE2KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5sb2FkZWQgPSByZXNwb25zZTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihyZXNwb25zZSk7XHJcblx0XHRcdH0pLmNhdGNoKChyZWFzb24pID0+IHtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmNyZWF0ZU1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIDI3LCAxNTMsIDIpO1xyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRGaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuYWRkTWFya2VycyhtYXJrZXJzKTtcclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuYWRkSGVhdG1hcCgpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgbWFwIGl0ZW1zIGJhc2VkIG9uIHRoZSBzZWFyY2ggbW9kZWxcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IFtzZWFyY2hdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyKHNlYXJjaD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVyTWFya2VycyhzZWFyY2gpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJIZWF0TWFwKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvYWQgdGhlIGVudGlyZSBtYXAgdG8gY2hlY2sgZm9yIHVwZGF0ZXNcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2FkKCk6IHZvaWR7XHJcblx0XHRcdHRoaXMuV2luZG93U2VydmljZS5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHRoZSBtYXAgc3RhdGVcclxuXHRcdCAqL1xyXG5cdFx0cmVzZXQoKSB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5yZXNldCgpO1xyXG5cdFx0XHR0aGlzLnNlYXJjaCA9ICcnO1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvY2F0ZSB0aGUgdXNlclxyXG5cdFx0ICovXHJcblx0XHRyZWxvY2F0ZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5HZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVtb3ZlR2VvTWFya2VycygpO1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIocmVzcG9uc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTaWdodGluZ30gcmVjb3JkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3VibWl0KG5hbWU6IHN0cmluZykge1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UuZ2V0R2VvUG9zaXRpb24oKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5wdXNoKHtcclxuXHRcdFx0XHRcdCdwb3NpdGlvbic6IHtcclxuXHRcdFx0XHRcdFx0J2Nvb3Jkcyc6IHtcclxuXHRcdFx0XHRcdFx0XHQnbGF0aXR1ZGUnOiBwb3NpdGlvbi5sYXQoKSxcclxuXHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24ubG5nKClcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0J3RpbWVzdGFtcCc6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSlcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQnbmFtZSc6IG5hbWVcclxuXHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuYWRkTWFya2VycyhtYXJrZXJzKTtcclxuXHJcblx0XHRcdFx0XHRcdGFsZXJ0KHRoaXMubmFtZSArICcgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIG1hcCEgVGhhbmsgeW91IScpO1xyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIE1hcENvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRkZWNsYXJlIHZhciBmaXJlYmFzZTogYW55O1xyXG5cclxuXHRleHBvcnQgY2xhc3MgRmlyZWJhc2VTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnXHJcblx0XHRdXHJcblxyXG5cdFx0cHJpdmF0ZSBmaXJlYmFzZTogYW55O1xyXG5cdFx0cHJpdmF0ZSBzaWdodGluZ3MgPSBuZXcgQXJyYXk8UG9rZW1vbj4oKTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IHVwIGNvbm5lY3Rpb24gdG8gZGF0YWJhc2VcclxuXHRcdCAqL1xyXG5cdFx0Y29uZmlndXJlKCk6IHZvaWQge1xyXG5cdFx0XHR2YXIgY29uZmlnID0ge1xyXG5cdFx0XHRcdGFwaUtleTogXCJBSXphU3lDWDhGM09DYXpyeDhBMFhsTkE0ajNLZ1ptT091eVBiTlFcIixcclxuXHRcdFx0XHRhdXRoRG9tYWluOiBcInBva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWFwcC5jb21cIixcclxuXHRcdFx0XHRkYXRhYmFzZVVSTDogXCJodHRwczovL3Bva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWlvLmNvbVwiLFxyXG5cdFx0XHRcdHN0b3JhZ2VCdWNrZXQ6IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmFwcHNwb3QuY29tXCIsXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0aGlzLmZpcmViYXNlID0gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHsqfSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdCA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZihwYXRoKS5vbigndmFsdWUnLCAoKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0cmVzcG9uc2UuZm9yRWFjaCgoc2lnaHRpbmcpID0+IHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHNpZ2h0aW5nKTtcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdH0pKVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdXNoKHJlY29yZDogYW55KTogbmcuSVByb21pc2U8YW55PiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUodGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpLnB1c2gocmVjb3JkKSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnRmlyZWJhc2VTZXJ2aWNlJywgRmlyZWJhc2VTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIGFuZCB1c2UgZ2VvbG9jYXRpb25cclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTG9jYXRpb25TZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lMb2NhdGlvblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIEdlb2xvY2F0aW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcTogbmcuSVFTZXJ2aWNlLCBwcml2YXRlIHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldCgpOiBuZy5JUHJvbWlzZTxQb3NpdGlvbj4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLnEuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMud2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHBvc2l0aW9uKTtcclxuXHRcdFx0XHR9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdHZW9sb2NhdGlvblNlcnZpY2UnLCBHZW9sb2NhdGlvblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBTZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBTZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBNYXBTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGZpbHRlcicsXHJcblx0XHRcdCckaHR0cCcsXHJcblx0XHRcdCckcSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBhY3RpdmU6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZG9tOiBFbGVtZW50O1xyXG5cdFx0cHJpdmF0ZSBnZW9NYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZ2VvQ2lyY2xlOiBnb29nbGUubWFwcy5DaXJjbGU7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdHByaXZhdGUgaGVhdG1hcCA9IG5ldyBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcjtcclxuXHRcdHByaXZhdGUgaGVhdG1hcFBvaW50cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5MYXRMbmc+KCk7XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkluZm9XaW5kb3c+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpbHRlclNlcnZpY2U6IG5nLklGaWx0ZXJTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIG1hcmtlcnMgZnJvbSBBUEkgdG8gdGhlIG1hcFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PE1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhZGRNYXJrZXJzKG1hcmtlcnM6IEFycmF5PE1hcmtlcj4pOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdFx0c2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoNjAsIDYwKSxcclxuXHRcdFx0XHRcdFx0dXJsOiAnL2FwaS9wb2tlbW9uL2ljb25zLycgKyBtYXJrZXJzW2ldLm5hbWUgKyAnLmljbycsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdFx0XHR0aXRsZTogbWFya2Vyc1tpXS5uYW1lLFxyXG5cdFx0XHRcdFx0ekluZGV4OiAxXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcclxuXHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlcnNbaV0ubmFtZSArICcgKEFkZGVkICcgKyB0aGlzLkZpbHRlclNlcnZpY2UoJ2RhdGUnKShtYXJrZXJzW2ldLnBvc2l0aW9uLnRpbWVzdGFtcCkgKyAnKSdcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzLnB1c2godGhpcy5pbmZvV2luZG93KTtcclxuXHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzLnB1c2godGhpcy5tYXJrZXIpO1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KHRoaXMubWFya2VyLCB0aGlzLmluZm9XaW5kb3cpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBtYXJrZXIgZm9yIHVzZXJzIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHQgKiBEZXBlbmRzIG9uIHRoZSBHZW9sb2NhdGlvblNlcnZpY2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEdlb01hcmtlcihwb3NpdGlvbjogUG9zaXRpb24pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRkcmFnZ2FibGU6IHRydWUsXHJcblx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdFx0XHRmaWxsT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0XHRcdHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxyXG5cdFx0XHRcdFx0c2NhbGU6IDgsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdCksXHJcblx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QKTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2Vycy5wdXNoKHRoaXMuZ2VvTWFya2VyKTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuZ2V0R2VvUG9zaXRpb24odGhpcy5nZW9NYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcclxuXHRcdFx0Ly8gXHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdC8vIFx0KSxcclxuXHRcdFx0Ly8gXHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRmaWxsT3BhY2l0eTogMC4xNSxcclxuXHRcdFx0Ly8gXHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdC8vIFx0cmFkaXVzOiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgKiAzLFxyXG5cdFx0XHQvLyBcdHN0cm9rZUNvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0c3Ryb2tlT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0Ly8gXHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0Ly8gfSk7XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZXMucHVzaCh0aGlzLmdlb0NpcmNsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGhlYXRtYXAgdG8gdGhlIG1hcCBpbnN0YW5jZSBieVxyXG5cdFx0ICogcGFzc2luZyBpbiBtYXAgcG9pbnRzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEhlYXRtYXAoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXIoe1xyXG5cdFx0XHRcdGRhdGE6IHRoaXMuaGVhdG1hcFBvaW50cyxcclxuXHRcdFx0XHRyYWRpdXM6IDUwXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiBuZy5JUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdHRoaXMuZG9tID0gZG9tO1xyXG5cclxuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5kb20sIHtcclxuXHRcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsbmcpLFxyXG5cdFx0XHRcdGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcblx0XHRcdFx0bWF4Wm9vbTogMTYsXHJcblx0XHRcdFx0bWluWm9vbTogMTQsXHJcblx0XHRcdFx0c3R5bGVzOiBbeyBcImZlYXR1cmVUeXBlXCI6IFwiYWRtaW5pc3RyYXRpdmVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy50ZXh0LmZpbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDQ0NDQ0XCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwibGFuZHNjYXBlXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjZjJmMmYyXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicG9pXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJzYXR1cmF0aW9uXCI6IC0xMDAgfSwgeyBcImxpZ2h0bmVzc1wiOiA0NSB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkLmhpZ2h3YXlcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwic2ltcGxpZmllZFwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuYXJ0ZXJpYWxcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy5pY29uXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJ0cmFuc2l0XCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcIndhdGVyXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDZiY2VjXCIgfSwgeyBcInZpc2liaWxpdHlcIjogXCJvblwiIH1dIH1dLFxyXG5cdFx0XHRcdHpvb206IHpvb21cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmluc3RhbmNlLCAndGlsZXNsb2FkZWQnLCAoKSA9PiB7XHJcblx0XHRcdFx0dmFyIHJlc3VsdDtcclxuXHJcblx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5pbnN0YW5jZSwgJ3RpbGVzbG9hZGVkJyk7XHJcblxyXG5cdFx0XHRcdHJlc3VsdCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgdmlzaWJsZSBtYXJrZXJzIGJ5IGEgbWF0Y2hpbmcgdmFsdWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyTWFya2VycyhzZWFyY2g/OiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKHNlYXJjaCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFRpdGxlKCkudG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWZ1bCB3aGVuIG1hcmtlcnMgY2hhbmdlIHRvIHJlZmxlY3QgdGhvc2UgY2hhbmdlc1xyXG5cdFx0ICogaW4gdGhlIGhlYXRtYXBwaW5nXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlckhlYXRNYXAoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5sZW5ndGggPSAwO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFZpc2libGUoKSkge1xyXG5cdFx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0R2VvUG9zaXRpb24obWFya2VyPzogZ29vZ2xlLm1hcHMuTWFya2VyKTogbmcuSVByb21pc2U8Z29vZ2xlLm1hcHMuTGF0TG5nPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKSxcclxuXHRcdFx0XHRyZXN1bHQ7XHJcblxyXG5cdFx0XHRyZXN1bHQgPSB0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgbWFya2VycyBmcm9tIGVuZHBvaW50XHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEFQSSBlbmRwb2ludFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPDxBcnJheTxNYXJrZXI+Pn0gQW4gYXJyYXkgb2YgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRnZXRNYXJrZXJzKHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PE1hcmtlcj4+IHtcclxuXHRcdFx0dmFyIHJlc3VsdDogbmcuSVByb21pc2U8YW55PiA9IHRoaXMuSHR0cFNlcnZpY2UuZ2V0KHBhdGgpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT3BlbiBpbmZvd2luZG93LCBjbG9zZSBvdGhlcnNcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5NYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge2dvb2dsZS5tYXBzLkluZm9XaW5kb3d9IGluZm9XaW5kb3cgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRvcGVuSW5mb1dpbmRvdyhtYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlciwgaW5mb1dpbmRvdzogZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyk6IHZvaWQge1xyXG5cdFx0XHRtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbmZvV2luZG93cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dGhpcy5pbmZvV2luZG93c1tpXS5jbG9zZSgpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aW5mb1dpbmRvdy5vcGVuKHRoaXMuaW5zdGFuY2UsIG1hcmtlcik7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHJlbW92ZUdlb01hcmtlcnMoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9NYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9NYXJrZXJzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb0NpcmNsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmdlb0NpcmNsZXNbaV0uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXNldCBtYXJrZXJzXHJcblx0XHQgKi9cclxuXHRcdHJlc2V0KCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ01hcFNlcnZpY2UnLCBNYXBTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgUG9rZW1vblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SVBva2Vtb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRodHRwJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JSHR0cFByb21pc2U8QXJyYXk8UG9rZW1vbj4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxQb2tlbW9uPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ1Bva2Vtb25TZXJ2aWNlJywgUG9rZW1vblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIERyb3Bkb3duIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJRHJvcGRvd25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIERyb3Bkb3duQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0XHJcblx0XHRdO1xyXG5cdFx0XHJcblx0XHRwdWJsaWMgc3RhdGU6IGJvb2xlYW47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuc3RhdGUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR0b2dnbGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuc3RhdGUgPSAhdGhpcy5zdGF0ZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBEcm9wZG93bkRpcmVjdGl2ZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtuZy5JRGlyZWN0aXZlfVxyXG5cdCAqL1xyXG5cdGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcblx0XHRwdWJsaWMgYmluZFRvQ29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXI6IGFueTtcclxuXHRcdHB1YmxpYyBjb250cm9sbGVyQXM6IGFueTtcclxuXHRcdHB1YmxpYyByZXBsYWNlOiBib29sZWFuO1xyXG5cdFx0cHVibGljIHNjb3BlOiBib29sZWFuO1xyXG5cdFx0cHVibGljIHRlbXBsYXRlVXJsOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgdHJhbnNjbHVkZTogYW55O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLmJpbmRUb0NvbnRyb2xsZXIgPSB7XHJcblx0XHRcdFx0bGVmdDogJ0AnLFxyXG5cdFx0XHRcdG9iamVjdDogJ0AnLFxyXG5cdFx0XHRcdHJpZ2h0OiAnQCdcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIgPSBEcm9wZG93bkNvbnRyb2xsZXI7XHJcblx0XHRcdHRoaXMuY29udHJvbGxlckFzID0gJ0Ryb3Bkb3duJztcclxuXHRcdFx0dGhpcy5yZXBsYWNlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5zY29wZSA9IHRydWU7XHJcblx0XHRcdHRoaXMudGVtcGxhdGVVcmwgPSAnL2RpcmVjdGl2ZXMvZHJvcGRvd24vdmlld3MvZHJvcGRvd24uaHRtbCdcclxuXHRcdFx0dGhpcy50cmFuc2NsdWRlID0ge1xyXG5cdFx0XHRcdHRpdGxlOiAnP2Ryb3Bkb3duVGl0bGUnLFxyXG5cdFx0XHRcdHJlc3VsdDogJz9kcm9wZG93blJlc3VsdCdcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JRGlyZWN0aXZlfSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHN0YXRpYyBpbnN0YW5jZSgpOiBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEcm9wZG93bkRpcmVjdGl2ZSgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtuZy5JU2NvcGV9IHNjb3BlIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bmcuSUF1Z21lbnRlZEpRdWVyeX0gZWxlbWVudCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpOiB2b2lkIHtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnZHJvcGRvd24nLCBEcm9wZG93bkRpcmVjdGl2ZS5pbnN0YW5jZSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
