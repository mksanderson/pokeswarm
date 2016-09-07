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
            this.state = false;
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
            input.push(this.formData.name);
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
            }).then(function () {
                _this.storageService.empty('form');
                if (_this.formData.name) {
                    _this.mapService.position().then(function (response) {
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
                                _this.pokemonService.match(_this.formData.name, _this.pokemon).then(function (response) {
                                    _this.formData.record = response;
                                });
                                _this.state = true;
                            });
                        });
                    });
                }
                else {
                    _this.error = true;
                    _this.state = false;
                }
            });
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
            this.name = '';
            this.record = new Application.Pokemon();
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
        function PokemonService(httpService, qService) {
            var _this = this;
            this.httpService = httpService;
            this.qService = qService;
            this.pokemon = new Array();
            this.get('/api/pokemon/pokemon.json').then(function (response) {
                _this.pokemon = response;
            });
        }
        /**
         * (description)
         *
         * @param {string} path (description)
         * @returns {ng.IHttpPromise<Array<Pokemon>>} (description)
         */
        PokemonService.prototype.get = function (path) {
            var result = this.httpService.get(path).then(function (response) {
                return response.data;
            });
            return result;
        };
        /**
         * Match a pokemon by it's name and return the full Pokemon item
         *
         * @param {string} name (description)
         * @returns {Pokemon} (description)
         */
        PokemonService.prototype.match = function (name, values) {
            var defer = this.qService.defer(), result;
            angular.forEach(values, function (pokemon, pokemonID) {
                if (pokemon.Name === name) {
                    defer.resolve(result = pokemon);
                }
            });
            return defer.promise;
        };
        PokemonService.$inject = [
            '$http',
            '$q'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL0luZGV4Q29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJtb2RlbHMvRm9ybURhdGEudHMiLCJtb2RlbHMvTWFya2VyLnRzIiwibW9kZWxzL1Bva2Vtb24udHMiLCJzZXJ2aWNlcy9GaXJlYmFzZVNlcnZpY2UudHMiLCJzZXJ2aWNlcy9HZW9sb2NhdGlvblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9NYXBTZXJ2aWNlLnRzIiwic2VydmljZXMvUG9rZW1vblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9TdG9yYWdlU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU9wQjtBQVBELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsUUFBUTtRQUNSLFNBQVM7UUFDVCxVQUFVO0tBQ1YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxFQVBTLFdBQVcsS0FBWCxXQUFXLFFBT3BCO0FDUkQsSUFBVSxXQUFXLENBYXBCO0FBYkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUV0QjtRQUNDLDBCQUNRLGdCQUFzQztZQUF0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXNCO1FBRzlDLENBQUM7UUFDRix1QkFBQztJQUFELENBTkEsQUFNQyxJQUFBO0lBTlksNEJBQWdCLG1CQU01QixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQ25ELENBQUMsRUFiUyxXQUFXLEtBQVgsV0FBVyxRQWFwQjtBQ2JELElBQVUsV0FBVyxDQTJDcEI7QUEzQ0QsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QjtRQUNDLHVCQUNRLGFBQXNDO1lBQXRDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUU3QyxhQUFhO2lCQUNYLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2YsVUFBVSxFQUFDLGdCQUFnQjtnQkFDM0IsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLFdBQVcsRUFBQywyQkFBMkI7YUFDdkMsQ0FBQztpQkFDRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3ZCLFVBQVUsRUFBQyxnQkFBZ0I7Z0JBQzNCLFlBQVksRUFBRSxNQUFNO2dCQUNwQixXQUFXLEVBQUMsK0JBQStCO2FBQzNDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDdEIsVUFBVSxFQUFDLGdCQUFnQjtnQkFDM0IsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLFdBQVcsRUFBQyw4QkFBOEI7YUFDMUMsQ0FBQztpQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNmLFVBQVUsRUFBQyxpQkFBaUI7Z0JBQzVCLFlBQVksRUFBRSxPQUFPO2dCQUNyQixXQUFXLEVBQUMsNkJBQTZCO2FBQ3pDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbkIsVUFBVSxFQUFDLGlCQUFpQjtnQkFDNUIsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLFdBQVcsRUFBQywrQkFBK0I7YUFDM0MsQ0FBQztpQkFDRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLFVBQVUsRUFBQyxlQUFlO2dCQUMxQixZQUFZLEVBQUUsS0FBSztnQkFDbkIsV0FBVyxFQUFDLHFCQUFxQjthQUNqQyxDQUFDO2lCQUNGLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNuQixDQUFDO1FBQ0Ysb0JBQUM7SUFBRCxDQXJDQSxBQXFDQyxJQUFBO0lBckNZLHlCQUFhLGdCQXFDekIsQ0FBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDN0MsQ0FBQyxFQTNDUyxXQUFXLEtBQVgsV0FBVyxRQTJDcEI7QUMzQ0QsSUFBVSxXQUFXLENBZ0RwQjtBQWhERCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBQ3RCOzs7OztPQUtHO0lBQ0g7UUFPQywrQkFDUyxlQUFnQyxFQUNoQyxlQUFvQyxFQUNwQyxhQUFnQztZQUZoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsb0JBQWUsR0FBZixlQUFlLENBQXFCO1lBQ3BDLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtZQUV4QyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVEOztXQUVHO1FBQ0gsc0NBQU0sR0FBTjtZQUNDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDRDQUFZLEdBQVosVUFBYSxJQUFZO1lBQ3hCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUEsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLENBQUEsQ0FBQztnQkFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsQ0FBQztRQUNGLENBQUM7UUFsQ00sNkJBQU8sR0FBRztZQUNoQixpQkFBaUI7WUFDakIsV0FBVztZQUNYLFNBQVM7U0FDVCxDQUFDO1FBK0JILDRCQUFDO0lBQUQsQ0FwQ0EsQUFvQ0MsSUFBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQzlELENBQUMsRUFoRFMsV0FBVyxLQUFYLFdBQVcsUUFnRHBCO0FDaERELElBQVUsV0FBVyxDQWlIcEI7QUFqSEQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0Qjs7OztPQUlHO0lBQ0g7UUFlQyx3QkFDUyxrQkFBc0MsRUFDdEMsZUFBZ0MsRUFDaEMsVUFBc0IsRUFDdEIsY0FBOEIsRUFDOUIsY0FBOEIsRUFDOUIsYUFBZ0M7WUFyQjFDLGlCQXNHQztZQXRGUyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQ3RCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDOUIsa0JBQWEsR0FBYixhQUFhLENBQW1CO1lBRXhDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBUSxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO2dCQUNsRSxLQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILHFDQUFZLEdBQVosVUFBYSxLQUFhLEVBQUUsS0FBYTtZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCwrQkFBTSxHQUFOLFVBQU8sS0FBYSxFQUFFLElBQVk7WUFDakMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBRWYsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBRTlCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsK0JBQU0sR0FBTjtZQUFBLGlCQXlDQztZQXhDQSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBUyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO2dCQUNyRCxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNQLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVsQyxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLEtBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTt3QkFDeEMsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDO3dCQUV4QixLQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQzs0QkFDekIsVUFBVSxFQUFFO2dDQUNYLFFBQVEsRUFBRTtvQ0FDVCxVQUFVLEVBQUUsUUFBUSxDQUFDLEdBQUc7b0NBQ3hCLFdBQVcsRUFBRSxRQUFRLENBQUMsR0FBRztpQ0FDekI7Z0NBQ0QsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOzZCQUNuQzs0QkFDRCxNQUFNLEVBQUUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO3lCQUMxQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTs0QkFDaEIsS0FBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTtnQ0FDM0MsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO2dDQUVqQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQ0FDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQ0FDakMsQ0FBQztnQ0FFRCxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTtvQ0FDekUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO2dDQUNqQyxDQUFDLENBQUMsQ0FBQTtnQ0FFRixLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs0QkFDbkIsQ0FBQyxDQUFDLENBQUM7d0JBQ0osQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUE7Z0JBQ0gsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDTCxLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDbEIsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFwR00sc0JBQU8sR0FBRztZQUNoQixvQkFBb0I7WUFDcEIsaUJBQWlCO1lBQ2pCLFlBQVk7WUFDWixnQkFBZ0I7WUFDaEIsZ0JBQWdCO1lBQ2hCLFNBQVM7U0FDVCxDQUFDO1FBOEZILHFCQUFDO0lBQUQsQ0F0R0EsQUFzR0MsSUFBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNoRCxDQUFDLEVBakhTLFdBQVcsS0FBWCxXQUFXLFFBaUhwQjtBQ2pIRCxJQUFVLFdBQVcsQ0EyQ3BCO0FBM0NELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEI7UUFVQyx5QkFDUyxjQUE4QixFQUM5QixZQUFvQztZQVo5QyxpQkFxQ0M7WUExQlMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzlCLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUU1QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7WUFFL0IsY0FBYyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7Z0JBQzdELEtBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO2dCQUV4QixLQUFJLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUU5QyxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsZ0NBQU0sR0FBTixVQUFPLEVBQVU7WUFDaEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQSxDQUFDO29CQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQW5DTSx1QkFBTyxHQUFHO1lBQ2hCLGdCQUFnQjtZQUNoQixRQUFRO1NBQ1IsQ0FBQztRQWlDSCxzQkFBQztJQUFELENBckNBLEFBcUNDLElBQUE7SUFyQ1ksMkJBQWUsa0JBcUMzQixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsVUFBVSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFBO0FBQ2pELENBQUMsRUEzQ1MsV0FBVyxLQUFYLFdBQVcsUUEyQ3BCO0FDM0NELElBQVUsV0FBVyxDQStEcEI7QUEvREQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUV0Qjs7Ozs7T0FLRztJQUNIO1FBWUMsdUJBQ1MsZUFBZ0MsRUFDaEMsa0JBQXNDLEVBQ3RDLFVBQXNCLEVBQ3RCLGNBQThCLEVBQzlCLGNBQThCLEVBQzlCLGFBQWdDO1lBTGhDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLGVBQVUsR0FBVixVQUFVLENBQVk7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM5QixrQkFBYSxHQUFiLGFBQWEsQ0FBbUI7WUFFeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1lBRW5DLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7Z0JBQ3RDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNQLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFFakIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO29CQUN0QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDakMsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ1AsY0FBYyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7d0JBQzdELE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQUMsT0FBTyxFQUFFLFNBQVM7NEJBQzVDLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQyxDQUFDO2dDQUNuQyxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUM7b0NBQ3ZDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO2dDQUN2QyxDQUFDOzRCQUNGLENBQUM7d0JBQ0YsQ0FBQyxDQUFDLENBQUE7d0JBRUYsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUIsQ0FBQyxDQUFDLENBQUE7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFFRCw4QkFBTSxHQUFOO1lBQ0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBaERNLHFCQUFPLEdBQUc7WUFDaEIsaUJBQWlCO1lBQ2pCLG9CQUFvQjtZQUNwQixZQUFZO1lBQ1osZ0JBQWdCO1lBQ2hCLGdCQUFnQjtZQUNoQixTQUFTO1NBQ1QsQ0FBQztRQTBDSCxvQkFBQztJQUFELENBbERBLEFBa0RDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixVQUFVLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzlDLENBQUMsRUEvRFMsV0FBVyxLQUFYLFdBQVcsUUErRHBCO0FDL0RELElBQVUsV0FBVyxDQVdwQjtBQVhELFdBQVUsV0FBVyxFQUFBLENBQUM7SUFDckI7UUFLQztZQUNDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBQ0YsZUFBQztJQUFELENBVEEsQUFTQyxJQUFBO0lBVFksb0JBQVEsV0FTcEIsQ0FBQTtBQUNGLENBQUMsRUFYUyxXQUFXLEtBQVgsV0FBVyxRQVdwQjtBQ1hELElBQVUsV0FBVyxDQVNwQjtBQVRELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEI7UUFJQztZQUNDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFDRixhQUFDO0lBQUQsQ0FQQSxBQU9DLElBQUE7SUFQWSxrQkFBTSxTQU9sQixDQUFBO0FBQ0YsQ0FBQyxFQVRTLFdBQVcsS0FBWCxXQUFXLFFBU3BCO0FDVEQsSUFBVSxXQUFXLENBa0NwQjtBQWxDRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBQ3RCO1FBZ0JDO1lBQ0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUM5QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFDRixjQUFDO0lBQUQsQ0FoQ0EsQUFnQ0MsSUFBQTtJQWhDWSxtQkFBTyxVQWdDbkIsQ0FBQTtBQUNGLENBQUMsRUFsQ1MsV0FBVyxLQUFYLFdBQVcsUUFrQ3BCO0FDbENELElBQVUsV0FBVyxDQXVFcEI7QUF2RUQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUd0QjtRQVFDLHlCQUNTLFFBQXNCO1lBQXRCLGFBQVEsR0FBUixRQUFRLENBQWM7WUFIdkIsY0FBUyxHQUFHLElBQUksS0FBSyxFQUFXLENBQUM7UUFNekMsQ0FBQztRQUdEOztXQUVHO1FBQ0gsbUNBQVMsR0FBVDtZQUNDLElBQUksTUFBTSxHQUFHO2dCQUNaLE1BQU0sRUFBRSx5Q0FBeUM7Z0JBQ2pELFVBQVUsRUFBRSwwQ0FBMEM7Z0JBQ3RELFdBQVcsRUFBRSxpREFBaUQ7Z0JBQzlELGFBQWEsRUFBRSxzQ0FBc0M7YUFDckQsQ0FBQztZQUVGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBR0Q7Ozs7O1dBS0c7UUFDSCw2QkFBRyxHQUFILFVBQUksSUFBWTtZQUNmLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ25DLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFYixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsVUFBQyxRQUFRO2dCQUN4RCxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtvQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLENBQUE7Z0JBRUYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCw4QkFBSSxHQUFKLFVBQUssTUFBVztZQUNmLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFckMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTlELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUE3RE0sdUJBQU8sR0FBRztZQUNoQixJQUFJO1NBQ0osQ0FBQTtRQTRERixzQkFBQztJQUFELENBL0RBLEFBK0RDLElBQUE7SUEvRFksMkJBQWUsa0JBK0QzQixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsT0FBTyxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQy9DLENBQUMsRUF2RVMsV0FBVyxLQUFYLFdBQVcsUUF1RXBCO0FDdkVELElBQVUsV0FBVyxDQWlFcEI7QUFqRUQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUV0Qjs7Ozs7T0FLRztJQUNIO1FBT0MsNEJBQ1MsUUFBc0IsRUFDdEIsY0FBOEIsRUFDOUIsYUFBZ0M7WUFGaEMsYUFBUSxHQUFSLFFBQVEsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDOUIsa0JBQWEsR0FBYixhQUFhLENBQW1CO1FBRXpDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsZ0NBQUcsR0FBSDtZQUFBLGlCQWdDQztZQS9CQSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBQyxRQUFRO29CQUNwRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7b0JBRWhCLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTVCLENBQUMsRUFBRSxVQUFDLEtBQUs7b0JBQ1IsS0FBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFVBQUMsUUFBUTt3QkFDcEUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO3dCQUVoQixRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM1QixDQUFDLEVBQUUsVUFBQyxLQUFLO29CQUVULENBQUMsRUFBRTt3QkFDRixrQkFBa0IsRUFBRSxJQUFJO3dCQUN4QixVQUFVLEVBQUUsS0FBSzt3QkFDakIsT0FBTyxFQUFFLElBQUk7cUJBQ2IsQ0FBQyxDQUFBO2dCQUNILENBQUMsRUFBRTtvQkFDRCxrQkFBa0IsRUFBRSxJQUFJO29CQUN4QixVQUFVLEVBQUUsS0FBSztvQkFDakIsT0FBTyxFQUFFLElBQUk7aUJBQ2IsQ0FDRCxDQUFDO1lBQ0gsQ0FBQztZQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFsRE0sMEJBQU8sR0FBRztZQUNoQixJQUFJO1lBQ0osZ0JBQWdCO1lBQ2hCLFNBQVM7U0FDVCxDQUFDO1FBK0NILHlCQUFDO0lBQUQsQ0FwREEsQUFvREMsSUFBQTtJQXBEWSw4QkFBa0IscUJBb0Q5QixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsT0FBTyxDQUFDLG9CQUFvQixFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDckQsQ0FBQyxFQWpFUyxXQUFXLEtBQVgsV0FBVyxRQWlFcEI7QUNqRUQsSUFBVSxXQUFXLENBa0lwQjtBQWxJRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBRXRCOzs7OztPQUtHO0lBQ0g7UUFnQkMsb0JBQ1MsYUFBZ0MsRUFDaEMsV0FBNEIsRUFDNUIsY0FBOEIsRUFDOUIsUUFBc0IsRUFDdEIsY0FBa0M7WUFKbEMsa0JBQWEsR0FBYixhQUFhLENBQW1CO1lBQ2hDLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDOUIsYUFBUSxHQUFSLFFBQVEsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFFMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBMEIsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxFQUFzQixDQUFDO1FBQ2hELENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSCw4QkFBUyxHQUFULFVBQVUsT0FBb0IsRUFBRSxNQUFnQixFQUFFLElBQVk7WUFBOUQsaUJBZUM7WUFkQSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrTEFBa0wsRUFBRTtnQkFDL0wsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLDJFQUEyRTthQUN4RixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3JCLEtBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO29CQUN2QixPQUFPLEVBQUUsSUFBSTtpQkFDYixDQUFDLENBQUE7WUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNILDJCQUFNLEdBQU47WUFBQSxpQkF1QkM7WUF0QkEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ2Ysa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsT0FBTyxFQUFFLElBQUk7YUFDYixDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLFFBQVE7Z0JBQy9CLEVBQUUsQ0FBQSxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO29CQUNqQixLQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBRUQsS0FBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDNUMsU0FBUyxFQUFFLElBQUk7b0JBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7d0JBQ2YsU0FBUyxFQUFDLFVBQVU7d0JBQ3BCLFFBQVEsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7cUJBQ2hCLENBQUM7b0JBQ0YsS0FBSyxFQUFFLGVBQWU7aUJBQ3RCLENBQUMsQ0FBQztnQkFFSCxLQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFbEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLFFBQVE7Z0JBQy9CLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDJCQUFNLEdBQU4sVUFBVSxNQUFnQjtZQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRTtvQkFDckcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ1osUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQzt3QkFDbEIsT0FBTyxFQUFFLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNO3FCQUM3RCxDQUFDO29CQUNGLFdBQVcsRUFBRSxJQUFJO29CQUNqQixLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztpQkFDeEIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNGLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsNkJBQVEsR0FBUjtZQUNDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFckMsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUM7Z0JBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFDRCxJQUFJLENBQUEsQ0FBQztnQkFDSixRQUFRLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFuSE0sa0JBQU8sR0FBRztZQUNoQixTQUFTO1lBQ1QsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixJQUFJO1lBQ0osVUFBVTtTQUNWLENBQUM7UUE4R0gsaUJBQUM7SUFBRCxDQXJIQSxBQXFIQyxJQUFBO0lBckhZLHNCQUFVLGFBcUh0QixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsT0FBTyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNyQyxDQUFDLEVBbElTLFdBQVcsS0FBWCxXQUFXLFFBa0lwQjtBQ2xJRCxJQUFVLFdBQVcsQ0FnRXBCO0FBaEVELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFFdEI7Ozs7O09BS0c7SUFDSDtRQVFDLHdCQUNTLFdBQTRCLEVBQzVCLFFBQXNCO1lBVmhDLGlCQW1EQztZQTFDUyxnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7WUFDNUIsYUFBUSxHQUFSLFFBQVEsQ0FBYztZQUU5QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxFQUFXLENBQUM7WUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7Z0JBQ25ELEtBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsNEJBQUcsR0FBSCxVQUFJLElBQVk7WUFDZixJQUFJLE1BQU0sR0FBcUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTtnQkFDaEYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUE7WUFFRixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsOEJBQUssR0FBTCxVQUFNLElBQVksRUFBRSxNQUFzQjtZQUN6QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUNoQyxNQUFlLENBQUM7WUFFakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBQyxPQUFPLEVBQUUsU0FBUztnQkFDMUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzQixLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFBO1lBRUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDdEIsQ0FBQztRQWpETSxzQkFBTyxHQUFHO1lBQ2hCLE9BQU87WUFDUCxJQUFJO1NBQ0osQ0FBQztRQStDSCxxQkFBQztJQUFELENBbkRBLEFBbURDLElBQUE7SUFuRFksMEJBQWMsaUJBbUQxQixDQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzdDLENBQUMsRUFoRVMsV0FBVyxLQUFYLFdBQVcsUUFnRXBCO0FDaEVELElBQVUsV0FBVyxDQXFGcEI7QUFyRkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QjtRQU1DLHdCQUNTLFFBQXNCLEVBQ3RCLGFBQWdDO1lBRGhDLGFBQVEsR0FBUixRQUFRLENBQWM7WUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQW1CO1FBR3pDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDhCQUFLLEdBQUwsVUFBUyxHQUFXO1lBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQ7Ozs7Ozs7O1dBUUc7UUFDSCw0QkFBRyxHQUFILFVBQU8sR0FBVztZQUNqQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUNoQyxNQUFNLEVBQ04sUUFBUSxFQUNSLE1BQU0sQ0FBQztZQUVSLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUQsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDckIsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBRTlCLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QixDQUFDO1lBQ0YsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixDQUFDO1lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDdEIsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSCw0QkFBRyxHQUFILFVBQU8sR0FBVyxFQUFFLE1BQVcsRUFBRSxLQUFjO1lBQzlDLElBQUksS0FBSyxDQUFDO1lBRVYsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxJQUFJLENBQUEsQ0FBQztnQkFDSixLQUFLLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUE3RU0sc0JBQU8sR0FBRztZQUNoQixJQUFJO1lBQ0osU0FBUztTQUNULENBQUM7UUEyRUgscUJBQUM7SUFBRCxDQS9FQSxBQStFQyxJQUFBO0lBL0VZLDBCQUFjLGlCQStFMUIsQ0FBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM3QyxDQUFDLEVBckZTLFdBQVcsS0FBWCxXQUFXLFFBcUZwQjtBQ3JGRCxJQUFVLFFBQVEsQ0FnRmpCO0FBaEZELFdBQVUsUUFBUSxFQUFDLENBQUM7SUFFbkI7Ozs7O09BS0c7SUFDSDtRQU9DO1lBQ0MsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVELG1DQUFNLEdBQU47WUFDQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBWk0sMEJBQU8sR0FBRyxFQUVoQixDQUFDO1FBV0gseUJBQUM7SUFBRCxDQWRBLEFBY0MsSUFBQTtJQUVEOzs7OztPQUtHO0lBQ0g7UUFTQztZQUNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRztnQkFDdkIsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsS0FBSyxFQUFFLEdBQUc7YUFDVixDQUFBO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLDBDQUEwQyxDQUFBO1lBQzdELElBQUksQ0FBQyxVQUFVLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLE1BQU0sRUFBRSxpQkFBaUI7YUFDekIsQ0FBQztRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLDBCQUFRLEdBQWY7WUFDQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLGdDQUFJLEdBQVgsVUFBWSxLQUFnQixFQUFFLE9BQTRCO1FBRTFELENBQUM7UUFDRix3QkFBQztJQUFELENBN0NBLEFBNkNDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELENBQUMsRUFoRlMsUUFBUSxLQUFSLFFBQVEsUUFnRmpCIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHRcdGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0NsaWVudCddKTtcclxuXHR9KTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XHJcbm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ0NsaWVudCcsXHJcblx0XHRbXHJcblx0XHRcdCduZ0FyaWEnLFxyXG5cdFx0XHQnbmdSb3V0ZScsXHJcblx0XHRcdCdvZmZDbGljaydcclxuXHRcdF0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRcclxuXHRleHBvcnQgY2xhc3MgTG9jYXRpb25Qcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgTG9jYXRpb25Qcm92aWRlcjogbmcuSUxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgTG9jYXRpb25Qcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUm91dGVQcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgUm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFJvdXRlUHJvdmlkZXJcclxuXHRcdFx0XHQud2hlbignL2Zvcm0vJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonRm9ybUNvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnRm9ybScsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9mb3JtL25hbWUuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvZm9ybS9sb2NhdGlvbicsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0Zvcm1Db250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0Zvcm0nLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvZm9ybS9sb2NhdGlvbi5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9mb3JtL3N1Y2Nlc3MnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0vc3VjY2Vzcy5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9pbmRleCcsIHtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6J0luZGV4Q29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdJbmRleCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9pbmRleC9pbmRleC5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9pbmRleC86aWQnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidJbmRleENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnSW5kZXgnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvaW5kZXgvcG9rZW1vbi5odG1sJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LndoZW4oJy9tYXAnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidNYXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ01hcCcsXHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9tYXAuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHQub3RoZXJ3aXNlKCcvbWFwJylcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIFJvdXRlUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBnbG9iYWwgZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJQXBwbGljYXRpb25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCckbG9jYXRpb24nLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgZmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgbG9jYXRpb25TZXJ2aWNlOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0ZmlyZWJhc2VTZXJ2aWNlLmNvbmZpZ3VyZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVsb2FkIHRoZSBlbnRpcmUgYXBwbGljYXRpb24gdG8gY2hlY2sgZm9yIHVwZGF0ZXNcclxuXHRcdCAqL1xyXG5cdFx0cmVsb2FkKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLndpbmRvd1NlcnZpY2UubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayB0aGF0IHRoZSBjdXJyZW50IHBhdGggbWF0Y2hlcyB0aGUgbG9jYXRpb24gcGF0aFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRjdXJyZW50Um91dGUocGF0aDogc3RyaW5nKTogYm9vbGVhbntcclxuXHRcdFx0aWYodGhpcy5sb2NhdGlvblNlcnZpY2UucGF0aCgpLnNlYXJjaChwYXRoKSl7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignQXBwbGljYXRpb25Db250cm9sbGVyJywgQXBwbGljYXRpb25Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBmb3JtIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBGb3JtQ29udHJvbGxlclxyXG5cdCAqL1xyXG5cdGNsYXNzIEZvcm1Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0J1N0b3JhZ2VTZXJ2aWNlJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdHB1YmxpYyBlcnJvcjogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBmb3JtRGF0YTogRm9ybURhdGE7XHJcblx0XHRwdWJsaWMgcG9rZW1vbjogUG9rZW1vbltdO1xyXG5cdFx0cHVibGljIHN0YXRlOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIGdlb2xvY2F0aW9uU2VydmljZTogR2VvbG9jYXRpb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIGZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIG1hcFNlcnZpY2U6IE1hcFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgcG9rZW1vblNlcnZpY2U6IFBva2Vtb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHN0b3JhZ2VTZXJ2aWNlOiBTdG9yYWdlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSB3aW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0dGhpcy5wb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMucG9rZW1vbiA9IHJlc3BvbnNlO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YXV0b2NvbXBsZXRlKG1vZGVsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcclxuXHRcdFx0dGhpcy5mb3JtRGF0YVttb2RlbF0gPSB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGZpZWxkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cmVjb3JkKGZpZWxkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR2YXIgaW5wdXQgPSBbXTtcclxuXHJcblx0XHRcdGlucHV0LnB1c2godGhpcy5mb3JtRGF0YS5uYW1lKVxyXG5cclxuXHRcdFx0dGhpcy5zdG9yYWdlU2VydmljZS5zZXQoJ2Zvcm0nLCBpbnB1dCk7XHJcblxyXG5cdFx0XHR0aGlzLndpbmRvd1NlcnZpY2Uub3BlbihwYXRoLCAnX3NlbGYnKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Ym1pdCBmb3JtIGRhdGEgdG8gZGF0YWJhc2UsIHJlc2V0IG1hcCwgbm90aWZ5IHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0c3VibWl0KCkge1xyXG5cdFx0XHR0aGlzLnN0b3JhZ2VTZXJ2aWNlLmdldDxzdHJpbmc+KCdmb3JtJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHR0aGlzLmZvcm1EYXRhLm5hbWUgPSByZXNwb25zZTtcclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5zdG9yYWdlU2VydmljZS5lbXB0eSgnZm9ybScpO1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5mb3JtRGF0YS5uYW1lKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcFNlcnZpY2UucG9zaXRpb24oKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMuZmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRcdCdwb3NpdGlvbic6IHtcclxuXHRcdFx0XHRcdFx0XHRcdCdjb29yZHMnOiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0J2xvbmdpdHVkZSc6IHBvc2l0aW9uLmxuZ1xyXG5cdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdCd0aW1lc3RhbXAnOiBNYXRoLmZsb29yKERhdGUubm93KCkpXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHQnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZVxyXG5cdFx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuZmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5wb2tlbW9uU2VydmljZS5tYXRjaCh0aGlzLmZvcm1EYXRhLm5hbWUsIHRoaXMucG9rZW1vbikudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5mb3JtRGF0YS5yZWNvcmQgPSByZXNwb25zZTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0ZSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHR0aGlzLmVycm9yID0gdHJ1ZTtcclxuXHRcdFx0XHRcdHRoaXMuc3RhdGUgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgRm9ybUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgSW5kZXhDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnLFxyXG5cdFx0XHQnJHJvdXRlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgY3VycmVudDogUG9rZW1vbjtcclxuXHRcdHB1YmxpYyBwYXJhbWV0ZXJzOiBPYmplY3Q7XHJcblx0XHRwdWJsaWMgcG9rZW1vbjogUG9rZW1vbltdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIHBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSByb3V0ZVNlcnZpY2U6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLnBhcmFtZXRlcnMgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG5cdFx0XHRwb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMucG9rZW1vbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHR0aGlzLnBhcmFtZXRlcnMgPSByb3V0ZVNlcnZpY2UuY3VycmVudC5wYXJhbXM7XHJcblxyXG5cdFx0XHRcdHRoaXMuYWN0aXZlKHRoaXMucGFyYW1ldGVyc1snaWQnXSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhY3RpdmUoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9rZW1vbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKHRoaXMucG9rZW1vbltpXS5OdW1iZXIgPT09IGlkKXtcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudCA9IHRoaXMucG9rZW1vbltpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignSW5kZXhDb250cm9sbGVyJywgSW5kZXhDb250cm9sbGVyKVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBDb250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBDb250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIE1hcENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnLFxyXG5cdFx0XHQnU3RvcmFnZVNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzOiBNYXJrZXJbXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBmaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBnZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBtYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBzdG9yYWdlU2VydmljZTogU3RvcmFnZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgd2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8TWFya2VyPigpO1xyXG5cclxuXHRcdFx0Z2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0bWFwU2VydmljZS5jb25maWd1cmUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZSwgMTIpO1xyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRmaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChyZXNwb25zZSwgKHBva2Vtb24sIHBva2Vtb25JRCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7aTxtYXJrZXJzLmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYobWFya2Vyc1tpXVsnbmFtZSddID09PSBwb2tlbW9uLk5hbWUpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzW2ldWydudW1iZXInXSA9IHBva2Vtb24uTnVtYmVyO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0XHRcdG1hcFNlcnZpY2UucG9pbnRzKG1hcmtlcnMpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdGxvY2F0ZSgpOiB2b2lke1xyXG5cdFx0XHR0aGlzLm1hcFNlcnZpY2UubG9jYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbntcclxuXHRleHBvcnQgY2xhc3MgRm9ybURhdGF7XHJcblx0XHRwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIHBvc2l0aW9uOiBQb3NpdGlvbjtcclxuXHRcdHB1YmxpYyByZWNvcmQ6IFBva2Vtb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHRcdHRoaXMucmVjb3JkID0gbmV3IFBva2Vtb24oKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBNYXJrZXIge1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR9XHJcblx0fVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vbiB7XHJcblx0XHRwdWJsaWMgQ2xhc3NpZmljYXRpb246IHN0cmluZztcclxuXHRcdHB1YmxpYyBGYXN0QXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgRmxlZVJhdGU6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBIZWlnaHQ6IE9iamVjdDtcclxuXHRcdHB1YmxpYyBNYXhDUDogbnVtYmVyO1xyXG5cdFx0cHVibGljIE1heEhQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIE51bWJlcjogc3RyaW5nO1xyXG5cdFx0cHVibGljIFByZXZpb3VzRXZvbHV0aW9uczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgUmVzaXN0YW50OiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBUeXBlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgU3BlY2lhbEF0dGFja3M6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlYWtuZXNzZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFdlaWdodDogT2JqZWN0O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkNsYXNzaWZpY2F0aW9uID0gJyc7XHJcblx0XHRcdHRoaXMuRmFzdEF0dGFja3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLkZsZWVSYXRlID0gMDtcclxuXHRcdFx0dGhpcy5IZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRcdHRoaXMuTWF4Q1AgPSAwO1xyXG5cdFx0XHR0aGlzLk1heEhQID0gMDtcclxuXHRcdFx0dGhpcy5OYW1lID0gJyc7XHJcblx0XHRcdHRoaXMuTnVtYmVyID0gJyc7XHJcblx0XHRcdHRoaXMuUHJldmlvdXNFdm9sdXRpb25zID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5SZXNpc3RhbnQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlR5cGVzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5TcGVjaWFsQXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2Vha25lc3NlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuV2VpZ2h0ID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnU3RvcmFnZVNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBTdG9yYWdlU2VydmljZTogU3RvcmFnZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgV2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKTtcclxuXHJcblx0XHRcdGlmICghdGhpcy5XaW5kb3dTZXJ2aWNlLm5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdCgnR2VvbG9jYXRpb24gbm90IHN1cHBvcnRlZC4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBvdXRwdXQgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuXHJcblx0XHRcdFx0fSwgKGVycm9yKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLldpbmRvd1NlcnZpY2UubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dmFyIG91dHB1dCA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZSk7XHJcblx0XHRcdFx0XHR9LCAoZXJyb3IpID0+IHtcclxuXHJcblx0XHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRcdGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0bWF4aW11bUFnZTogNjAwMDAsXHJcblx0XHRcdFx0XHRcdHRpbWVvdXQ6IDUwMDAsXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRtYXhpbXVtQWdlOiA2MDAwMCxcclxuXHRcdFx0XHRcdFx0dGltZW91dDogNTAwMFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdHZW9sb2NhdGlvblNlcnZpY2UnLCBHZW9sb2NhdGlvblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBTZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBTZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBNYXBTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGZpbHRlcicsXHJcblx0XHRcdCckaHR0cCcsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZScsXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckdGltZW91dCdcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBsb2NhdGlvbjogTC5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3c7XHJcblx0XHRwcml2YXRlIGluZm9XaW5kb3dzOiBnb29nbGUubWFwcy5JbmZvV2luZG93W107XHJcblx0XHRwcml2YXRlIG1hcDogTC5NYXA7XHJcblx0XHRwcml2YXRlIG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzOiBnb29nbGUubWFwcy5NYXJrZXJbXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaWx0ZXJTZXJ2aWNlOiBuZy5JRmlsdGVyU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBIdHRwU2VydmljZTogbmcuSUh0dHBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFRpbWVvdXRTZXJ2aWNlOiBuZy5JVGltZW91dFNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLmluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xyXG5cdFx0XHR0aGlzLmluZm9XaW5kb3dzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkluZm9XaW5kb3c+KCk7XHJcblx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigpO1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7UG9zaXRpb259IGNlbnRlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gem9vbSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGNvbmZpZ3VyZShlbGVtZW50OiBIVE1MRWxlbWVudCwgY2VudGVyOiBQb3NpdGlvbiwgem9vbTogbnVtYmVyKTogdm9pZCB7XHJcblx0XHRcdHRoaXMubWFwID0gTC5tYXAoZWxlbWVudCk7XHJcblxyXG5cdFx0XHR0aGlzLmxvY2F0ZSgpO1xyXG5cclxuXHRcdFx0TC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20vc3R5bGVzL3YxL21rc2FuZGVyc29uL2Npc29obGFxZzAwMGYyeHBiZXRzaHo3anYvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj1way5leUoxSWpvaWJXdHpZVzVrWlhKemIyNGlMQ0poSWpvaVJUSTVTVWxaUVNKOS5XVXgtbVZ4OTQ5aVJXZkctczdZWnZBJywge1xyXG5cdFx0XHRcdG1heFpvb206IDE5LFxyXG5cdFx0XHRcdGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+J1xyXG5cdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblxyXG5cdFx0XHR0aGlzLm1hcC5vbigncmVzaXplJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMubWFwLmludmFsaWRhdGVTaXplKHtcclxuXHRcdFx0XHRcdGFuaW1hdGU6IHRydWVcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRsb2NhdGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMubWFwLmxvY2F0ZSh7XHJcblx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdHNldFZpZXc6IHRydWVcclxuXHRcdFx0fSkub24oJ2xvY2F0aW9uZm91bmQnLCAocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRcdHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubG9jYXRpb24pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGhpcy5sb2NhdGlvbiA9IEwubWFya2VyKHJlc3BvbnNlWydsYXRsbmcnXSwge1xyXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxyXG5cdFx0XHRcdFx0aWNvbjogTC5kaXZJY29uKHtcclxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lOidsb2NhdGlvbicsXHJcblx0XHRcdFx0XHRcdGljb25TaXplOlszMiwzMl1cclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0dGl0bGU6ICdZb3VyIGxvY2F0aW9uJ1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hcC5hZGRMYXllcih0aGlzLmxvY2F0aW9uKTtcclxuXHJcblx0XHRcdH0pLm9uKCdsb2NhdGlvbmVycm9yJywgKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0YWxlcnQoJ0dlb2xvY2F0aW9uIGVycm9yOiAnICsgcmVzcG9uc2UpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAdGVtcGxhdGUgVFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9pbnRzPFQ+KHZhbHVlczogQXJyYXk8VD4pOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRMLm1hcmtlcihbdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbGF0aXR1ZGUnXSwgdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbG9uZ2l0dWRlJ11dLCB7XHJcblx0XHRcdFx0XHRpY29uOiBMLmljb24oe1xyXG5cdFx0XHRcdFx0XHRpY29uU2l6ZTogWzYwLCA2MF0sXHJcblx0XHRcdFx0XHRcdGljb25Vcmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIHZhbHVlc1tpXVsnbnVtYmVyJ10gKyAnLmljbydcclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0cmlzZU9uSG92ZXI6IHRydWUsXHJcblx0XHRcdFx0XHR0aXRsZTogdmFsdWVzW2ldWyduYW1lJ11cclxuXHRcdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxMLkxhdExuZz59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9zaXRpb24oKTogbmcuSVByb21pc2U8TC5MYXRMbmc+e1xyXG5cdFx0XHR2YXIgZGVmZXJyYWwgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRkZWZlcnJhbC5yZXNvbHZlKHRoaXMubG9jYXRpb24uZ2V0TGF0TG5nKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0ZGVmZXJyYWwucmVqZWN0KCdObyBsb2NhdGlvbiBhdmFpbGFibGUnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmFsLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ01hcFNlcnZpY2UnLCBNYXBTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgUG9rZW1vblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SVBva2Vtb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0JyRxJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgcG9rZW1vbjogQXJyYXk8UG9rZW1vbj47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgaHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBxU2VydmljZTogbmcuSVFTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0dGhpcy5wb2tlbW9uID0gbmV3IEFycmF5PFBva2Vtb24+KCk7XHJcblxyXG5cdFx0XHR0aGlzLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5wb2tlbW9uID0gcmVzcG9uc2U7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JSHR0cFByb21pc2U8QXJyYXk8UG9rZW1vbj4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxQb2tlbW9uPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5odHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBNYXRjaCBhIHBva2Vtb24gYnkgaXQncyBuYW1lIGFuZCByZXR1cm4gdGhlIGZ1bGwgUG9rZW1vbiBpdGVtXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtQb2tlbW9ufSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdG1hdGNoKG5hbWU6IHN0cmluZywgdmFsdWVzOiBBcnJheTxQb2tlbW9uPik6IG5nLklQcm9taXNlPFBva2Vtb24+IHtcclxuXHRcdFx0dmFyIGRlZmVyID0gdGhpcy5xU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdHJlc3VsdDogUG9rZW1vbjtcclxuXHJcblx0XHRcdGFuZ3VsYXIuZm9yRWFjaCh2YWx1ZXMsIChwb2tlbW9uLCBwb2tlbW9uSUQpID0+IHtcclxuXHRcdFx0XHRpZiAocG9rZW1vbi5OYW1lID09PSBuYW1lKSB7XHJcblx0XHRcdFx0XHRkZWZlci5yZXNvbHZlKHJlc3VsdCA9IHBva2Vtb24pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiBkZWZlci5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdQb2tlbW9uU2VydmljZScsIFBva2Vtb25TZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFN0b3JhZ2VTZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIENsZWFyIGFuIGl0ZW0gaW4gc3RvcmFnZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAdGVtcGxhdGUgVFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGVtcHR5PFQ+KGtleTogc3RyaW5nKTogdm9pZHtcclxuXHRcdFx0dGhpcy5XaW5kb3dTZXJ2aWNlLnNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZldGNoIGl0ZW0gYnkga2V5IGZyb20gc2Vzc2lvbiBzdG9yYWdlLiBDb21wYXJlIHRvIHNvdXJjZVxyXG5cdFx0ICogZGF0YSBhbmQgYnVpbGQgYW4gb3V0cHV0IGFycmF5IHRoYXQgY29udGFpbnMgZnVsbCB2ZXJzaW9uc1xyXG5cdFx0ICogYW5kIG5vdCBqdXN0IHRoZSBpZCBmaWVsZCBvZiBlYWNoIHN0b3JlZCBpdGVtLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAdGVtcGxhdGUgVFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8QXJyYXk8VD4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldDxUPihrZXk6IHN0cmluZyk6IG5nLklQcm9taXNlPFQ+IHtcclxuXHRcdFx0dmFyIGRlZmVyID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdG91dHB1dCxcclxuXHRcdFx0XHRyZXNwb25zZSxcclxuXHRcdFx0XHRyZXN1bHQ7XHJcblxyXG5cdFx0XHRyZXNwb25zZSA9IHRoaXMuV2luZG93U2VydmljZS5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblxyXG5cdFx0XHRpZiAocmVzcG9uc2UgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChhbmd1bGFyLmlzQXJyYXkocmVzcG9uc2UpKSB7XHJcblx0XHRcdFx0XHRpZiAocmVzcG9uc2UubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG5cclxuXHRcdFx0XHRcdFx0ZGVmZXIucmVzb2x2ZShyZXN1bHQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGRlZmVyLnJlc29sdmUocmVzcG9uc2UpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRkZWZlci5yZWplY3QoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVyLnByb21pc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgYSBmaWVsZCBmcm9tIGEgZGF0YSBzZXQgdG8gYSBzdHJpbmcgdmFsdWUgaW4gc2Vzc2lvbiBzdG9yYWdlXHJcblx0XHQgKiBcclxuXHRcdCAqIEB0ZW1wbGF0ZSBUXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8VD59IHZhbHVlcyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gW2ZpZWxkXSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHNldDxUPihrZXk6IHN0cmluZywgdmFsdWVzOiBUW10sIGZpZWxkPzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHZhciBpbnB1dDtcclxuXHJcblx0XHRcdGlmIChhbmd1bGFyLmlzQXJyYXkodmFsdWVzKSkge1xyXG5cdFx0XHRcdGlucHV0ID0gdmFsdWVzLmpvaW4oJywnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdGlucHV0ID0gdmFsdWVzO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2Uuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIGlucHV0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnU3RvcmFnZVNlcnZpY2UnLCBTdG9yYWdlU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
