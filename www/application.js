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
        'ngAria',
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
        function MapController(FirebaseService, GeolocationService, MapService, StorageService, WindowService) {
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            this.StorageService = StorageService;
            this.WindowService = WindowService;
        }
        MapController.prototype.initialize = function (dom, geomarker, draggable, markers) {
            var _this = this;
            if (Application.GeolocationService.position) {
                this.MapService.createMap(document.getElementById(dom), Application.GeolocationService.position.coords.latitude, Application.GeolocationService.position.coords.longitude, 2).then(function (response) {
                    if (markers) {
                        _this.FirebaseService.get('/').then(function (response) {
                            var markers = [];
                            for (var i = 0; i < response.length; i++) {
                                markers.push(response[i].val());
                            }
                            if (markers) {
                                _this.MapService.addMarkers(markers);
                            }
                        });
                    }
                    if (geomarker) {
                        _this.MapService.addGeoMarker(draggable, Application.GeolocationService.position);
                    }
                });
            }
            else {
                this.MapService.createMap(document.getElementById(dom), 0, 0, 2).then(function (response) {
                    if (markers) {
                        _this.FirebaseService.get('/').then(function (response) {
                            var markers = [];
                            for (var i = 0; i < response.length; i++) {
                                markers.push(response[i].val());
                            }
                            if (markers) {
                                _this.MapService.addMarkers(markers);
                            }
                        });
                    }
                });
            }
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
            'StorageService',
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
        function GeolocationService(QService, StorageService, WindowService) {
            this.QService = QService;
            this.StorageService = StorageService;
            this.WindowService = WindowService;
        }
        /**
         * (description)
         *
         * @returns {ng.IPromise<Position>} (description)
         */
        GeolocationService.prototype.get = function () {
            var deferred = this.QService.defer();
            if (!this.WindowService.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            }
            else {
                this.WindowService.navigator.geolocation.getCurrentPosition(function (response) {
                    var output = [];
                    deferred.resolve(response);
                    GeolocationService.position = response;
                }, function (error) {
                    deferred.reject(error);
                }, {
                    maximumAge: 0,
                    timeout: 5000
                });
            }
            return deferred.promise;
        };
        GeolocationService.$inject = [
            '$q',
            'StorageService',
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
                                    size: new google.maps.Size(80, 80, 'em', 'em'),
                                    scaledSize: new google.maps.Size(80, 80, 'em,', 'em'),
                                    url: '/api/pokemon/icons/' + pokemon.Number + '.ico'
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
            this.instance.setZoom(16);
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
var Application;
(function (Application) {
    var StorageService = (function () {
        function StorageService(QService, WindowService) {
            this.QService = QService;
            this.WindowService = WindowService;
        }
        /**
         * Fetch item by key from session storage. Compare to source
         * data and build an output array that contains full versions
         * and not just the id field of each stored item.
         *
         * @template T
         * @param {string} key (description)
         * @returns {ng.IPromise<Array<T>>} (description)
         */
        StorageService.prototype.get = function (key) {
            var defer = this.QService.defer(), output, response, result;
            response = this.WindowService.sessionStorage.getItem(key);
            if (response != null) {
                if (response.length) {
                    result = JSON.parse(response);
                    defer.resolve(result);
                }
            }
            else {
                defer.reject();
            }
            return defer.promise;
        };
        /**
         * Set a field from a data set to a string value in session storage
         *
         * @template T
         * @param {string} key (description)
         * @param {Array<T>} values (description)
         * @param {string} [field] (description)
         */
        StorageService.prototype.set = function (key, values, field) {
            var input;
            input = values.join(',');
            this.WindowService.sessionStorage.setItem(key, input);
        };
        StorageService.$inject = [
            '$q',
            '$window'
        ];
        return StorageService;
    }());
    Application.StorageService = StorageService;
    angular
        .module('Client')
        .service('StorageService', StorageService);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL0luZGV4Q29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsIm1vZGVscy9Gb3JtRGF0YS50cyIsIm1vZGVscy9NYXJrZXIudHMiLCJtb2RlbHMvUG9rZW1vbi50cyIsInNlcnZpY2VzL0ZpcmViYXNlU2VydmljZS50cyIsInNlcnZpY2VzL0dlb2xvY2F0aW9uU2VydmljZS50cyIsInNlcnZpY2VzL01hcFNlcnZpY2UudHMiLCJzZXJ2aWNlcy9Qb2tlbW9uU2VydmljZS50cyIsInNlcnZpY2VzL1N0b3JhZ2VTZXJ2aWNlLnRzIiwiZGlyZWN0aXZlcy9kcm9wZG93bi9jb250cm9sbGVycy9Ecm9wZG93bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBSXBCO0FBSkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLEVBSlMsV0FBVyxLQUFYLFdBQVcsUUFJcEI7QUNKRCw2Q0FBNkM7QUFDN0MsSUFBVSxXQUFXLENBT3BCO0FBUEQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdEI7UUFDQyxRQUFRO1FBQ1Is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Q0FBQyxnQkFBZ0IsR0FBRztnQkFDdkIsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsS0FBSyxFQUFFLEdBQUc7YUFDVixDQUFBO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLDBDQUEwQyxDQUFBO1lBQzdELElBQUksQ0FBQyxVQUFVLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLE1BQU0sRUFBRSxpQkFBaUI7YUFDekIsQ0FBQztRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLDBCQUFRLEdBQWY7WUFDQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLGdDQUFJLEdBQVgsVUFBWSxLQUFnQixFQUFFLE9BQTRCO1FBRTFELENBQUM7UUFDRix3QkFBQztJQUFELENBN0NBLEFBNkNDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELENBQUMsRUFoRlMsUUFBUSxLQUFSLFFBQVEsUUFnRmpCIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHRcdGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0NsaWVudCddKTtcclxuXHR9KTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XHJcbm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ0NsaWVudCcsXHJcblx0XHRbXHJcblx0XHRcdCduZ0FyaWEnLFxyXG5cdFx0XHQnbmdSb3V0ZScsXHJcblx0XHRcdCdvZmZDbGljaydcclxuXHRcdF0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRcclxuXHRleHBvcnQgY2xhc3MgTG9jYXRpb25Qcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgTG9jYXRpb25Qcm92aWRlcjogbmcuSUxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgTG9jYXRpb25Qcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUm91dGVQcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgUm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFJvdXRlUHJvdmlkZXJcclxuXHRcdFx0XHQud2hlbignL2Zvcm0nLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidJbmRleENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnSW5kZXgnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvaW5kZXguaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgvOmlkJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonSW5kZXhDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0luZGV4JyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL3Bva2Vtb24uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvbWFwJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonTWFwQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdNYXAnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSgnL21hcCcpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBSb3V0ZVByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnJGxvY2F0aW9uJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIExvY2F0aW9uU2VydmljZTogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdEZpcmViYXNlU2VydmljZS5jb25maWd1cmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9hZCB0aGUgZW50aXJlIG1hcCB0byBjaGVjayBmb3IgdXBkYXRlc1xyXG5cdFx0ICovXHJcblx0XHRyZWxvYWQoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuV2luZG93U2VydmljZS5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoZWNrIHRoYXQgdGhlIGN1cnJlbnQgcGF0aCBtYXRjaGVzIHRoZSBsb2NhdGlvbiBwYXRoXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGN1cnJlbnRSb3V0ZShwYXRoOiBzdHJpbmcpOiBib29sZWFue1xyXG5cdFx0XHRpZih0aGlzLkxvY2F0aW9uU2VydmljZS5wYXRoKCkuc2VhcmNoKHBhdGgpKXtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdBcHBsaWNhdGlvbkNvbnRyb2xsZXInLCBBcHBsaWNhdGlvbkNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHQvKipcclxuXHQgKiBDb3JlIGNvbnRyb2xsZXIgZm9yIGZvcm0gZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEZvcm1Db250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgRm9ybUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdHZW9sb2NhdGlvblNlcnZpY2UnLFxyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBlcnJvcjogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBmb3JtRGF0YTogRm9ybURhdGE7XHJcblx0XHRwdWJsaWMgcG9rZW1vbjogUG9rZW1vbltdO1xyXG5cdFx0cHVibGljIHN0YXRlOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEdlb2xvY2F0aW9uU2VydmljZTogR2VvbG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIE1hcFNlcnZpY2U6IE1hcFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUG9rZW1vblNlcnZpY2U6IFBva2Vtb25TZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5Qb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMucG9rZW1vbiA9IHJlc3BvbnNlO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YXV0b2NvbXBsZXRlKG1vZGVsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpe1xyXG5cdFx0XHR0aGlzLmZvcm1EYXRhW21vZGVsXSA9IHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VibWl0IGZvcm0gZGF0YSB0byBkYXRhYmFzZSwgcmVzZXQgbWFwLCBub3RpZnkgdXNlclxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQoKSB7XHJcblx0XHRcdGlmICh0aGlzLmZvcm1EYXRhLm5hbWUpIHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuZ2V0R2VvUG9zaXRpb24oKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5GaXJlYmFzZVNlcnZpY2UucHVzaCh7XHJcblx0XHRcdFx0XHRcdCdwb3NpdGlvbic6IHtcclxuXHRcdFx0XHRcdFx0XHQnY29vcmRzJzoge1xyXG5cdFx0XHRcdFx0XHRcdFx0J2xhdGl0dWRlJzogcG9zaXRpb24ubGF0KCksXHJcblx0XHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24ubG5nKClcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdCd0aW1lc3RhbXAnOiBNYXRoLmZsb29yKERhdGUubm93KCkpXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdCduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lXHJcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLk1hcFNlcnZpY2Uuc2V0Q2VudGVyKHBvc2l0aW9uLmxhdCgpLCBwb3NpdGlvbi5sbmcoKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9ybURhdGEubWVzc2FnZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9ybURhdGEubWVzc2FnZXMucHVzaCgnU3VjY2Vzc2Z1bGx5IGFkZGVkICcgKyB0aGlzLmZvcm1EYXRhLm5hbWUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLmZvcm1EYXRhLm5hbWUgPSAnJztcclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy50b2dnbGUoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZXJyb3IgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIEZvcm1Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIEluZGV4Q29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0JyRyb3V0ZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGN1cnJlbnQ6IFBva2Vtb247XHJcblx0XHRwdWJsaWMgcGFyYW1ldGVyczogT2JqZWN0O1xyXG5cdFx0cHVibGljIHBva2Vtb246IFBva2Vtb25bXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBQb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUm91dGVTZXJ2aWNlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5wYXJhbWV0ZXJzID0gbmV3IE9iamVjdCgpO1xyXG5cclxuXHRcdFx0UG9rZW1vblNlcnZpY2UuZ2V0KCcvYXBpL3Bva2Vtb24vcG9rZW1vbi5qc29uJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLnBva2Vtb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0dGhpcy5wYXJhbWV0ZXJzID0gUm91dGVTZXJ2aWNlLmN1cnJlbnQucGFyYW1zO1xyXG5cclxuXHRcdFx0XHR0aGlzLmFjdGl2ZSh0aGlzLnBhcmFtZXRlcnNbJ2lkJ10pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWN0aXZlKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBva2Vtb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZih0aGlzLnBva2Vtb25baV0uTnVtYmVyID09PSBpZCl7XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnQgPSB0aGlzLnBva2Vtb25baV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0luZGV4Q29udHJvbGxlcicsIEluZGV4Q29udHJvbGxlcilcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0J1N0b3JhZ2VTZXJ2aWNlJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBmdWxsc2NyZWVuOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEdlb2xvY2F0aW9uU2VydmljZTogR2VvbG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIE1hcFNlcnZpY2U6IE1hcFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgU3RvcmFnZVNlcnZpY2U6IFN0b3JhZ2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aW5pdGlhbGl6ZShkb206IHN0cmluZywgZ2VvbWFya2VyOiBib29sZWFuLCBkcmFnZ2FibGU6IGJvb2xlYW4sIG1hcmtlcnM6IGJvb2xlYW4pOiB2b2lkIHtcclxuXHRcdFx0aWYgKEdlb2xvY2F0aW9uU2VydmljZS5wb3NpdGlvbikge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tKSwgR2VvbG9jYXRpb25TZXJ2aWNlLnBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgR2VvbG9jYXRpb25TZXJ2aWNlLnBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUsIDIpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAobWFya2Vycykge1xyXG5cdFx0XHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAobWFya2Vycykge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmKGdlb21hcmtlcil7XHJcblx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZHJhZ2dhYmxlLCBHZW9sb2NhdGlvblNlcnZpY2UucG9zaXRpb24pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tKSwgMCwgMCwgMikudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdGlmIChtYXJrZXJzKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChtYXJrZXJzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuYWRkTWFya2VycyhtYXJrZXJzKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWQgZm9yIHJlc2l6aW5nIHRoZSBtYXAsIGllOiBtYWtpbmcgaXQgZnVsbCBzY3JlZW5cclxuXHRcdCAqL1xyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmZ1bGxzY3JlZW4gPSAhdGhpcy5mdWxsc2NyZWVuO1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVzaXplKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvY2F0ZSB0aGUgdXNlclxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHJlbG9jYXRlKGRyYWdnYWJsZTogYm9vbGVhbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihkcmFnZ2FibGUsIHJlc3BvbnNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBjb250ZW50IHBhZ2VzXHJcblx0ICogXHJcblx0ICogQGNsYXNzIFBhZ2VDb250cm9sbGVyXHJcblx0ICovXHJcblx0Y2xhc3MgUGFnZUNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0KSB7XHJcblx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignUGFnZUNvbnRyb2xsZXInLCBQYWdlQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb257XHJcblx0ZXhwb3J0IGNsYXNzIEZvcm1EYXRhe1xyXG5cdFx0cHVibGljIG1lc3NhZ2VzOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgcG9zaXRpb246IFBvc2l0aW9uO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBNYXJrZXIge1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vbiB7XHJcblx0XHRwdWJsaWMgQ2xhc3NpZmljYXRpb246IHN0cmluZztcclxuXHRcdHB1YmxpYyBGYXN0QXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgRmxlZVJhdGU6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBIZWlnaHQ6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBNYXhDUDogbnVtYmVyO1xyXG5cdFx0cHVibGljIE1heEhQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIE51bWJlcjogc3RyaW5nO1xyXG5cdFx0cHVibGljIFByZXZpb3VzRXZvbHV0aW9uczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgUmVzaXN0YW50OiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBUeXBlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgU3BlY2lhbEF0dGFja3M6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlYWtuZXNzZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlaWdodDogT2JqZWN0O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkNsYXNzaWZpY2F0aW9uID0gJyc7XHJcblx0XHRcdHRoaXMuRmFzdEF0dGFja3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLkZsZWVSYXRlID0gMDtcclxuXHRcdFx0dGhpcy5IZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRcdHRoaXMuTWF4Q1AgPSAwO1xyXG5cdFx0XHR0aGlzLk1heEhQID0gMDtcclxuXHRcdFx0dGhpcy5OYW1lID0gJyc7XHJcblx0XHRcdHRoaXMuTnVtYmVyID0gJyc7XHJcblx0XHRcdHRoaXMuUHJldmlvdXNFdm9sdXRpb25zID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5SZXNpc3RhbnQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlR5cGVzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5TcGVjaWFsQXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2Vha25lc3NlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2VpZ2h0ID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnU3RvcmFnZVNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIHN0YXRpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSwgXHJcblx0XHRcdHByaXZhdGUgU3RvcmFnZVNlcnZpY2U6IFN0b3JhZ2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldCgpOiBuZy5JUHJvbWlzZTxQb3NpdGlvbj4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZiAoIXRoaXMuV2luZG93U2VydmljZS5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5XaW5kb3dTZXJ2aWNlLm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR2YXIgb3V0cHV0ID0gW107XHJcblxyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZSk7XHJcblxyXG5cdFx0XHRcdFx0R2VvbG9jYXRpb25TZXJ2aWNlLnBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdH0sIChlcnJvcikgPT4ge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRcdG1heGltdW1BZ2U6IDAsXHJcblx0XHRcdFx0XHRcdHRpbWVvdXQ6IDUwMDBcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnR2VvbG9jYXRpb25TZXJ2aWNlJywgR2VvbG9jYXRpb25TZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgTWFwU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRmaWx0ZXInLFxyXG5cdFx0XHQnJGh0dHAnLFxyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnLFxyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHRpbWVvdXQnXHJcblx0XHRdO1xyXG5cclxuXHRcdHByaXZhdGUgYWN0aXZlOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGRvbTogRWxlbWVudDtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZTogZ29vZ2xlLm1hcHMuQ2lyY2xlO1xyXG5cdFx0cHJpdmF0ZSBnZW9NYXJrZXJzOiBnb29nbGUubWFwcy5NYXJrZXJbXTtcclxuXHRcdHByaXZhdGUgZ2VvQ2lyY2xlczogZ29vZ2xlLm1hcHMuQ2lyY2xlW107XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzOiBnb29nbGUubWFwcy5JbmZvV2luZG93W107XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VyczogZ29vZ2xlLm1hcHMuTWFya2VyW107XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXM6IGdvb2dsZS5tYXBzLkNpcmNsZVtdO1xyXG5cdFx0cHJpdmF0ZSBwb2tlbW9uOiBQb2tlbW9uW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlsdGVyU2VydmljZTogbmcuSUZpbHRlclNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBQb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5hY3RpdmUgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigpO1xyXG5cdFx0XHR0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoKTtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdFx0dGhpcy5nZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdFx0dGhpcy5pbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKTtcclxuXHRcdFx0dGhpcy5pbmZvV2luZG93cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5JbmZvV2luZG93PigpO1xyXG5cdFx0XHR0aGlzLm1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoKTtcclxuXHRcdFx0dGhpcy5tYXJrZXJDaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKCk7XHJcblx0XHRcdHRoaXMubWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRcdHRoaXMubWFya2VyQ2lyY2xlcyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5DaXJjbGU+KCk7XHJcblx0XHRcdHRoaXMucG9rZW1vbiA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIG1hcmtlcnMgZnJvbSBBUEkgdG8gdGhlIG1hcFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PE1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhZGRNYXJrZXJzKG1hcmtlcnM6IEFycmF5PE1hcmtlcj4pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5Qb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMucG9rZW1vbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaCh0aGlzLnBva2Vtb24sIChwb2tlbW9uLCBwb2tlbW9uSUQpID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKG1hcmtlcnNbaV0ubmFtZSA9PT0gcG9rZW1vbi5OYW1lKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRcdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoODAsIDgwLCAnZW0nLCAnZW0nKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoODAsIDgwLCAnZW0sJywgJ2VtJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdHVybDogJy9hcGkvcG9rZW1vbi9pY29ucy8nICsgcG9rZW1vbi5OdW1iZXIgKyAnLmljbycsXHJcblx0XHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdFx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRcdFx0XHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdFx0XHRcdFx0XHR0aXRsZTogbWFya2Vyc1tpXS5uYW1lLFxyXG5cdFx0XHRcdFx0XHRcdFx0ekluZGV4OiAxXHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdFx0dGhpcy5pbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xyXG5cdFx0XHRcdFx0XHRjb250ZW50OiBtYXJrZXJzW2ldLm5hbWUgKyAnIChBZGRlZCAnICsgdGhpcy5GaWx0ZXJTZXJ2aWNlKCdkYXRlJykobWFya2Vyc1tpXS5wb3NpdGlvbi50aW1lc3RhbXApICsgJyknXHJcblx0XHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3MucHVzaCh0aGlzLmluZm9XaW5kb3cpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMubWFya2Vycy5wdXNoKHRoaXMubWFya2VyKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KHRoaXMubWFya2VyLCB0aGlzLmluZm9XaW5kb3cpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIG1hcmtlciBmb3IgdXNlcnMgY3VycmVudCBwb3NpdGlvbi5cclxuXHRcdCAqIERlcGVuZHMgb24gdGhlIEdlb2xvY2F0aW9uU2VydmljZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge01hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkR2VvTWFya2VyKGRyYWdnYWJsZTogYm9vbGVhbiwgcG9zaXRpb246IFBvc2l0aW9uKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0ZHJhZ2dhYmxlOiBkcmFnZ2FibGUsXHJcblx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdFx0XHRmaWxsT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0XHRcdHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxyXG5cdFx0XHRcdFx0c2NhbGU6IDgsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdCksXHJcblx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlXHJcblx0XHRcdH0pO1xyXG5cclxuXHJcblx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0Wm9vbSgxNik7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlci5zZXRBbmltYXRpb24oZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1ApO1xyXG5cclxuXHRcdFx0dGhpcy5nZW9NYXJrZXJzLnB1c2godGhpcy5nZW9NYXJrZXIpO1xyXG5cclxuXHRcdFx0aWYgKGRyYWdnYWJsZSkge1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2VyLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5nZXRHZW9Qb3NpdGlvbih0aGlzLmdlb01hcmtlcik7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcclxuXHRcdFx0Ly8gXHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdC8vIFx0KSxcclxuXHRcdFx0Ly8gXHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRmaWxsT3BhY2l0eTogMC4xNSxcclxuXHRcdFx0Ly8gXHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdC8vIFx0cmFkaXVzOiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgKiAzLFxyXG5cdFx0XHQvLyBcdHN0cm9rZUNvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0c3Ryb2tlT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0Ly8gXHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0Ly8gfSk7XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZXMucHVzaCh0aGlzLmdlb0NpcmNsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiBuZy5JUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdHRoaXMuZG9tID0gZG9tO1xyXG5cclxuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5kb20sIHtcclxuXHRcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobGF0LCBsbmcpLFxyXG5cdFx0XHRcdGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXHJcblx0XHRcdFx0bWF4Wm9vbTogMjAsXHJcblx0XHRcdFx0c3R5bGVzOiBbeyBcImZlYXR1cmVUeXBlXCI6IFwiYWRtaW5pc3RyYXRpdmVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy50ZXh0LmZpbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDQ0NDQ0XCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwibGFuZHNjYXBlXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjZjJmMmYyXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicG9pXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJzYXR1cmF0aW9uXCI6IC0xMDAgfSwgeyBcImxpZ2h0bmVzc1wiOiA0NSB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJyb2FkLmhpZ2h3YXlcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwic2ltcGxpZmllZFwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuYXJ0ZXJpYWxcIiwgXCJlbGVtZW50VHlwZVwiOiBcImxhYmVscy5pY29uXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJvZmZcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJ0cmFuc2l0XCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcIndhdGVyXCIsIFwiZWxlbWVudFR5cGVcIjogXCJhbGxcIiwgXCJzdHlsZXJzXCI6IFt7IFwiY29sb3JcIjogXCIjNDZiY2VjXCIgfSwgeyBcInZpc2liaWxpdHlcIjogXCJvblwiIH1dIH1dLFxyXG5cdFx0XHRcdHpvb206IHpvb21cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCAoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRDZW50ZXIobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZykpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIENoZWNrIHdoZW4gdGhlIG1hcCBpcyByZWFkeSBhbmQgcmV0dXJuIGEgcHJvbWlzZVxyXG5cdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmluc3RhbmNlLCAndGlsZXNsb2FkZWQnLCAoKSA9PiB7XHJcblx0XHRcdFx0dmFyIHJlc3VsdDtcclxuXHJcblx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5pbnN0YW5jZSwgJ3RpbGVzbG9hZGVkJyk7XHJcblxyXG5cdFx0XHRcdHJlc3VsdCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgdmlzaWJsZSBtYXJrZXJzIGJ5IGEgbWF0Y2hpbmcgdmFsdWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyTWFya2VycyhzZWFyY2g/OiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKHNlYXJjaCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFRpdGxlKCkudG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldEdlb1Bvc2l0aW9uKG1hcmtlcj86IGdvb2dsZS5tYXBzLk1hcmtlcik6IG5nLklQcm9taXNlPGdvb2dsZS5tYXBzLkxhdExuZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0O1xyXG5cclxuXHRcdFx0cmVzdWx0ID0gdGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IG1hcmtlcnMgZnJvbSBlbmRwb2ludFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBUEkgZW5kcG9pbnRcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTw8QXJyYXk8TWFya2VyPj59IEFuIGFycmF5IG9mIG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0Z2V0TWFya2VycyhwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxNYXJrZXI+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE9wZW4gaW5mb3dpbmRvdywgY2xvc2Ugb3RoZXJzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuTWFya2VyfSBtYXJrZXIgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5JbmZvV2luZG93fSBpbmZvV2luZG93IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0b3BlbkluZm9XaW5kb3cobWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXIsIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3cpOiB2b2lkIHtcclxuXHRcdFx0bWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5mb1dpbmRvd3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3NbaV0uY2xvc2UoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGluZm9XaW5kb3cub3Blbih0aGlzLmluc3RhbmNlLCBtYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZW1vdmVHZW9NYXJrZXJzKCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvTWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2Vyc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9DaXJjbGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9DaXJjbGVzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVHJpZ2dlcmluZyByZXNpemUgZXZlbnRzXHJcblx0XHQgKi9cclxuXHRcdHJlc2l6ZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5UaW1lb3V0U2VydmljZSgoKSA9PiB7XHJcblx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQudHJpZ2dlcih0aGlzLmluc3RhbmNlLCAncmVzaXplJyk7XHJcblx0XHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRDZW50ZXIodGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKSk7XHJcblx0XHRcdH0sIDApXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGb3Igc2V0dGluZyB0aGUgbWFwIHRvIGEgY2VudGVyIHBvaW50XHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBsYXRpdHVkZVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxvbmdpdHVkZVxyXG5cdFx0ICovXHJcblx0XHRzZXRDZW50ZXIobGF0aXR1ZGU6IG51bWJlciwgbG9uZ2l0dWRlOiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRDZW50ZXIobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXRpdHVkZSwgbG9uZ2l0dWRlKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ01hcFNlcnZpY2UnLCBNYXBTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgUG9rZW1vblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SVBva2Vtb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRodHRwJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JSHR0cFByb21pc2U8QXJyYXk8UG9rZW1vbj4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxQb2tlbW9uPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ1Bva2Vtb25TZXJ2aWNlJywgUG9rZW1vblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgU3RvcmFnZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogRmV0Y2ggaXRlbSBieSBrZXkgZnJvbSBzZXNzaW9uIHN0b3JhZ2UuIENvbXBhcmUgdG8gc291cmNlXHJcblx0XHQgKiBkYXRhIGFuZCBidWlsZCBhbiBvdXRwdXQgYXJyYXkgdGhhdCBjb250YWlucyBmdWxsIHZlcnNpb25zXHJcblx0XHQgKiBhbmQgbm90IGp1c3QgdGhlIGlkIGZpZWxkIG9mIGVhY2ggc3RvcmVkIGl0ZW0uXHJcblx0XHQgKiBcclxuXHRcdCAqIEB0ZW1wbGF0ZSBUXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxBcnJheTxUPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0PFQ+KGtleTogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8VD4+IHtcclxuXHRcdFx0dmFyIGRlZmVyID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdG91dHB1dCxcclxuXHRcdFx0XHRyZXNwb25zZSxcclxuXHRcdFx0XHRyZXN1bHQ7XHJcblxyXG5cdFx0XHRyZXNwb25zZSA9IHRoaXMuV2luZG93U2VydmljZS5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblxyXG5cdFx0XHRpZiAocmVzcG9uc2UgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChyZXNwb25zZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG5cclxuXHRcdFx0XHRcdGRlZmVyLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0ZGVmZXIucmVqZWN0KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlci5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBhIGZpZWxkIGZyb20gYSBkYXRhIHNldCB0byBhIHN0cmluZyB2YWx1ZSBpbiBzZXNzaW9uIHN0b3JhZ2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHRlbXBsYXRlIFRcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBbZmllbGRdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c2V0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZXM6IEFycmF5PFQ+LCBmaWVsZD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR2YXIgaW5wdXQ7XHJcblxyXG5cdFx0XHRpbnB1dCA9IHZhbHVlcy5qb2luKCcsJyk7XHJcblxyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2Uuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIGlucHV0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnU3RvcmFnZVNlcnZpY2UnLCBTdG9yYWdlU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
