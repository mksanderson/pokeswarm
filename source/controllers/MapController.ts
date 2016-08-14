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
			'$timeout',
			'$window'
		];

		public fullscreen: boolean;
		public loaded: boolean;
		public location: Position;
		public message: string;

		constructor(
			private FirebaseService: FirebaseService,
			private GeolocationService: GeolocationService,
			private MapService: MapService,
			private TimeoutService: ng.ITimeoutService,
			private WindowService: ng.IWindowService
		) {
			TimeoutService(() => {
				GeolocationService.get().then((response) => {
					MapService.createMap(document.getElementById('map'), response.coords.latitude, response.coords.longitude, 16).then((response) => {
						this.loaded = response;
					});
					MapService.addGeoMarker(false, response);
				}).catch((reason) => {
					MapService.createMap(document.getElementById('map'), 27, 153, 2);
				}).then(() => {
					FirebaseService.get('/').then((response) => {
						var markers = [];

						for (var i = 0; i < response.length; i++) {
							markers.push(response[i].val());
						}

						MapService.addMarkers(markers);
						MapService.addHeatmap();
					})
				});
			},0)
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


		/**
		 * Used for resizing the map, ie: making it full screen
		 */
		resize(): void {
			this.fullscreen = !this.fullscreen;
			this.MapService.resize();
		}

		/**
		 * Relocate the user
		 */
		relocate(): void {
			this.GeolocationService.get().then((response) => {
				this.MapService.removeGeoMarkers();
				this.MapService.addGeoMarker(false, response);
			});
		}
	}

	angular
		.module('Client')
		.controller('MapController', MapController);
}