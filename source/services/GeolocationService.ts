namespace Application {

	/**
	 * Fetch and use geolocation
	 * 
	 * @class LocationService
	 * @implements {ILocationService}
	 */
	export class GeolocationService {
		static $inject = [
			'$q',
			'StorageService',
			'$window'
		];

		constructor(
			private QService: ng.IQService, 
			private StorageService: StorageService,
			private WindowService: ng.IWindowService) {

		}

		/**
		 * (description)
		 * 
		 * @returns {ng.IPromise<Position>} (description)
		 */
		get(): ng.IPromise<Position> {
			var deferred = this.QService.defer();

			if (!this.WindowService.navigator.geolocation) {
				deferred.reject('Geolocation not supported.');
			} else {
				this.WindowService.navigator.geolocation.getCurrentPosition((response) => {
					var output = [];

					deferred.resolve(response);

					output.push(response.coords.latitude);
					output.push(response.coords.longitude);

					this.StorageService.set('geolocation', output);

				}, (error) => {
					deferred.reject(error);
				}, {
						maximumAge: 0,
						timeout: 5000
					}
				);
			}

			return deferred.promise;
		}
	}

	angular
		.module('Client')
		.service('GeolocationService', GeolocationService);
}