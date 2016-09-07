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
			'MapService',
			'PokemonService',
			'StorageService',
			'$window'
		];

		public error: boolean;
		public formData: FormData;
		public pokemon: Pokemon[];
		public state: boolean;

		constructor(
			private geolocationService: GeolocationService,
			private firebaseService: FirebaseService,
			private mapService: MapService,
			private pokemonService: PokemonService,
			private storageService: StorageService,
			private windowService: ng.IWindowService
		) {
			this.formData = new FormData();
			this.state = false;

			this.pokemonService.get('/api/pokemon/pokemon.json').then((response) => {
				this.pokemon = response;
			})
		}

		/**
		 * (description)
		 * 
		 * @param {string} model (description)
		 * @param {string} value (description)
		 */
		autocomplete(model: string, value: string) {
			this.formData[model] = value;
		}

		/**
		 * (description)
		 * 
		 * @param {string} field (description)
		 * @param {string} path (description)
		 */
		record(field: string, path: string): void {
			var input = [];

			input.push(this.formData.name)

			this.storageService.set('form', input);

			this.windowService.open(path, '_self');
		}

		/**
		 * Submit form data to database, reset map, notify user
		 */
		submit() {
			this.storageService.get<string>('form').then((response) => {
				this.formData.name = response;
			}).then(() => {
				this.storageService.empty('form');

				if (this.formData.name) {
					this.mapService.position().then((response) => {
						var position = response;

						this.firebaseService.push({
							'position': {
								'coords': {
									'latitude': position.lat,
									'longitude': position.lng
								},
								'timestamp': Math.floor(Date.now())
							},
							'name': this.formData.name
						}).then((response) => {
							this.firebaseService.get('/').then((response) => {
								var markers = [];

								for (var i = 0; i < response.length; i++) {
									markers.push(response[i].val());
								}
								
								this.pokemonService.match(this.formData.name, this.pokemon).then((response) => {
									this.formData.record = response;
								})

								this.state = true;
							});
						});
					})
				}
				else {
					this.error = true;
					this.state = false;
				}
			})
		}
	}

	angular
		.module('Client')
		.controller('FormController', FormController);
}