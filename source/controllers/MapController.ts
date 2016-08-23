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
			'StorageService',
			'$window'
		];

		public fullscreen: boolean;

		constructor(
			private FirebaseService: FirebaseService,
			private GeolocationService: GeolocationService,
			private MapService: MapService,
			private StorageService: StorageService,
			private WindowService: ng.IWindowService
		) {

		}

		initialize(dom: string, geomarker: boolean, draggable: boolean, markers: boolean): void {
			if (GeolocationService.position) {
				this.MapService.createMap(document.getElementById(dom), GeolocationService.position.coords.latitude, GeolocationService.position.coords.longitude, 2).then((response) => {
					if (markers) {
						this.FirebaseService.get('/').then((response) => {
							var markers = [];

							for (var i = 0; i < response.length; i++) {
								markers.push(response[i].val());
							}

							if (markers) {
								this.MapService.addMarkers(markers);
							}
						})
					}

					if(geomarker){
						this.MapService.addGeoMarker(draggable, GeolocationService.position);
					}
				});
			}
			else {
				this.MapService.createMap(document.getElementById(dom), 0, 0, 2).then((response) => {
					if (markers) {
						this.FirebaseService.get('/').then((response) => {
							var markers = [];

							for (var i = 0; i < response.length; i++) {
								markers.push(response[i].val());
							}

							if (markers) {
								this.MapService.addMarkers(markers);
							}
						})
					}
				});
			}
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