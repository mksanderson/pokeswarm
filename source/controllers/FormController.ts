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
		public formData: FormData;
		public pokemon: Pokemon[];
		public state: boolean;

		constructor(
			private GeolocationService: GeolocationService,
			private FirebaseService: FirebaseService,
			private MapService: MapService,
			private PokemonService: PokemonService
		) {
			this.formData = new FormData();
			
			this.PokemonService.get('/api/pokemon/pokemon.json').then((response) => {
				this.pokemon = response;
			})
		}

		/**
		 * (description)
		 * 
		 * @param {string} model (description)
		 * @param {string} value (description)
		 */
		autocomplete(model: string, value: string){
			this.formData[model] = value;
		}

		/**
		 * Submit form data to database, reset map, notify user
		 */
		submit() {
			if (this.formData.name) {
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
						'name': this.formData.name
					}).then((response) => {
						this.FirebaseService.get('/').then((response) => {
							var markers = [];

							for (var i = 0; i < response.length; i++) {
								markers.push(response[i].val());
							}

							this.MapService.setCenter(position.lat(), position.lng());

							this.formData.messages = new Array<string>();
							this.formData.messages.push('Successfully added ' + this.formData.name);

							this.formData.name = '';

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