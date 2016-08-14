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
        function FormController(GeolocationService, FirebaseService, MapService, TimeoutService) {
            this.GeolocationService = GeolocationService;
            this.FirebaseService = FirebaseService;
            this.MapService = MapService;
            this.TimeoutService = TimeoutService;
            TimeoutService(function () {
                GeolocationService.get().then(function (response) {
                    MapService.createMap(document.getElementById('location'), response.coords.latitude, response.coords.longitude, 16).then(function (response) {
                    });
                    MapService.addGeoMarker(true, response);
                });
            }, 0);
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
            'MapService',
            '$timeout'
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
        function MapController(FirebaseService, GeolocationService, MapService, TimeoutService, WindowService) {
            var _this = this;
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            this.TimeoutService = TimeoutService;
            this.WindowService = WindowService;
            TimeoutService(function () {
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
            }, 0);
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
         * Used for resizing the map, ie: making it full screen
         */
        MapController.prototype.resize = function () {
            this.fullscreen = !this.fullscreen;
            this.MapService.resize();
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
            '$timeout',
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
        function MapService(FilterService, HttpService, QService, TimeoutService) {
            this.FilterService = FilterService;
            this.HttpService = HttpService;
            this.QService = QService;
            this.TimeoutService = TimeoutService;
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
            this.TimeoutService(function () {
            }, 0);
            this.instance = new google.maps.Map(this.dom, {
                center: new google.maps.LatLng(lat, lng),
                disableDefaultUI: true,
                maxZoom: 20,
                minZoom: 12,
                styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }],
                zoom: zoom
            });
            google.maps.event.addDomListener(window, 'resize', function () {
                _this.instance.setCenter(new google.maps.LatLng(lat, lng));
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
        MapService.prototype.resize = function () {
            var _this = this;
            this.TimeoutService(function () {
                google.maps.event.trigger(_this.instance, 'resize');
                _this.instance.setCenter(_this.geoMarker.getPosition());
            }, 0);
        };
        MapService.$inject = [
            '$filter',
            '$http',
            '$q',
            '$timeout'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsInNlcnZpY2VzL0ZpcmViYXNlU2VydmljZS50cyIsInNlcnZpY2VzL0dlb2xvY2F0aW9uU2VydmljZS50cyIsInNlcnZpY2VzL01hcFNlcnZpY2UudHMiLCJzZXJ2aWNlcy9Qb2tlbW9uU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU1wQjtBQU5ELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsU0FBUztRQUNULFVBQVU7S0FDVixDQUFDLENBQUM7QUFDTCxDQUFDLEVBTlMsV0FBVyxLQUFYLFdBQVcsUUFNcEI7QUNQRCxJQUFVLFdBQVcsQ0FhcEI7QUFiRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBRXRCO1FBQ0MsMEJBQ1EsZ0JB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Y2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHRcdGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0NsaWVudCddKTtcclxuXHR9KTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XHJcbm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ0NsaWVudCcsIFxyXG5cdFx0W1xyXG5cdFx0XHQnbmdSb3V0ZScsXHJcblx0XHRcdCdvZmZDbGljaydcclxuXHRcdF0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRcclxuXHRleHBvcnQgY2xhc3MgTG9jYXRpb25Qcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgTG9jYXRpb25Qcm92aWRlcjogbmcuSUxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgTG9jYXRpb25Qcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUm91dGVQcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgUm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFJvdXRlUHJvdmlkZXJcclxuXHRcdFx0XHQud2hlbignL3BhZ2UnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidQYWdlQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdQYWdlJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL3BhZ2UuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvZm9ybScsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0Zvcm1Db250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0Zvcm0nLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvZm9ybS5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9tYXAnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidNYXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ01hcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9tYXAuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQub3RoZXJ3aXNlKCcvbWFwJylcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIFJvdXRlUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBnbG9iYWwgZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJQXBwbGljYXRpb25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCckbG9jYXRpb24nLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGRhdGE6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBMb2NhdGlvblNlcnZpY2U6IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgV2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHRGaXJlYmFzZVNlcnZpY2UuY29uZmlndXJlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvYWQgdGhlIGVudGlyZSBtYXAgdG8gY2hlY2sgZm9yIHVwZGF0ZXNcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2FkKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayB0aGF0IHRoZSBjdXJyZW50IHBhdGggbWF0Y2hlcyB0aGUgbG9jYXRpb24gcGF0aFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjdXJyZW50Um91dGUocGF0aDogc3RyaW5nKTogYm9vbGVhbntcclxuXHRcdFx0aWYocGF0aCA9PSB0aGlzLkxvY2F0aW9uU2VydmljZS5wYXRoKCkpe1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0FwcGxpY2F0aW9uQ29udHJvbGxlcicsIEFwcGxpY2F0aW9uQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZm9ybSBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRm9ybUNvbnRyb2xsZXJcclxuXHQgKi9cclxuXHRjbGFzcyBGb3JtQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCckdGltZW91dCdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGVycm9yOiBib29sZWFuO1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFRpbWVvdXRTZXJ2aWNlOiBuZy5JVGltZW91dFNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHRUaW1lb3V0U2VydmljZSgoKSA9PiB7XHJcblx0XHRcdFx0R2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmNyZWF0ZU1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9jYXRpb24nKSwgcmVzcG9uc2UuY29vcmRzLmxhdGl0dWRlLCByZXNwb25zZS5jb29yZHMubG9uZ2l0dWRlLCAxNikudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuYWRkR2VvTWFya2VyKHRydWUsIHJlc3BvbnNlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSwgMClcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9jYXRlIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdHJlbG9jYXRlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcih0cnVlLCByZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQobmFtZTogc3RyaW5nKSB7XHJcblx0XHRcdGlmIChuYW1lKSB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmdldEdlb1Bvc2l0aW9uKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiB7XHJcblx0XHRcdFx0XHRcdFx0J2Nvb3Jkcyc6IHtcclxuXHRcdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2xvbmdpdHVkZSc6IHBvc2l0aW9uLmxuZygpXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHQndGltZXN0YW1wJzogTWF0aC5mbG9vcihEYXRlLm5vdygpKVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQnbmFtZSc6IG5hbWVcclxuXHRcdFx0XHRcdH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy50b2dnbGUoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZXJyb3IgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIEZvcm1Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0JyR0aW1lb3V0JyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBmdWxsc2NyZWVuOiBib29sZWFuO1xyXG5cdFx0cHVibGljIGxvYWRlZDogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBsb2NhdGlvbjogUG9zaXRpb247XHJcblx0XHRwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEdlb2xvY2F0aW9uU2VydmljZTogR2VvbG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIE1hcFNlcnZpY2U6IE1hcFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgVGltZW91dFNlcnZpY2U6IG5nLklUaW1lb3V0U2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdFRpbWVvdXRTZXJ2aWNlKCgpID0+IHtcclxuXHRcdFx0XHRHZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgcmVzcG9uc2UuY29vcmRzLmxhdGl0dWRlLCByZXNwb25zZS5jb29yZHMubG9uZ2l0dWRlLCAxNikudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5sb2FkZWQgPSByZXNwb25zZTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0TWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZmFsc2UsIHJlc3BvbnNlKTtcclxuXHRcdFx0XHR9KS5jYXRjaCgocmVhc29uKSA9PiB7XHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmNyZWF0ZU1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIDI3LCAxNTMsIDIpO1xyXG5cdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0TWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cdFx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEhlYXRtYXAoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sMClcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgbWFwIGl0ZW1zIGJhc2VkIG9uIHRoZSBzZWFyY2ggbW9kZWxcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IFtzZWFyY2hdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyKHNlYXJjaD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVyTWFya2VycyhzZWFyY2gpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJIZWF0TWFwKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWQgZm9yIHJlc2l6aW5nIHRoZSBtYXAsIGllOiBtYWtpbmcgaXQgZnVsbCBzY3JlZW5cclxuXHRcdCAqL1xyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmZ1bGxzY3JlZW4gPSAhdGhpcy5mdWxsc2NyZWVuO1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVzaXplKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvY2F0ZSB0aGUgdXNlclxyXG5cdFx0ICovXHJcblx0XHRyZWxvY2F0ZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5HZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVtb3ZlR2VvTWFya2VycygpO1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZmFsc2UsIHJlc3BvbnNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBjb250ZW50IHBhZ2VzXHJcblx0ICogXHJcblx0ICogQGNsYXNzIFBhZ2VDb250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgUGFnZUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0KSB7XHJcblx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignUGFnZUNvbnRyb2xsZXInLCBQYWdlQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBxOiBuZy5JUVNlcnZpY2UsIHByaXZhdGUgd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMucS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLndpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xyXG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0dlb2xvY2F0aW9uU2VydmljZScsIEdlb2xvY2F0aW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcFNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcFNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIE1hcFNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckZmlsdGVyJyxcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR0aW1lb3V0J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwcml2YXRlIGFjdGl2ZTogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBkb206IEVsZW1lbnQ7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwID0gbmV3IGdvb2dsZS5tYXBzLnZpc3VhbGl6YXRpb24uSGVhdG1hcExheWVyO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwUG9pbnRzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkxhdExuZz4oKTtcclxuXHRcdHByaXZhdGUgaW5zdGFuY2U6IGdvb2dsZS5tYXBzLk1hcDtcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvdzogZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdztcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvd3MgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuSW5mb1dpbmRvdz4oKTtcclxuXHRcdHByaXZhdGUgbWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZTogZ29vZ2xlLm1hcHMuQ2lyY2xlO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdHByaXZhdGUgbWFya2VyQ2lyY2xlcyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5DaXJjbGU+KCk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlsdGVyU2VydmljZTogbmcuSUZpbHRlclNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFRpbWVvdXRTZXJ2aWNlOiBuZy5JVGltZW91dFNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBtYXJrZXJzIGZyb20gQVBJIHRvIHRoZSBtYXBcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkTWFya2VycyhtYXJrZXJzOiBBcnJheTxNYXJrZXI+KTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0XHRpY29uOiB7XHJcblx0XHRcdFx0XHRcdHNjYWxlZFNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDYwLCA2MCksXHJcblx0XHRcdFx0XHRcdHVybDogJy9hcGkvcG9rZW1vbi9pY29ucy8nICsgbWFya2Vyc1tpXS5uYW1lICsgJy5pY28nLFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdFx0bWFya2Vyc1tpXS5wb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdFx0XHQpLFxyXG5cdFx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlLFxyXG5cdFx0XHRcdFx0dGl0bGU6IG1hcmtlcnNbaV0ubmFtZSxcclxuXHRcdFx0XHRcdHpJbmRleDogMVxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR0aGlzLmluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7XHJcblx0XHRcdFx0XHRjb250ZW50OiBtYXJrZXJzW2ldLm5hbWUgKyAnIChBZGRlZCAnICsgdGhpcy5GaWx0ZXJTZXJ2aWNlKCdkYXRlJykobWFya2Vyc1tpXS5wb3NpdGlvbi50aW1lc3RhbXApICsgJyknXHJcblx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0dGhpcy5pbmZvV2luZG93cy5wdXNoKHRoaXMuaW5mb1dpbmRvdyk7XHJcblxyXG5cdFx0XHRcdHRoaXMubWFya2Vycy5wdXNoKHRoaXMubWFya2VyKTtcclxuXHJcblx0XHRcdFx0dGhpcy5vcGVuSW5mb1dpbmRvdyh0aGlzLm1hcmtlciwgdGhpcy5pbmZvV2luZG93KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIGEgbWFya2VyIGZvciB1c2VycyBjdXJyZW50IHBvc2l0aW9uLlxyXG5cdFx0ICogRGVwZW5kcyBvbiB0aGUgR2VvbG9jYXRpb25TZXJ2aWNlXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7Ym9vbGVhbn0gZHJhZ2dhYmxlIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7TWFya2VyfSBtYXJrZXIgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhZGRHZW9NYXJrZXIoZHJhZ2dhYmxlOiBib29sZWFuLCBwb3NpdGlvbjogUG9zaXRpb24pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRkcmFnZ2FibGU6IGRyYWdnYWJsZSxcclxuXHRcdFx0XHRpY29uOiB7XHJcblx0XHRcdFx0XHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0XHRcdGZpbGxPcGFjaXR5OiAwLjM1LFxyXG5cdFx0XHRcdFx0cGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEUsXHJcblx0XHRcdFx0XHRzY2FsZTogOCxcclxuXHRcdFx0XHRcdHN0cm9rZVdlaWdodDogMlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdFx0KSxcclxuXHRcdFx0XHRtYXA6IHRoaXMuaW5zdGFuY2VcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlci5zZXRBbmltYXRpb24oZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1ApO1xyXG5cclxuXHRcdFx0dGhpcy5nZW9NYXJrZXJzLnB1c2godGhpcy5nZW9NYXJrZXIpO1xyXG5cclxuXHRcdFx0aWYgKGRyYWdnYWJsZSkge1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2VyLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5nZXRHZW9Qb3NpdGlvbih0aGlzLmdlb01hcmtlcik7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcclxuXHRcdFx0Ly8gXHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdC8vIFx0KSxcclxuXHRcdFx0Ly8gXHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRmaWxsT3BhY2l0eTogMC4xNSxcclxuXHRcdFx0Ly8gXHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdC8vIFx0cmFkaXVzOiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgKiAzLFxyXG5cdFx0XHQvLyBcdHN0cm9rZUNvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0c3Ryb2tlT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0Ly8gXHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0Ly8gfSk7XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZXMucHVzaCh0aGlzLmdlb0NpcmNsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGhlYXRtYXAgdG8gdGhlIG1hcCBpbnN0YW5jZSBieVxyXG5cdFx0ICogcGFzc2luZyBpbiBtYXAgcG9pbnRzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEhlYXRtYXAoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXIoe1xyXG5cdFx0XHRcdGRhdGE6IHRoaXMuaGVhdG1hcFBvaW50cyxcclxuXHRcdFx0XHRyYWRpdXM6IDUwXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiBuZy5JUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdHRoaXMuZG9tID0gZG9tO1xyXG5cclxuXHRcdFx0dGhpcy5UaW1lb3V0U2VydmljZSgoKSA9PiB7XHJcblxyXG5cdFx0XHR9LCAwKVxyXG5cclxuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5kb20sIHtcclxuXHRcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsbmcpLFxyXG5cdFx0XHRcdGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcblx0XHRcdFx0bWF4Wm9vbTogMjAsXHJcblx0XHRcdFx0bWluWm9vbTogMTIsXHJcblx0XHRcdFx0c3R5bGVzOiBbeyBcImZlYXR1cmVUeXBlXCI6IFwiYWRtaW5pc3RyYXRpdmVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy50ZXh0LmZpbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDQ0NDQ0XCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwibGFuZHNjYXBlXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjZjJmMmYyXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicG9pXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJzYXR1cmF0aW9uXCI6IC0xMDAgfSwgeyBcImxpZ2h0bmVzc1wiOiA0NSB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkLmhpZ2h3YXlcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwic2ltcGxpZmllZFwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuYXJ0ZXJpYWxcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy5pY29uXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJ0cmFuc2l0XCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcIndhdGVyXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDZiY2VjXCIgfSwgeyBcInZpc2liaWxpdHlcIjogXCJvblwiIH1dIH1dLFxyXG5cdFx0XHRcdHpvb206IHpvb21cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCAoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRDZW50ZXIobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZykpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIENoZWNrIHdoZW4gdGhlIG1hcCBpcyByZWFkeSBhbmQgcmV0dXJuIGEgcHJvbWlzZVxyXG5cdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmluc3RhbmNlLCAndGlsZXNsb2FkZWQnLCAoKSA9PiB7XHJcblx0XHRcdFx0dmFyIHJlc3VsdDtcclxuXHJcblx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5pbnN0YW5jZSwgJ3RpbGVzbG9hZGVkJyk7XHJcblxyXG5cdFx0XHRcdHJlc3VsdCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgdmlzaWJsZSBtYXJrZXJzIGJ5IGEgbWF0Y2hpbmcgdmFsdWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyTWFya2VycyhzZWFyY2g/OiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKHNlYXJjaCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFRpdGxlKCkudG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWZ1bCB3aGVuIG1hcmtlcnMgY2hhbmdlIHRvIHJlZmxlY3QgdGhvc2UgY2hhbmdlc1xyXG5cdFx0ICogaW4gdGhlIGhlYXRtYXBwaW5nXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlckhlYXRNYXAoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5sZW5ndGggPSAwO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFZpc2libGUoKSkge1xyXG5cdFx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0R2VvUG9zaXRpb24obWFya2VyPzogZ29vZ2xlLm1hcHMuTWFya2VyKTogbmcuSVByb21pc2U8Z29vZ2xlLm1hcHMuTGF0TG5nPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKSxcclxuXHRcdFx0XHRyZXN1bHQ7XHJcblxyXG5cdFx0XHRyZXN1bHQgPSB0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgbWFya2VycyBmcm9tIGVuZHBvaW50XHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEFQSSBlbmRwb2ludFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPDxBcnJheTxNYXJrZXI+Pn0gQW4gYXJyYXkgb2YgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRnZXRNYXJrZXJzKHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PE1hcmtlcj4+IHtcclxuXHRcdFx0dmFyIHJlc3VsdDogbmcuSVByb21pc2U8YW55PiA9IHRoaXMuSHR0cFNlcnZpY2UuZ2V0KHBhdGgpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT3BlbiBpbmZvd2luZG93LCBjbG9zZSBvdGhlcnNcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5NYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge2dvb2dsZS5tYXBzLkluZm9XaW5kb3d9IGluZm9XaW5kb3cgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRvcGVuSW5mb1dpbmRvdyhtYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlciwgaW5mb1dpbmRvdzogZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyk6IHZvaWQge1xyXG5cdFx0XHRtYXJrZXIuYWRkTGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbmZvV2luZG93cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dGhpcy5pbmZvV2luZG93c1tpXS5jbG9zZSgpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aW5mb1dpbmRvdy5vcGVuKHRoaXMuaW5zdGFuY2UsIG1hcmtlcik7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHJlbW92ZUdlb01hcmtlcnMoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9NYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9NYXJrZXJzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb0NpcmNsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmdlb0NpcmNsZXNbaV0uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXNldCBtYXJrZXJzXHJcblx0XHQgKi9cclxuXHRcdHJlc2V0KCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLlRpbWVvdXRTZXJ2aWNlKCgpID0+IHtcclxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuaW5zdGFuY2UsICdyZXNpemUnKTtcclxuXHRcdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0fSwgMClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnTWFwU2VydmljZScsIE1hcFNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQb2tlbW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJUG9rZW1vblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIFBva2Vtb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGh0dHAnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge25nLklIdHRwUHJvbWlzZTxBcnJheTxQb2tlbW9uPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PFBva2Vtb24+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnUG9rZW1vblNlcnZpY2UnLCBQb2tlbW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
