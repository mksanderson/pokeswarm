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
        function MapController(FirebaseService, GeolocationService, MapService) {
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
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
         * Reset the map state
         */
        MapController.prototype.reset = function () {
            this.MapService.reset();
            this.search = '';
        };
        MapController.prototype.updateLocation = function () {
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
            this.GeolocationService.get().then(function (response) {
                var position = response;
                _this.FirebaseService.push({
                    'position': {
                        'coords': {
                            'latitude': position.coords.latitude,
                            'longitude': position.coords.longitude
                        },
                        'timestamp': position.timestamp
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
            'MapService'
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
        GeolocationService.prototype.update = function (position) {
            alert('test');
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
                    icon: '/api/pokemon/icons/' + markers[i].name + '.png',
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
            this.geoMarker = new google.maps.Marker({
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
            this.geoCircle = new google.maps.Circle({
                center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                fillColor: '#039be5',
                fillOpacity: 0.15,
                map: this.instance,
                radius: position.coords.accuracy * 3,
                strokeColor: '#039be5',
                strokeOpacity: 0.35,
                strokeWeight: 2
            });
            this.geoCircles.push(this.geoCircle);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC50cyIsInN0YXJ0dXAudHMiLCJjb25maWd1cmF0aW9uL0xvY2F0aW9uUHJvdmlkZXIudHMiLCJjb25maWd1cmF0aW9uL1JvdXRlUHJvdmlkZXIudHMiLCJjb250cm9sbGVycy9BcHBsaWNhdGlvbkNvbnRyb2xsZXIudHMiLCJjb250cm9sbGVycy9NYXBDb250cm9sbGVyLnRzIiwic2VydmljZXMvRmlyZWJhc2VTZXJ2aWNlLnRzIiwic2VydmljZXMvR2VvbG9jYXRpb25TZXJ2aWNlLnRzIiwic2VydmljZXMvTWFwU2VydmljZS50cyIsInNlcnZpY2VzL1Bva2Vtb25TZXJ2aWNlLnRzIiwiZGlyZWN0aXZlcy9kcm9wZG93bi9jb250cm9sbGVycy9Ecm9wZG93bkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBSXBCO0FBSkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLEVBSlMsV0FBVyxLQUFYLFdBQVcsUUFJcEI7QUNKRCw2Q0FBNkM7QUFDN0MsSUFBVSxXQUFXLENBTXBCO0FBTkQsV0FBVSxXQUFXLEVBQUMsQ0FBQztJQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdEI7UUFDQyxTQUFTO1FBQ1QsVUFBVTtLQUNWLENBQUMsQ0FBQztBQUNMLENBQUMsRUFOUyxXQUFXLEtBQVgsV0FBVyxRQU1wQjtBQ1BELElBQVUsV0FBVyxDQWFwQjtBQWJELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFFdEI7UUFDQywwQkFDUSxnQkFBc0M7WUFBdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFzQjtRQUc5QyxDQUFDO1FBQ0YsdUJBQUM7SUFBRCxD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RztnQkFDWCxLQUFLLEVBQUUsR0FBRzthQUNWLENBQUE7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsMENBQTBDLENBQUE7WUFDN0QsSUFBSSxDQUFDLFVBQVUsR0FBRztnQkFDakIsS0FBSyxFQUFFLGdCQUFnQjtnQkFDdkIsTUFBTSxFQUFFLGlCQUFpQjthQUN6QixDQUFDO1FBQ0gsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ksMEJBQVEsR0FBZjtZQUNDLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ksZ0NBQUksR0FBWCxVQUFZLEtBQWdCLEVBQUUsT0FBNEI7UUFFMUQsQ0FBQztRQUNGLHdCQUFDO0lBQUQsQ0E3Q0EsQUE2Q0MsSUFBQTtJQUVELE9BQU87U0FDTCxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2hCLFNBQVMsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsQ0FBQyxFQWhGUyxRQUFRLEtBQVIsUUFBUSxRQWdGakIiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cdFx0YW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnQ2xpZW50J10pO1xyXG5cdH0pO1xyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvaW5kZXguZC50c1wiLz5cclxubmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnQ2xpZW50JywgXHJcblx0XHRbXHJcblx0XHRcdCduZ1JvdXRlJyxcclxuXHRcdFx0J29mZkNsaWNrJ1xyXG5cdFx0XSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdFxyXG5cdGV4cG9ydCBjbGFzcyBMb2NhdGlvblByb3ZpZGVye1xyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHB1YmxpYyBMb2NhdGlvblByb3ZpZGVyOiBuZy5JTG9jYXRpb25Qcm92aWRlclxyXG5cdFx0KXtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29uZmlnKFsnJGxvY2F0aW9uUHJvdmlkZXInLCBMb2NhdGlvblByb3ZpZGVyXSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cdGV4cG9ydCBjbGFzcyBSb3V0ZVByb3ZpZGVye1xyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHB1YmxpYyBSb3V0ZVByb3ZpZGVyOiBuZy5yb3V0ZS5JUm91dGVQcm92aWRlclxyXG5cdFx0KXtcclxuXHRcdFx0Um91dGVQcm92aWRlclxyXG5cdFx0XHRcdC53aGVuKCcvJywge1xyXG5cdFx0XHRcdFx0dGVtcGxhdGVVcmw6Jy90ZW1wbGF0ZXMvbWFwLmh0bWwnXHJcblx0XHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnQ2xpZW50JylcclxuXHRcdC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIFJvdXRlUHJvdmlkZXJdKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0LyoqXHJcblx0ICogQ29yZSBjb250cm9sbGVyIGZvciBnbG9iYWwgZnVuY3Rpb25zXHJcblx0ICogXHJcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJQXBwbGljYXRpb25Db250cm9sbGVyfVxyXG5cdCAqL1xyXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGRhdGE6IGFueTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZVxyXG5cdFx0KSB7XHJcblx0XHRcdEZpcmViYXNlU2VydmljZS5jb25maWd1cmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignQXBwbGljYXRpb25Db250cm9sbGVyJywgQXBwbGljYXRpb25Db250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwQ29udHJvbGxlclxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwQ29udHJvbGxlcn1cclxuXHQgKi9cclxuXHRjbGFzcyBNYXBDb250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJyxcclxuXHRcdFx0J0dlb2xvY2F0aW9uU2VydmljZScsXHJcblx0XHRcdCdNYXBTZXJ2aWNlJ1xyXG5cdFx0XTtcclxuXHJcblx0XHRwdWJsaWMgbG9jYXRpb246IFBvc2l0aW9uO1xyXG5cdFx0cHVibGljIG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBzZWFyY2g6IHN0cmluZztcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaXJlYmFzZVNlcnZpY2U6IEZpcmViYXNlU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBNYXBTZXJ2aWNlOiBNYXBTZXJ2aWNlXHJcblx0XHQpIHtcclxuXHRcdFx0R2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0TWFwU2VydmljZS5jcmVhdGVNYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCByZXNwb25zZS5jb29yZHMubGF0aXR1ZGUsIHJlc3BvbnNlLmNvb3Jkcy5sb25naXR1ZGUsIDE2KTtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihyZXNwb25zZSk7XHJcblx0XHRcdH0pLmNhdGNoKChyZWFzb24pID0+IHtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmNyZWF0ZU1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIDI3LCAxNTMsIDIpO1xyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRGaXJlYmFzZVNlcnZpY2UuZ2V0KCcvJykudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRtYXJrZXJzLnB1c2gocmVzcG9uc2VbaV0udmFsKCkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdE1hcFNlcnZpY2UuYWRkTWFya2VycyhtYXJrZXJzKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBGaWx0ZXIgdGhlIG1hcCBpdGVtcyBiYXNlZCBvbiB0aGUgc2VhcmNoIG1vZGVsXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBbc2VhcmNoXSAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlcihzZWFyY2g/OiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmZpbHRlck1hcmtlcnMoc2VhcmNoKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVySGVhdE1hcCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHRoZSBtYXAgc3RhdGVcclxuXHRcdCAqL1xyXG5cdFx0cmVzZXQoKSB7XHJcblx0XHRcdHRoaXMuTWFwU2VydmljZS5yZXNldCgpO1xyXG5cdFx0XHR0aGlzLnNlYXJjaCA9ICcnO1xyXG5cdFx0fVxyXG5cclxuXHRcdHVwZGF0ZUxvY2F0aW9uKCk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLkdlb2xvY2F0aW9uU2VydmljZS5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5yZW1vdmVHZW9NYXJrZXJzKCk7XHJcblx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZEdlb01hcmtlcihyZXNwb25zZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQobmFtZTogc3RyaW5nKSB7XHJcblx0XHRcdHRoaXMuR2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0J3Bvc2l0aW9uJzoge1xyXG5cdFx0XHRcdFx0XHQnY29vcmRzJzoge1xyXG5cdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQndGltZXN0YW1wJzogcG9zaXRpb24udGltZXN0YW1wXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0J25hbWUnOiBuYW1lXHJcblx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblxyXG5cdFx0XHRcdFx0XHRhbGVydCh0aGlzLm5hbWUgKyAnIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBtYXAhIFRoYW5rIHlvdSEnKTtcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblx0ZGVjbGFyZSB2YXIgZmlyZWJhc2U6IGFueTtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIEZpcmViYXNlU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRxJ1xyXG5cdFx0XVxyXG5cclxuXHRcdHByaXZhdGUgZmlyZWJhc2U6IGFueTtcclxuXHRcdHByaXZhdGUgc2lnaHRpbmdzID0gbmV3IEFycmF5PFBva2Vtb24+KCk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgUVNlcnZpY2U6IG5nLklRU2VydmljZVxyXG5cdFx0KSB7XHJcblxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCB1cCBjb25uZWN0aW9uIHRvIGRhdGFiYXNlXHJcblx0XHQgKi9cclxuXHRcdGNvbmZpZ3VyZSgpOiB2b2lkIHtcclxuXHRcdFx0dmFyIGNvbmZpZyA9IHtcclxuXHRcdFx0XHRhcGlLZXk6IFwiQUl6YVN5Q1g4RjNPQ2F6cng4QTBYbE5BNGozS2dabU9PdXlQYk5RXCIsXHJcblx0XHRcdFx0YXV0aERvbWFpbjogXCJwb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuZmlyZWJhc2VhcHAuY29tXCIsXHJcblx0XHRcdFx0ZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wb2tldHJlbmRzLTE0Njk3NzgxNDQzMDEuZmlyZWJhc2Vpby5jb21cIixcclxuXHRcdFx0XHRzdG9yYWdlQnVja2V0OiBcInBva2V0cmVuZHMtMTQ2OTc3ODE0NDMwMS5hcHBzcG90LmNvbVwiLFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0dGhpcy5maXJlYmFzZSA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcmV0dXJucyB7Kn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8YW55PiB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IHRoaXMuUVNlcnZpY2UuZGVmZXIoKSxcclxuXHRcdFx0XHRyZXN1bHQgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYocGF0aCkub24oJ3ZhbHVlJywgKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdHJlc3BvbnNlLmZvckVhY2goKHNpZ2h0aW5nKSA9PiB7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChzaWdodGluZyk7XHJcblx0XHRcdFx0fSlcclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG5cdFx0XHR9KSlcclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTaWdodGluZ30gcmVjb3JkIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVzaChyZWNvcmQ6IGFueSk6IG5nLklQcm9taXNlPGFueT4ge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSB0aGlzLlFTZXJ2aWNlLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHRoaXMuZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKS5wdXNoKHJlY29yZCkpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdDbGllbnQnKVxyXG5cdFx0LnNlcnZpY2UoJ0ZpcmViYXNlU2VydmljZScsIEZpcmViYXNlU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiBGZXRjaCBhbmQgdXNlIGdlb2xvY2F0aW9uXHJcblx0ICogXHJcblx0ICogQGNsYXNzIExvY2F0aW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTG9jYXRpb25TZXJ2aWNlfVxyXG5cdCAqL1xyXG5cdGV4cG9ydCBjbGFzcyBHZW9sb2NhdGlvblNlcnZpY2Uge1xyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbXHJcblx0XHRcdCckcScsXHJcblx0XHRcdCckd2luZG93J1xyXG5cdFx0XTtcclxuXHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIHE6IG5nLklRU2VydmljZSwgcHJpdmF0ZSB3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XHJcblxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybnMge25nLklQcm9taXNlPFBvc2l0aW9uPn0gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRnZXQoKTogbmcuSVByb21pc2U8UG9zaXRpb24+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5xLmRlZmVyKCk7XHJcblxyXG5cdFx0XHRpZiAoIXRoaXMud2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdCgnR2VvbG9jYXRpb24gbm90IHN1cHBvcnRlZC4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLndpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uIChwb3NpdGlvbikge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XHJcblx0XHRcdFx0fSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHRcdH1cclxuXHJcblx0XHR1cGRhdGUocG9zaXRpb246IFBvc2l0aW9uKTogdm9pZHtcclxuXHRcdFx0YWxlcnQoJ3Rlc3QnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnR2VvbG9jYXRpb25TZXJ2aWNlJywgR2VvbG9jYXRpb25TZXJ2aWNlKTtcclxufSIsIm5hbWVzcGFjZSBBcHBsaWNhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgTWFwU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJTWFwU2VydmljZX1cclxuXHQgKi9cclxuXHRleHBvcnQgY2xhc3MgTWFwU2VydmljZSB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0JyRmaWx0ZXInLFxyXG5cdFx0XHQnJGh0dHAnLFxyXG5cdFx0XHQnJHEnXHJcblx0XHRdO1xyXG5cclxuXHRcdHByaXZhdGUgYWN0aXZlOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGRvbTogRWxlbWVudDtcclxuXHRcdHByaXZhdGUgZ2VvTWFya2VyOiBnb29nbGUubWFwcy5NYXJrZXI7XHJcblx0XHRwcml2YXRlIGdlb0NpcmNsZTogZ29vZ2xlLm1hcHMuQ2lyY2xlO1xyXG5cdFx0cHJpdmF0ZSBnZW9NYXJrZXJzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLk1hcmtlcj4oKTtcclxuXHRcdHByaXZhdGUgZ2VvQ2lyY2xlcyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5DaXJjbGU+KCk7XHJcblx0XHRwcml2YXRlIGhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXI7XHJcblx0XHRwcml2YXRlIGhlYXRtYXBQb2ludHMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTGF0TG5nPigpO1xyXG5cdFx0cHJpdmF0ZSBpbnN0YW5jZTogZ29vZ2xlLm1hcHMuTWFwO1xyXG5cdFx0cHJpdmF0ZSBpbmZvV2luZG93OiBnb29nbGUubWFwcy5JbmZvV2luZG93O1xyXG5cdFx0cHJpdmF0ZSBpbmZvV2luZG93cyA9IG5ldyBBcnJheTxnb29nbGUubWFwcy5JbmZvV2luZG93PigpO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXI6IGdvb2dsZS5tYXBzLk1hcmtlcjtcclxuXHRcdHByaXZhdGUgbWFya2VyQ2lyY2xlOiBnb29nbGUubWFwcy5DaXJjbGU7XHJcblx0XHRwcml2YXRlIG1hcmtlcnMgPSBuZXcgQXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPigpO1xyXG5cdFx0cHJpdmF0ZSBtYXJrZXJDaXJjbGVzID0gbmV3IEFycmF5PGdvb2dsZS5tYXBzLkNpcmNsZT4oKTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcihcclxuXHRcdFx0cHJpdmF0ZSBGaWx0ZXJTZXJ2aWNlOiBuZy5JRmlsdGVyU2VydmljZSxcclxuXHRcdFx0cHJpdmF0ZSBIdHRwU2VydmljZTogbmcuSUh0dHBTZXJ2aWNlLFxyXG5cdFx0XHRwcml2YXRlIFFTZXJ2aWNlOiBuZy5JUVNlcnZpY2VcclxuXHRcdCkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBtYXJrZXJzIGZyb20gQVBJIHRvIHRoZSBtYXBcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxNYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkTWFya2VycyhtYXJrZXJzOiBBcnJheTxNYXJrZXI+KTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcblx0XHRcdFx0XHRpY29uOiAnL2FwaS9wb2tlbW9uL2ljb25zLycgKyBtYXJrZXJzW2ldLm5hbWUgKyAnLnBuZycsXHJcblx0XHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdFx0bWFya2Vyc1tpXS5wb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcblx0XHRcdFx0XHRcdG1hcmtlcnNbaV0ucG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdFx0KSxcclxuXHRcdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZSxcclxuXHRcdFx0XHRcdHRpdGxlOiBtYXJrZXJzW2ldLm5hbWUsXHJcblx0XHRcdFx0XHR6SW5kZXg6IDFcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0dGhpcy5pbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xyXG5cdFx0XHRcdFx0Y29udGVudDogbWFya2Vyc1tpXS5uYW1lICsgJyAoQWRkZWQgJyArIHRoaXMuRmlsdGVyU2VydmljZSgnZGF0ZScpKG1hcmtlcnNbaV0ucG9zaXRpb24udGltZXN0YW1wKSArICcpJ1xyXG5cdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdHRoaXMuaW5mb1dpbmRvd3MucHVzaCh0aGlzLmluZm9XaW5kb3cpO1xyXG5cclxuXHRcdFx0XHR0aGlzLm1hcmtlcnMucHVzaCh0aGlzLm1hcmtlcik7XHJcblxyXG5cdFx0XHRcdHRoaXMub3BlbkluZm9XaW5kb3codGhpcy5tYXJrZXIsIHRoaXMuaW5mb1dpbmRvdyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIG1hcmtlciBmb3IgdXNlcnMgY3VycmVudCBwb3NpdGlvbi5cclxuXHRcdCAqIERlcGVuZHMgb24gdGhlIEdlb2xvY2F0aW9uU2VydmljZVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge01hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0YWRkR2VvTWFya2VyKHBvc2l0aW9uOiBQb3NpdGlvbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmdlb01hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG5cdFx0XHRcdGljb246IHtcclxuXHRcdFx0XHRcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IDAuMzUsXHJcblx0XHRcdFx0XHRwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcclxuXHRcdFx0XHRcdHNjYWxlOiA4LFxyXG5cdFx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAyXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZVxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvTWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCk7XHJcblxyXG5cdFx0XHR0aGlzLmdlb01hcmtlcnMucHVzaCh0aGlzLmdlb01hcmtlcik7XHJcblxyXG5cdFx0XHR0aGlzLmdlb0NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xyXG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdGZpbGxDb2xvcjogJyMwMzliZTUnLFxyXG5cdFx0XHRcdGZpbGxPcGFjaXR5OiAwLjE1LFxyXG5cdFx0XHRcdG1hcDogdGhpcy5pbnN0YW5jZSxcclxuXHRcdFx0XHRyYWRpdXM6IHBvc2l0aW9uLmNvb3Jkcy5hY2N1cmFjeSAqIDMsXHJcblx0XHRcdFx0c3Ryb2tlQ29sb3I6ICcjMDM5YmU1JyxcclxuXHRcdFx0XHRzdHJva2VPcGFjaXR5OiAwLjM1LFxyXG5cdFx0XHRcdHN0cm9rZVdlaWdodDogMlxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRoaXMuZ2VvQ2lyY2xlcy5wdXNoKHRoaXMuZ2VvQ2lyY2xlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGhlYXRtYXAgdG8gdGhlIG1hcCBpbnN0YW5jZSBieVxyXG5cdFx0ICogcGFzc2luZyBpbiBtYXAgcG9pbnRzXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8TWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGFkZEhlYXRtYXAoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmhlYXRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMudmlzdWFsaXphdGlvbi5IZWF0bWFwTGF5ZXIoe1xyXG5cdFx0XHRcdGRhdGE6IHRoaXMuaGVhdG1hcFBvaW50cyxcclxuXHRcdFx0XHRyYWRpdXM6IDUwXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtFbGVtZW50fSBkb20gKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdCAoZGVzY3JpcHRpb24pXHJcblx0XHQgKiBAcGFyYW0ge251bWJlcn0gbG5nIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB6b29tIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlTWFwKGRvbTogRWxlbWVudCwgbGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB6b29tOiBudW1iZXIpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5kb20gPSBkb207XHJcblxyXG5cdFx0XHR0aGlzLmluc3RhbmNlID0gbmV3IGdvb2dsZS5tYXBzLk1hcCh0aGlzLmRvbSwge1xyXG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZyksXHJcblx0XHRcdFx0ZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcclxuXHRcdFx0XHRzdHlsZXM6IFt7IFwiZmVhdHVyZVR5cGVcIjogXCJhZG1pbmlzdHJhdGl2ZVwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLnRleHQuZmlsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NDQ0NDRcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJsYW5kc2NhcGVcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiNmMmYyZjJcIiB9XSB9LCB7IFwiZmVhdHVyZVR5cGVcIjogXCJwb2lcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZFwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInNhdHVyYXRpb25cIjogLTEwMCB9LCB7IFwibGlnaHRuZXNzXCI6IDQ1IH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInJvYWQuaGlnaHdheVwiLCBcImVsZW1lbnRUeXBlXCI6IFwiYWxsXCIsIFwic3R5bGVyc1wiOiBbeyBcInZpc2liaWxpdHlcIjogXCJzaW1wbGlmaWVkXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwicm9hZC5hcnRlcmlhbFwiLCBcImVsZW1lbnRUeXBlXCI6IFwibGFiZWxzLmljb25cIiwgXCJzdHlsZXJzXCI6IFt7IFwidmlzaWJpbGl0eVwiOiBcIm9mZlwiIH1dIH0sIHsgXCJmZWF0dXJlVHlwZVwiOiBcInRyYW5zaXRcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJ2aXNpYmlsaXR5XCI6IFwib2ZmXCIgfV0gfSwgeyBcImZlYXR1cmVUeXBlXCI6IFwid2F0ZXJcIiwgXCJlbGVtZW50VHlwZVwiOiBcImFsbFwiLCBcInN0eWxlcnNcIjogW3sgXCJjb2xvclwiOiBcIiM0NmJjZWNcIiB9LCB7IFwidmlzaWJpbGl0eVwiOiBcIm9uXCIgfV0gfV0sXHJcblx0XHRcdFx0em9vbTogem9vbVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgdmlzaWJsZSBtYXJrZXJzIGJ5IGEgbWF0Y2hpbmcgdmFsdWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheTxnb29nbGUubWFwcy5NYXJrZXI+fSBtYXJrZXJzIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyTWFya2VycyhzZWFyY2g/OiBzdHJpbmcpOiBuZy5JUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gdGhpcy5RU2VydmljZS5kZWZlcigpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHNlYXJjaCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFRpdGxlKCkudG9Mb3dlckNhc2UoKSA9PT0gc2VhcmNoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLm1hcmtlcnNbaV0uc2V0VmlzaWJsZSh0cnVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVzZWZ1bCB3aGVuIG1hcmtlcnMgY2hhbmdlIHRvIHJlZmxlY3QgdGhvc2UgY2hhbmdlc1xyXG5cdFx0ICogaW4gdGhlIGhlYXRtYXBwaW5nXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8Z29vZ2xlLm1hcHMuTWFya2VyPn0gbWFya2VycyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdGZpbHRlckhlYXRNYXAoKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGVhdG1hcFBvaW50cy5sZW5ndGggPSAwO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodGhpcy5tYXJrZXJzW2ldLmdldFZpc2libGUoKSkge1xyXG5cdFx0XHRcdFx0dGhpcy5oZWF0bWFwUG9pbnRzLnB1c2godGhpcy5tYXJrZXJzW2ldLmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5oZWF0bWFwLnNldE1hcCh0aGlzLmluc3RhbmNlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBtYXJrZXJzIGZyb20gZW5kcG9pbnRcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggQVBJIGVuZHBvaW50XHJcblx0XHQgKiBAcmV0dXJucyB7bmcuSVByb21pc2U8PEFycmF5PE1hcmtlcj4+fSBBbiBhcnJheSBvZiBtYXJrZXJzXHJcblx0XHQgKi9cclxuXHRcdGdldE1hcmtlcnMocGF0aDogc3RyaW5nKTogbmcuSVByb21pc2U8QXJyYXk8TWFya2VyPj4ge1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBuZy5JUHJvbWlzZTxhbnk+ID0gdGhpcy5IdHRwU2VydmljZS5nZXQocGF0aCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBPcGVuIGluZm93aW5kb3csIGNsb3NlIG90aGVyc1xyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge2dvb2dsZS5tYXBzLk1hcmtlcn0gbWFya2VyIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIEBwYXJhbSB7Z29vZ2xlLm1hcHMuSW5mb1dpbmRvd30gaW5mb1dpbmRvdyAoZGVzY3JpcHRpb24pXHJcblx0XHQgKi9cclxuXHRcdG9wZW5JbmZvV2luZG93KG1hcmtlcjogZ29vZ2xlLm1hcHMuTWFya2VyLCBpbmZvV2luZG93OiBnb29nbGUubWFwcy5JbmZvV2luZG93KTogdm9pZCB7XHJcblx0XHRcdG1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluZm9XaW5kb3dzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR0aGlzLmluZm9XaW5kb3dzW2ldLmNsb3NlKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpbmZvV2luZG93Lm9wZW4odGhpcy5pbnN0YW5jZSwgbWFya2VyKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cmVtb3ZlR2VvTWFya2VycygpOiB2b2lke1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2k8dGhpcy5nZW9NYXJrZXJzLmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdHRoaXMuZ2VvTWFya2Vyc1tpXS5zZXRNYXAobnVsbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aTx0aGlzLmdlb0NpcmNsZXMubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dGhpcy5nZW9DaXJjbGVzW2ldLnNldE1hcChudWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IG1hcmtlcnNcclxuXHRcdCAqL1xyXG5cdFx0cmVzZXQoKTogdm9pZCB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dGhpcy5tYXJrZXJzW2ldLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnTWFwU2VydmljZScsIE1hcFNlcnZpY2UpO1xyXG59IiwibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcclxuXHJcblx0LyoqXHJcblx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdCAqIFxyXG5cdCAqIEBjbGFzcyBQb2tlbW9uU2VydmljZVxyXG5cdCAqIEBpbXBsZW1lbnRzIHtJUG9rZW1vblNlcnZpY2V9XHJcblx0ICovXHJcblx0ZXhwb3J0IGNsYXNzIFBva2Vtb25TZXJ2aWNlIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHQnJGh0dHAnXHJcblx0XHRdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgSHR0cFNlcnZpY2U6IG5nLklIdHRwU2VydmljZSkge1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHJldHVybnMge25nLklIdHRwUHJvbWlzZTxBcnJheTxQb2tlbW9uPj59IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0Z2V0KHBhdGg6IHN0cmluZyk6IG5nLklQcm9taXNlPEFycmF5PFBva2Vtb24+PiB7XHJcblx0XHRcdHZhciByZXN1bHQ6IG5nLklQcm9taXNlPGFueT4gPSB0aGlzLkh0dHBTZXJ2aWNlLmdldChwYXRoKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuc2VydmljZSgnUG9rZW1vblNlcnZpY2UnLCBQb2tlbW9uU2VydmljZSk7XHJcbn0iLCJuYW1lc3BhY2UgRHJvcGRvd24ge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIChkZXNjcmlwdGlvbilcclxuXHQgKiBcclxuXHQgKiBAY2xhc3MgRHJvcGRvd25Db250cm9sbGVyXHJcblx0ICogQGltcGxlbWVudHMge0lEcm9wZG93bkNvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25Db250cm9sbGVyIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gW1xyXG5cdFx0XHRcclxuXHRcdF07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBzdGF0ZTogYm9vbGVhbjtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvZ2dsZSgpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5zdGF0ZSA9ICF0aGlzLnN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIERyb3Bkb3duRGlyZWN0aXZlXHJcblx0ICogQGltcGxlbWVudHMge25nLklEaXJlY3RpdmV9XHJcblx0ICovXHJcblx0Y2xhc3MgRHJvcGRvd25EaXJlY3RpdmUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuXHRcdHB1YmxpYyBiaW5kVG9Db250cm9sbGVyOiBhbnk7XHJcblx0XHRwdWJsaWMgY29udHJvbGxlcjogYW55O1xyXG5cdFx0cHVibGljIGNvbnRyb2xsZXJBczogYW55O1xyXG5cdFx0cHVibGljIHJlcGxhY2U6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgc2NvcGU6IGJvb2xlYW47XHJcblx0XHRwdWJsaWMgdGVtcGxhdGVVcmw6IHN0cmluZztcclxuXHRcdHB1YmxpYyB0cmFuc2NsdWRlOiBhbnk7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHtcclxuXHRcdFx0XHRsZWZ0OiAnQCcsXHJcblx0XHRcdFx0b2JqZWN0OiAnQCcsXHJcblx0XHRcdFx0cmlnaHQ6ICdAJ1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuY29udHJvbGxlciA9IERyb3Bkb3duQ29udHJvbGxlcjtcclxuXHRcdFx0dGhpcy5jb250cm9sbGVyQXMgPSAnRHJvcGRvd24nO1xyXG5cdFx0XHR0aGlzLnJlcGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnNjb3BlID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy50ZW1wbGF0ZVVybCA9ICcvZGlyZWN0aXZlcy9kcm9wZG93bi92aWV3cy9kcm9wZG93bi5odG1sJ1xyXG5cdFx0XHR0aGlzLnRyYW5zY2x1ZGUgPSB7XHJcblx0XHRcdFx0dGl0bGU6ICc/ZHJvcGRvd25UaXRsZScsXHJcblx0XHRcdFx0cmVzdWx0OiAnP2Ryb3Bkb3duUmVzdWx0J1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIChkZXNjcmlwdGlvbilcclxuXHRcdCAqIFxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQHJldHVybnMge25nLklEaXJlY3RpdmV9IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0c3RhdGljIGluc3RhbmNlKCk6IG5nLklEaXJlY3RpdmUge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERyb3Bkb3duRGlyZWN0aXZlKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge25nLklTY29wZX0gc2NvcGUgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogQHBhcmFtIHtuZy5JQXVnbWVudGVkSlF1ZXJ5fSBlbGVtZW50IChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSk6IHZvaWQge1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuZGlyZWN0aXZlKCdkcm9wZG93bicsIERyb3Bkb3duRGlyZWN0aXZlLmluc3RhbmNlKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
