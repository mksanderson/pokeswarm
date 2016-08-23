namespace Application {
	export class StorageService {
		static $inject = [
			'$q',
			'$window'
		];

		constructor(
			private QService: ng.IQService,
			private WindowService: ng.IWindowService
		) {

		}
		
		/**
		 * Fetch item by key from session storage. Compare to source
		 * data and build an output array that contains full versions
		 * and not just the id field of each stored item.
		 * 
		 * @template T
		 * @param {string} key (description)
		 * @returns {ng.IPromise<Array<T>>} (description)
		 */
		get<T>(key: string): ng.IPromise<Array<T>> {
			var defer = this.QService.defer(),
				output,
				response,
				result;

			response = this.WindowService.sessionStorage.getItem(key);

			if (response != null) {
				if (response.length) {
					result = JSON.parse(response);

					defer.resolve(result);
				}
			}
			else {
				defer.reject();
			}

			return defer.promise;
		}
		
		/**
		 * Set a field from a data set to a string value in session storage
		 * 
		 * @template T
		 * @param {string} key (description)
		 * @param {Array<T>} values (description)
		 * @param {string} [field] (description)
		 */
		set<T>(key: string, values: Array<T>, field?: string): void {
			var input;

			input = values.join(',');

			this.WindowService.sessionStorage.setItem(key, input);
		}
	}

	angular
		.module('Client')
		.service('StorageService', StorageService);
}