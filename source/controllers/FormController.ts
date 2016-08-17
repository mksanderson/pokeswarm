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
			'PokemonService'
		];

		public error: boolean;
		public name: string;
		public pokemon: Pokemon[];
		public state: boolean;

		constructor(
			private GeolocationService: GeolocationService,
			private FirebaseService: FirebaseService,
			private MapService: MapService,
			private PokemonService: PokemonService
		) {
			this.PokemonService.get('/api/pokemon/pokemon.json').then((response) => {
				this.pokemon = response;
			})
		}

		autocomplete(model: string, pokemon: Pokemon){
			this[model] = pokemon.name;
		}

		/**
		 * Submit form data to database, reset map, notify user
		 * 
		 * @param {string} name Name of the item being submitted
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

							this.MapService.setCenter(position.lat(), position.lng());

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