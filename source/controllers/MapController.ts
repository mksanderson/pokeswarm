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
			'PokemonService',
			'StorageService',
			'$window'
		];

		private markers: Marker[];

		constructor(
			private firebaseService: FirebaseService,
			private geolocationService: GeolocationService,
			private mapService: MapService,
			private pokemonService: PokemonService,
			private storageService: StorageService,
			private windowService: ng.IWindowService
		) {
			this.markers = new Array<Marker>();

			geolocationService.get().then((response) => {
				mapService.configure(document.getElementById('map'), response, 12);
			}).then(() => {
				var markers = [];

				firebaseService.get('/').then((response) => {
					for (var i = 0; i < response.length; i++) {
						markers.push(response[i].val());
					}
				}).then(() => {
					pokemonService.get('/api/pokemon/pokemon.json').then((response) => {
						angular.forEach(response, (pokemon, pokemonID) => {
							for(var i = 0;i<markers.length;i++){
								if(markers[i]['name'] === pokemon.Name){
									markers[i]['number'] = pokemon.Number;
								}
							}
						})

						mapService.points(markers);
					})
				})
			})
		}

		locate(): void{
			this.mapService.locate();
		}
	}

	angular
		.module('Client')
		.controller('MapController', MapController);
}