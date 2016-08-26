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
        function FormController(geolocationService, firebaseService, mapService, pokemonService) {
            var _this = this;
            this.geolocationService = geolocationService;
            this.firebaseService = firebaseService;
            this.mapService = mapService;
            this.pokemonService = pokemonService;
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
         * Submit form data to database, reset map, notify user
         */
        FormController.prototype.submit = function () {
            var _this = this;
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
            L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWtzYW5kZXJzb24iLCJhIjoiRTI5SUlZQSJ9.WUx-mVx949iRWfG-s7YZvA', {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9Gb3JtQ29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL0luZGV4Q29udHJvbGxlci50cyIsImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiLCJtb2RlbHMvRm9ybURhdGEudHMiLCJtb2RlbHMvTWFya2VyLnRzIiwibW9kZWxzL1Bva2Vtb24udHMiLCJzZXJ2aWNlcy9GaXJlYmFzZVNlcnZpY2UudHMiLCJzZXJ2aWNlcy9HZW9sb2NhdGlvblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9NYXBTZXJ2aWNlLnRzIiwic2VydmljZXMvUG9rZW1vblNlcnZpY2UudHMiLCJzZXJ2aWNlcy9TdG9yYWdlU2VydmljZS50cyIsImRpcmVjdGl2ZXMvZHJvcGRvd24vY29udHJvbGxlcnMvRHJvcGRvd25Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsV0FBVyxDQUlwQjtBQUpELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQUpTLFdBQVcsS0FBWCxXQUFXLFFBSXBCO0FDSkQsNkNBQTZDO0FBQzdDLElBQVUsV0FBVyxDQU9wQjtBQVBELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCO1FBQ0MsUUFBUTtRQUNSLFNBQVM7UUFDVCxVQUFVO0tBQ1YsQ0FBQyxDQUFDO0FB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Q0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLDBDQUEwQyxDQUFBO1lBQzdELElBQUksQ0FBQyxVQUFVLEdBQUc7Z0JBQ2pCLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLE1BQU0sRUFBRSxpQkFBaUI7YUFDekIsQ0FBQztRQUNILENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLDBCQUFRLEdBQWY7WUFDQyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLGdDQUFJLEdBQVgsVUFBWSxLQUFnQixFQUFFLE9BQTRCO1FBRTFELENBQUM7UUFDRix3QkFBQztJQUFELENBN0NBLEFBNkNDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELENBQUMsRUFoRlMsUUFBUSxLQUFSLFFBQVEsUUFnRmpCIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHRcdGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ0NsaWVudCddKTtcclxuXHR9KTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2luZGV4LmQudHNcIi8+XHJcbm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ0NsaWVudCcsXHJcblx0XHRbXHJcblx0XHRcdCduZ0FyaWEnLFxyXG5cdFx0XHQnbmdSb3V0ZScsXHJcblx0XHRcdCdvZmZDbGljaydcclxuXHRcdF0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRcclxuXHRleHBvcnQgY2xhc3MgTG9jYXRpb25Qcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgTG9jYXRpb25Qcm92aWRlcjogbmcuSUxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRsb2NhdGlvblByb3ZpZGVyJywgTG9jYXRpb25Qcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgUm91dGVQcm92aWRlcntcclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwdWJsaWMgUm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXJcclxuXHRcdCl7XHJcblx0XHRcdFJvdXRlUHJvdmlkZXJcclxuXHRcdFx0XHQud2hlbignL2Zvcm0nLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidGb3JtQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdGb3JtJyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL2Zvcm0uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgnLCB7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyOidJbmRleENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdFx0Y29udHJvbGxlckFzOiAnSW5kZXgnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvaW5kZXguaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvaW5kZXgvOmlkJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonSW5kZXhDb250cm9sbGVyJyxcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ0luZGV4JyxcclxuXHRcdFx0XHRcdHRlbXBsYXRlVXJsOicvdGVtcGxhdGVzL3Bva2Vtb24uaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC53aGVuKCcvbWFwJywge1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlcjonTWFwQ29udHJvbGxlcicsXHJcblx0XHRcdFx0XHRjb250cm9sbGVyQXM6ICdNYXAnLFxyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSgnL21hcCcpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBSb3V0ZVByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBBcHBsaWNhdGlvbkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnJGxvY2F0aW9uJyxcclxuXHRcdFx0JyR3aW5kb3cnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIGZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIGxvY2F0aW9uU2VydmljZTogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSB3aW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdGZpcmViYXNlU2VydmljZS5jb25maWd1cmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9hZCB0aGUgZW50aXJlIGFwcGxpY2F0aW9uIHRvIGNoZWNrIGZvciB1cGRhdGVzXHJcblx0XHQgKi9cclxuXHRcdHJlbG9hZCgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy53aW5kb3dTZXJ2aWNlLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hlY2sgdGhhdCB0aGUgY3VycmVudCBwYXRoIG1hdGNoZXMgdGhlIGxvY2F0aW9uIHBhdGhcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3VycmVudFJvdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW57XHJcblx0XHRcdGlmKHRoaXMubG9jYXRpb25TZXJ2aWNlLnBhdGgoKS5zZWFyY2gocGF0aCkpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0FwcGxpY2F0aW9uQ29udHJvbGxlcicsIEFwcGxpY2F0aW9uQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZm9ybSBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRm9ybUNvbnRyb2xsZXJcclxuXHQgKi9cclxuXHRjbGFzcyBGb3JtQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGVycm9yOiBib29sZWFuO1xyXG5cdFx0cHVibGljIGZvcm1EYXRhOiBGb3JtRGF0YTtcclxuXHRcdHB1YmxpYyBwb2tlbW9uOiBQb2tlbW9uW107XHJcblx0XHRwdWJsaWMgc3RhdGU6IGJvb2xlYW47XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgZ2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgZmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgbWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBwb2tlbW9uU2VydmljZTogUG9rZW1vblNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLmZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5wb2tlbW9uID0gcmVzcG9uc2U7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhdXRvY29tcGxldGUobW9kZWw6IHN0cmluZywgdmFsdWU6IHN0cmluZyl7XHJcblx0XHRcdHRoaXMuZm9ybURhdGFbbW9kZWxdID0gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWJtaXQgZm9ybSBkYXRhIHRvIGRhdGFiYXNlLCByZXNldCBtYXAsIG5vdGlmeSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdHN1Ym1pdCgpIHtcclxuXHRcdFx0aWYgKHRoaXMuZm9ybURhdGEubmFtZSkge1xyXG5cdFx0XHRcdHRoaXMubWFwU2VydmljZS5wb3NpdGlvbigpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSByZXNwb25zZTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLmZpcmViYXNlU2VydmljZS5wdXNoKHtcclxuXHRcdFx0XHRcdFx0J3Bvc2l0aW9uJzoge1xyXG5cdFx0XHRcdFx0XHRcdCdjb29yZHMnOiB7XHJcblx0XHRcdFx0XHRcdFx0XHQnbGF0aXR1ZGUnOiBwb3NpdGlvbi5sYXQsXHJcblx0XHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24ubG5nXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHQndGltZXN0YW1wJzogTWF0aC5mbG9vcihEYXRlLm5vdygpKVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQnbmFtZSc6IHRoaXMuZm9ybURhdGEubmFtZVxyXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy5maXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5mb3JtRGF0YS5tZXNzYWdlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5mb3JtRGF0YS5tZXNzYWdlcy5wdXNoKCdTdWNjZXNzZnVsbHkgYWRkZWQgJyArIHRoaXMuZm9ybURhdGEubmFtZSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9ybURhdGEubmFtZSA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLnRvZ2dsZSgpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5lcnJvciA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgRm9ybUNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgSW5kZXhDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnLFxyXG5cdFx0XHQnJHJvdXRlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgY3VycmVudDogUG9rZW1vbjtcclxuXHRcdHB1YmxpYyBwYXJhbWV0ZXJzOiBPYmplY3Q7XHJcblx0XHRwdWJsaWMgcG9rZW1vbjogUG9rZW1vbltdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIHBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSByb3V0ZVNlcnZpY2U6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLnBhcmFtZXRlcnMgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG5cdFx0XHRwb2tlbW9uU2VydmljZS5nZXQoJy9hcGkvcG9rZW1vbi9wb2tlbW9uLmpzb24nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMucG9rZW1vbiA9IHJlc3BvbnNlO1xyXG5cclxuXHRcdFx0XHR0aGlzLnBhcmFtZXRlcnMgPSByb3V0ZVNlcnZpY2UuY3VycmVudC5wYXJhbXM7XHJcblxyXG5cdFx0XHRcdHRoaXMuYWN0aXZlKHRoaXMucGFyYW1ldGVyc1snaWQnXSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRhY3RpdmUoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9rZW1vbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKHRoaXMucG9rZW1vbltpXS5OdW1iZXIgPT09IGlkKXtcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudCA9IHRoaXMucG9rZW1vbltpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignSW5kZXhDb250cm9sbGVyJywgSW5kZXhDb250cm9sbGVyKVxyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBDb250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBDb250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIE1hcENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnUG9rZW1vblNlcnZpY2UnLFxyXG5cdFx0XHQnU3RvcmFnZVNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzOiBNYXJrZXJbXTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBmaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBnZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBtYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIHBva2Vtb25TZXJ2aWNlOiBQb2tlbW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBzdG9yYWdlU2VydmljZTogU3RvcmFnZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgd2luZG93U2VydmljZTogbmcuSVdpbmRvd1NlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHR0aGlzLm1hcmtlcnMgPSBuZXcgQXJyYXk8TWFya2VyPigpO1xyXG5cclxuXHRcdFx0Z2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0bWFwU2VydmljZS5jb25maWd1cmUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZSwgMTIpO1xyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRmaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHBva2Vtb25TZXJ2aWNlLmdldCgnL2FwaS9wb2tlbW9uL3Bva2Vtb24uanNvbicpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChyZXNwb25zZSwgKHBva2Vtb24sIHBva2Vtb25JRCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7aTxtYXJrZXJzLmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYobWFya2Vyc1tpXVsnbmFtZSddID09PSBwb2tlbW9uLk5hbWUpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJrZXJzW2ldWydudW1iZXInXSA9IHBva2Vtb24uTnVtYmVyO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0XHRcdG1hcFNlcnZpY2UucG9pbnRzKG1hcmtlcnMpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdGxvY2F0ZSgpOiB2b2lke1xyXG5cdFx0XHR0aGlzLm1hcFNlcnZpY2UubG9jYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbntcclxuXHRleHBvcnQgY2xhc3MgRm9ybURhdGF7XHJcblx0XHRwdWJsaWMgbWVzc2FnZXM6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBwb3NpdGlvbjogUG9zaXRpb247XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKXtcclxuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIE1hcmtlciB7XHJcblx0XHRwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG5cdFx0cHVibGljIHBvc2l0aW9uOiBQb3NpdGlvbjtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdH1cclxuXHR9XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uIHtcclxuXHRcdHB1YmxpYyBDbGFzc2lmaWNhdGlvbjogc3RyaW5nO1xyXG5cdFx0cHVibGljIEZhc3RBdHRhY2tzOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBGbGVlUmF0ZTogbnVtYmVyO1xyXG5cdFx0cHVibGljIEhlaWdodDogT2JqZWN0O1xyXG5cdFx0cHVibGljIE1heENQOiBudW1iZXI7XHJcblx0XHRwdWJsaWMgTWF4SFA6IG51bWJlcjtcclxuXHRcdHB1YmxpYyBOYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgTnVtYmVyOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgUHJldmlvdXNFdm9sdXRpb25zOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBSZXNpc3RhbnQ6IHN0cmluZ1tdO1xyXG5cdFx0cHVibGljIFR5cGVzOiBzdHJpbmdbXTtcclxuXHRcdHB1YmxpYyBTcGVjaWFsQXR0YWNrczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgV2Vha25lc3Nlczogc3RyaW5nW107XHJcblx0XHRwdWJsaWMgV2VpZ2h0OiBPYmplY3Q7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuQ2xhc3NpZmljYXRpb24gPSAnJztcclxuXHRcdFx0dGhpcy5GYXN0QXR0YWNrcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuRmxlZVJhdGUgPSAwO1xyXG5cdFx0XHR0aGlzLkhlaWdodCA9IG5ldyBPYmplY3QoKTtcclxuXHRcdFx0dGhpcy5NYXhDUCA9IDA7XHJcblx0XHRcdHRoaXMuTWF4SFAgPSAwO1xyXG5cdFx0XHR0aGlzLk5hbWUgPSAnJztcclxuXHRcdFx0dGhpcy5OdW1iZXIgPSAnJztcclxuXHRcdFx0dGhpcy5QcmV2aW91c0V2b2x1dGlvbnMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlJlc2lzdGFudCA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcblx0XHRcdHRoaXMuVHlwZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG5cdFx0XHR0aGlzLlNwZWNpYWxBdHRhY2tzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5XZWFrbmVzc2VzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcclxuXHRcdFx0dGhpcy5XZWlnaHQgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZGVjbGFyZSB2YXIgZmlyZWJhc2U6IGFueTtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIEZpcmViYXNlU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRxJ1xyXG5cdFx0XVxyXG5cclxuXHRcdHByaXZhdGUgZmlyZWJhc2U6IGFueTtcclxuXHRcdHByaXZhdGUgc2lnaHRpbmdzID0gbmV3IEFycmF5PFBva2Vtb24+KCk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCB1cCBjb25uZWN0aW9uIHRvIGRhdGFiYXNlXHJcblx0XHQgKi9cclxuXHRcdGNvbmZpZ3VyZSgpOiB2b2lkIHtcclxuXHRcdFx0dmFyIGNvbmZpZyA9IHtcclxuXHRcdFx0XHRhcGlLZXk6IFwiQUl6YVN5Q1g4RjNPQ2F6cng4QTBYbE5BNGozS2dabU9PdXlQYk5RXCIsXHJcblx0XHRcdFx0YXV0aERvbWFpbjogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuZmlyZWJhc2VhcHAuY29tXCIsXHJcblx0XHRcdFx0ZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuZmlyZWJhc2Vpby5jb21cIixcclxuXHRcdFx0XHRzdG9yYWdlQnVja2V0OiBcInBva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5hcHBzcG90LmNvbVwiLFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0dGhpcy5maXJlYmFzZSA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Kn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8YW55PiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKSxcclxuXHRcdFx0XHRyZXN1bHQgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYocGF0aCkub24oJ3ZhbHVlJywgKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHJlc3BvbnNlLmZvckVhY2goKHNpZ2h0aW5nKSA9PiB7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChzaWdodGluZyk7XHJcblx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdFx0XHR9KSlcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTaWdodGluZ30gcmVjb3JkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVzaChyZWNvcmQ6IGFueSk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHRoaXMuZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKS5wdXNoKHJlY29yZCkpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0ZpcmViYXNlU2VydmljZScsIEZpcmViYXNlU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiBGZXRjaCBhbmQgdXNlIGdlb2xvY2F0aW9uXHJcblx0ICogXHJcblx0ICogQGNsYXNzIExvY2F0aW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTG9jYXRpb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBHZW9sb2NhdGlvblNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCdTdG9yYWdlU2VydmljZScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFN0b3JhZ2VTZXJ2aWNlOiBTdG9yYWdlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPFBvc2l0aW9uPn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQoKTogbmcuSVByb21pc2U8UG9zaXRpb24+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLldpbmRvd1NlcnZpY2UubmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdHZW9sb2NhdGlvbiBub3Qgc3VwcG9ydGVkLicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuV2luZG93U2VydmljZS5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dmFyIG91dHB1dCA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xyXG5cclxuXHRcdFx0XHR9LCAoZXJyb3IpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuV2luZG93U2VydmljZS5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR2YXIgb3V0cHV0ID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRcdH0sIChlcnJvcikgPT4ge1xyXG5cclxuXHRcdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRtYXhpbXVtQWdlOiA2MDAwMCxcclxuXHRcdFx0XHRcdFx0dGltZW91dDogNTAwMCxcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0XHRlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcblx0XHRcdFx0XHRcdG1heGltdW1BZ2U6IDYwMDAwLFxyXG5cdFx0XHRcdFx0XHR0aW1lb3V0OiA1MDAwXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0dlb2xvY2F0aW9uU2VydmljZScsIEdlb2xvY2F0aW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcFNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcFNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIE1hcFNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckZmlsdGVyJyxcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0J1Bva2Vtb25TZXJ2aWNlJyxcclxuXHRcdFx0JyRxJyxcclxuXHRcdFx0JyR0aW1lb3V0J1xyXG5cdFx0XTtcclxuXHJcblx0XHRwcml2YXRlIGxvY2F0aW9uOiBMLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvdzogZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdztcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvd3M6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3dbXTtcclxuXHRcdHByaXZhdGUgbWFwOiBMLk1hcDtcclxuXHRcdHByaXZhdGUgbWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIG1hcmtlcnM6IGdvb2dsZS5tYXBzLk1hcmtlcltdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpbHRlclNlcnZpY2U6IG5nLklGaWx0ZXJTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgUG9rZW1vblNlcnZpY2U6IFBva2Vtb25TZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgVGltZW91dFNlcnZpY2U6IG5nLklUaW1lb3V0U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvd3MgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuSW5mb1dpbmRvdz4oKTtcclxuXHRcdFx0dGhpcy5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCk7XHJcblx0XHRcdHRoaXMubWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtQb3NpdGlvbn0gY2VudGVyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y29uZmlndXJlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjZW50ZXI6IFBvc2l0aW9uLCB6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5tYXAgPSBMLm1hcChlbGVtZW50KTtcclxuXHJcblx0XHRcdHRoaXMubG9jYXRlKCk7XHJcblxyXG5cdFx0XHRMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9zdHlsZXMvdjEvbWFwYm94L3N0cmVldHMtdjkvdGlsZXMvMjU2L3t6fS97eH0ve3l9P2FjY2Vzc190b2tlbj1way5leUoxSWpvaWJXdHpZVzVrWlhKemIyNGlMQ0poSWpvaVJUSTVTVWxaUVNKOS5XVXgtbVZ4OTQ5aVJXZkctczdZWnZBJywge1xyXG5cdFx0XHRcdG1heFpvb206IDE5LFxyXG5cdFx0XHRcdGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+J1xyXG5cdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblxyXG5cdFx0XHR0aGlzLm1hcC5vbigncmVzaXplJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMubWFwLmludmFsaWRhdGVTaXplKHtcclxuXHRcdFx0XHRcdGFuaW1hdGU6IHRydWVcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRsb2NhdGUoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMubWFwLmxvY2F0ZSh7XHJcblx0XHRcdFx0ZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlLFxyXG5cdFx0XHRcdHNldFZpZXc6IHRydWVcclxuXHRcdFx0fSkub24oJ2xvY2F0aW9uZm91bmQnLCAocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRcdHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubG9jYXRpb24pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGhpcy5sb2NhdGlvbiA9IEwubWFya2VyKHJlc3BvbnNlWydsYXRsbmcnXSwge1xyXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxyXG5cdFx0XHRcdFx0aWNvbjogTC5kaXZJY29uKHtcclxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lOidsb2NhdGlvbicsXHJcblx0XHRcdFx0XHRcdGljb25TaXplOlszMiwzMl1cclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0dGl0bGU6ICdZb3VyIGxvY2F0aW9uJ1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hcC5hZGRMYXllcih0aGlzLmxvY2F0aW9uKTtcclxuXHJcblx0XHRcdH0pLm9uKCdsb2NhdGlvbmVycm9yJywgKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0YWxlcnQoJ0dlb2xvY2F0aW9uIGVycm9yOiAnICsgcmVzcG9uc2UpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAdGVtcGxhdGUgVFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9pbnRzPFQ+KHZhbHVlczogQXJyYXk8VD4pOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRMLm1hcmtlcihbdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbGF0aXR1ZGUnXSwgdmFsdWVzW2ldWydwb3NpdGlvbiddWydjb29yZHMnXVsnbG9uZ2l0dWRlJ11dLCB7XHJcblx0XHRcdFx0XHRpY29uOiBMLmljb24oe1xyXG5cdFx0XHRcdFx0XHRpY29uU2l6ZTogWzYwLCA2MF0sXHJcblx0XHRcdFx0XHRcdGljb25Vcmw6ICcvYXBpL3Bva2Vtb24vaWNvbnMvJyArIHZhbHVlc1tpXVsnbnVtYmVyJ10gKyAnLmljbydcclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0cmlzZU9uSG92ZXI6IHRydWUsXHJcblx0XHRcdFx0XHR0aXRsZTogdmFsdWVzW2ldWyduYW1lJ11cclxuXHRcdFx0XHR9KS5hZGRUbyh0aGlzLm1hcCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxMLkxhdExuZz59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cG9zaXRpb24oKTogbmcuSVByb21pc2U8TC5MYXRMbmc+e1xyXG5cdFx0XHR2YXIgZGVmZXJyYWwgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZih0aGlzLmxvY2F0aW9uKXtcclxuXHRcdFx0XHRkZWZlcnJhbC5yZXNvbHZlKHRoaXMubG9jYXRpb24uZ2V0TGF0TG5nKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0ZGVmZXJyYWwucmVqZWN0KCdObyBsb2NhdGlvbiBhdmFpbGFibGUnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmFsLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ01hcFNlcnZpY2UnLCBNYXBTZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgUG9rZW1vblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SVBva2Vtb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBQb2tlbW9uU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRodHRwJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIEh0dHBTZXJ2aWNlOiBuZy5JSHR0cFNlcnZpY2UpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JSHR0cFByb21pc2U8QXJyYXk8UG9rZW1vbj4+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldChwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxQb2tlbW9uPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ1Bva2Vtb25TZXJ2aWNlJywgUG9rZW1vblNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRleHBvcnQgY2xhc3MgU3RvcmFnZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFdpbmRvd1NlcnZpY2U6IG5nLklXaW5kb3dTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogRmV0Y2ggaXRlbSBieSBrZXkgZnJvbSBzZXNzaW9uIHN0b3JhZ2UuIENvbXBhcmUgdG8gc291cmNlXHJcblx0XHQgKiBkYXRhIGFuZCBidWlsZCBhbiBvdXRwdXQgYXJyYXkgdGhhdCBjb250YWlucyBmdWxsIHZlcnNpb25zXHJcblx0XHQgKiBhbmQgbm90IGp1c3QgdGhlIGlkIGZpZWxkIG9mIGVhY2ggc3RvcmVkIGl0ZW0uXHJcblx0XHQgKiBcclxuXHRcdCAqIEB0ZW1wbGF0ZSBUXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxBcnJheTxUPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0PFQ+KGtleTogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8VD4+IHtcclxuXHRcdFx0dmFyIGRlZmVyID0gdGhpcy5RU2VydmljZS5kZWZlcigpLFxyXG5cdFx0XHRcdG91dHB1dCxcclxuXHRcdFx0XHRyZXNwb25zZSxcclxuXHRcdFx0XHRyZXN1bHQ7XHJcblxyXG5cdFx0XHRyZXNwb25zZSA9IHRoaXMuV2luZG93U2VydmljZS5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XHJcblxyXG5cdFx0XHRpZiAocmVzcG9uc2UgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChyZXNwb25zZS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG5cclxuXHRcdFx0XHRcdGRlZmVyLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0ZGVmZXIucmVqZWN0KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlci5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBhIGZpZWxkIGZyb20gYSBkYXRhIHNldCB0byBhIHN0cmluZyB2YWx1ZSBpbiBzZXNzaW9uIHN0b3JhZ2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHRlbXBsYXRlIFRcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxUPn0gdmFsdWVzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBbZmllbGRdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c2V0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZXM6IEFycmF5PFQ+LCBmaWVsZD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR2YXIgaW5wdXQ7XHJcblxyXG5cdFx0XHRpbnB1dCA9IHZhbHVlcy5qb2luKCcsJyk7XHJcblxyXG5cdFx0XHR0aGlzLldpbmRvd1NlcnZpY2Uuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIGlucHV0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnU3RvcmFnZVNlcnZpY2UnLCBTdG9yYWdlU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
