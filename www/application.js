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
                .when('/form', {
                controller: 'FormController',
                controllerAs: 'Form',
                templateUrl: '/templates/form.html'
            })
                .when('/index', {
                controller: 'IndexController',
                controllerAs: 'Index',
                templateUrl: '/templates/index.html'
            })
                .when('/index/:id', {
                controller: 'IndexController',
                controllerAs: 'Index',
                templateUrl: '/templates/pokemon.html'
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
            if (this.LocationService.path().search(path)) {
                return false;
            }
            else {
                return true;
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
        function FormController(GeolocationService, FirebaseService, MapService, PokemonService) {
            var _this = this;
            this.GeolocationService = GeolocationService;
            this.FirebaseService = FirebaseService;
            this.MapService = MapService;
            this.PokemonService = PokemonService;
            this.formData = new Application.FormData();
            this.PokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
            });
        }
        /**
         * (description)
         *
         * @param {string} model (description)
         * @param {string} value (description)
         */
        FormController.prototype.autocomplete = function (model, value) {
            this.formData[model] = value;
        };
        /**
         * Submit form data to database, reset map, notify user
         */
        FormController.prototype.submit = function () {
            var _this = this;
            if (this.formData.name) {
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
                        'name': _this.formData.name
                    }).then(function (response) {
                        _this.FirebaseService.get('/').then(function (response) {
                            var markers = [];
                            for (var i = 0; i < response.length; i++) {
                                markers.push(response[i].val());
                            }
                            _this.MapService.setCenter(position.lat(), position.lng());
                            _this.formData.messages = new Array();
                            _this.formData.messages.push('Successfully added ' + _this.formData.name);
                            _this.formData.name = '';
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
            'PokemonService'
        ];
        return FormController;
    }());
    angular
        .module('Client')
        .controller('FormController', FormController);
})(Application || (Application = {}));
var Application;
(function (Application) {
    var IndexController = (function () {
        function IndexController(PokemonService, RouteService) {
            var _this = this;
            this.PokemonService = PokemonService;
            this.RouteService = RouteService;
            this.parameters = new Object();
            PokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
                _this.parameters = RouteService.current.params;
                _this.active(_this.parameters['id']);
            });
        }
        /**
         * (description)
         *
         * @param {string} id (description)
         */
        IndexController.prototype.active = function (id) {
            for (var i = 0; i < this.pokemon.length; i++) {
                if (this.pokemon[i].Number === id) {
                    this.current = this.pokemon[i];
                }
            }
        };
        IndexController.$inject = [
            'PokemonService',
            '$route'
        ];
        return IndexController;
    }());
    Application.IndexController = IndexController;
    angular
        .module('Client')
        .controller('IndexController', IndexController);
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
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            this.WindowService = WindowService;
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
        MapController.prototype.initialize = function (dom, geomarker, draggable, markers) {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                _this.MapService.createMap(document.getElementById(dom), response.coords.latitude, response.coords.longitude, 16).then(function (response) {
                    _this.loaded = response;
                });
                if (geomarker) {
                    _this.MapService.addGeoMarker(draggable, response);
                }
            }).catch(function (reason) {
                alert('Geolocation lookup has failed');
                console.log(reason);
            }).then(function () {
                if (markers) {
                    _this.FirebaseService.get('/').then(function (response) {
                        var markers = [];
                        for (var i = 0; i < response.length; i++) {
                            markers.push(response[i].val());
                        }
                        if (markers) {
                            _this.MapService.addMarkers(markers);
                            _this.MapService.addHeatmap();
                        }
                    });
                }
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
    var FormData = (function () {
        function FormData() {
            this.messages = new Array();
            this.name = '';
        }
        return FormData;
    }());
    Application.FormData = FormData;
})(Application || (Application = {}));
var Application;
(function (Application) {
    var Marker = (function () {
        function Marker() {
            this.name = '';
        }
        return Marker;
    }());
    Application.Marker = Marker;
})(Application || (Application = {}));
var Application;
(function (Application) {
    var Pokemon = (function () {
        function Pokemon() {
            this.Classification = '';
            this.FastAttacks = new Array();
            this.FleeRate = 0;
            this.Height = new Object();
            this.MaxCP = 0;
            this.MaxHP = 0;
            this.Name = '';
            this.Number = '';
            this.PreviousEvolutions = new Array();
            this.Resistant = new Array();
            this.Types = new Array();
            this.SpecialAttacks = new Array();
            this.Weaknesses = new Array();
            this.Weight = new Object();
        }
        return Pokemon;
    }());
    Application.Pokemon = Pokemon;
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
        function MapService(FilterService, HttpService, PokemonService, QService, TimeoutService) {
            this.FilterService = FilterService;
            this.HttpService = HttpService;
            this.PokemonService = PokemonService;
            this.QService = QService;
            this.TimeoutService = TimeoutService;
            this.active = new google.maps.Marker();
            this.geoMarker = new google.maps.Marker();
            this.geoCircle = new google.maps.Circle();
            this.geoMarkers = new Array();
            this.geoCircles = new Array();
            this.heatmap = new google.maps.visualization.HeatmapLayer();
            this.heatmapPoints = new Array();
            this.infoWindow = new google.maps.InfoWindow();
            this.infoWindows = new Array();
            this.marker = new google.maps.Marker();
            this.markerCircle = new google.maps.Circle();
            this.markers = new Array();
            this.markerCircles = new Array();
            this.pokemon = new Array();
        }
        /**
         * Add markers from API to the map
         *
         * @param {Array<Marker>} markers (description)
         */
        MapService.prototype.addMarkers = function (markers) {
            var _this = this;
            this.PokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
                for (var i = 0; i < markers.length; i++) {
                    angular.forEach(_this.pokemon, function (pokemon, pokemonID) {
                        if (markers[i].name === pokemon.Name) {
                            _this.marker = new google.maps.Marker({
                                icon: {
                                    size: new google.maps.Size(40, 40, 'em', 'em'),
                                    scaledSize: new google.maps.Size(40, 40, 'em,', 'em'),
                                    url: '/api/pokemon/icons/' + pokemon.Number + '.svg'
                                },
                                position: new google.maps.LatLng(markers[i].position.coords.latitude, markers[i].position.coords.longitude),
                                map: _this.instance,
                                title: markers[i].name,
                                zIndex: 1
                            });
                        }
                    });
                    _this.infoWindow = new google.maps.InfoWindow({
                        content: markers[i].name + ' (Added ' + _this.FilterService('date')(markers[i].position.timestamp) + ')'
                    });
                    _this.infoWindows.push(_this.infoWindow);
                    _this.markers.push(_this.marker);
                    _this.openInfoWindow(_this.marker, _this.infoWindow);
                }
            });
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
            'PokemonService',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL0luZGV4Q29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsIm1vZGVscy9Gb3JtRGF0YS50cyIsIm1vZGVscy9NYXJrZXIudHMiLCJtb2RlbHMvUG9rZW1vbi50cyIsInNlcnZpY2VzL0ZpcmViYXNlU2VydmljZS50cyIsInNlcnZpY2VzL0dlb2xvY2F0aW9uU2VydmljZS50cyIsInNlcnZpY2VzL01hcFNlcnZpY2UudHMiLCJzZXJ2aWNlcy9Qb2tlbW9uU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU1wQjtBQU5ELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsU0FBUztRQUNULFVBQVU7S0FDVixDQUFDLENBQUM7QUFDTCxDQUFD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QUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN4eUIsSUFBSSxFQUFFLElBQUk7YUFDVixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtnQkFDbEQsS0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztZQUVILG1EQUFtRDtZQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUU7Z0JBQzNELElBQUksTUFBTSxDQUFDO2dCQUVYLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUUvRCxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUVkLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILGtDQUFhLEdBQWIsVUFBYyxNQUFlO1lBQzVCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFckMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDdkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ25DLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7WUFDRixDQUFDO1lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQztRQUdEOzs7OztXQUtHO1FBQ0gsa0NBQWEsR0FBYjtZQUNDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUU5QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzlDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFHRDs7OztXQUlHO1FBQ0gsbUNBQWMsR0FBZCxVQUFlLE1BQTJCO1lBQ3pDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ25DLE1BQU0sQ0FBQztZQUVSLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXRDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFekIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsK0JBQVUsR0FBVixVQUFXLElBQVk7WUFDdEIsSUFBSSxNQUFNLEdBQXFCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVE7Z0JBQ2hGLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFBO1lBRUYsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILG1DQUFjLEdBQWQsVUFBZSxNQUEwQixFQUFFLFVBQWtDO1lBQTdFLGlCQVFDO1lBUEEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7Z0JBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDbEQsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUE7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxxQ0FBZ0IsR0FBaEI7WUFDQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSCwwQkFBSyxHQUFMO1lBQ0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxDQUFDO1FBQ0YsQ0FBQztRQUdEOztXQUVHO1FBQ0gsMkJBQU0sR0FBTjtZQUFBLGlCQUtDO1lBSkEsSUFBSSxDQUFDLGNBQWMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25ELEtBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUN2RCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCw4QkFBUyxHQUFULFVBQVUsUUFBZ0IsRUFBRSxTQUFpQjtZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFqVk0sa0JBQU8sR0FBRztZQUNoQixTQUFTO1lBQ1QsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixJQUFJO1lBQ0osVUFBVTtTQUNWLENBQUM7UUE0VUgsaUJBQUM7SUFBRCxDQW5WQSxBQW1WQyxJQUFBO0lBblZZLHNCQUFVLGFBbVZ0QixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsT0FBTyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNyQyxDQUFDLEVBaFdTLFdBQVcsS0FBWCxXQUFXLFFBZ1dwQjtBQ2hXRCxJQUFVLFdBQVcsQ0FtQ3BCO0FBbkNELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFFdEI7Ozs7O09BS0c7SUFDSDtRQUtDLHdCQUFvQixXQUE0QjtZQUE1QixnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7UUFFaEQsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsNEJBQUcsR0FBSCxVQUFJLElBQVk7WUFDZixJQUFJLE1BQU0sR0FBcUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTtnQkFDaEYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUE7WUFFRixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQXBCTSxzQkFBTyxHQUFHO1lBQ2hCLE9BQU87U0FDUCxDQUFDO1FBbUJILHFCQUFDO0lBQUQsQ0F0QkEsQUFzQkMsSUFBQTtJQXRCWSwwQkFBYyxpQkFzQjFCLENBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDN0MsQ0FBQyxFQW5DUyxXQUFXLEtBQVgsV0FBVyxRQW1DcEI7QUNuQ0QsSUFBVSxRQUFRLENBZ0ZqQjtBQWhGRCxXQUFVLFFBQVEsRUFBQyxDQUFDO0lBRW5COzs7OztPQUtHO0lBQ0g7UUFPQztZQUNDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxtQ0FBTSxHQUFOO1lBQ0MsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQVpNLDBCQUFPLEdBQUcsRUFFaEIsQ0FBQztRQVdILHlCQUFDO0lBQUQsQ0FkQSxBQWNDLElBQUE7SUFFRDs7Ozs7T0FLRztJQUNIO1FBU0M7WUFDQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUc7Z0JBQ3ZCLElBQUksRUFBRSxHQUFHO2dCQUNULE1BQU0sRUFBRSxHQUFHO2dCQUNYLEtBQUssRUFBRSxHQUFHO2FBQ1YsQ0FBQTtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUM7WUFDckMsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7WUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRywwQ0FBMEMsQ0FBQTtZQUM3RCxJQUFJLENBQUMsVUFBVSxHQUFHO2dCQUNqQixLQUFLLEVBQUUsZ0JBQWdCO2dCQUN2QixNQUFNLEVBQUUsaUJBQWlCO2FBQ3pCLENBQUM7UUFDSCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSwwQkFBUSxHQUFmO1lBQ0MsTUFBTSxDQUFDLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSxnQ0FBSSxHQUFYLFVBQVksS0FBZ0IsRUFBRSxPQUE0QjtRQUUxRCxDQUFDO1FBQ0Ysd0JBQUM7SUFBRCxDQTdDQSxBQTZDQyxJQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsU0FBUyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRCxDQUFDLEVBaEZTLFFBQVEsS0FBUixRQUFRLFFBZ0ZqQiIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblx0XHRhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydDbGllbnQnXSk7XHJcblx0fSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIvPlxyXG5uYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdDbGllbnQnLCBcclxuXHRcdFtcclxuXHRcdFx0J25nUm91dGUnLFxyXG5cdFx0XHQnb2ZmQ2xpY2snXHJcblx0XHRdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0XHJcblx0ZXhwb3J0IGNsYXNzIExvY2F0aW9uUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIExvY2F0aW9uUHJvdmlkZXI6IG5nLklMb2NhdGlvblByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsIExvY2F0aW9uUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIFJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRSb3V0ZVByb3ZpZGVyXHJcblx0XHRcdFx0LndoZW4oJy9mb3JtJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonRm9ybUNvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnRm9ybScsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9mb3JtLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL2luZGV4Jywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonSW5kZXhDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0luZGV4JyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2luZGV4Lmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL2luZGV4LzppZCcsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0luZGV4Q29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdJbmRleCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9wb2tlbW9uLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL21hcCcsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J01hcENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnTWFwJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL21hcC5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdC5vdGhlcndpc2UoJy9tYXAnKVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgUm91dGVQcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHQvKipcclxuXHQgKiBDb3JlIGNvbnRyb2xsZXIgZm9yIGdsb2JhbCBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgQXBwbGljYXRpb25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lBcHBsaWNhdGlvbkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgQXBwbGljYXRpb25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0JyRsb2NhdGlvbicsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBMb2NhdGlvblNlcnZpY2U6IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgV2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHRGaXJlYmFzZVNlcnZpY2UuY29uZmlndXJlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvYWQgdGhlIGVudGlyZSBtYXAgdG8gY2hlY2sgZm9yIHVwZGF0ZXNcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2FkKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayB0aGF0IHRoZSBjdXJyZW50IHBhdGggbWF0Y2hlcyB0aGUgbG9jYXRpb24gcGF0aFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjdXJyZW50Um91dGUocGF0aDogc3RyaW5nKTogYm9vbGVhbntcclxuXHRcdFx0aWYodGhpcy5Mb2NhdGlvblNlcnZpY2UucGF0aCgpLnNlYXJjaChwYXRoKSl7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignQXBwbGljYXRpb25Db250cm9sbGVyJywgQXBwbGljYXRpb25Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBmb3JtIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBGb3JtQ29udHJvbGxlclxyXG5cdCAqL1xyXG5cdGNsYXNzIEZvcm1Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgZXJyb3I6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgZm9ybURhdGE6IEZvcm1EYXRhO1xyXG5cdFx0cHVibGljIHBva2Vtb246IFBva2Vtb25bXTtcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuUG9rZW1vblNlcnZpY2UuZ2V0KCcvYXBpL3Bva2Vtb24vcG9rZW1vbi5qc29uJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLnBva2Vtb24gPSByZXNwb25zZTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGF1dG9jb21wbGV0ZShtb2RlbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKXtcclxuXHRcdFx0dGhpcy5mb3JtRGF0YVttb2RlbF0gPSB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Ym1pdCBmb3JtIGRhdGEgdG8gZGF0YWJhc2UsIHJlc2V0IG1hcCwgbm90aWZ5IHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0c3VibWl0KCkge1xyXG5cdFx0XHRpZiAodGhpcy5mb3JtRGF0YS5uYW1lKSB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmdldEdlb1Bvc2l0aW9uKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiB7XHJcblx0XHRcdFx0XHRcdFx0J2Nvb3Jkcyc6IHtcclxuXHRcdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2xvbmdpdHVkZSc6IHBvc2l0aW9uLmxuZygpXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHQndGltZXN0YW1wJzogTWF0aC5mbG9vcihEYXRlLm5vdygpKVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZVxyXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnNldENlbnRlcihwb3NpdGlvbi5sYXQoKSwgcG9zaXRpb24ubG5nKCkpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLmZvcm1EYXRhLm1lc3NhZ2VzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmZvcm1EYXRhLm1lc3NhZ2VzLnB1c2goJ1N1Y2Nlc3NmdWxseSBhZGRlZCAnICsgdGhpcy5mb3JtRGF0YS5uYW1lKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5mb3JtRGF0YS5uYW1lID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMudG9nZ2xlKCk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmVycm9yID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHR0b2dnbGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuc3RhdGUgPSAhdGhpcy5zdGF0ZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignRm9ybUNvbnRyb2xsZXInLCBGb3JtQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBJbmRleENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZScsXHJcblx0XHRcdCckcm91dGUnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBjdXJyZW50OiBQb2tlbW9uO1xyXG5cdFx0cHVibGljIHBhcmFtZXRlcnM6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBwb2tlbW9uOiBQb2tlbW9uW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUG9rZW1vblNlcnZpY2U6IFBva2Vtb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFJvdXRlU2VydmljZTogbmcucm91dGUuSVJvdXRlU2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdHRoaXMucGFyYW1ldGVycyA9IG5ldyBPYmplY3QoKTtcclxuXHJcblx0XHRcdFBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5wb2tlbW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdHRoaXMucGFyYW1ldGVycyA9IFJvdXRlU2VydmljZS5jdXJyZW50LnBhcmFtcztcclxuXHJcblx0XHRcdFx0dGhpcy5hY3RpdmUodGhpcy5wYXJhbWV0ZXJzWydpZCddKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBpZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFjdGl2ZShpZDogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2tlbW9uLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYodGhpcy5wb2tlbW9uW2ldLk51bWJlciA9PT0gaWQpe1xyXG5cdFx0XHRcdFx0dGhpcy5jdXJyZW50ID0gdGhpcy5wb2tlbW9uW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdJbmRleENvbnRyb2xsZXInLCBJbmRleENvbnRyb2xsZXIpXHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcENvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcENvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgTWFwQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCdHZW9sb2NhdGlvblNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgZnVsbHNjcmVlbjogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBsb2FkZWQ6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgbG9jYXRpb246IFBvc2l0aW9uO1xyXG5cdFx0cHVibGljIG1lc3NhZ2U6IHN0cmluZztcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGaWx0ZXIgdGhlIG1hcCBpdGVtcyBiYXNlZCBvbiB0aGUgc2VhcmNoIG1vZGVsXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBbc2VhcmNoXSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlcihzZWFyY2g/OiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmZpbHRlck1hcmtlcnMoc2VhcmNoKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVySGVhdE1hcCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRpbml0aWFsaXplKGRvbTogc3RyaW5nLCBnZW9tYXJrZXI6IGJvb2xlYW4sIGRyYWdnYWJsZTogYm9vbGVhbiwgbWFya2VyczogYm9vbGVhbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tKSwgcmVzcG9uc2UuY29vcmRzLmxhdGl0dWRlLCByZXNwb25zZS5jb29yZHMubG9uZ2l0dWRlLCAxNikudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMubG9hZGVkID0gcmVzcG9uc2U7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0aWYgKGdlb21hcmtlcikge1xyXG5cdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihkcmFnZ2FibGUsIHJlc3BvbnNlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pLmNhdGNoKChyZWFzb24pID0+IHtcclxuXHRcdFx0XHRhbGVydCgnR2VvbG9jYXRpb24gbG9va3VwIGhhcyBmYWlsZWQnKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWFzb24pO1xyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRpZiAobWFya2Vycykge1xyXG5cdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobWFya2Vycykge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRIZWF0bWFwKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWQgZm9yIHJlc2l6aW5nIHRoZSBtYXAsIGllOiBtYWtpbmcgaXQgZnVsbCBzY3JlZW5cclxuXHRcdCAqL1xyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmZ1bGxzY3JlZW4gPSAhdGhpcy5mdWxsc2NyZWVuO1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVzaXplKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvY2F0ZSB0aGUgdXNlclxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHJlbG9jYXRlKGRyYWdnYWJsZTogYm9vbGVhbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihkcmFnZ2FibGUsIHJlc3BvbnNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBjb250ZW50IHBhZ2VzXHJcblx0ICogXHJcblx0ICogQGNsYXNzIFBhZ2VDb250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgUGFnZUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0KSB7XHJcblx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignUGFnZUNvbnRyb2xsZXInLCBQYWdlQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb257XHJcblx0ZXhwb3J0IGNsYXNzIEZvcm1EYXRhe1xyXG5cdFx0cHVibGljIG1lc3NhZ2VzOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgcG9zaXRpb246IFBvc2l0aW9uO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBNYXJrZXIge1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vbiB7XHJcblx0XHRwdWJsaWMgQ2xhc3NpZmljYXRpb246IHN0cmluZztcclxuXHRcdHB1YmxpYyBGYXN0QXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgRmxlZVJhdGU6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBIZWlnaHQ6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBNYXhDUDogbnVtYmVyO1xyXG5cdFx0cHVibGljIE1heEhQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIE51bWJlcjogc3RyaW5nO1xyXG5cdFx0cHVibGljIFByZXZpb3VzRXZvbHV0aW9uczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgUmVzaXN0YW50OiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBUeXBlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgU3BlY2lhbEF0dGFja3M6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlYWtuZXNzZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlaWdodDogT2JqZWN0O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkNsYXNzaWZpY2F0aW9uID0gJyc7XHJcblx0XHRcdHRoaXMuRmFzdEF0dGFja3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLkZsZWVSYXRlID0gMDtcclxuXHRcdFx0dGhpcy5IZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRcdHRoaXMuTWF4Q1AgPSAwO1xyXG5cdFx0XHR0aGlzLk1heEhQID0gMDtcclxuXHRcdFx0dGhpcy5OYW1lID0gJyc7XHJcblx0XHRcdHRoaXMuTnVtYmVyID0gJyc7XHJcblx0XHRcdHRoaXMuUHJldmlvdXNFdm9sdXRpb25zID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5SZXNpc3RhbnQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlR5cGVzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5TcGVjaWFsQXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2Vha25lc3NlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2VpZ2h0ID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBxOiBuZy5JUVNlcnZpY2UsIHByaXZhdGUgd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMucS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLndpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xyXG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0dlb2xvY2F0aW9uU2VydmljZScsIEdlb2xvY2F0aW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcFNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcFNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIE1hcFNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckZmlsdGVyJyxcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR0aW1lb3V0J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwcml2YXRlIGFjdGl2ZTogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBkb206IEVsZW1lbnQ7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VyczogZ29vZ2xlLm1hcHMuTWFya2VyW107XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZXM6IGdvb2dsZS5tYXBzLkNpcmNsZVtdO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwOiBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcjtcclxuXHRcdHByaXZhdGUgaGVhdG1hcFBvaW50czogZ29vZ2xlLm1hcHMuTGF0TG5nW107XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzOiBnb29nbGUubWFwcy5JbmZvV2luZG93W107XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VyczogZ29vZ2xlLm1hcHMuTWFya2VyW107XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXM6IGdvb2dsZS5tYXBzLkNpcmNsZVtdO1xyXG5cdFx0cHJpdmF0ZSBwb2tlbW9uOiBQb2tlbW9uW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlsdGVyU2VydmljZTogbmcuSUZpbHRlclNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBQb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5hY3RpdmUgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigpO1xyXG5cdFx0XHR0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoKTtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdFx0dGhpcy5nZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdFx0dGhpcy5oZWF0bWFwID0gbmV3IGdvb2dsZS5tYXBzLnZpc3VhbGl6YXRpb24uSGVhdG1hcExheWVyKCk7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5MYXRMbmc+KCk7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvd3MgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuSW5mb1dpbmRvdz4oKTtcclxuXHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMubWFya2VyQ2lyY2xlID0gbmV3IGdvb2dsZS5tYXBzLkNpcmNsZSgpO1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0XHR0aGlzLm1hcmtlckNpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cdFx0XHR0aGlzLnBva2Vtb24gPSBuZXcgQXJyYXk8UG9rZW1vbj4oKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBtYXJrZXJzIGZyb20gQVBJIHRvIHRoZSBtYXBcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkTWFya2VycyhtYXJrZXJzOiBBcnJheTxNYXJrZXI+KTogdm9pZCB7XHJcblx0XHRcdHRoaXMuUG9rZW1vblNlcnZpY2UuZ2V0KCcvYXBpL3Bva2Vtb24vcG9rZW1vbi5qc29uJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLnBva2Vtb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2godGhpcy5wb2tlbW9uLCAocG9rZW1vbiwgcG9rZW1vbklEKSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmIChtYXJrZXJzW2ldLm5hbWUgPT09IHBva2Vtb24uTmFtZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0XHRcdFx0XHRpY29uOiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDQwLCA0MCwgJ2VtJywgJ2VtJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdHNjYWxlZFNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDQwLCA0MCwgJ2VtLCcsICdlbScpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR1cmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIHBva2Vtb24uTnVtYmVyICsgJy5zdmcnLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bWFya2Vyc1tpXS5wb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdFx0XHRcdFx0XHQpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlcnNbaV0ubmFtZSxcclxuXHRcdFx0XHRcdFx0XHRcdHpJbmRleDogMVxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcclxuXHRcdFx0XHRcdFx0Y29udGVudDogbWFya2Vyc1tpXS5uYW1lICsgJyAoQWRkZWQgJyArIHRoaXMuRmlsdGVyU2VydmljZSgnZGF0ZScpKG1hcmtlcnNbaV0ucG9zaXRpb24udGltZXN0YW1wKSArICcpJ1xyXG5cdFx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzLnB1c2godGhpcy5pbmZvV2luZG93KTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnMucHVzaCh0aGlzLm1hcmtlcik7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5vcGVuSW5mb1dpbmRvdyh0aGlzLm1hcmtlciwgdGhpcy5pbmZvV2luZG93KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBtYXJrZXIgZm9yIHVzZXJzIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHQgKiBEZXBlbmRzIG9uIHRoZSBHZW9sb2NhdGlvblNlcnZpY2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBkcmFnZ2FibGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEdlb01hcmtlcihkcmFnZ2FibGU6IGJvb2xlYW4sIHBvc2l0aW9uOiBQb3NpdGlvbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmdlb01hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdGRyYWdnYWJsZTogZHJhZ2dhYmxlLFxyXG5cdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IDAuMzUsXHJcblx0XHRcdFx0XHRwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcclxuXHRcdFx0XHRcdHNjYWxlOiA4LFxyXG5cdFx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCk7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlcnMucHVzaCh0aGlzLmdlb01hcmtlcik7XHJcblxyXG5cdFx0XHRpZiAoZHJhZ2dhYmxlKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9NYXJrZXIuYWRkTGlzdGVuZXIoJ2RyYWdlbmQnLCAoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmdldEdlb1Bvc2l0aW9uKHRoaXMuZ2VvTWFya2VyKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xyXG5cdFx0XHQvLyBcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0Ly8gXHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0Ly8gXHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0Ly8gXHQpLFxyXG5cdFx0XHQvLyBcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHQvLyBcdGZpbGxPcGFjaXR5OiAwLjE1LFxyXG5cdFx0XHQvLyBcdG1hcDogdGhpcy5pbnN0YW5jZSxcclxuXHRcdFx0Ly8gXHRyYWRpdXM6IHBvc2l0aW9uLmNvb3Jkcy5hY2N1cmFjeSAqIDMsXHJcblx0XHRcdC8vIFx0c3Ryb2tlQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRzdHJva2VPcGFjaXR5OiAwLjM1LFxyXG5cdFx0XHQvLyBcdHN0cm9rZVdlaWdodDogMlxyXG5cdFx0XHQvLyB9KTtcclxuXHJcblx0XHRcdC8vIHRoaXMuZ2VvQ2lyY2xlcy5wdXNoKHRoaXMuZ2VvQ2lyY2xlKTtcclxuXHJcblx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0Q2VudGVyKHRoaXMuZ2VvTWFya2VyLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIGEgaGVhdG1hcCB0byB0aGUgbWFwIGluc3RhbmNlIGJ5XHJcblx0XHQgKiBwYXNzaW5nIGluIG1hcCBwb2ludHNcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkSGVhdG1hcCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMucHVzaCh0aGlzLm1hcmtlcnNbaV0uZ2V0UG9zaXRpb24oKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuaGVhdG1hcCA9IG5ldyBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcih7XHJcblx0XHRcdFx0ZGF0YTogdGhpcy5oZWF0bWFwUG9pbnRzLFxyXG5cdFx0XHRcdHJhZGl1czogNTBcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAuc2V0TWFwKHRoaXMuaW5zdGFuY2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0VsZW1lbnR9IGRvbSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbGF0IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBsbmcgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IHpvb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjcmVhdGVNYXAoZG9tOiBFbGVtZW50LCBsYXQ6IG51bWJlciwgbG5nOiBudW1iZXIsIHpvb206IG51bWJlcik6IG5nLklQcm9taXNlPGJvb2xlYW4+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0dGhpcy5kb20gPSBkb207XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLmRvbSwge1xyXG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZyksXHJcblx0XHRcdFx0ZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuXHRcdFx0XHRtYXhab29tOiAyMCxcclxuXHRcdFx0XHRzdHlsZXM6IFt7IFwiZmVhdHVyZVR5cGVcIjogXCJhZG1pbmlzdHJhdGl2ZVwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLnRleHQuZmlsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NDQ0NDRcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJsYW5kc2NhcGVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiNmMmYyZjJcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJwb2lcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZFwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInNhdHVyYXRpb25cIjogLTEwMCB9LCB7IFwibGlnaHRuZXNzXCI6IDQ1IH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuaGlnaHdheVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJzaW1wbGlmaWVkXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZC5hcnRlcmlhbFwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLmljb25cIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInRyYW5zaXRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwid2F0ZXJcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NmJjZWNcIiB9LCB7IFwidmlzaWJpbGl0eVwiOiBcIm9uXCIgfV0gfV0sXHJcblx0XHRcdFx0em9vbTogem9vbVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IHtcclxuXHRcdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gQ2hlY2sgd2hlbiB0aGUgbWFwIGlzIHJlYWR5IGFuZCByZXR1cm4gYSBwcm9taXNlXHJcblx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuaW5zdGFuY2UsICd0aWxlc2xvYWRlZCcsICgpID0+IHtcclxuXHRcdFx0XHR2YXIgcmVzdWx0O1xyXG5cclxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLmluc3RhbmNlLCAndGlsZXNsb2FkZWQnKTtcclxuXHJcblx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmlsdGVyIHRoZSB2aXNpYmxlIG1hcmtlcnMgYnkgYSBtYXRjaGluZyB2YWx1ZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXJNYXJrZXJzKHNlYXJjaD86IHN0cmluZyk6IG5nLklQcm9taXNlPHN0cmluZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZiAoc2VhcmNoKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLm1hcmtlcnNbaV0uZ2V0VGl0bGUoKS50b0xvd2VyQ2FzZSgpID09PSBzZWFyY2gudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZShmYWxzZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVXNlZnVsIHdoZW4gbWFya2VycyBjaGFuZ2UgdG8gcmVmbGVjdCB0aG9zZSBjaGFuZ2VzXHJcblx0XHQgKiBpbiB0aGUgaGVhdG1hcHBpbmdcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVySGVhdE1hcCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLmxlbmd0aCA9IDA7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh0aGlzLm1hcmtlcnNbaV0uZ2V0VmlzaWJsZSgpKSB7XHJcblx0XHRcdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMucHVzaCh0aGlzLm1hcmtlcnNbaV0uZ2V0UG9zaXRpb24oKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAuc2V0TWFwKHRoaXMuaW5zdGFuY2UpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPFBvc2l0aW9uPn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXRHZW9Qb3NpdGlvbihtYXJrZXI/OiBnb29nbGUubWFwcy5NYXJrZXIpOiBuZy5JUHJvbWlzZTxnb29nbGUubWFwcy5MYXRMbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdDtcclxuXHJcblx0XHRcdHJlc3VsdCA9IHRoaXMuZ2VvTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcblxyXG5cdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBtYXJrZXJzIGZyb20gZW5kcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggQVBJIGVuZHBvaW50XHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8PEFycmF5PE1hcmtlcj4+fSBBbiBhcnJheSBvZiBtYXJrZXJzXHJcblx0XHQgKi9cclxuXHRcdGdldE1hcmtlcnMocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8TWFya2VyPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBPcGVuIGluZm93aW5kb3csIGNsb3NlIG90aGVyc1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2dvb2dsZS5tYXBzLk1hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuSW5mb1dpbmRvd30gaW5mb1dpbmRvdyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdG9wZW5JbmZvV2luZG93KG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyLCBpbmZvV2luZG93OiBnb29nbGUubWFwcy5JbmZvV2luZG93KTogdm9pZCB7XHJcblx0XHRcdG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluZm9XaW5kb3dzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzW2ldLmNsb3NlKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpbmZvV2luZG93Lm9wZW4odGhpcy5pbnN0YW5jZSwgbWFya2VyKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cmVtb3ZlR2VvTWFya2VycygpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb01hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmdlb01hcmtlcnNbaV0uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvQ2lyY2xlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuZ2VvQ2lyY2xlc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0cmVzZXQoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmlnZ2VyaW5nIHJlc2l6ZSBldmVudHNcclxuXHRcdCAqL1xyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLlRpbWVvdXRTZXJ2aWNlKCgpID0+IHtcclxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuaW5zdGFuY2UsICdyZXNpemUnKTtcclxuXHRcdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0fSwgMClcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZvciBzZXR0aW5nIHRoZSBtYXAgdG8gYSBjZW50ZXIgcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdGl0dWRlXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG9uZ2l0dWRlXHJcblx0XHQgKi9cclxuXHRcdHNldENlbnRlcihsYXRpdHVkZTogbnVtYmVyLCBsb25naXR1ZGU6IG51bWJlcik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdGl0dWRlLCBsb25naXR1ZGUpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnTWFwU2VydmljZScsIE1hcFNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQb2tlbW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJUG9rZW1vblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIFBva2Vtb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGh0dHAnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge25nLklIdHRwUHJvbWlzZTxBcnJheTxQb2tlbW9uPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PFBva2Vtb24+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnUG9rZW1vblNlcnZpY2UnLCBQb2tlbW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
