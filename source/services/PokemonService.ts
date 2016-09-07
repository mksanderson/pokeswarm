namespace Application {

	/**
	 * (description)
	 * 
	 * @class PokemonService
	 * @implements {IPokemonService}
	 */
	export class PokemonService {
		static $inject = [
			'$http',
			'$q'
		];

		public pokemon: Array<Pokemon>;

		constructor(
			private httpService: ng.IHttpService,
			private qService: ng.IQService
		) {
			this.pokemon = new Array<Pokemon>();

			this.get('/api/pokemon/pokemon.json').then((response) => {
				this.pokemon = response;
			})
		}

		/**
		 * (description)
		 * 
		 * @param {string} path (description)
		 * @returns {ng.IHttpPromise<Array<Pokemon>>} (description)
		 */
		get(path: string): ng.IPromise<Array<Pokemon>> {
			var result: ng.IPromise<any> = this.httpService.get(path).then(function (response) {
				return response.data;
			})

			return result;
		}

		/**
		 * Match a pokemon by it's name and return the full Pokemon item
		 * 
		 * @param {string} name (description)
		 * @returns {Pokemon} (description)
		 */
		match(name: string, values: Array<Pokemon>): ng.IPromise<Pokemon> {
			var defer = this.qService.defer(),
				result: Pokemon;

			angular.forEach(values, (pokemon, pokemonID) => {
				if (pokemon.Name === name) {
					defer.resolve(result = pokemon);
				}
			})

			return defer.promise;
		}
	}

	angular
		.module('Client')
		.service('PokemonService', PokemonService);
}