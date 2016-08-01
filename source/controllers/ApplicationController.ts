namespace Application {
	/**
	 * Core controller for global functions
	 * 
	 * @class ApplicationController
	 * @implements {IApplicationController}
	 */
	class ApplicationController {
		static $inject = [
			'FirebaseService'
		];

		public data: any;

		constructor(
			private FirebaseService: FirebaseService
		) {
			FirebaseService.configure();
		}
	}

	angular
		.module('Client')
		.controller('ApplicationController', ApplicationController);
}