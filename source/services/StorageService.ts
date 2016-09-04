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
		 * Clear an item in storage
		 * 
		 * @template T
		 * @param {string} key (description)
		 */
		empty<T>(key: string): void{
			this.WindowService.sessionStorage.removeItem(key);
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
		get<T>(key: string): ng.IPromise<T> {
			var defer = this.QService.defer(),
				output,
				response,
				result;

			response = this.WindowService.sessionStorage.getItem(key);

			if (response != null) {
				if (angular.isArray(response)) {
					if (response.length) {
						result = JSON.parse(response);

						defer.resolve(result);
					}
				}
				else {
					defer.resolve(response);
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
		set<T>(key: string, values: T[], field?: string): void {
			var input;

			if (angular.isArray(values)) {
				input = values.join(',');
			}
			else{
				input = values;
			}

			this.WindowService.sessionStorage.setItem(key, input);
		}
	}

	angular
		.module('Client')
		.service('StorageService', StorageService);
}