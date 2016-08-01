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
			'$window'
		];

		constructor(private q: ng.IQService, private window: ng.IWindowService) {

		}
		
		/**
		 * (description)
		 * 
		 * @returns {ng.IPromise<Position>} (description)
		 */
		get(): ng.IPromise<Position> {
			var deferred = this.q.defer();

			if (!this.window.navigator.geolocation) {
				deferred.reject('Geolocation not supported.');
			} else {
				this.window.navigator.geolocation.getCurrentPosition(function (position) {
					deferred.resolve(position);
				}, function (error) {
					deferred.reject(error);
				});
			}

			return deferred.promise;
		}

		update(position: Position): void{
			alert('test');
		}
	}

	angular
		.module('Client')
		.service('GeolocationService', GeolocationService);
}