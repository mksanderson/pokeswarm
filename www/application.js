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
                .when('/form/', {
                controller: 'FormController',
                controllerAs: 'Form',
                templateUrl: '/templates/form/name.html'
            })
                .when('/form/location', {
                controller: 'FormController',
                controllerAs: 'Form',
                templateUrl: '/templates/form/location.html'
            })
                .when('/form/success', {
                controller: 'FormController',
                controllerAs: 'Form',
                templateUrl: '/templates/form/success.html'
            })
                .when('/index', {
                controller: 'IndexController',
                controllerAs: 'Index',
                templateUrl: '/templates/index/index.html'
            })
                .when('/index/:id', {
                controller: 'IndexController',
                controllerAs: 'Index',
                templateUrl: '/templates/index/pokemon.html'
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
        function ApplicationController(firebaseService, locationService, windowService) {
            this.firebaseService = firebaseService;
            this.locationService = locationService;
            this.windowService = windowService;
            firebaseService.configure();
        }
        /**
         * Reload the entire application to check for updates
         */
        ApplicationController.prototype.reload = function () {
            this.windowService.location.reload();
        };
        /**
         * Check that the current path matches the location path
         *
         * @param {string} path (description)
         * @returns {boolean} (description)
         */
        ApplicationController.prototype.currentRoute = function (path) {
            if (this.locationService.path().search(path)) {
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
        function FormController(geolocationService, firebaseService, mapService, pokemonService, storageService, windowService) {
            var _this = this;
            this.geolocationService = geolocationService;
            this.firebaseService = firebaseService;
            this.mapService = mapService;
            this.pokemonService = pokemonService;
            this.storageService = storageService;
            this.windowService = windowService;
            this.formData = new Application.FormData();
            this.pokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
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
         * (description)
         *
         * @param {string} field (description)
         * @param {string} path (description)
         */
        FormController.prototype.record = function (field, path) {
            var input = [];
            angular.forEach(this.formData, function (value, key) {
                if (angular.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        input.push(value[i]);
                    }
                }
                else {
                    input.push(value);
                }
            });
            this.storageService.set('form', input);
            this.windowService.open(path, '_self');
        };
        /**
         * Submit form data to database, reset map, notify user
         */
        FormController.prototype.submit = function () {
            var _this = this;
            this.storageService.get('form').then(function (response) {
                _this.formData.name = response;
            });
            this.storageService.empty('form');
            if (this.formData.name) {
                this.mapService.position().then(function (response) {
                    var position = response;
                    _this.firebaseService.push({
                        'position': {
                            'coords': {
                                'latitude': position.lat,
                                'longitude': position.lng
                            },
                            'timestamp': Math.floor(Date.now())
                        },
                        'name': _this.formData.name
                    }).then(function (response) {
                        _this.firebaseService.get('/').then(function (response) {
                            var markers = [];
                            for (var i = 0; i < response.length; i++) {
                                markers.push(response[i].val());
                            }
                            _this.formData.messages = new Array();
                            _this.formData.messages.push('Successfully added ' + _this.formData.name);
                            _this.formData.name = '';
                            _this.toggle();
                            _this.windowService.open('/#/form/success', '_self');
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
            'PokemonService',
            'StorageService',
            '$window'
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
        function IndexController(pokemonService, routeService) {
            var _this = this;
            this.pokemonService = pokemonService;
            this.routeService = routeService;
            this.parameters = new Object();
            pokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
                _this.parameters = routeService.current.params;
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
        function MapController(firebaseService, geolocationService, mapService, pokemonService, storageService, windowService) {
            this.firebaseService = firebaseService;
            this.geolocationService = geolocationService;
            this.mapService = mapService;
            this.pokemonService = pokemonService;
            this.storageService = storageService;
            this.windowService = windowService;
            this.markers = new Array();
            geolocationService.get().then(function (response) {
                mapService.configure(document.getElementById('map'), response, 12);
            }).then(function () {
                var markers = [];
                firebaseService.get('/').then(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        markers.push(response[i].val());
                    }
                }).then(function () {
                    pokemonService.get('/api/pokemon/pokemon.json').then(function (response) {
                        angular.forEach(response, function (pokemon, pokemonID) {
                            for (var i = 0; i < markers.length; i++) {
                                if (markers[i]['name'] === pokemon.Name) {
                                    markers[i]['number'] = pokemon.Number;
                                }
                            }
                        });
                        mapService.points(markers);
                    });
                });
            });
        }
        MapController.prototype.locate = function () {
            this.mapService.locate();
        };
        MapController.$inject = [
            'FirebaseService',
            'GeolocationService',
            'MapService',
            'PokemonService',
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
            var _this = this;
            var deferred = this.QService.defer();
            if (!this.WindowService.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            }
            else {
                this.WindowService.navigator.geolocation.getCurrentPosition(function (response) {
                    var output = [];
                    deferred.resolve(response);
                }, function (error) {
                    _this.WindowService.navigator.geolocation.getCurrentPosition(function (response) {
                        var output = [];
                        deferred.resolve(response);
                    }, function (error) {
                    }, {
                        enableHighAccuracy: true,
                        maximumAge: 60000,
                        timeout: 5000
                    });
                }, {
                    enableHighAccuracy: true,
                    maximumAge: 60000,
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
            this.infoWindow = new google.maps.InfoWindow();
            this.infoWindows = new Array();
            this.marker = new google.maps.Marker();
            this.markers = new Array();
        }
        /**
         * (description)
         *
         * @param {HTMLElement} element (description)
         * @param {Position} center (description)
         * @param {number} zoom (description)
         */
        MapService.prototype.configure = function (element, center, zoom) {
            var _this = this;
            this.map = L.map(element);
            this.locate();
            L.tileLayer('https://api.mapbox.com/styles/v1/mksanderson/cisohlaqg000f2xpbetshz7jv/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWtzYW5kZXJzb24iLCJhIjoiRTI5SUlZQSJ9.WUx-mVx949iRWfG-s7YZvA', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);
            this.map.on('resize', function () {
                _this.map.invalidateSize({
                    animate: true
                });
            });
        };
        /**
         * (description)
         */
        MapService.prototype.locate = function () {
            var _this = this;
            this.map.locate({
                enableHighAccuracy: true,
                setView: true
            }).on('locationfound', function (response) {
                if (_this.location) {
                    _this.map.removeLayer(_this.location);
                }
                _this.location = L.marker(response['latlng'], {
                    draggable: true,
                    icon: L.divIcon({
                        className: 'location',
                        iconSize: [32, 32]
                    }),
                    title: 'Your location'
                });
                _this.map.addLayer(_this.location);
            }).on('locationerror', function (response) {
                alert('Geolocation error: ' + response);
            });
        };
        /**
         * (description)
         *
         * @template T
         * @param {Array<T>} values (description)
         */
        MapService.prototype.points = function (values) {
            for (var i = 0; i < values.length; i++) {
                L.marker([values[i]['position']['coords']['latitude'], values[i]['position']['coords']['longitude']], {
                    icon: L.icon({
                        iconSize: [60, 60],
                        iconUrl: '/api/pokemon/icons/' + values[i]['number'] + '.ico'
                    }),
                    riseOnHover: true,
                    title: values[i]['name']
                }).addTo(this.map);
            }
        };
        /**
         * (description)
         *
         * @returns {ng.IPromise<L.LatLng>} (description)
         */
        MapService.prototype.position = function () {
            var deferral = this.QService.defer();
            if (this.location) {
                deferral.resolve(this.location.getLatLng());
            }
            else {
                deferral.reject('No location available');
            }
            return deferral.promise;
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
         * Clear an item in storage
         *
         * @template T
         * @param {string} key (description)
         */
        StorageService.prototype.empty = function (key) {
            this.WindowService.sessionStorage.removeItem(key);
        };
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
                if (angular.isArray(response)) {
                    if (response.length) {
                        result = JSON.parse(response);
                        defer.resolve(result);
                    }
                }
                else {
                    defer.resolve(response);
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
            if (angular.isArray(values)) {
                input = values.join(',');
            }
            else {
                input = values;
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL0luZGV4Q29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJtb2RlbHMvRm9ybURhdGEudHMiLCJtb2RlbHMvTWFya2VyLnRzIiwibW9kZWxzL1Bva2Vtb24udHMiLCJzZXJ2aWNlcy9GaXJlYmFzZVNlcnZpY2UudHMiLCJzZXJ2aWNlcy9HZW9sb2NhdGlvblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9NYXBTZXJ2aWNlLnRzIiwic2VydmljZXMvUG9rZW1vblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9TdG9yYWdlU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU9wQjtBQVBELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsUUFBUTtRQUNSLFNBQVM7UUFDVCxVQUFVO0tBQ1YsQ0FBQyxDQUFDO0FB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Ozs7O1dBS0c7UUFDSSwwQkFBUSxHQUFmO1lBQ0MsTUFBTSxDQUFDLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSxnQ0FBSSxHQUFYLFVBQVksS0FBZ0IsRUFBRSxPQUE0QjtRQUUxRCxDQUFDO1FBQ0Ysd0JBQUM7SUFBRCxDQTdDQSxBQTZDQyxJQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsU0FBUyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRCxDQUFDLEVBaEZTLFFBQVEsS0FBUixRQUFRLFFBZ0ZqQiIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblx0XHRhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydDbGllbnQnXSk7XHJcblx0fSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIvPlxyXG5uYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdDbGllbnQnLFxyXG5cdFx0W1xyXG5cdFx0XHQnbmdBcmlhJyxcclxuXHRcdFx0J25nUm91dGUnLFxyXG5cdFx0XHQnb2ZmQ2xpY2snXHJcblx0XHRdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0XHJcblx0ZXhwb3J0IGNsYXNzIExvY2F0aW9uUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIExvY2F0aW9uUHJvdmlkZXI6IG5nLklMb2NhdGlvblByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsIExvY2F0aW9uUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIFJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRSb3V0ZVByb3ZpZGVyXHJcblx0XHRcdFx0LndoZW4oJy9mb3JtLycsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0Zvcm1Db250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0Zvcm0nLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvZm9ybS9uYW1lLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQud2hlbignL2Zvcm0vbG9jYXRpb24nLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0vbG9jYXRpb24uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvZm9ybS9zdWNjZXNzJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonRm9ybUNvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnRm9ybScsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9mb3JtL3N1Y2Nlc3MuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidJbmRleENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnSW5kZXgnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvaW5kZXgvaW5kZXguaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgvOmlkJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonSW5kZXhDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0luZGV4JyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2luZGV4L3Bva2Vtb24uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvbWFwJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonTWFwQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdNYXAnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSgnL21hcCcpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBSb3V0ZVByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnJGxvY2F0aW9uJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIGZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIGxvY2F0aW9uU2VydmljZTogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSB3aW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdGZpcmViYXNlU2VydmljZS5jb25maWd1cmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9hZCB0aGUgZW50aXJlIGFwcGxpY2F0aW9uIHRvIGNoZWNrIGZvciB1cGRhdGVzXHJcblx0XHQgKi9cclxuXHRcdHJlbG9hZCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy53aW5kb3dTZXJ2aWNlLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hlY2sgdGhhdCB0aGUgY3VycmVudCBwYXRoIG1hdGNoZXMgdGhlIGxvY2F0aW9uIHBhdGhcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3VycmVudFJvdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW57XHJcblx0XHRcdGlmKHRoaXMubG9jYXRpb25TZXJ2aWNlLnBhdGgoKS5zZWFyY2gocGF0aCkpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0FwcGxpY2F0aW9uQ29udHJvbGxlcicsIEFwcGxpY2F0aW9uQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZm9ybSBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRm9ybUNvbnRyb2xsZXJcclxuXHQgKi9cclxuXHRjbGFzcyBGb3JtQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZScsXHJcblx0XHRcdCdTdG9yYWdlU2VydmljZScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgZXJyb3I6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgZm9ybURhdGE6IEZvcm1EYXRhO1xyXG5cdFx0cHVibGljIHBva2Vtb246IFBva2Vtb25bXTtcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBnZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBmaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBtYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBzdG9yYWdlU2VydmljZTogU3RvcmFnZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgd2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLmZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcblxyXG5cdFx0XHR0aGlzLnBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5wb2tlbW9uID0gcmVzcG9uc2U7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhdXRvY29tcGxldGUobW9kZWw6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xyXG5cdFx0XHR0aGlzLmZvcm1EYXRhW21vZGVsXSA9IHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gZmllbGQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZWNvcmQoZmllbGQ6IHN0cmluZywgcGF0aDogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHZhciBpbnB1dCA9IFtdO1xyXG5cclxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKHRoaXMuZm9ybURhdGEsICh2YWx1ZSwga2V5KSA9PiB7XHJcblx0XHRcdFx0aWYgKGFuZ3VsYXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aW5wdXQucHVzaCh2YWx1ZVtpXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0aW5wdXQucHVzaCh2YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0dGhpcy5zdG9yYWdlU2VydmljZS5zZXQoJ2Zvcm0nLCBpbnB1dCk7XHJcblxyXG5cdFx0XHR0aGlzLndpbmRvd1NlcnZpY2Uub3BlbihwYXRoLCAnX3NlbGYnKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Ym1pdCBmb3JtIGRhdGEgdG8gZGF0YWJhc2UsIHJlc2V0IG1hcCwgbm90aWZ5IHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0c3VibWl0KCkge1xyXG5cdFx0XHR0aGlzLnN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KCdmb3JtJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLmZvcm1EYXRhLm5hbWUgPSByZXNwb25zZTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0aGlzLnN0b3JhZ2VTZXJ2aWNlLmVtcHR5KCdmb3JtJyk7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5mb3JtRGF0YS5uYW1lKSB7XHJcblx0XHRcdFx0dGhpcy5tYXBTZXJ2aWNlLnBvc2l0aW9uKCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuZmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiB7XHJcblx0XHRcdFx0XHRcdFx0J2Nvb3Jkcyc6IHtcclxuXHRcdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCxcclxuXHRcdFx0XHRcdFx0XHRcdCdsb25naXR1ZGUnOiBwb3NpdGlvbi5sbmdcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdCd0aW1lc3RhbXAnOiBNYXRoLmZsb29yKERhdGUubm93KCkpXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdCduYW1lJzogdGhpcy5mb3JtRGF0YS5uYW1lXHJcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLmZvcm1EYXRhLm1lc3NhZ2VzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmZvcm1EYXRhLm1lc3NhZ2VzLnB1c2goJ1N1Y2Nlc3NmdWxseSBhZGRlZCAnICsgdGhpcy5mb3JtRGF0YS5uYW1lKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5mb3JtRGF0YS5uYW1lID0gJyc7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMudG9nZ2xlKCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMud2luZG93U2VydmljZS5vcGVuKCcvIy9mb3JtL3N1Y2Nlc3MnLCAnX3NlbGYnKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZXJyb3IgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIEZvcm1Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIEluZGV4Q29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0JyRyb3V0ZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGN1cnJlbnQ6IFBva2Vtb247XHJcblx0XHRwdWJsaWMgcGFyYW1ldGVyczogT2JqZWN0O1xyXG5cdFx0cHVibGljIHBva2Vtb246IFBva2Vtb25bXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBwb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgcm91dGVTZXJ2aWNlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5wYXJhbWV0ZXJzID0gbmV3IE9iamVjdCgpO1xyXG5cclxuXHRcdFx0cG9rZW1vblNlcnZpY2UuZ2V0KCcvYXBpL3Bva2Vtb24vcG9rZW1vbi5qc29uJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLnBva2Vtb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0dGhpcy5wYXJhbWV0ZXJzID0gcm91dGVTZXJ2aWNlLmN1cnJlbnQucGFyYW1zO1xyXG5cclxuXHRcdFx0XHR0aGlzLmFjdGl2ZSh0aGlzLnBhcmFtZXRlcnNbJ2lkJ10pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWN0aXZlKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBva2Vtb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZih0aGlzLnBva2Vtb25baV0uTnVtYmVyID09PSBpZCl7XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnQgPSB0aGlzLnBva2Vtb25baV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0luZGV4Q29udHJvbGxlcicsIEluZGV4Q29udHJvbGxlcilcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0J1N0b3JhZ2VTZXJ2aWNlJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHByaXZhdGUgbWFya2VyczogTWFya2VyW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgZmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgZ2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgbWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBwb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgc3RvcmFnZVNlcnZpY2U6IFN0b3JhZ2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5tYXJrZXJzID0gbmV3IEFycmF5PE1hcmtlcj4oKTtcclxuXHJcblx0XHRcdGdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdG1hcFNlcnZpY2UuY29uZmlndXJlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgcmVzcG9uc2UsIDEyKTtcclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0ZmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRwb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UsIChwb2tlbW9uLCBwb2tlbW9uSUQpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwO2k8bWFya2Vycy5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKG1hcmtlcnNbaV1bJ25hbWUnXSA9PT0gcG9rZW1vbi5OYW1lKXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bWFya2Vyc1tpXVsnbnVtYmVyJ10gPSBwb2tlbW9uLk51bWJlcjtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdFx0XHRtYXBTZXJ2aWNlLnBvaW50cyhtYXJrZXJzKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHRsb2NhdGUoKTogdm9pZHtcclxuXHRcdFx0dGhpcy5tYXBTZXJ2aWNlLmxvY2F0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb257XHJcblx0ZXhwb3J0IGNsYXNzIEZvcm1EYXRhe1xyXG5cdFx0cHVibGljIG1lc3NhZ2VzOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgcG9zaXRpb246IFBvc2l0aW9uO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBNYXJrZXIge1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vbiB7XHJcblx0XHRwdWJsaWMgQ2xhc3NpZmljYXRpb246IHN0cmluZztcclxuXHRcdHB1YmxpYyBGYXN0QXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgRmxlZVJhdGU6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBIZWlnaHQ6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBNYXhDUDogbnVtYmVyO1xyXG5cdFx0cHVibGljIE1heEhQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIE51bWJlcjogc3RyaW5nO1xyXG5cdFx0cHVibGljIFByZXZpb3VzRXZvbHV0aW9uczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgUmVzaXN0YW50OiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBUeXBlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgU3BlY2lhbEF0dGFja3M6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlYWtuZXNzZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlaWdodDogT2JqZWN0O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkNsYXNzaWZpY2F0aW9uID0gJyc7XHJcblx0XHRcdHRoaXMuRmFzdEF0dGFja3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLkZsZWVSYXRlID0gMDtcclxuXHRcdFx0dGhpcy5IZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRcdHRoaXMuTWF4Q1AgPSAwO1xyXG5cdFx0XHR0aGlzLk1heEhQID0gMDtcclxuXHRcdFx0dGhpcy5OYW1lID0gJyc7XHJcblx0XHRcdHRoaXMuTnVtYmVyID0gJyc7XHJcblx0XHRcdHRoaXMuUHJldmlvdXNFdm9sdXRpb25zID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5SZXNpc3RhbnQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlR5cGVzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5TcGVjaWFsQXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2Vha25lc3NlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2VpZ2h0ID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnU3RvcmFnZVNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBTdG9yYWdlU2VydmljZTogU3RvcmFnZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgV2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy5XaW5kb3dTZXJ2aWNlLm5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdCgnR2VvbG9jYXRpb24gbm90IHN1cHBvcnRlZC4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBvdXRwdXQgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuXHJcblx0XHRcdFx0fSwgKGVycm9yKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dmFyIG91dHB1dCA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZSk7XHJcblx0XHRcdFx0XHR9LCAoZXJyb3IpID0+IHtcclxuXHJcblx0XHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRcdGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0bWF4aW11bUFnZTogNjAwMDAsXHJcblx0XHRcdFx0XHRcdHRpbWVvdXQ6IDUwMDAsXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRtYXhpbXVtQWdlOiA2MDAwMCxcclxuXHRcdFx0XHRcdFx0dGltZW91dDogNTAwMFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdHZW9sb2NhdGlvblNlcnZpY2UnLCBHZW9sb2NhdGlvblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBTZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBTZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBNYXBTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGZpbHRlcicsXHJcblx0XHRcdCckaHR0cCcsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZScsXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckdGltZW91dCdcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBsb2NhdGlvbjogTC5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzOiBnb29nbGUubWFwcy5JbmZvV2luZG93W107XHJcblx0XHRwcml2YXRlIG1hcDogTC5NYXA7XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzOiBnb29nbGUubWFwcy5NYXJrZXJbXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaWx0ZXJTZXJ2aWNlOiBuZy5JRmlsdGVyU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBIdHRwU2VydmljZTogbmcuSUh0dHBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFRpbWVvdXRTZXJ2aWNlOiBuZy5JVGltZW91dFNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLmluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xyXG5cdFx0XHR0aGlzLmluZm9XaW5kb3dzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkluZm9XaW5kb3c+KCk7XHJcblx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigpO1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7UG9zaXRpb259IGNlbnRlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gem9vbSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGNvbmZpZ3VyZShlbGVtZW50OiBIVE1MRWxlbWVudCwgY2VudGVyOiBQb3NpdGlvbiwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcblx0XHRcdHRoaXMubWFwID0gTC5tYXAoZWxlbWVudCk7XHJcblxyXG5cdFx0XHR0aGlzLmxvY2F0ZSgpO1xyXG5cclxuXHRcdFx0TC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21rc2FuZGVyc29uL2Npc29obGFxZzAwMGYyeHBiZXRzaHo3anYvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj1way5leUoxSWpvaWJXdHpZVzVrWlhKemIyNGlMQ0poSWpvaVJUSTVTVWxaUVNKOS5XVXgtbVZ4OTQ5aVJXZkctczdZWnZBJywge1xyXG5cdFx0XHRcdG1heFpvb206IDE5LFxyXG5cdFx0XHRcdGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+J1xyXG5cdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblxyXG5cdFx0XHR0aGlzLm1hcC5vbigncmVzaXplJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMubWFwLmludmFsaWRhdGVTaXplKHtcclxuXHRcdFx0XHRcdGFuaW1hdGU6IHRydWVcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRsb2NhdGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMubWFwLmxvY2F0ZSh7XHJcblx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdHNldFZpZXc6IHRydWVcclxuXHRcdFx0fSkub24oJ2xvY2F0aW9uZm91bmQnLCAocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRcdHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubG9jYXRpb24pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGhpcy5sb2NhdGlvbiA9IEwubWFya2VyKHJlc3BvbnNlWydsYXRsbmcnXSwge1xyXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxyXG5cdFx0XHRcdFx0aWNvbjogTC5kaXZJY29uKHtcclxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lOidsb2NhdGlvbicsXHJcblx0XHRcdFx0XHRcdGljb25TaXplOlszMiwzMl1cclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0dGl0bGU6ICdZb3VyIGxvY2F0aW9uJ1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hcC5hZGRMYXllcih0aGlzLmxvY2F0aW9uKTtcclxuXHJcblx0XHRcdH0pLm9uKCdsb2NhdGlvbmVycm9yJywgKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0YWxlcnQoJ0dlb2xvY2F0aW9uIGVycm9yOiAnICsgcmVzcG9uc2UpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAdGVtcGxhdGUgVFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9pbnRzPFQ+KHZhbHVlczogQXJyYXk8VD4pOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRMLm1hcmtlcihbdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbGF0aXR1ZGUnXSwgdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbG9uZ2l0dWRlJ11dLCB7XHJcblx0XHRcdFx0XHRpY29uOiBMLmljb24oe1xyXG5cdFx0XHRcdFx0XHRpY29uU2l6ZTogWzYwLCA2MF0sXHJcblx0XHRcdFx0XHRcdGljb25Vcmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIHZhbHVlc1tpXVsnbnVtYmVyJ10gKyAnLmljbydcclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0cmlzZU9uSG92ZXI6IHRydWUsXHJcblx0XHRcdFx0XHR0aXRsZTogdmFsdWVzW2ldWyduYW1lJ11cclxuXHRcdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxMLkxhdExuZz59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9zaXRpb24oKTogbmcuSVByb21pc2U8TC5MYXRMbmc+e1xyXG5cdFx0XHR2YXIgZGVmZXJyYWwgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRkZWZlcnJhbC5yZXNvbHZlKHRoaXMubG9jYXRpb24uZ2V0TGF0TG5nKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0ZGVmZXJyYWwucmVqZWN0KCdObyBsb2NhdGlvbiBhdmFpbGFibGUnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmFsLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ01hcFNlcnZpY2UnLCBNYXBTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgUG9rZW1vblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SVBva2Vtb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRodHRwJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JSHR0cFByb21pc2U8QXJyYXk8UG9rZW1vbj4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxQb2tlbW9uPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ1Bva2Vtb25TZXJ2aWNlJywgUG9rZW1vblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgU3RvcmFnZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogQ2xlYXIgYW4gaXRlbSBpbiBzdG9yYWdlXHJcblx0XHQgKiBcclxuXHRcdCAqIEB0ZW1wbGF0ZSBUXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZW1wdHk8VD4oa2V5OiBzdHJpbmcpOiB2b2lke1xyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2Uuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmV0Y2ggaXRlbSBieSBrZXkgZnJvbSBzZXNzaW9uIHN0b3JhZ2UuIENvbXBhcmUgdG8gc291cmNlXHJcblx0XHQgKiBkYXRhIGFuZCBidWlsZCBhbiBvdXRwdXQgYXJyYXkgdGhhdCBjb250YWlucyBmdWxsIHZlcnNpb25zXHJcblx0XHQgKiBhbmQgbm90IGp1c3QgdGhlIGlkIGZpZWxkIG9mIGVhY2ggc3RvcmVkIGl0ZW0uXHJcblx0XHQgKiBcclxuXHRcdCAqIEB0ZW1wbGF0ZSBUXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxBcnJheTxUPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0PFQ+KGtleTogc3RyaW5nKTogbmcuSVByb21pc2U8VD4ge1xyXG5cdFx0XHR2YXIgZGVmZXIgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0b3V0cHV0LFxyXG5cdFx0XHRcdHJlc3BvbnNlLFxyXG5cdFx0XHRcdHJlc3VsdDtcclxuXHJcblx0XHRcdHJlc3BvbnNlID0gdGhpcy5XaW5kb3dTZXJ2aWNlLnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oa2V5KTtcclxuXHJcblx0XHRcdGlmIChyZXNwb25zZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKGFuZ3VsYXIuaXNBcnJheShyZXNwb25zZSkpIHtcclxuXHRcdFx0XHRcdGlmIChyZXNwb25zZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRkZWZlci5yZXNvbHZlKHJlc3VsdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0ZGVmZXIucmVzb2x2ZShyZXNwb25zZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGRlZmVyLnJlamVjdCgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXIucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBhIGZpZWxkIGZyb20gYSBkYXRhIHNldCB0byBhIHN0cmluZyB2YWx1ZSBpbiBzZXNzaW9uIHN0b3JhZ2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHRlbXBsYXRlIFRcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBbZmllbGRdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c2V0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZXM6IFRbXSwgZmllbGQ/OiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dmFyIGlucHV0O1xyXG5cclxuXHRcdFx0aWYgKGFuZ3VsYXIuaXNBcnJheSh2YWx1ZXMpKSB7XHJcblx0XHRcdFx0aW5wdXQgPSB2YWx1ZXMuam9pbignLCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0aW5wdXQgPSB2YWx1ZXM7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuV2luZG93U2VydmljZS5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGtleSwgaW5wdXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdTdG9yYWdlU2VydmljZScsIFN0b3JhZ2VTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBEcm9wZG93biB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SURyb3Bkb3duQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0cHVibGljIHN0YXRlOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25EaXJlY3RpdmVcclxuXHQgKiBAaW1wbGVtZW50cyB7bmcuSURpcmVjdGl2ZX1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkRpcmVjdGl2ZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG5cdFx0cHVibGljIGJpbmRUb0NvbnRyb2xsZXI6IGFueTtcclxuXHRcdHB1YmxpYyBjb250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlckFzOiBhbnk7XHJcblx0XHRwdWJsaWMgcmVwbGFjZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBzY29wZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyB0ZW1wbGF0ZVVybDogc3RyaW5nO1xyXG5cdFx0cHVibGljIHRyYW5zY2x1ZGU6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5iaW5kVG9Db250cm9sbGVyID0ge1xyXG5cdFx0XHRcdGxlZnQ6ICdAJyxcclxuXHRcdFx0XHRvYmplY3Q6ICdAJyxcclxuXHRcdFx0XHRyaWdodDogJ0AnXHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5jb250cm9sbGVyID0gRHJvcGRvd25Db250cm9sbGVyO1xyXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXJBcyA9ICdEcm9wZG93bic7XHJcblx0XHRcdHRoaXMucmVwbGFjZSA9IHRydWU7XHJcblx0XHRcdHRoaXMuc2NvcGUgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnRlbXBsYXRlVXJsID0gJy9kaXJlY3RpdmVzL2Ryb3Bkb3duL3ZpZXdzL2Ryb3Bkb3duLmh0bWwnXHJcblx0XHRcdHRoaXMudHJhbnNjbHVkZSA9IHtcclxuXHRcdFx0XHR0aXRsZTogJz9kcm9wZG93blRpdGxlJyxcclxuXHRcdFx0XHRyZXN1bHQ6ICc/ZHJvcGRvd25SZXN1bHQnXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSURpcmVjdGl2ZX0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdGF0aWMgaW5zdGFuY2UoKTogbmcuSURpcmVjdGl2ZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRHJvcGRvd25EaXJlY3RpdmUoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7bmcuSVNjb3BlfSBzY29wZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge25nLklBdWdtZW50ZWRKUXVlcnl9IGVsZW1lbnQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KTogdm9pZCB7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5kaXJlY3RpdmUoJ2Ryb3Bkb3duJywgRHJvcGRvd25EaXJlY3RpdmUuaW5zdGFuY2UpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
