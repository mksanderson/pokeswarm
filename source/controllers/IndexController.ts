namespace Application {
	export class IndexController {
		static $inject = [
			'PokemonService',
			'$route'
		];

		public current: Pokemon;
		public parameters: Object;
		public pokemon: Pokemon[];

		constructor(
			private pokemonService: PokemonService,
			private routeService: ng.route.IRouteService
		) {
			this.parameters = new Object();

			pokemonService.get('/api/pokemon/pokemon.json').then((response) => {
				this.pokemon = response;

				this.parameters = routeService.current.params;

				this.active(this.parameters['id']);
			});
		}

		/**
		 * (description)
		 * 
		 * @param {string} id (description)
		 */
		active(id: string): void {
			for (var i = 0; i < this.pokemon.length; i++) {
				if(this.pokemon[i].Number === id){
					this.current = this.pokemon[i];
				}
			}
		}
	}

	angular
		.module('Client')
		.controller('IndexController', IndexController)
}