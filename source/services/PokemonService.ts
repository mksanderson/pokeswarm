namespace Application {

	/**
	 * (description)
	 * 
	 * @class PokemonService
	 * @implements {IPokemonService}
	 */
	export class PokemonService {
		static $inject = [
			'$http'
		];

		constructor(private HttpService: ng.IHttpService) {

		}

		/**
		 * (description)
		 * 
		 * @param {string} path (description)
		 * @returns {ng.IHttpPromise<Array<Pokemon>>} (description)
		 */
		get(path: string): ng.IPromise<Array<Pokemon>> {
			var result: ng.IPromise<any> = this.HttpService.get(path).then(function (response) {
				return response.data;
			})

			return result;
		}
	}

	angular
		.module('Client')
		.service('PokemonService', PokemonService);
}