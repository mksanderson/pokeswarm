namespace Application {

	/**
	 * (description)
	 * 
	 * @class MapService
	 * @implements {IMapService}
	 */
	export class MapService {
		static $inject = [
			'$filter',
			'$http',
			'$q'
		];

		private active: google.maps.Marker;
		private dom: Element;
		private geoMarker: google.maps.Marker;
		private geoCircle: google.maps.Circle;
		private geoMarkers = new Array<google.maps.Marker>();
		private geoCircles = new Array<google.maps.Circle>();
		private heatmap = new google.maps.visualization.HeatmapLayer;
		private heatmapPoints = new Array<google.maps.LatLng>();
		private instance: google.maps.Map;
		private infoWindow: google.maps.InfoWindow;
		private infoWindows = new Array<google.maps.InfoWindow>();
		private marker: google.maps.Marker;
		private markerCircle: google.maps.Circle;
		private markers = new Array<google.maps.Marker>();
		private markerCircles = new Array<google.maps.Circle>();

		constructor(
			private FilterService: ng.IFilterService,
			private HttpService: ng.IHttpService,
			private QService: ng.IQService
		) {

		}

		/**
		 * Add markers from API to the map
		 * 
		 * @param {Array<Marker>} markers (description)
		 */
		addMarkers(markers: Array<Marker>): void {
			for (var i = 0; i < markers.length; i++) {
				this.marker = new google.maps.Marker({
					icon: {
						scaledSize:new google.maps.Size(60, 60),
						url:'/api/pokemon/icons/' + markers[i].name + '.ico',
					},
					position: new google.maps.LatLng(
						markers[i].position.coords.latitude,
						markers[i].position.coords.longitude
					),
					map: this.instance,
					title: markers[i].name,
					zIndex: 1
				});

				this.infoWindow = new google.maps.InfoWindow({
					content: markers[i].name + ' (Added ' + this.FilterService('date')(markers[i].position.timestamp) + ')'
				})

				this.infoWindows.push(this.infoWindow);

				this.markers.push(this.marker);

				this.openInfoWindow(this.marker, this.infoWindow);
			}
		}

		/**
		 * Add a marker for users current position.
		 * Depends on the GeolocationService
		 * 
		 * @param {Marker} marker (description)
		 */
		addGeoMarker(position: Position): void {
			this.geoMarker = new google.maps.Marker({
				draggable: true,
				icon: {
					fillColor: '#039be5',
					fillOpacity: 0.35,
					path: google.maps.SymbolPath.CIRCLE,
					scale: 8,
					strokeWeight: 2
				},
				position: new google.maps.LatLng(
					position.coords.latitude,
					position.coords.longitude
				),
				map: this.instance
			});

			this.geoMarker.setAnimation(google.maps.Animation.DROP);

			this.geoMarkers.push(this.geoMarker);

			this.geoMarker.addListener('dragend', () => {
				this.getGeoPosition(this.geoMarker);
			})
			
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
		}

		/**
		 * Add a heatmap to the map instance by
		 * passing in map points
		 * 
		 * @param {Array<Marker>} markers (description)
		 */
		addHeatmap(): void {
			for (var i = 0; i < this.markers.length; i++) {
				this.heatmapPoints.push(this.markers[i].getPosition());
			}

			this.heatmap = new google.maps.visualization.HeatmapLayer({
				data: this.heatmapPoints,
				radius: 50
			});

			this.heatmap.setMap(this.instance);
		}

		/**
		 * (description)
		 * 
		 * @param {Element} dom (description)
		 * @param {number} lat (description)
		 * @param {number} lng (description)
		 * @param {number} zoom (description)
		 */
		createMap(dom: Element, lat: number, lng: number, zoom: number): void {
			this.dom = dom;

			this.instance = new google.maps.Map(this.dom, {
				center: new google.maps.LatLng(lat, lng),
				disableDefaultUI: true,
				styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }],
				zoom: zoom
			});
		}

		/**
		 * Filter the visible markers by a matching value
		 * 
		 * @param {Array<google.maps.Marker>} markers (description)
		 */
		filterMarkers(search?: string): ng.IPromise<string> {
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
		}


		/**
		 * Useful when markers change to reflect those changes
		 * in the heatmapping
		 * 
		 * @param {Array<google.maps.Marker>} markers (description)
		 */
		filterHeatMap(): void {
			this.heatmapPoints.length = 0;

			for (var i = 0; i < this.markers.length; i++) {
				if (this.markers[i].getVisible()) {
					this.heatmapPoints.push(this.markers[i].getPosition());
				}
			}

			this.heatmap.setMap(this.instance);
		}

		
		/**
		 * (description)
		 * 
		 * @returns {ng.IPromise<Position>} (description)
		 */
		getGeoPosition(marker?: google.maps.Marker): ng.IPromise<google.maps.LatLng> {
			var deferred = this.QService.defer(),
				result;

			result = this.geoMarker.getPosition();

			deferred.resolve(result);

			return deferred.promise;
		}

		/**
		 * Get markers from endpoint
		 * 
		 * @param {string} path API endpoint
		 * @returns {ng.IPromise<<Array<Marker>>} An array of markers
		 */
		getMarkers(path: string): ng.IPromise<Array<Marker>> {
			var result: ng.IPromise<any> = this.HttpService.get(path).then(function (response) {
				return response.data;
			})

			return result;
		}

		/**
		 * Open infowindow, close others
		 * 
		 * @param {google.maps.Marker} marker (description)
		 * @param {google.maps.InfoWindow} infoWindow (description)
		 */
		openInfoWindow(marker: google.maps.Marker, infoWindow: google.maps.InfoWindow): void {
			marker.addListener('click', () => {
				for (var i = 0; i < this.infoWindows.length; i++) {
					this.infoWindows[i].close();
				}

				infoWindow.open(this.instance, marker);
			})
		}

		/**
		 * (description)
		 */
		removeGeoMarkers(): void{
			for(var i = 0;i<this.geoMarkers.length;i++){
				this.geoMarkers[i].setMap(null);
			}
			
			for(var i = 0;i<this.geoCircles.length;i++){
				this.geoCircles[i].setMap(null);
			}
		}
		
		/**
		 * Reset markers
		 */
		reset(): void {
			for (var i = 0; i < this.markers.length; i++) {
				this.markers[i].setVisible(true);
			}
		}
	}

	angular
		.module('Client')
		.service('MapService', MapService);
}