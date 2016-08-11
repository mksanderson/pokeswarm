namespace Application {
	/**
	 * Core controller for global functions
	 * 
	 * @class ApplicationController
	 * @implements {IApplicationController}
	 */
	class ApplicationController {
		static $inject = [
			'FirebaseService',
			'$location',
			'$window'
		];

		public data: any;

		constructor(
			private FirebaseService: FirebaseService,
			private LocationService: ng.ILocationService,
			private WindowService: ng.IWindowService
		) {
			FirebaseService.configure();
		}

		/**
		 * Reload the entire map to check for updates
		 */
		reload(): void {
			this.WindowService.location.reload();
		}

		/**
		 * Check that the current path matches the location path
		 * 
		 * @param {string} path (description)
		 * @returns {boolean} (description)
		 */
		currentRoute(path: string): boolean{
			if(path == this.LocationService.path()){
				return true;
			}
			else{
				return false;
			}
		}
	}

	angular
		.module('Client')
		.controller('ApplicationController', ApplicationController);
}