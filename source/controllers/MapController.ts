namespace Application {

	/**
	 * (description)
	 * 
	 * @class MapController
	 * @implements {IMapController}
	 */
	class MapController {
		static $inject = [
			'FirebaseService',
			'GeolocationService',
			'MapService',
			'$window'
		];

		public fullscreen: boolean;

		constructor(
			private FirebaseService: FirebaseService,
			private GeolocationService: GeolocationService,
			private MapService: MapService,
			private WindowService: ng.IWindowService
		) {
			
		}

		/**
		 * Filter the map items based on the search model
		 * 
		 * @param {string} [search] (description)
		 */
		filter(search?: string): void {
			this.MapService.filterMarkers(search).then(() => {
				this.MapService.filterHeatMap();
			});
		}

		initialize(dom: string, geomarker: boolean, draggable: boolean, markers: boolean): void {
			this.GeolocationService.get().then((response) => {
				this.MapService.createMap(document.getElementById(dom), response.coords.latitude, response.coords.longitude, 16).then((response) => {

				});
				if (geomarker) {
					this.MapService.addGeoMarker(draggable, response);
				}
			}).catch((reason) => {
				this.GeolocationService.get().then((response) => {
					this.MapService.createMap(document.getElementById(dom), response.coords.latitude, response.coords.longitude, 16).then((response) => {

					});
					if (geomarker) {
						this.MapService.addGeoMarker(draggable, response);
					}
				}).catch((reason) => {
					alert('Geolocation lookup has failed, the map has been set at default coordinates. Please enable location services to experience all features of PokeSwarm.');

					this.MapService.createMap(document.getElementById(dom), 0, 0, 2);
				})
			}).then(() => {
				if (markers) {
					this.FirebaseService.get('/').then((response) => {
						var markers = [];

						for (var i = 0; i < response.length; i++) {
							markers.push(response[i].val());
						}

						if (markers) {
							this.MapService.addMarkers(markers);
							this.MapService.addHeatmap();
						}
					})
				}
			});
		}

		/**
		 * Used for resizing the map, ie: making it full screen
		 */
		resize(): void {
			this.fullscreen = !this.fullscreen;
			this.MapService.resize();
		}

		/**
		 * Relocate the user
		 * 
		 * @param {boolean} draggable (description)
		 */
		relocate(draggable: boolean): void {
			this.GeolocationService.get().then((response) => {
				this.MapService.removeGeoMarkers();
				this.MapService.addGeoMarker(draggable, response);
			});
		}
	}

	angular
		.module('Client')
		.controller('MapController', MapController);
}