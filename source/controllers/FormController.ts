namespace Application {
	/**
	 * Core controller for form functions
	 * 
	 * @class FormController
	 */
	class FormController {
		static $inject = [
			'GeolocationService',
			'FirebaseService',
			'MapService'
		];

		public error: boolean;
		public name: string;
		public state: boolean;

		constructor(
			private GeolocationService: GeolocationService,
			private FirebaseService: FirebaseService,
			private MapService: MapService
		) {
			GeolocationService.get().then((response) => {
				MapService.createMap(document.getElementById('location'), response.coords.latitude, response.coords.longitude, 16).then((response) => {
					
				});
				MapService.addGeoMarker(response);
			});
		}

		/**
		 * Relocate the user
		 */
		relocate(): void {
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
			if (name) {
				this.MapService.getGeoPosition().then((response) => {
					var position = response;

					this.FirebaseService.push({
						'position': {
							'coords': {
								'latitude': position.lat(),
								'longitude': position.lng()
							},
							'timestamp': Math.floor(Date.now())
						},
						'name': name
					}).then((response) => {
						this.FirebaseService.get('/').then((response) => {
							var markers = [];

							for (var i = 0; i < response.length; i++) {
								markers.push(response[i].val());
							}

							this.MapService.addMarkers(markers);

							this.name = '';

							this.toggle();
						});
					});
				})
			}
			else {
				this.error = true;
			}
		}

		/**
		 * (description)
		 */
		toggle(): void {
			this.state = !this.state;
		}
	}

	angular
		.module('Client')
		.controller('FormController', FormController);
}