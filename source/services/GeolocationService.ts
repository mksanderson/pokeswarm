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

		public static position: Position;

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

					GeolocationService.position = response;

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