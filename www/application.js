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
        function FormController(GeolocationService, FirebaseService, MapService, PokemonService) {
            var _this = this;
            this.GeolocationService = GeolocationService;
            this.FirebaseService = FirebaseService;
            this.MapService = MapService;
            this.PokemonService = PokemonService;
            this.PokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
            });
        }
        FormController.prototype.autocomplete = function (model, pokemon) {
            this[model] = pokemon.Name;
        };
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
                        _this.MapService.addMarkers(markers);
                        _this.MapService.addHeatmap();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9QYWdlQ29udHJvbGxlci50cyIsIm1vZGVscy9Qb2tlbW9uLnRzIiwic2VydmljZXMvRmlyZWJhc2VTZXJ2aWNlLnRzIiwic2VydmljZXMvR2VvbG9jYXRpb25TZXJ2aWNlLnRzIiwic2VydmljZXMvTWFwU2VydmljZS50cyIsInNlcnZpY2VzL1Bva2Vtb25TZXJ2aWNlLnRzIiwiZGlyZWN0aXZlcy9kcm9wZG93bi9jb250cm9sbGVycy9Ecm9wZG93bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBSXBCO0FBSkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLEVBSlMsV0FBVyxLQUFYLFdBQVcsUUFJcEI7QUNKRCw2Q0FBNkM7QUFDN0MsSUFBVSxXQUFXLENBTXBCO0FBTkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdEI7UUFDQyxTQUFTO1FBQ1QsVUFBVTtLQUNWLENBQUMsQ0FBQztBQUNMLENBQUMsRUFOUyxXQUFXLEtBQVgsV0FBVyxRQU1wQjtBQ1BELElBQVUsV0FBVyxDQWFwQjtBQWJELFdBQVUsV0FBVyxFQUFDLENBQUM7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QUMxQixDQUFDO1FBWk0sMEJBQU8sR0FBRyxFQUVoQixDQUFDO1FBV0gseUJBQUM7SUFBRCxDQWRBLEFBY0MsSUFBQTtJQUVEOzs7OztPQUtHO0lBQ0g7UUFTQztZQUNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRztnQkFDdkIsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsS0FBSyxFQUFFLEdBQUc7YUFDVixDQUFBO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLDBDQUEwQyxDQUFBO1lBQzdELElBQUksQ0FBQyxVQUFVLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLE1BQU0sRUFBRSxpQkFBaUI7YUFDekIsQ0FBQztRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLDBCQUFRLEdBQWY7WUFDQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLGdDQUFJLEdBQVgsVUFBWSxLQUFnQixFQUFFLE9BQTRCO1FBRTFELENBQUM7UUFDRix3QkFBQztJQUFELENBN0NBLEFBNkNDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELENBQUMsRUFoRlMsUUFBUSxLQUFSLFFBQVEsUUFnRmpCIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHRcdGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0NsaWVudCddKTtcclxuXHR9KTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XHJcbm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ0NsaWVudCcsIFxyXG5cdFx0W1xyXG5cdFx0XHQnbmdSb3V0ZScsXHJcblx0XHRcdCdvZmZDbGljaydcclxuXHRcdF0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRcclxuXHRleHBvcnQgY2xhc3MgTG9jYXRpb25Qcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgTG9jYXRpb25Qcm92aWRlcjogbmcuSUxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgTG9jYXRpb25Qcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUm91dGVQcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgUm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFJvdXRlUHJvdmlkZXJcclxuXHRcdFx0XHQud2hlbignL3BhZ2UnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidQYWdlQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdQYWdlJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL3BhZ2UuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvZm9ybScsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0Zvcm1Db250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0Zvcm0nLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvZm9ybS5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9tYXAnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidNYXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ01hcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9tYXAuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQub3RoZXJ3aXNlKCcvbWFwJylcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIFJvdXRlUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBnbG9iYWwgZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJQXBwbGljYXRpb25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCckbG9jYXRpb24nLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGRhdGE6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBMb2NhdGlvblNlcnZpY2U6IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgV2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHRGaXJlYmFzZVNlcnZpY2UuY29uZmlndXJlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWxvYWQgdGhlIGVudGlyZSBtYXAgdG8gY2hlY2sgZm9yIHVwZGF0ZXNcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2FkKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayB0aGF0IHRoZSBjdXJyZW50IHBhdGggbWF0Y2hlcyB0aGUgbG9jYXRpb24gcGF0aFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjdXJyZW50Um91dGUocGF0aDogc3RyaW5nKTogYm9vbGVhbntcclxuXHRcdFx0aWYocGF0aCA9PSB0aGlzLkxvY2F0aW9uU2VydmljZS5wYXRoKCkpe1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0FwcGxpY2F0aW9uQ29udHJvbGxlcicsIEFwcGxpY2F0aW9uQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZm9ybSBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRm9ybUNvbnRyb2xsZXJcclxuXHQgKi9cclxuXHRjbGFzcyBGb3JtQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGVycm9yOiBib29sZWFuO1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb2tlbW9uOiBQb2tlbW9uW107XHJcblx0XHRwdWJsaWMgc3RhdGU6IGJvb2xlYW47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBQb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLlBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5wb2tlbW9uID0gcmVzcG9uc2U7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0YXV0b2NvbXBsZXRlKG1vZGVsOiBzdHJpbmcsIHBva2Vtb246IFBva2Vtb24pe1xyXG5cdFx0XHR0aGlzW21vZGVsXSA9IHBva2Vtb24uTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Ym1pdCBmb3JtIGRhdGEgdG8gZGF0YWJhc2UsIHJlc2V0IG1hcCwgbm90aWZ5IHVzZXJcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgaXRlbSBiZWluZyBzdWJtaXR0ZWRcclxuXHRcdCAqL1xyXG5cdFx0c3VibWl0KG5hbWU6IHN0cmluZykge1xyXG5cdFx0XHRpZiAobmFtZSkge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5nZXRHZW9Qb3NpdGlvbigpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5wdXNoKHtcclxuXHRcdFx0XHRcdFx0J3Bvc2l0aW9uJzoge1xyXG5cdFx0XHRcdFx0XHRcdCdjb29yZHMnOiB7XHJcblx0XHRcdFx0XHRcdFx0XHQnbGF0aXR1ZGUnOiBwb3NpdGlvbi5sYXQoKSxcclxuXHRcdFx0XHRcdFx0XHRcdCdsb25naXR1ZGUnOiBwb3NpdGlvbi5sbmcoKVxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0J3RpbWVzdGFtcCc6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSlcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0J25hbWUnOiBuYW1lXHJcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLk1hcFNlcnZpY2Uuc2V0Q2VudGVyKHBvc2l0aW9uLmxhdCgpLCBwb3NpdGlvbi5sbmcoKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLnRvZ2dsZSgpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5lcnJvciA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgRm9ybUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBDb250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBDb250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIE1hcENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGZ1bGxzY3JlZW46IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgbG9hZGVkOiBib29sZWFuO1xyXG5cdFx0cHVibGljIGxvY2F0aW9uOiBQb3NpdGlvbjtcclxuXHRcdHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmlsdGVyIHRoZSBtYXAgaXRlbXMgYmFzZWQgb24gdGhlIHNlYXJjaCBtb2RlbFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gW3NlYXJjaF0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXIoc2VhcmNoPzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJNYXJrZXJzKHNlYXJjaCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmZpbHRlckhlYXRNYXAoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aW5pdGlhbGl6ZShkb206IHN0cmluZywgZ2VvbWFya2VyOiBib29sZWFuLCBkcmFnZ2FibGU6IGJvb2xlYW4sIG1hcmtlcnM6IGJvb2xlYW4pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5HZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRvbSksIHJlc3BvbnNlLmNvb3Jkcy5sYXRpdHVkZSwgcmVzcG9uc2UuY29vcmRzLmxvbmdpdHVkZSwgMTYpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmxvYWRlZCA9IHJlc3BvbnNlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGlmIChnZW9tYXJrZXIpIHtcclxuXHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZHJhZ2dhYmxlLCByZXNwb25zZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KS5jYXRjaCgocmVhc29uKSA9PiB7XHJcblx0XHRcdFx0YWxlcnQoJ0dlb2xvY2F0aW9uIGxvb2t1cCBoYXMgZmFpbGVkJyk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2cocmVhc29uKTtcclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0aWYgKG1hcmtlcnMpIHtcclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRIZWF0bWFwKCk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVc2VkIGZvciByZXNpemluZyB0aGUgbWFwLCBpZTogbWFraW5nIGl0IGZ1bGwgc2NyZWVuXHJcblx0XHQgKi9cclxuXHRcdHJlc2l6ZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5mdWxsc2NyZWVuID0gIXRoaXMuZnVsbHNjcmVlbjtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnJlc2l6ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2NhdGUgdGhlIHVzZXJcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBkcmFnZ2FibGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZWxvY2F0ZShkcmFnZ2FibGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5HZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UucmVtb3ZlR2VvTWFya2VycygpO1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRHZW9NYXJrZXIoZHJhZ2dhYmxlLCByZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgY29udGVudCBwYWdlc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQYWdlQ29udHJvbGxlclxyXG5cdCAqL1xyXG5cdGNsYXNzIFBhZ2VDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdCkge1xyXG5cdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDb250cm9sbGVyJywgUGFnZUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vbiB7XHJcblx0XHRwdWJsaWMgQ2xhc3NpZmljYXRpb246IHN0cmluZztcclxuXHRcdHB1YmxpYyBGYXN0QXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgRmxlZVJhdGU6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBIZWlnaHQ6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBNYXhDUDogbnVtYmVyO1xyXG5cdFx0cHVibGljIE1heEhQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIE51bWJlcjogc3RyaW5nO1xyXG5cdFx0cHVibGljIFByZXZpb3VzRXZvbHV0aW9uczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgUmVzaXN0YW50OiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBUeXBlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgU3BlY2lhbEF0dGFja3M6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlYWtuZXNzZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlaWdodDogT2JqZWN0O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkNsYXNzaWZpY2F0aW9uID0gJyc7XHJcblx0XHRcdHRoaXMuRmFzdEF0dGFja3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLkZsZWVSYXRlID0gMDtcclxuXHRcdFx0dGhpcy5IZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRcdHRoaXMuTWF4Q1AgPSAwO1xyXG5cdFx0XHR0aGlzLk1heEhQID0gMDtcclxuXHRcdFx0dGhpcy5OYW1lID0gJyc7XHJcblx0XHRcdHRoaXMuTnVtYmVyID0gJyc7XHJcblx0XHRcdHRoaXMuUHJldmlvdXNFdm9sdXRpb25zID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5SZXNpc3RhbnQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlR5cGVzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5TcGVjaWFsQXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2Vha25lc3NlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2VpZ2h0ID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBxOiBuZy5JUVNlcnZpY2UsIHByaXZhdGUgd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMucS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLndpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xyXG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0dlb2xvY2F0aW9uU2VydmljZScsIEdlb2xvY2F0aW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcFNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcFNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIE1hcFNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckZmlsdGVyJyxcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR0aW1lb3V0J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwcml2YXRlIGFjdGl2ZTogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBkb206IEVsZW1lbnQ7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VyczogZ29vZ2xlLm1hcHMuTWFya2VyW107XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZXM6IGdvb2dsZS5tYXBzLkNpcmNsZVtdO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwOiBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcjtcclxuXHRcdHByaXZhdGUgaGVhdG1hcFBvaW50czogZ29vZ2xlLm1hcHMuTGF0TG5nW107XHJcblx0XHRwcml2YXRlIGluc3RhbmNlOiBnb29nbGUubWFwcy5NYXA7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzOiBnb29nbGUubWFwcy5JbmZvV2luZG93W107XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgbWFya2VyczogZ29vZ2xlLm1hcHMuTWFya2VyW107XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZXM6IGdvb2dsZS5tYXBzLkNpcmNsZVtdO1xyXG5cdFx0cHJpdmF0ZSBwb2tlbW9uOiBQb2tlbW9uW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlsdGVyU2VydmljZTogbmcuSUZpbHRlclNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBQb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBUaW1lb3V0U2VydmljZTogbmcuSVRpbWVvdXRTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5hY3RpdmUgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigpO1xyXG5cdFx0XHR0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoKTtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdFx0dGhpcy5nZW9DaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHRcdFx0dGhpcy5oZWF0bWFwID0gbmV3IGdvb2dsZS5tYXBzLnZpc3VhbGl6YXRpb24uSGVhdG1hcExheWVyKCk7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5MYXRMbmc+KCk7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvd3MgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuSW5mb1dpbmRvdz4oKTtcclxuXHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMubWFya2VyQ2lyY2xlID0gbmV3IGdvb2dsZS5tYXBzLkNpcmNsZSgpO1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0XHR0aGlzLm1hcmtlckNpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cdFx0XHR0aGlzLnBva2Vtb24gPSBuZXcgQXJyYXk8UG9rZW1vbj4oKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBtYXJrZXJzIGZyb20gQVBJIHRvIHRoZSBtYXBcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkTWFya2VycyhtYXJrZXJzOiBBcnJheTxNYXJrZXI+KTogdm9pZCB7XHJcblx0XHRcdHRoaXMuUG9rZW1vblNlcnZpY2UuZ2V0KCcvYXBpL3Bva2Vtb24vcG9rZW1vbi5qc29uJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLnBva2Vtb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2godGhpcy5wb2tlbW9uLCAocG9rZW1vbiwgcG9rZW1vbklEKSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmIChtYXJrZXJzW2ldLm5hbWUgPT09IHBva2Vtb24uTmFtZSkge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0XHRcdFx0XHRpY29uOiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDQwLCA0MCwgJ2VtJywgJ2VtJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdHNjYWxlZFNpemU6IG5ldyBnb29nbGUubWFwcy5TaXplKDQwLCA0MCwgJ2VtLCcsICdlbScpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR1cmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIHBva2Vtb24uTnVtYmVyICsgJy5zdmcnLFxyXG5cdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bWFya2Vyc1tpXS5wb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdFx0XHRcdFx0XHQpLFxyXG5cdFx0XHRcdFx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlcnNbaV0ubmFtZSxcclxuXHRcdFx0XHRcdFx0XHRcdHpJbmRleDogMVxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcclxuXHRcdFx0XHRcdFx0Y29udGVudDogbWFya2Vyc1tpXS5uYW1lICsgJyAoQWRkZWQgJyArIHRoaXMuRmlsdGVyU2VydmljZSgnZGF0ZScpKG1hcmtlcnNbaV0ucG9zaXRpb24udGltZXN0YW1wKSArICcpJ1xyXG5cdFx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzLnB1c2godGhpcy5pbmZvV2luZG93KTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnMucHVzaCh0aGlzLm1hcmtlcik7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5vcGVuSW5mb1dpbmRvdyh0aGlzLm1hcmtlciwgdGhpcy5pbmZvV2luZG93KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBtYXJrZXIgZm9yIHVzZXJzIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHQgKiBEZXBlbmRzIG9uIHRoZSBHZW9sb2NhdGlvblNlcnZpY2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBkcmFnZ2FibGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEdlb01hcmtlcihkcmFnZ2FibGU6IGJvb2xlYW4sIHBvc2l0aW9uOiBQb3NpdGlvbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmdlb01hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdGRyYWdnYWJsZTogZHJhZ2dhYmxlLFxyXG5cdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IDAuMzUsXHJcblx0XHRcdFx0XHRwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcclxuXHRcdFx0XHRcdHNjYWxlOiA4LFxyXG5cdFx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCk7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlcnMucHVzaCh0aGlzLmdlb01hcmtlcik7XHJcblxyXG5cdFx0XHRpZiAoZHJhZ2dhYmxlKSB7XHJcblx0XHRcdFx0dGhpcy5nZW9NYXJrZXIuYWRkTGlzdGVuZXIoJ2RyYWdlbmQnLCAoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmdldEdlb1Bvc2l0aW9uKHRoaXMuZ2VvTWFya2VyKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xyXG5cdFx0XHQvLyBcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0Ly8gXHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0Ly8gXHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0Ly8gXHQpLFxyXG5cdFx0XHQvLyBcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHQvLyBcdGZpbGxPcGFjaXR5OiAwLjE1LFxyXG5cdFx0XHQvLyBcdG1hcDogdGhpcy5pbnN0YW5jZSxcclxuXHRcdFx0Ly8gXHRyYWRpdXM6IHBvc2l0aW9uLmNvb3Jkcy5hY2N1cmFjeSAqIDMsXHJcblx0XHRcdC8vIFx0c3Ryb2tlQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRzdHJva2VPcGFjaXR5OiAwLjM1LFxyXG5cdFx0XHQvLyBcdHN0cm9rZVdlaWdodDogMlxyXG5cdFx0XHQvLyB9KTtcclxuXHJcblx0XHRcdC8vIHRoaXMuZ2VvQ2lyY2xlcy5wdXNoKHRoaXMuZ2VvQ2lyY2xlKTtcclxuXHJcblx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0Q2VudGVyKHRoaXMuZ2VvTWFya2VyLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIGEgaGVhdG1hcCB0byB0aGUgbWFwIGluc3RhbmNlIGJ5XHJcblx0XHQgKiBwYXNzaW5nIGluIG1hcCBwb2ludHNcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkSGVhdG1hcCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMucHVzaCh0aGlzLm1hcmtlcnNbaV0uZ2V0UG9zaXRpb24oKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuaGVhdG1hcCA9IG5ldyBnb29nbGUubWFwcy52aXN1YWxpemF0aW9uLkhlYXRtYXBMYXllcih7XHJcblx0XHRcdFx0ZGF0YTogdGhpcy5oZWF0bWFwUG9pbnRzLFxyXG5cdFx0XHRcdHJhZGl1czogNTBcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAuc2V0TWFwKHRoaXMuaW5zdGFuY2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0VsZW1lbnR9IGRvbSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbGF0IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBsbmcgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IHpvb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjcmVhdGVNYXAoZG9tOiBFbGVtZW50LCBsYXQ6IG51bWJlciwgbG5nOiBudW1iZXIsIHpvb206IG51bWJlcik6IG5nLklQcm9taXNlPGJvb2xlYW4+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0dGhpcy5kb20gPSBkb207XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLmRvbSwge1xyXG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZyksXHJcblx0XHRcdFx0ZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuXHRcdFx0XHRtYXhab29tOiAyMCxcclxuXHRcdFx0XHRzdHlsZXM6IFt7IFwiZmVhdHVyZVR5cGVcIjogXCJhZG1pbmlzdHJhdGl2ZVwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLnRleHQuZmlsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NDQ0NDRcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJsYW5kc2NhcGVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiNmMmYyZjJcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJwb2lcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZFwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInNhdHVyYXRpb25cIjogLTEwMCB9LCB7IFwibGlnaHRuZXNzXCI6IDQ1IH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuaGlnaHdheVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJzaW1wbGlmaWVkXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZC5hcnRlcmlhbFwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLmljb25cIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInRyYW5zaXRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwid2F0ZXJcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NmJjZWNcIiB9LCB7IFwidmlzaWJpbGl0eVwiOiBcIm9uXCIgfV0gfV0sXHJcblx0XHRcdFx0em9vbTogem9vbVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHdpbmRvdywgJ3Jlc2l6ZScsICgpID0+IHtcclxuXHRcdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gQ2hlY2sgd2hlbiB0aGUgbWFwIGlzIHJlYWR5IGFuZCByZXR1cm4gYSBwcm9taXNlXHJcblx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuaW5zdGFuY2UsICd0aWxlc2xvYWRlZCcsICgpID0+IHtcclxuXHRcdFx0XHR2YXIgcmVzdWx0O1xyXG5cclxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLmluc3RhbmNlLCAndGlsZXNsb2FkZWQnKTtcclxuXHJcblx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmlsdGVyIHRoZSB2aXNpYmxlIG1hcmtlcnMgYnkgYSBtYXRjaGluZyB2YWx1ZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj59IG1hcmtlcnMgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXJNYXJrZXJzKHNlYXJjaD86IHN0cmluZyk6IG5nLklQcm9taXNlPHN0cmluZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZiAoc2VhcmNoKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmICh0aGlzLm1hcmtlcnNbaV0uZ2V0VGl0bGUoKS50b0xvd2VyQ2FzZSgpID09PSBzZWFyY2gudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZShmYWxzZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMubWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVXNlZnVsIHdoZW4gbWFya2VycyBjaGFuZ2UgdG8gcmVmbGVjdCB0aG9zZSBjaGFuZ2VzXHJcblx0XHQgKiBpbiB0aGUgaGVhdG1hcHBpbmdcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVySGVhdE1hcCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLmxlbmd0aCA9IDA7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh0aGlzLm1hcmtlcnNbaV0uZ2V0VmlzaWJsZSgpKSB7XHJcblx0XHRcdFx0XHR0aGlzLmhlYXRtYXBQb2ludHMucHVzaCh0aGlzLm1hcmtlcnNbaV0uZ2V0UG9zaXRpb24oKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAuc2V0TWFwKHRoaXMuaW5zdGFuY2UpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPFBvc2l0aW9uPn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXRHZW9Qb3NpdGlvbihtYXJrZXI/OiBnb29nbGUubWFwcy5NYXJrZXIpOiBuZy5JUHJvbWlzZTxnb29nbGUubWFwcy5MYXRMbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdDtcclxuXHJcblx0XHRcdHJlc3VsdCA9IHRoaXMuZ2VvTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcblxyXG5cdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBtYXJrZXJzIGZyb20gZW5kcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggQVBJIGVuZHBvaW50XHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8PEFycmF5PE1hcmtlcj4+fSBBbiBhcnJheSBvZiBtYXJrZXJzXHJcblx0XHQgKi9cclxuXHRcdGdldE1hcmtlcnMocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8TWFya2VyPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBPcGVuIGluZm93aW5kb3csIGNsb3NlIG90aGVyc1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2dvb2dsZS5tYXBzLk1hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuSW5mb1dpbmRvd30gaW5mb1dpbmRvdyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdG9wZW5JbmZvV2luZG93KG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyLCBpbmZvV2luZG93OiBnb29nbGUubWFwcy5JbmZvV2luZG93KTogdm9pZCB7XHJcblx0XHRcdG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluZm9XaW5kb3dzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzW2ldLmNsb3NlKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpbmZvV2luZG93Lm9wZW4odGhpcy5pbnN0YW5jZSwgbWFya2VyKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cmVtb3ZlR2VvTWFya2VycygpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb01hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmdlb01hcmtlcnNbaV0uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvQ2lyY2xlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMuZ2VvQ2lyY2xlc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0cmVzZXQoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmlnZ2VyaW5nIHJlc2l6ZSBldmVudHNcclxuXHRcdCAqL1xyXG5cdFx0cmVzaXplKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLlRpbWVvdXRTZXJ2aWNlKCgpID0+IHtcclxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKHRoaXMuaW5zdGFuY2UsICdyZXNpemUnKTtcclxuXHRcdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdFx0fSwgMClcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZvciBzZXR0aW5nIHRoZSBtYXAgdG8gYSBjZW50ZXIgcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdGl0dWRlXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG9uZ2l0dWRlXHJcblx0XHQgKi9cclxuXHRcdHNldENlbnRlcihsYXRpdHVkZTogbnVtYmVyLCBsb25naXR1ZGU6IG51bWJlcik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdGl0dWRlLCBsb25naXR1ZGUpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnTWFwU2VydmljZScsIE1hcFNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQb2tlbW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJUG9rZW1vblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIFBva2Vtb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGh0dHAnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge25nLklIdHRwUHJvbWlzZTxBcnJheTxQb2tlbW9uPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PFBva2Vtb24+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnUG9rZW1vblNlcnZpY2UnLCBQb2tlbW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
