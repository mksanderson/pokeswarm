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
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            this.WindowService = WindowService;
            GeolocationService.get().then(function (response) {
                MapService.createMap(document.getElementById('map'), response.coords.latitude, response.coords.longitude, 16);
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
            this.dom = dom;
            this.instance = new google.maps.Map(this.dom, {
                center: new google.maps.LatLng(lat, lng),
                disableDefaultUI: true,
                styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }],
                zoom: zoom
            });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9NYXBDb250cm9sbGVyLnRzIiwic2VydmljZXMvRmlyZWJhc2VTZXJ2aWNlLnRzIiwic2VydmljZXMvR2VvbG9jYXRpb25TZXJ2aWNlLnRzIiwic2VydmljZXMvTWFwU2VydmljZS50cyIsInNlcnZpY2VzL1Bva2Vtb25TZXJ2aWNlLnRzIiwiZGlyZWN0aXZlcy9kcm9wZG93bi9jb250cm9sbGVycy9Ecm9wZG93bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBSXBCO0FBSkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLEVBSlMsV0FBVyxLQUFYLFdBQVcsUUFJcEI7QUNKRCw2Q0FBNkM7QUFDN0MsSUFBVSxXQUFXLENBTXBCO0FBTkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdEI7UUFDQyxTQUFTO1FBQ1QsVUFBVTtLQUNWLENBQUMsQ0FBQztBQUNMLENBQUMsRUFOUyxXQUFXLEtBQVgsV0FBVyxRQU1wQjtBQ1BELElBQVUsV0FBVyxDQWFwQjtBQWJELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFFdEI7UUFDQywwQkFDUSxnQkFBc0M7WUFBdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFzQjtRQUc5QyxDQUFDO1FBQ0YsdUJBQUM7SUFBRCxD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SSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUN4QyxnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixNQUFNLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FB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QU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsU0FBUyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRCxDQUFDLEVBaEZTLFFBQVEsS0FBUixRQUFRLFFBZ0ZqQiIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblx0XHRhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydDbGllbnQnXSk7XHJcblx0fSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9pbmRleC5kLnRzXCIvPlxyXG5uYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdDbGllbnQnLCBcclxuXHRcdFtcclxuXHRcdFx0J25nUm91dGUnLFxyXG5cdFx0XHQnb2ZmQ2xpY2snXHJcblx0XHRdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0XHJcblx0ZXhwb3J0IGNsYXNzIExvY2F0aW9uUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIExvY2F0aW9uUHJvdmlkZXI6IG5nLklMb2NhdGlvblByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsIExvY2F0aW9uUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlUHJvdmlkZXJ7XHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHVibGljIFJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyXHJcblx0XHQpe1xyXG5cdFx0XHRSb3V0ZVByb3ZpZGVyXHJcblx0XHRcdFx0LndoZW4oJy8nLCB7XHJcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDonL3RlbXBsYXRlcy9tYXAuaHRtbCdcclxuXHRcdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgUm91dGVQcm92aWRlcl0pO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHQvKipcclxuXHQgKiBDb3JlIGNvbnRyb2xsZXIgZm9yIGdsb2JhbCBmdW5jdGlvbnNcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgQXBwbGljYXRpb25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lBcHBsaWNhdGlvbkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgQXBwbGljYXRpb25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgZGF0YTogYW55O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmNvbmZpZ3VyZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdBcHBsaWNhdGlvbkNvbnRyb2xsZXInLCBBcHBsaWNhdGlvbkNvbnRyb2xsZXIpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBNYXBDb250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lNYXBDb250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIE1hcENvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCdGaXJlYmFzZVNlcnZpY2UnLFxyXG5cdFx0XHQnR2VvbG9jYXRpb25TZXJ2aWNlJyxcclxuXHRcdFx0J01hcFNlcnZpY2UnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGxvY2F0aW9uOiBQb3NpdGlvbjtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgc2VhcmNoOiBzdHJpbmc7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgR2VvbG9jYXRpb25TZXJ2aWNlOiBHZW9sb2NhdGlvblNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgTWFwU2VydmljZTogTWFwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBXaW5kb3dTZXJ2aWNlOiBuZy5JV2luZG93U2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdEdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdE1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgcmVzcG9uc2UuY29vcmRzLmxhdGl0dWRlLCByZXNwb25zZS5jb29yZHMubG9uZ2l0dWRlLCAxNik7XHJcblx0XHRcdFx0TWFwU2VydmljZS5hZGRHZW9NYXJrZXIocmVzcG9uc2UpO1xyXG5cdFx0XHR9KS5jYXRjaCgocmVhc29uKSA9PiB7XHJcblx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCAyNywgMTUzLCAyKTtcclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0RmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRNYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRmlsdGVyIHRoZSBtYXAgaXRlbXMgYmFzZWQgb24gdGhlIHNlYXJjaCBtb2RlbFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gW3NlYXJjaF0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRmaWx0ZXIoc2VhcmNoPzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJNYXJrZXJzKHNlYXJjaCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmZpbHRlckhlYXRNYXAoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9hZCB0aGUgZW50aXJlIG1hcCB0byBjaGVjayBmb3IgdXBkYXRlc1xyXG5cdFx0ICovXHJcblx0XHRyZWxvYWQoKTogdm9pZHtcclxuXHRcdFx0dGhpcy5XaW5kb3dTZXJ2aWNlLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgdGhlIG1hcCBzdGF0ZVxyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpIHtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnJlc2V0KCk7XHJcblx0XHRcdHRoaXMuc2VhcmNoID0gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIFJlbG9jYXRlIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdHJlbG9jYXRlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihyZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQobmFtZTogc3RyaW5nKSB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5nZXRHZW9Qb3NpdGlvbigpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0J3Bvc2l0aW9uJzoge1xyXG5cdFx0XHRcdFx0XHQnY29vcmRzJzoge1xyXG5cdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdFx0XHRcdCdsb25naXR1ZGUnOiBwb3NpdGlvbi5sbmcoKVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQndGltZXN0YW1wJzogTWF0aC5mbG9vcihEYXRlLm5vdygpKVxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdCduYW1lJzogbmFtZVxyXG5cdFx0XHRcdH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLkZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHR2YXIgbWFya2VycyA9IFtdO1xyXG5cclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHRoaXMuTWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cclxuXHRcdFx0XHRcdFx0YWxlcnQodGhpcy5uYW1lICsgJyBoYXMgYmVlbiBhZGRlZCB0byB0aGUgbWFwISBUaGFuayB5b3UhJyk7XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGRlY2xhcmUgdmFyIGZpcmViYXNlOiBhbnk7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBGaXJlYmFzZVNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcSdcclxuXHRcdF1cclxuXHJcblx0XHRwcml2YXRlIGZpcmViYXNlOiBhbnk7XHJcblx0XHRwcml2YXRlIHNpZ2h0aW5ncyA9IG5ldyBBcnJheTxQb2tlbW9uPigpO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdXAgY29ubmVjdGlvbiB0byBkYXRhYmFzZVxyXG5cdFx0ICovXHJcblx0XHRjb25maWd1cmUoKTogdm9pZCB7XHJcblx0XHRcdHZhciBjb25maWcgPSB7XHJcblx0XHRcdFx0YXBpS2V5OiBcIkFJemFTeUNYOEYzT0NhenJ4OEEwWGxOQTRqM0tnWm1PT3V5UGJOUVwiLFxyXG5cdFx0XHRcdGF1dGhEb21haW46IFwicG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlYXBwLmNvbVwiLFxyXG5cdFx0XHRcdGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vcG9rZXRyZW5kcy0xNDY5Nzc4MTQ0MzAxLmZpcmViYXNlaW8uY29tXCIsXHJcblx0XHRcdFx0c3RvcmFnZUJ1Y2tldDogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuYXBwc3BvdC5jb21cIixcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHRoaXMuZmlyZWJhc2UgPSBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMgeyp9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0ID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKHBhdGgpLm9uKCd2YWx1ZScsICgocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRyZXNwb25zZS5mb3JFYWNoKChzaWdodGluZykgPT4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2lnaHRpbmcpO1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHRcdFx0fSkpXHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U2lnaHRpbmd9IHJlY29yZCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1c2gocmVjb3JkOiBhbnkpOiBuZy5JUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cclxuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCkucHVzaChyZWNvcmQpKTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdGaXJlYmFzZVNlcnZpY2UnLCBGaXJlYmFzZVNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogRmV0Y2ggYW5kIHVzZSBnZW9sb2NhdGlvblxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBMb2NhdGlvblNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SUxvY2F0aW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgR2VvbG9jYXRpb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJHEnLFxyXG5cdFx0XHQnJHdpbmRvdydcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBxOiBuZy5JUVNlcnZpY2UsIHByaXZhdGUgd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTxQb3NpdGlvbj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KCk6IG5nLklQcm9taXNlPFBvc2l0aW9uPiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMucS5kZWZlcigpO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLndpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoJ0dlb2xvY2F0aW9uIG5vdCBzdXBwb3J0ZWQuJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy53aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xyXG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0dlb2xvY2F0aW9uU2VydmljZScsIEdlb2xvY2F0aW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcFNlcnZpY2VcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcFNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIE1hcFNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckZmlsdGVyJyxcclxuXHRcdFx0JyRodHRwJyxcclxuXHRcdFx0JyRxJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwcml2YXRlIGFjdGl2ZTogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBkb206IEVsZW1lbnQ7XHJcblx0XHRwcml2YXRlIGdlb01hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyO1xyXG5cdFx0cHJpdmF0ZSBnZW9DaXJjbGU6IGdvb2dsZS5tYXBzLkNpcmNsZTtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VycyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+KCk7XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZXMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuQ2lyY2xlPigpO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwID0gbmV3IGdvb2dsZS5tYXBzLnZpc3VhbGl6YXRpb24uSGVhdG1hcExheWVyO1xyXG5cdFx0cHJpdmF0ZSBoZWF0bWFwUG9pbnRzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkxhdExuZz4oKTtcclxuXHRcdHByaXZhdGUgaW5zdGFuY2U6IGdvb2dsZS5tYXBzLk1hcDtcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvdzogZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdztcclxuXHRcdHByaXZhdGUgaW5mb1dpbmRvd3MgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuSW5mb1dpbmRvdz4oKTtcclxuXHRcdHByaXZhdGUgbWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIG1hcmtlckNpcmNsZTogZ29vZ2xlLm1hcHMuQ2lyY2xlO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdHByaXZhdGUgbWFya2VyQ2lyY2xlcyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5DaXJjbGU+KCk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlsdGVyU2VydmljZTogbmcuSUZpbHRlclNlcnZpY2UsXHJcblx0XHRcdHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBRU2VydmljZTogbmcuSVFTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgbWFya2VycyBmcm9tIEFQSSB0byB0aGUgbWFwXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZE1hcmtlcnMobWFya2VyczogQXJyYXk8TWFya2VyPik6IHZvaWQge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0XHRzY2FsZWRTaXplOm5ldyBnb29nbGUubWFwcy5TaXplKDYwLCA2MCksXHJcblx0XHRcdFx0XHRcdHVybDonL2FwaS9wb2tlbW9uL2ljb25zLycgKyBtYXJrZXJzW2ldLm5hbWUgKyAnLmljbycsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0XHRtYXJrZXJzW2ldLnBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdFx0XHR0aXRsZTogbWFya2Vyc1tpXS5uYW1lLFxyXG5cdFx0XHRcdFx0ekluZGV4OiAxXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHRoaXMuaW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcclxuXHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlcnNbaV0ubmFtZSArICcgKEFkZGVkICcgKyB0aGlzLkZpbHRlclNlcnZpY2UoJ2RhdGUnKShtYXJrZXJzW2ldLnBvc2l0aW9uLnRpbWVzdGFtcCkgKyAnKSdcclxuXHRcdFx0XHR9KVxyXG5cclxuXHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzLnB1c2godGhpcy5pbmZvV2luZG93KTtcclxuXHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzLnB1c2godGhpcy5tYXJrZXIpO1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KHRoaXMubWFya2VyLCB0aGlzLmluZm9XaW5kb3cpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBtYXJrZXIgZm9yIHVzZXJzIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHQgKiBEZXBlbmRzIG9uIHRoZSBHZW9sb2NhdGlvblNlcnZpY2VcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtNYXJrZXJ9IG1hcmtlciAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEdlb01hcmtlcihwb3NpdGlvbjogUG9zaXRpb24pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuXHRcdFx0XHRkcmFnZ2FibGU6IHRydWUsXHJcblx0XHRcdFx0aWNvbjoge1xyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdFx0XHRmaWxsT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0XHRcdHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFLFxyXG5cdFx0XHRcdFx0c2NhbGU6IDgsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG5cdFx0XHRcdFx0cG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdCksXHJcblx0XHRcdFx0bWFwOiB0aGlzLmluc3RhbmNlXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5nZW9NYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QKTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2Vycy5wdXNoKHRoaXMuZ2VvTWFya2VyKTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuZ2V0R2VvUG9zaXRpb24odGhpcy5nZW9NYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gdGhpcy5nZW9DaXJjbGUgPSBuZXcgZ29vZ2xlLm1hcHMuQ2lyY2xlKHtcclxuXHRcdFx0Ly8gXHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdC8vIFx0XHRwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXHJcblx0XHRcdC8vIFx0KSxcclxuXHRcdFx0Ly8gXHRmaWxsQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0Ly8gXHRmaWxsT3BhY2l0eTogMC4xNSxcclxuXHRcdFx0Ly8gXHRtYXA6IHRoaXMuaW5zdGFuY2UsXHJcblx0XHRcdC8vIFx0cmFkaXVzOiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgKiAzLFxyXG5cdFx0XHQvLyBcdHN0cm9rZUNvbG9yOiAnIzAzOWJlNScsXHJcblx0XHRcdC8vIFx0c3Ryb2tlT3BhY2l0eTogMC4zNSxcclxuXHRcdFx0Ly8gXHRzdHJva2VXZWlnaHQ6IDJcclxuXHRcdFx0Ly8gfSk7XHJcblxyXG5cdFx0XHQvLyB0aGlzLmdlb0NpcmNsZXMucHVzaCh0aGlzLmdlb0NpcmNsZSk7XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldENlbnRlcih0aGlzLmdlb01hcmtlci5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGhlYXRtYXAgdG8gdGhlIG1hcCBpbnN0YW5jZSBieVxyXG5cdFx0ICogcGFzc2luZyBpbiBtYXAgcG9pbnRzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEhlYXRtYXAoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXIoe1xyXG5cdFx0XHRcdGRhdGE6IHRoaXMuaGVhdG1hcFBvaW50cyxcclxuXHRcdFx0XHRyYWRpdXM6IDUwXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5kb20gPSBkb207XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLmRvbSwge1xyXG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZyksXHJcblx0XHRcdFx0ZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuXHRcdFx0XHRzdHlsZXM6IFt7IFwiZmVhdHVyZVR5cGVcIjogXCJhZG1pbmlzdHJhdGl2ZVwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLnRleHQuZmlsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NDQ0NDRcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJsYW5kc2NhcGVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiNmMmYyZjJcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJwb2lcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZFwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInNhdHVyYXRpb25cIjogLTEwMCB9LCB7IFwibGlnaHRuZXNzXCI6IDQ1IH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuaGlnaHdheVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJzaW1wbGlmaWVkXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZC5hcnRlcmlhbFwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLmljb25cIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInRyYW5zaXRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwid2F0ZXJcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NmJjZWNcIiB9LCB7IFwidmlzaWJpbGl0eVwiOiBcIm9uXCIgfV0gfV0sXHJcblx0XHRcdFx0em9vbTogem9vbVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgdmlzaWJsZSBtYXJrZXJzIGJ5IGEgbWF0Y2hpbmcgdmFsdWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyTWFya2VycyhzZWFyY2g/OiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHNlYXJjaCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFRpdGxlKCkudG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWZ1bCB3aGVuIG1hcmtlcnMgY2hhbmdlIHRvIHJlZmxlY3QgdGhvc2UgY2hhbmdlc1xyXG5cdFx0ICogaW4gdGhlIGhlYXRtYXBwaW5nXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlckhlYXRNYXAoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5sZW5ndGggPSAwO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFZpc2libGUoKSkge1xyXG5cdFx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8UG9zaXRpb24+fSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGdldEdlb1Bvc2l0aW9uKG1hcmtlcj86IGdvb2dsZS5tYXBzLk1hcmtlcik6IG5nLklQcm9taXNlPGdvb2dsZS5tYXBzLkxhdExuZz4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCksXHJcblx0XHRcdFx0cmVzdWx0O1xyXG5cclxuXHRcdFx0cmVzdWx0ID0gdGhpcy5nZW9NYXJrZXIuZ2V0UG9zaXRpb24oKTtcclxuXHJcblx0XHRcdGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IG1hcmtlcnMgZnJvbSBlbmRwb2ludFxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBUEkgZW5kcG9pbnRcclxuXHRcdCAqIEByZXR1cm5zIHtuZy5JUHJvbWlzZTw8QXJyYXk8TWFya2VyPj59IEFuIGFycmF5IG9mIG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0Z2V0TWFya2VycyhwYXRoOiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxBcnJheTxNYXJrZXI+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE9wZW4gaW5mb3dpbmRvdywgY2xvc2Ugb3RoZXJzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuTWFya2VyfSBtYXJrZXIgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5JbmZvV2luZG93fSBpbmZvV2luZG93IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0b3BlbkluZm9XaW5kb3cobWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXIsIGluZm9XaW5kb3c6IGdvb2dsZS5tYXBzLkluZm9XaW5kb3cpOiB2b2lkIHtcclxuXHRcdFx0bWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5mb1dpbmRvd3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3NbaV0uY2xvc2UoKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGluZm9XaW5kb3cub3Blbih0aGlzLmluc3RhbmNlLCBtYXJrZXIpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRyZW1vdmVHZW9NYXJrZXJzKCk6IHZvaWR7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aTx0aGlzLmdlb01hcmtlcnMubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dGhpcy5nZW9NYXJrZXJzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpPHRoaXMuZ2VvQ2lyY2xlcy5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHR0aGlzLmdlb0NpcmNsZXNbaV0uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgbWFya2Vyc1xyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdNYXBTZXJ2aWNlJywgTWFwU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIFBva2Vtb25TZXJ2aWNlXHJcblx0ICogQGltcGxlbWVudHMge0lQb2tlbW9uU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgUG9rZW1vblNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckaHR0cCdcclxuXHRcdF07XHJcblxyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBIdHRwU2VydmljZTogbmcuSUh0dHBTZXJ2aWNlKSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSUh0dHBQcm9taXNlPEFycmF5PFBva2Vtb24+Pn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8UG9rZW1vbj4+IHtcclxuXHRcdFx0dmFyIHJlc3VsdDogbmcuSVByb21pc2U8YW55PiA9IHRoaXMuSHR0cFNlcnZpY2UuZ2V0KHBhdGgpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5zZXJ2aWNlKCdQb2tlbW9uU2VydmljZScsIFBva2Vtb25TZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBEcm9wZG93biB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SURyb3Bkb3duQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkNvbnRyb2xsZXIge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdFxyXG5cdFx0XTtcclxuXHRcdFxyXG5cdFx0cHVibGljIHN0YXRlOiBib29sZWFuO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dG9nZ2xlKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLnN0YXRlID0gIXRoaXMuc3RhdGU7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25EaXJlY3RpdmVcclxuXHQgKiBAaW1wbGVtZW50cyB7bmcuSURpcmVjdGl2ZX1cclxuXHQgKi9cclxuXHRjbGFzcyBEcm9wZG93bkRpcmVjdGl2ZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG5cdFx0cHVibGljIGJpbmRUb0NvbnRyb2xsZXI6IGFueTtcclxuXHRcdHB1YmxpYyBjb250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlckFzOiBhbnk7XHJcblx0XHRwdWJsaWMgcmVwbGFjZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyBzY29wZTogYm9vbGVhbjtcclxuXHRcdHB1YmxpYyB0ZW1wbGF0ZVVybDogc3RyaW5nO1xyXG5cdFx0cHVibGljIHRyYW5zY2x1ZGU6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5iaW5kVG9Db250cm9sbGVyID0ge1xyXG5cdFx0XHRcdGxlZnQ6ICdAJyxcclxuXHRcdFx0XHRvYmplY3Q6ICdAJyxcclxuXHRcdFx0XHRyaWdodDogJ0AnXHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5jb250cm9sbGVyID0gRHJvcGRvd25Db250cm9sbGVyO1xyXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXJBcyA9ICdEcm9wZG93bic7XHJcblx0XHRcdHRoaXMucmVwbGFjZSA9IHRydWU7XHJcblx0XHRcdHRoaXMuc2NvcGUgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnRlbXBsYXRlVXJsID0gJy9kaXJlY3RpdmVzL2Ryb3Bkb3duL3ZpZXdzL2Ryb3Bkb3duLmh0bWwnXHJcblx0XHRcdHRoaXMudHJhbnNjbHVkZSA9IHtcclxuXHRcdFx0XHR0aXRsZTogJz9kcm9wZG93blRpdGxlJyxcclxuXHRcdFx0XHRyZXN1bHQ6ICc/ZHJvcGRvd25SZXN1bHQnXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSURpcmVjdGl2ZX0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdGF0aWMgaW5zdGFuY2UoKTogbmcuSURpcmVjdGl2ZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRHJvcGRvd25EaXJlY3RpdmUoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7bmcuSVNjb3BlfSBzY29wZSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge25nLklBdWdtZW50ZWRKUXVlcnl9IGVsZW1lbnQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KTogdm9pZCB7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5kaXJlY3RpdmUoJ2Ryb3Bkb3duJywgRHJvcGRvd25EaXJlY3RpdmUuaW5zdGFuY2UpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
