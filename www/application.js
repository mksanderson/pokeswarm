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
                .when('/page', {
                controller: 'PageController',
                controllerAs: 'Page',
                templateUrl: '/templates/page.html'
            })
                .when('/form', {
                controller: 'FormController',
                controllerAs: 'Form',
                templateUrl: '/templates/form.html'
            })
                .when('/map', {
                controller: 'MapController',
                controllerAs: 'Map',
                templateUrl: '/templates/map.html'
            })
                .otherwise('/map');
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
        function ApplicationController(FirebaseService, LocationService, WindowService) {
            this.FirebaseService = FirebaseService;
            this.LocationService = LocationService;
            this.WindowService = WindowService;
            FirebaseService.configure();
        }
        /**
         * Reload the entire map to check for updates
         */
        ApplicationController.prototype.reload = function () {
            this.WindowService.location.reload();
        };
        /**
         * Check that the current path matches the location path
         *
         * @param {string} path (description)
         * @returns {boolean} (description)
         */
        ApplicationController.prototype.currentRoute = function (path) {
            if (path == this.LocationService.path()) {
                return true;
            }
            else {
                return false;
            }
        };
        ApplicationController.$inject = [
            'FirebaseService',
            '$location',
            '$window'
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
     * Core controller for form functions
     *
     * @class FormController
     */
    var FormController = (function () {
        function FormController(GeolocationService, FirebaseService, MapService) {
            this.GeolocationService = GeolocationService;
            this.FirebaseService = FirebaseService;
            this.MapService = MapService;
            GeolocationService.get().then(function (response) {
                MapService.createMap(document.getElementById('location'), response.coords.latitude, response.coords.longitude, 16).then(function (response) {
                });
                MapService.addGeoMarker(true, response);
            });
        }
        /**
         * Relocate the user
         */
        FormController.prototype.relocate = function () {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                _this.MapService.removeGeoMarkers();
                _this.MapService.addGeoMarker(true, response);
            });
        };
        /**
         * (description)
         *
         * @param {Sighting} record (description)
         */
        FormController.prototype.submit = function (name) {
            var _this = this;
            if (name) {
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
                            _this.name = '';
                            _this.toggle();
                        });
                    });
                });
            }
            else {
                this.error = true;
            }
        };
        /**
         * (description)
         */
        FormController.prototype.toggle = function () {
            this.state = !this.state;
        };
        FormController.$inject = [
            'GeolocationService',
            'FirebaseService',
            'MapService'
        ];
        return FormController;
    }());
    angular
        .module('Client')
        .controller('FormController', FormController);
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
                MapService.addGeoMarker(false, response);
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
         * Relocate the user
         */
        MapController.prototype.relocate = function () {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                _this.MapService.removeGeoMarkers();
                _this.MapService.addGeoMarker(false, response);
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
    /**
     * Core controller for content pages
     *
     * @class PageController
     */
    var PageController = (function () {
        function PageController() {
        }
        PageController.$inject = [];
        return PageController;
    }());
    angular
        .module('Client')
        .controller('PageController', PageController);
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
         * @param {boolean} draggable (description)
         * @param {Marker} marker (description)
         */
        MapService.prototype.addGeoMarker = function (draggable, position) {
            var _this = this;
            this.geoMarker = new google.maps.Marker({
                draggable: draggable,
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
            if (draggable) {
                this.geoMarker.addListener('dragend', function () {
                    _this.getGeoPosition(_this.geoMarker);
                });
            }
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
                maxZoom: 20,
                minZoom: 12,
                styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }],
                zoom: zoom
            });
            // Check when the map is ready and return a promise
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsInNlcnZpY2VzL0ZpcmViYXNlU2VydmljZS50cyIsInNlcnZpY2VzL0dlb2xvY2F0aW9uU2VydmljZS50cyIsInNlcnZpY2VzL01hcFNlcnZpY2UudHMiLCJzZXJ2aWNlcy9Qb2tlbW9uU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU1wQjtBQU5ELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsU0FBUztRQUNULFVBQVU7S0FDVixDQUFDLENBQUM7QUFDTCxDQUFDLEVBTlMsV0FBVyxLQUFYLFdBQVcsUUFNcEI7QUNQRCxJQUFVLFdBQVcsQ0FhcEI7QUFiRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBRXRCO1FBQ0MsMEJBQ1EsZ0JB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UixRQUFRLFFBZ0ZqQiIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblx0XHRhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydDbGllbnQnXSk7XHJcblx0fSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIvPlxyXG5uYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdDbGllbnQnLCBcclxuXHRcdFtcclxuXHRcdFx0J25nUm91dGUnLFxyXG5cdFx0XHQnb2ZmQ2xpY2snXHJcblx0XHRdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0XHJcblx0ZXhwb3J0IGNsYXNzIExvY2F0aW9uUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIExvY2F0aW9uUHJvdmlkZXI6IG5nLklMb2NhdGlvblByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsIExvY2F0aW9uUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIFJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRSb3V0ZVByb3ZpZGVyXHJcblx0XHRcdFx0LndoZW4oJy9wYWdlJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonUGFnZUNvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnUGFnZScsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9wYWdlLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL2Zvcm0nLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvbWFwJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonTWFwQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdNYXAnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSgnL21hcCcpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBSb3V0ZVByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnJGxvY2F0aW9uJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBkYXRhOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTG9jYXRpb25TZXJ2aWNlOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmNvbmZpZ3VyZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2FkIHRoZSBlbnRpcmUgbWFwIHRvIGNoZWNrIGZvciB1cGRhdGVzXHJcblx0XHQgKi9cclxuXHRcdHJlbG9hZCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5XaW5kb3dTZXJ2aWNlLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hlY2sgdGhhdCB0aGUgY3VycmVudCBwYXRoIG1hdGNoZXMgdGhlIGxvY2F0aW9uIHBhdGhcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3VycmVudFJvdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW57XHJcblx0XHRcdGlmKHBhdGggPT0gdGhpcy5Mb2NhdGlvblNlcnZpY2UucGF0aCgpKXtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdBcHBsaWNhdGlvbkNvbnRyb2xsZXInLCBBcHBsaWNhdGlvbkNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHQvKipcclxuXHQgKiBDb3JlIGNvbnRyb2xsZXIgZm9yIGZvcm0gZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEZvcm1Db250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgRm9ybUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdHZW9sb2NhdGlvblNlcnZpY2UnLFxyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBlcnJvcjogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgc3RhdGU6IGJvb2xlYW47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdEdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdE1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2NhdGlvbicpLCByZXNwb25zZS5jb29yZHMubGF0aXR1ZGUsIHJlc3BvbnNlLmNvb3Jkcy5sb25naXR1ZGUsIDE2KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0TWFwU2VydmljZS5hZGRHZW9NYXJrZXIodHJ1ZSwgcmVzcG9uc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9jYXRlIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdHJlbG9jYXRlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcih0cnVlLCByZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQobmFtZTogc3RyaW5nKSB7XHJcblx0XHRcdGlmIChuYW1lKSB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmdldEdlb1Bvc2l0aW9uKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiB7XHJcblx0XHRcdFx0XHRcdFx0J2Nvb3Jkcyc6IHtcclxuXHRcdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2xvbmdpdHVkZSc6IHBvc2l0aW9uLmxuZygpXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHQndGltZXN0YW1wJzogTWF0aC5mbG9vcihEYXRlLm5vdygpKVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQnbmFtZSc6IG5hbWVcclxuXHRcdFx0XHRcdH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy50b2dnbGUoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZXJyb3IgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIEZvcm1Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBsb2FkZWQ6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgbG9jYXRpb246IFBvc2l0aW9uO1xyXG5cdFx0cHVibGljIG1lc3NhZ2U6IHN0cmluZztcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0R2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZS5jb29yZHMubGF0aXR1ZGUsIHJlc3BvbnNlLmNvb3Jkcy5sb25naXR1ZGUsIDE2KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5sb2FkZWQgPSByZXNwb25zZTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihmYWxzZSwgcmVzcG9uc2UpO1xyXG5cdFx0XHR9KS5jYXRjaCgocmVhc29uKSA9PiB7XHJcblx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCAyNywgMTUzLCAyKTtcclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEhlYXRtYXAoKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgbWFwIGl0ZW1zIGJhc2VkIG9uIHRoZSBzZWFyY2ggbW9kZWxcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IFtzZWFyY2hdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyKHNlYXJjaD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVyTWFya2VycyhzZWFyY2gpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJIZWF0TWFwKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2NhdGUgdGhlIHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2NhdGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuR2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnJlbW92ZUdlb01hcmtlcnMoKTtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuYWRkR2VvTWFya2VyKGZhbHNlLCByZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgY29udGVudCBwYWdlc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQYWdlQ29udHJvbGxlclxyXG5cdCAqL1xyXG5cdGNsYXNzIFBhZ2VDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdCkge1xyXG5cdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDb250cm9sbGVyJywgUGFnZUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRkZWNsYXJlIHZhciBmaXJlYmFzZTogYW55O1xyXG5cclxuXHRleHBvcnQgY2xhc3MgRmlyZWJhc2VTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnXHJcblx0XHRdXHJcblxyXG5cdFx0cHJpdmF0ZSBmaXJlYmFzZTogYW55O1xyXG5cdFx0cHJpdmF0ZSBzaWdodGluZ3MgPSBuZXcgQXJyYXk8UG9rZW1vbj4oKTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IHVwIGNvbm5lY3Rpb24gdG8gZGF0YWJhc2VcclxuXHRcdCAqL1xyXG5cdFx0Y29uZmlndXJlKCk6IHZvaWQge1xyXG5cdFx0XHR2YXIgY29uZmlnID0ge1xyXG5cdFx0XHRcdGFwaUtleTogXCJBSXphU3lDWDhGM09DYXpyeDhBMFhsTkE0ajNLZ1ptT091eVBiTlFcIixcclxuXHRcdFx0XHRhdXRoRG9tYWluOiBcInBva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWFwcC5jb21cIixcclxuXHRcdFx0XHRkYXRhYmFzZVVSTDogXCJodHRwczovL3Bva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWlvLmNvbVwiLFxyXG5cdFx0XHRcdHN0b3JhZ2VCdWNrZXQ6IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmFwcHNwb3QuY29tXCIsXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0aGlzLmZpcmViYXNlID0gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHsqfSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdCA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZihwYXRoKS5vbigndmFsdWUnLCAoKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0cmVzcG9uc2UuZm9yRWFjaCgoc2lnaHRpbmcpID0+IHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHNpZ2h0aW5nKTtcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdH0pKVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdXNoKHJlY29yZDogYW55KTogbmcuSVByb21pc2U8YW55PiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUodGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpLnB1c2gocmVjb3JkKSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnRmlyZWJhc2VTZXJ2aWNlJywgRmlyZWJhc2VTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIGFuZCB1c2UgZ2VvbG9jYXRpb25cclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTG9jYXRpb25TZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lMb2NhdGlvblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIEdlb2xvY2F0aW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcTogbmcuSVFTZXJ2aWNlLCBwcml2YXRlIHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldCgpOiBuZy5JUHJvbWlzZTxQb3NpdGlvbj4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLnEuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMud2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHBvc2l0aW9uKTtcclxuXHRcdFx0XHR9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdHZW9sb2NhdGlvblNlcnZpY2UnLCBHZW9sb2NhdGlvblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBTZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBTZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBNYXBTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGZpbHRlcicsXHJcblx0XHRcdCckaHR0cCcsXHJcblx0XHRcdCckcSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBhY3RpdmU6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZG9tOiBFbGVtZW50O1xyXG5cdFx0cHJpdmF0ZSBnZW9NYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZ2VvQ2lyY2xlOiBnb29nbGUubWFwcy5DaXJjbGU7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdHByaXZhdGUgaGVhdG1hcCA9IG5ldyBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcjtcclxuXHRcdHByaXZhdGUgaGVhdG1hcFBvaW50cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5MYXRMbmc+KCk7XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkluZm9XaW5kb3c+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpbHRlclNlcnZpY2U6IG5nLklGaWx0ZXJTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIG1hcmtlcnMgZnJvbSBBUEkgdG8gdGhlIG1hcFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PE1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhZGRNYXJrZXJzKG1hcmtlcnM6IEFycmF5PE1hcmtlcj4pOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdFx0c2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoNjAsIDYwKSxcclxuXHRcdFx0XHRcdFx0dXJsOiAnL2FwaS9wb2tlbW9uL2ljb25zLycgKyBtYXJrZXJzW2ldLm5hbWUgKyAnLmljbycsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdFx0XHR0aXRsZTogbWFya2Vyc1tpXS5uYW1lLFxyXG5cdFx0XHRcdFx0ekluZGV4OiAxXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcclxuXHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlcnNbaV0ubmFtZSArICcgKEFkZGVkICcgKyB0aGlzLkZpbHRlclNlcnZpY2UoJ2RhdGUnKShtYXJrZXJzW2ldLnBvc2l0aW9uLnRpbWVzdGFtcCkgKyAnKSdcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzLnB1c2godGhpcy5pbmZvV2luZG93KTtcclxuXHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzLnB1c2godGhpcy5tYXJrZXIpO1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KHRoaXMubWFya2VyLCB0aGlzLmluZm9XaW5kb3cpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBtYXJrZXIgZm9yIHVzZXJzIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHQgKiBEZXBlbmRzIG9uIHRoZSBHZW9sb2NhdGlvblNlcnZpY2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBkcmFnZ2FibGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEdlb01hcmtlcihkcmFnZ2FibGU6IGJvb2xlYW4sIHBvc2l0aW9uOiBQb3NpdGlvbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmdlb01hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdGRyYWdnYWJsZTogZHJhZ2dhYmxlLFxyXG5cdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IDAuMzUsXHJcblx0XHRcdFx0XHRwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcclxuXHRcdFx0XHRcdHNjYWxlOiA4LFxyXG5cdFx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCk7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlcnMucHVzaCh0aGlzLmdlb01hcmtlcik7XHJcblxyXG5cdFx0XHRpZihkcmFnZ2FibGUpe1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2VyLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5nZXRHZW9Qb3NpdGlvbih0aGlzLmdlb01hcmtlcik7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcclxuXHRcdFx0Ly8gXHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdC8vIFx0KSxcclxuXHRcdFx0Ly8gXHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRmaWxsT3BhY2l0eTogMC4xNSxcclxuXHRcdFx0Ly8gXHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdC8vIFx0cmFkaXVzOiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgKiAzLFxyXG5cdFx0XHQvLyBcdHN0cm9rZUNvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0c3Ryb2tlT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0Ly8gXHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0Ly8gfSk7XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZXMucHVzaCh0aGlzLmdlb0NpcmNsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGhlYXRtYXAgdG8gdGhlIG1hcCBpbnN0YW5jZSBieVxyXG5cdFx0ICogcGFzc2luZyBpbiBtYXAgcG9pbnRzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEhlYXRtYXAoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXIoe1xyXG5cdFx0XHRcdGRhdGE6IHRoaXMuaGVhdG1hcFBvaW50cyxcclxuXHRcdFx0XHRyYWRpdXM6IDUwXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiBuZy5JUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdHRoaXMuZG9tID0gZG9tO1xyXG5cclxuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5kb20sIHtcclxuXHRcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsbmcpLFxyXG5cdFx0XHRcdGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcblx0XHRcdFx0bWF4Wm9vbTogMjAsXHJcblx0XHRcdFx0bWluWm9vbTogMTIsXHJcblx0XHRcdFx0c3R5bGVzOiBbeyBcImZlYXR1cmVUeXBlXCI6IFwiYWRtaW5pc3RyYXRpdmVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy50ZXh0LmZpbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDQ0NDQ0XCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwibGFuZHNjYXBlXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjZjJmMmYyXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicG9pXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJzYXR1cmF0aW9uXCI6IC0xMDAgfSwgeyBcImxpZ2h0bmVzc1wiOiA0NSB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkLmhpZ2h3YXlcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwic2ltcGxpZmllZFwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuYXJ0ZXJpYWxcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy5pY29uXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJ0cmFuc2l0XCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcIndhdGVyXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDZiY2VjXCIgfSwgeyBcInZpc2liaWxpdHlcIjogXCJvblwiIH1dIH1dLFxyXG5cdFx0XHRcdHpvb206IHpvb21cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBDaGVjayB3aGVuIHRoZSBtYXAgaXMgcmVhZHkgYW5kIHJldHVybiBhIHByb21pc2VcclxuXHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5pbnN0YW5jZSwgJ3RpbGVzbG9hZGVkJywgKCkgPT4ge1xyXG5cdFx0XHRcdHZhciByZXN1bHQ7XHJcblxyXG5cdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMuaW5zdGFuY2UsICd0aWxlc2xvYWRlZCcpO1xyXG5cclxuXHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGaWx0ZXIgdGhlIHZpc2libGUgbWFya2VycyBieSBhIG1hdGNoaW5nIHZhbHVlXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlck1hcmtlcnMoc2VhcmNoPzogc3RyaW5nKTogbmcuSVByb21pc2U8c3RyaW5nPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmIChzZWFyY2gpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMubWFya2Vyc1tpXS5nZXRUaXRsZSgpLnRvTG93ZXJDYXNlKCkgPT09IHNlYXJjaC50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKGZhbHNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVc2VmdWwgd2hlbiBtYXJrZXJzIGNoYW5nZSB0byByZWZsZWN0IHRob3NlIGNoYW5nZXNcclxuXHRcdCAqIGluIHRoZSBoZWF0bWFwcGluZ1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXJIZWF0TWFwKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMubGVuZ3RoID0gMDtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFya2Vyc1tpXS5nZXRWaXNpYmxlKCkpIHtcclxuXHRcdFx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5wdXNoKHRoaXMubWFya2Vyc1tpXS5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuaGVhdG1hcC5zZXRNYXAodGhpcy5pbnN0YW5jZSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldEdlb1Bvc2l0aW9uKG1hcmtlcj86IGdvb2dsZS5tYXBzLk1hcmtlcik6IG5nLklQcm9taXNlPGdvb2dsZS5tYXBzLkxhdExuZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0O1xyXG5cclxuXHRcdFx0cmVzdWx0ID0gdGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IG1hcmtlcnMgZnJvbSBlbmRwb2ludFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBUEkgZW5kcG9pbnRcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTw8QXJyYXk8TWFya2VyPj59IEFuIGFycmF5IG9mIG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0Z2V0TWFya2VycyhwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxNYXJrZXI+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE9wZW4gaW5mb3dpbmRvdywgY2xvc2Ugb3RoZXJzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuTWFya2VyfSBtYXJrZXIgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5JbmZvV2luZG93fSBpbmZvV2luZG93IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0b3BlbkluZm9XaW5kb3cobWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXIsIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3cpOiB2b2lkIHtcclxuXHRcdFx0bWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5mb1dpbmRvd3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3NbaV0uY2xvc2UoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGluZm9XaW5kb3cub3Blbih0aGlzLmluc3RhbmNlLCBtYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZW1vdmVHZW9NYXJrZXJzKCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvTWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2Vyc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9DaXJjbGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9DaXJjbGVzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdNYXBTZXJ2aWNlJywgTWFwU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIFBva2Vtb25TZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lQb2tlbW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vblNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckaHR0cCdcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBIdHRwU2VydmljZTogbmcuSUh0dHBTZXJ2aWNlKSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSUh0dHBQcm9taXNlPEFycmF5PFBva2Vtb24+Pn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8UG9rZW1vbj4+IHtcclxuXHRcdFx0dmFyIHJlc3VsdDogbmcuSVByb21pc2U8YW55PiA9IHRoaXMuSHR0cFNlcnZpY2UuZ2V0KHBhdGgpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdQb2tlbW9uU2VydmljZScsIFBva2Vtb25TZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBEcm9wZG93biB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SURyb3Bkb3duQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0cHVibGljIHN0YXRlOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25EaXJlY3RpdmVcclxuXHQgKiBAaW1wbGVtZW50cyB7bmcuSURpcmVjdGl2ZX1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkRpcmVjdGl2ZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG5cdFx0cHVibGljIGJpbmRUb0NvbnRyb2xsZXI6IGFueTtcclxuXHRcdHB1YmxpYyBjb250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlckFzOiBhbnk7XHJcblx0XHRwdWJsaWMgcmVwbGFjZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBzY29wZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyB0ZW1wbGF0ZVVybDogc3RyaW5nO1xyXG5cdFx0cHVibGljIHRyYW5zY2x1ZGU6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5iaW5kVG9Db250cm9sbGVyID0ge1xyXG5cdFx0XHRcdGxlZnQ6ICdAJyxcclxuXHRcdFx0XHRvYmplY3Q6ICdAJyxcclxuXHRcdFx0XHRyaWdodDogJ0AnXHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5jb250cm9sbGVyID0gRHJvcGRvd25Db250cm9sbGVyO1xyXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXJBcyA9ICdEcm9wZG93bic7XHJcblx0XHRcdHRoaXMucmVwbGFjZSA9IHRydWU7XHJcblx0XHRcdHRoaXMuc2NvcGUgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnRlbXBsYXRlVXJsID0gJy9kaXJlY3RpdmVzL2Ryb3Bkb3duL3ZpZXdzL2Ryb3Bkb3duLmh0bWwnXHJcblx0XHRcdHRoaXMudHJhbnNjbHVkZSA9IHtcclxuXHRcdFx0XHR0aXRsZTogJz9kcm9wZG93blRpdGxlJyxcclxuXHRcdFx0XHRyZXN1bHQ6ICc/ZHJvcGRvd25SZXN1bHQnXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSURpcmVjdGl2ZX0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdGF0aWMgaW5zdGFuY2UoKTogbmcuSURpcmVjdGl2ZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRHJvcGRvd25EaXJlY3RpdmUoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7bmcuSVNjb3BlfSBzY29wZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge25nLklBdWdtZW50ZWRKUXVlcnl9IGVsZW1lbnQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KTogdm9pZCB7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5kaXJlY3RpdmUoJ2Ryb3Bkb3duJywgRHJvcGRvd25EaXJlY3RpdmUuaW5zdGFuY2UpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
