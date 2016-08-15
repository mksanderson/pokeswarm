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
         * Submit form data to database, reset map, notify user
         *
         * @param {string} name Name of the item being submitted
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
                            _this.MapService.setCenter(position.lat(), position.lng());
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
         *
         * @param {boolean} draggable (description)
         */
        MapController.prototype.relocate = function (draggable) {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                _this.MapService.removeGeoMarkers();
                _this.MapService.addGeoMarker(draggable, response);
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
        /**
         * Triggering resize events
         */
        MapService.prototype.resize = function () {
            var _this = this;
            this.TimeoutService(function () {
                google.maps.event.trigger(_this.instance, 'resize');
                _this.instance.setCenter(_this.geoMarker.getPosition());
            }, 0);
        };
        /**
         * For setting the map to a center point
         *
         * @param {number} latitude
         * @param {number} longitude
         */
        MapService.prototype.setCenter = function (latitude, longitude) {
            this.instance.setCenter(new google.maps.LatLng(latitude, longitude));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsInNlcnZpY2VzL0ZpcmViYXNlU2VydmljZS50cyIsInNlcnZpY2VzL0dlb2xvY2F0aW9uU2VydmljZS50cyIsInNlcnZpY2VzL01hcFNlcnZpY2UudHMiLCJzZXJ2aWNlcy9Qb2tlbW9uU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU1wQjtBQU5ELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsU0FBUztRQUNULFVBQVU7S0FDVixDQUFDLENBQUM7QUFDTCxDQUFDLEVBTlMsV0FBVyxLQUFYLFdBQVcsUUFNcEI7QUNQRCxJQUFVLFdBQVcsQ0FhcEI7QUFiRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBRXRCO1FBQ0MsMEJBQ1EsZ0JB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QUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDeHlCLElBQUksRUFBRSxJQUFJO2FBQ1YsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7Z0JBQ2xELEtBQUksQ0FBQyxR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cyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblx0XHRhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydDbGllbnQnXSk7XHJcblx0fSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIvPlxyXG5uYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdDbGllbnQnLCBcclxuXHRcdFtcclxuXHRcdFx0J25nUm91dGUnLFxyXG5cdFx0XHQnb2ZmQ2xpY2snXHJcblx0XHRdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0XHJcblx0ZXhwb3J0IGNsYXNzIExvY2F0aW9uUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIExvY2F0aW9uUHJvdmlkZXI6IG5nLklMb2NhdGlvblByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsIExvY2F0aW9uUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIFJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRSb3V0ZVByb3ZpZGVyXHJcblx0XHRcdFx0LndoZW4oJy9wYWdlJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonUGFnZUNvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnUGFnZScsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9wYWdlLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL2Zvcm0nLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvbWFwJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonTWFwQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdNYXAnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSgnL21hcCcpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBSb3V0ZVByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnJGxvY2F0aW9uJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBkYXRhOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTG9jYXRpb25TZXJ2aWNlOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmNvbmZpZ3VyZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2FkIHRoZSBlbnRpcmUgbWFwIHRvIGNoZWNrIGZvciB1cGRhdGVzXHJcblx0XHQgKi9cclxuXHRcdHJlbG9hZCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5XaW5kb3dTZXJ2aWNlLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hlY2sgdGhhdCB0aGUgY3VycmVudCBwYXRoIG1hdGNoZXMgdGhlIGxvY2F0aW9uIHBhdGhcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3VycmVudFJvdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW57XHJcblx0XHRcdGlmKHBhdGggPT0gdGhpcy5Mb2NhdGlvblNlcnZpY2UucGF0aCgpKXtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdBcHBsaWNhdGlvbkNvbnRyb2xsZXInLCBBcHBsaWNhdGlvbkNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHQvKipcclxuXHQgKiBDb3JlIGNvbnRyb2xsZXIgZm9yIGZvcm0gZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEZvcm1Db250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgRm9ybUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdHZW9sb2NhdGlvblNlcnZpY2UnLFxyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnJHRpbWVvdXQnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBlcnJvcjogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgc3RhdGU6IGJvb2xlYW47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0VGltZW91dFNlcnZpY2UoKCkgPT4ge1xyXG5cdFx0XHRcdEdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvY2F0aW9uJyksIHJlc3BvbnNlLmNvb3Jkcy5sYXRpdHVkZSwgcmVzcG9uc2UuY29vcmRzLmxvbmdpdHVkZSwgMTYpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEdlb01hcmtlcih0cnVlLCByZXNwb25zZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0sIDApXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWJtaXQgZm9ybSBkYXRhIHRvIGRhdGFiYXNlLCByZXNldCBtYXAsIG5vdGlmeSB1c2VyXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIGl0ZW0gYmVpbmcgc3VibWl0dGVkXHJcblx0XHQgKi9cclxuXHRcdHN1Ym1pdChuYW1lOiBzdHJpbmcpIHtcclxuXHRcdFx0aWYgKG5hbWUpIHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuZ2V0R2VvUG9zaXRpb24oKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UucHVzaCh7XHJcblx0XHRcdFx0XHRcdCdwb3NpdGlvbic6IHtcclxuXHRcdFx0XHRcdFx0XHQnY29vcmRzJzoge1xyXG5cdFx0XHRcdFx0XHRcdFx0J2xhdGl0dWRlJzogcG9zaXRpb24ubGF0KCksXHJcblx0XHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24ubG5nKClcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdCd0aW1lc3RhbXAnOiBNYXRoLmZsb29yKERhdGUubm93KCkpXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdCduYW1lJzogbmFtZVxyXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnNldENlbnRlcihwb3NpdGlvbi5sYXQoKSxwb3NpdGlvbi5sbmcoKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLnRvZ2dsZSgpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5lcnJvciA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgRm9ybUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBDb250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBDb250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIE1hcENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnJHRpbWVvdXQnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGZ1bGxzY3JlZW46IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgbG9hZGVkOiBib29sZWFuO1xyXG5cdFx0cHVibGljIGxvY2F0aW9uOiBQb3NpdGlvbjtcclxuXHRcdHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0VGltZW91dFNlcnZpY2UoKCkgPT4ge1xyXG5cdFx0XHRcdEdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZS5jb29yZHMubGF0aXR1ZGUsIHJlc3BvbnNlLmNvb3Jkcy5sb25naXR1ZGUsIDE2KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmxvYWRlZCA9IHJlc3BvbnNlO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihmYWxzZSwgcmVzcG9uc2UpO1xyXG5cdFx0XHRcdH0pLmNhdGNoKChyZWFzb24pID0+IHtcclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgMjcsIDE1MywgMik7XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRGaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0XHRcdE1hcFNlcnZpY2UuYWRkSGVhdG1hcCgpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSwwKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmlsdGVyIHRoZSBtYXAgaXRlbXMgYmFzZWQgb24gdGhlIHNlYXJjaCBtb2RlbFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gW3NlYXJjaF0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXIoc2VhcmNoPzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJNYXJrZXJzKHNlYXJjaCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmZpbHRlckhlYXRNYXAoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVc2VkIGZvciByZXNpemluZyB0aGUgbWFwLCBpZTogbWFraW5nIGl0IGZ1bGwgc2NyZWVuXHJcblx0XHQgKi9cclxuXHRcdHJlc2l6ZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5mdWxsc2NyZWVuID0gIXRoaXMuZnVsbHNjcmVlbjtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnJlc2l6ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2NhdGUgdGhlIHVzZXJcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBkcmFnZ2FibGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZWxvY2F0ZShkcmFnZ2FibGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5HZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVtb3ZlR2VvTWFya2VycygpO1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZHJhZ2dhYmxlLCByZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgY29udGVudCBwYWdlc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQYWdlQ29udHJvbGxlclxyXG5cdCAqL1xyXG5cdGNsYXNzIFBhZ2VDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdCkge1xyXG5cdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDb250cm9sbGVyJywgUGFnZUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRkZWNsYXJlIHZhciBmaXJlYmFzZTogYW55O1xyXG5cclxuXHRleHBvcnQgY2xhc3MgRmlyZWJhc2VTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnXHJcblx0XHRdXHJcblxyXG5cdFx0cHJpdmF0ZSBmaXJlYmFzZTogYW55O1xyXG5cdFx0cHJpdmF0ZSBzaWdodGluZ3MgPSBuZXcgQXJyYXk8UG9rZW1vbj4oKTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IHVwIGNvbm5lY3Rpb24gdG8gZGF0YWJhc2VcclxuXHRcdCAqL1xyXG5cdFx0Y29uZmlndXJlKCk6IHZvaWQge1xyXG5cdFx0XHR2YXIgY29uZmlnID0ge1xyXG5cdFx0XHRcdGFwaUtleTogXCJBSXphU3lDWDhGM09DYXpyeDhBMFhsTkE0ajNLZ1ptT091eVBiTlFcIixcclxuXHRcdFx0XHRhdXRoRG9tYWluOiBcInBva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWFwcC5jb21cIixcclxuXHRcdFx0XHRkYXRhYmFzZVVSTDogXCJodHRwczovL3Bva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5maXJlYmFzZWlvLmNvbVwiLFxyXG5cdFx0XHRcdHN0b3JhZ2VCdWNrZXQ6IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmFwcHNwb3QuY29tXCIsXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0aGlzLmZpcmViYXNlID0gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHsqfSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdCA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZihwYXRoKS5vbigndmFsdWUnLCAoKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0cmVzcG9uc2UuZm9yRWFjaCgoc2lnaHRpbmcpID0+IHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHNpZ2h0aW5nKTtcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdH0pKVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdXNoKHJlY29yZDogYW55KTogbmcuSVByb21pc2U8YW55PiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUodGhpcy5maXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpLnB1c2gocmVjb3JkKSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnRmlyZWJhc2VTZXJ2aWNlJywgRmlyZWJhc2VTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZldGNoIGFuZCB1c2UgZ2VvbG9jYXRpb25cclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTG9jYXRpb25TZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lMb2NhdGlvblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIEdlb2xvY2F0aW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcTogbmcuSVFTZXJ2aWNlLCBwcml2YXRlIHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldCgpOiBuZy5JUHJvbWlzZTxQb3NpdGlvbj4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLnEuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMud2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvc2l0aW9uKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHBvc2l0aW9uKTtcclxuXHRcdFx0XHR9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdHZW9sb2NhdGlvblNlcnZpY2UnLCBHZW9sb2NhdGlvblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBTZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBTZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBNYXBTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGZpbHRlcicsXHJcblx0XHRcdCckaHR0cCcsXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckdGltZW91dCdcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBhY3RpdmU6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZG9tOiBFbGVtZW50O1xyXG5cdFx0cHJpdmF0ZSBnZW9NYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgZ2VvQ2lyY2xlOiBnb29nbGUubWFwcy5DaXJjbGU7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdHByaXZhdGUgaGVhdG1hcCA9IG5ldyBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcjtcclxuXHRcdHByaXZhdGUgaGVhdG1hcFBvaW50cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5MYXRMbmc+KCk7XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkluZm9XaW5kb3c+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpbHRlclNlcnZpY2U6IG5nLklGaWx0ZXJTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgbWFya2VycyBmcm9tIEFQSSB0byB0aGUgbWFwXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZE1hcmtlcnMobWFya2VyczogQXJyYXk8TWFya2VyPik6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0XHRzY2FsZWRTaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSg2MCwgNjApLFxyXG5cdFx0XHRcdFx0XHR1cmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIG1hcmtlcnNbaV0ubmFtZSArICcuaWNvJyxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdFx0bWFya2Vyc1tpXS5wb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdFx0KSxcclxuXHRcdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZSxcclxuXHRcdFx0XHRcdHRpdGxlOiBtYXJrZXJzW2ldLm5hbWUsXHJcblx0XHRcdFx0XHR6SW5kZXg6IDFcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0dGhpcy5pbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xyXG5cdFx0XHRcdFx0Y29udGVudDogbWFya2Vyc1tpXS5uYW1lICsgJyAoQWRkZWQgJyArIHRoaXMuRmlsdGVyU2VydmljZSgnZGF0ZScpKG1hcmtlcnNbaV0ucG9zaXRpb24udGltZXN0YW1wKSArICcpJ1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3MucHVzaCh0aGlzLmluZm9XaW5kb3cpO1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hcmtlcnMucHVzaCh0aGlzLm1hcmtlcik7XHJcblxyXG5cdFx0XHRcdHRoaXMub3BlbkluZm9XaW5kb3codGhpcy5tYXJrZXIsIHRoaXMuaW5mb1dpbmRvdyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIG1hcmtlciBmb3IgdXNlcnMgY3VycmVudCBwb3NpdGlvbi5cclxuXHRcdCAqIERlcGVuZHMgb24gdGhlIEdlb2xvY2F0aW9uU2VydmljZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge01hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkR2VvTWFya2VyKGRyYWdnYWJsZTogYm9vbGVhbiwgcG9zaXRpb246IFBvc2l0aW9uKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0ZHJhZ2dhYmxlOiBkcmFnZ2FibGUsXHJcblx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdFx0XHRmaWxsT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0XHRcdHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxyXG5cdFx0XHRcdFx0c2NhbGU6IDgsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdCksXHJcblx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QKTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2Vycy5wdXNoKHRoaXMuZ2VvTWFya2VyKTtcclxuXHJcblx0XHRcdGlmIChkcmFnZ2FibGUpIHtcclxuXHRcdFx0XHR0aGlzLmdlb01hcmtlci5hZGRMaXN0ZW5lcignZHJhZ2VuZCcsICgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuZ2V0R2VvUG9zaXRpb24odGhpcy5nZW9NYXJrZXIpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHRoaXMuZ2VvQ2lyY2xlID0gbmV3IGdvb2dsZS5tYXBzLkNpcmNsZSh7XHJcblx0XHRcdC8vIFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHQvLyBcdFx0cG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHQvLyBcdFx0cG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHQvLyBcdCksXHJcblx0XHRcdC8vIFx0ZmlsbENvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0ZmlsbE9wYWNpdHk6IDAuMTUsXHJcblx0XHRcdC8vIFx0bWFwOiB0aGlzLmluc3RhbmNlLFxyXG5cdFx0XHQvLyBcdHJhZGl1czogcG9zaXRpb24uY29vcmRzLmFjY3VyYWN5ICogMyxcclxuXHRcdFx0Ly8gXHRzdHJva2VDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHQvLyBcdHN0cm9rZU9wYWNpdHk6IDAuMzUsXHJcblx0XHRcdC8vIFx0c3Ryb2tlV2VpZ2h0OiAyXHJcblx0XHRcdC8vIH0pO1xyXG5cclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGVzLnB1c2godGhpcy5nZW9DaXJjbGUpO1xyXG5cclxuXHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRDZW50ZXIodGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBoZWF0bWFwIHRvIHRoZSBtYXAgaW5zdGFuY2UgYnlcclxuXHRcdCAqIHBhc3NpbmcgaW4gbWFwIHBvaW50c1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PE1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhZGRIZWF0bWFwKCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5wdXNoKHRoaXMubWFya2Vyc1tpXS5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwID0gbmV3IGdvb2dsZS5tYXBzLnZpc3VhbGl6YXRpb24uSGVhdG1hcExheWVyKHtcclxuXHRcdFx0XHRkYXRhOiB0aGlzLmhlYXRtYXBQb2ludHMsXHJcblx0XHRcdFx0cmFkaXVzOiA1MFxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuaGVhdG1hcC5zZXRNYXAodGhpcy5pbnN0YW5jZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7RWxlbWVudH0gZG9tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxuZyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gem9vbSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGNyZWF0ZU1hcChkb206IEVsZW1lbnQsIGxhdDogbnVtYmVyLCBsbmc6IG51bWJlciwgem9vbTogbnVtYmVyKTogbmcuSVByb21pc2U8Ym9vbGVhbj4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHR0aGlzLmRvbSA9IGRvbTtcclxuXHJcblx0XHRcdHRoaXMuVGltZW91dFNlcnZpY2UoKCkgPT4ge1xyXG5cclxuXHRcdFx0fSwgMClcclxuXHJcblx0XHRcdHRoaXMuaW5zdGFuY2UgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKHRoaXMuZG9tLCB7XHJcblx0XHRcdFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKSxcclxuXHRcdFx0XHRkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxyXG5cdFx0XHRcdG1heFpvb206IDIwLFxyXG5cdFx0XHRcdG1pblpvb206IDEyLFxyXG5cdFx0XHRcdHN0eWxlczogW3sgXCJmZWF0dXJlVHlwZVwiOiBcImFkbWluaXN0cmF0aXZlXCIsIFwiZWxlbWVudFR5cGVcIjogXCJsYWJlbHMudGV4dC5maWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcImNvbG9yXCI6IFwiIzQ0NDQ0NFwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcImxhbmRzY2FwZVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcImNvbG9yXCI6IFwiI2YyZjJmMlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInBvaVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwic2F0dXJhdGlvblwiOiAtMTAwIH0sIHsgXCJsaWdodG5lc3NcIjogNDUgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZC5oaWdod2F5XCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcInNpbXBsaWZpZWRcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkLmFydGVyaWFsXCIsIFwiZWxlbWVudFR5cGVcIjogXCJsYWJlbHMuaWNvblwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwidHJhbnNpdFwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJ3YXRlclwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcImNvbG9yXCI6IFwiIzQ2YmNlY1wiIH0sIHsgXCJ2aXNpYmlsaXR5XCI6IFwib25cIiB9XSB9XSxcclxuXHRcdFx0XHR6b29tOiB6b29tXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIod2luZG93LCAncmVzaXplJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0Q2VudGVyKG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsbmcpKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBDaGVjayB3aGVuIHRoZSBtYXAgaXMgcmVhZHkgYW5kIHJldHVybiBhIHByb21pc2VcclxuXHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5pbnN0YW5jZSwgJ3RpbGVzbG9hZGVkJywgKCkgPT4ge1xyXG5cdFx0XHRcdHZhciByZXN1bHQ7XHJcblxyXG5cdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMuaW5zdGFuY2UsICd0aWxlc2xvYWRlZCcpO1xyXG5cclxuXHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGaWx0ZXIgdGhlIHZpc2libGUgbWFya2VycyBieSBhIG1hdGNoaW5nIHZhbHVlXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlck1hcmtlcnMoc2VhcmNoPzogc3RyaW5nKTogbmcuSVByb21pc2U8c3RyaW5nPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmIChzZWFyY2gpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMubWFya2Vyc1tpXS5nZXRUaXRsZSgpLnRvTG93ZXJDYXNlKCkgPT09IHNlYXJjaC50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKGZhbHNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVc2VmdWwgd2hlbiBtYXJrZXJzIGNoYW5nZSB0byByZWZsZWN0IHRob3NlIGNoYW5nZXNcclxuXHRcdCAqIGluIHRoZSBoZWF0bWFwcGluZ1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXJIZWF0TWFwKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMubGVuZ3RoID0gMDtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMubWFya2Vyc1tpXS5nZXRWaXNpYmxlKCkpIHtcclxuXHRcdFx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5wdXNoKHRoaXMubWFya2Vyc1tpXS5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuaGVhdG1hcC5zZXRNYXAodGhpcy5pbnN0YW5jZSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldEdlb1Bvc2l0aW9uKG1hcmtlcj86IGdvb2dsZS5tYXBzLk1hcmtlcik6IG5nLklQcm9taXNlPGdvb2dsZS5tYXBzLkxhdExuZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0O1xyXG5cclxuXHRcdFx0cmVzdWx0ID0gdGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IG1hcmtlcnMgZnJvbSBlbmRwb2ludFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBUEkgZW5kcG9pbnRcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTw8QXJyYXk8TWFya2VyPj59IEFuIGFycmF5IG9mIG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0Z2V0TWFya2VycyhwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxNYXJrZXI+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE9wZW4gaW5mb3dpbmRvdywgY2xvc2Ugb3RoZXJzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuTWFya2VyfSBtYXJrZXIgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5JbmZvV2luZG93fSBpbmZvV2luZG93IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0b3BlbkluZm9XaW5kb3cobWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXIsIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3cpOiB2b2lkIHtcclxuXHRcdFx0bWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5mb1dpbmRvd3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3NbaV0uY2xvc2UoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGluZm9XaW5kb3cub3Blbih0aGlzLmluc3RhbmNlLCBtYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZW1vdmVHZW9NYXJrZXJzKCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvTWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2Vyc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9DaXJjbGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9DaXJjbGVzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRyaWdnZXJpbmcgcmVzaXplIGV2ZW50c1xyXG5cdFx0ICovXHJcblx0XHRyZXNpemUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuVGltZW91dFNlcnZpY2UoKCkgPT4ge1xyXG5cdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIodGhpcy5pbnN0YW5jZSwgJ3Jlc2l6ZScpO1xyXG5cdFx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0Q2VudGVyKHRoaXMuZ2VvTWFya2VyLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9LCAwKVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIEZvciBzZXR0aW5nIHRoZSBtYXAgdG8gYSBjZW50ZXIgcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdGl0dWRlXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG9uZ2l0dWRlXHJcblx0XHQgKi9cclxuXHRcdHNldENlbnRlcihsYXRpdHVkZTogbnVtYmVyLCBsb25naXR1ZGU6IG51bWJlcik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdGl0dWRlLCBsb25naXR1ZGUpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnTWFwU2VydmljZScsIE1hcFNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQb2tlbW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJUG9rZW1vblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIFBva2Vtb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGh0dHAnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge25nLklIdHRwUHJvbWlzZTxBcnJheTxQb2tlbW9uPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PFBva2Vtb24+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnUG9rZW1vblNlcnZpY2UnLCBQb2tlbW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
