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
			'MapService'
		];

		public location: Position;
		public name: string;
		public search: string;

		constructor(
			private FirebaseService: FirebaseService,
			private GeolocationService: GeolocationService,
			private MapService: MapService
		) {
			GeolocationService.get().then((response) => {
				MapService.createMap(document.getElementById('map'), response.coords.latitude, response.coords.longitude, 16);
				MapService.addGeoMarker(response);
			}).catch((reason) => {
				MapService.createMap(document.getElementById('map'), 27, 153, 2);
			}).then(() => {
				FirebaseService.get('/').then((response) => {
					var markers = [];

					for (var i = 0; i < response.length; i++) {
						markers.push(response[i].val());
					}

					MapService.addMarkers(markers);
				})
			});
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
		 * Reset the map state
		 */
		reset() {
			this.MapService.reset();
			this.search = '';
		}

		updateLocation(): void {
			this.GeolocationService.get().then((response) => {
				this.MapService.removeGeoMarkers();
				this.MapService.addGeoMarker(response);
			});
		}

		/**
		 * (description)
		 * 
		 * @param {Sighting} record (description)
		 */
		submit(name: string) {
			this.GeolocationService.get().then((response) => {
				var position = response;

				this.FirebaseService.push({
					'position': {
						'coords': {
							'latitude': position.coords.latitude,
							'longitude': position.coords.longitude
						},
						'timestamp': position.timestamp
					},
					'name': name
				}).then((response) => {
					this.FirebaseService.get('/').then((response) => {
						var markers = [];

						for (var i = 0; i < response.length; i++) {
							markers.push(response[i].val());
						}

						this.MapService.addMarkers(markers);

						alert(this.name + ' has been added to the map! Thank you!');

						this.name = '';
					});
				});
			})
		}
	}

	angular
		.module('Client')
		.controller('MapController', MapController);
}