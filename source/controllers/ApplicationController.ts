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

		constructor(
			private firebaseService: FirebaseService,
			private locationService: ng.ILocationService,
			private windowService: ng.IWindowService
		) {
			firebaseService.configure();
		}

		/**
		 * Reload the entire application to check for updates
		 */
		reload(): void {
			this.windowService.location.reload();
		}

		/**
		 * Check that the current path matches the location path
		 * 
		 * @param {string} path (description)
		 * @returns {boolean} (description)
		 */
		currentRoute(path: string): boolean{
			if(this.locationService.path().search(path)){
				return false;
			}
			else{
				return true;
			}
		}
	}

	angular
		.module('Client')
		.controller('ApplicationController', ApplicationController);
}