namespace Sightings {

	/**
	 * (description)
	 * 
	 * @class DropdownController
	 * @implements {IDropdownController}
	 */
	class SightingsController {
		static $inject = [
			'FirebaseService',
			'MapService'
		];

		public error: boolean;
		public name: string;
		public state: boolean;

		constructor(
			private FirebaseService: Application.FirebaseService,
			private MapService: Application.MapService
		) {
			this.state = false;
		}

		/**
		 * (description)
		 * 
		 * @param {Sighting} record (description)
		 */
		submit(name: string) {
			if (name) {
				this.MapService.getGeoPosition().then((response) => {
					var position = response;

					this.FirebaseService.push({
						'position': {
							'coords': {
								'latitude': position.lat(),
								'longitude': position.lng()
							},
							'timestamp': Math.floor(Date.now())
						},
						'name': name
					}).then((response) => {
						this.FirebaseService.get('/').then((response) => {
							var markers = [];

							for (var i = 0; i < response.length; i++) {
								markers.push(response[i].val());
							}

							this.MapService.addMarkers(markers);

							this.name = '';

							this.toggle();
						});
					});
				})
			}
			else {
				this.error = true;
			}
		}

		/**
		 * (description)
		 */
		toggle(): void {
			this.state = !this.state;
		}
	}

	/**
	 * (description)
	 * 
	 * @class SightingsDirective
	 * @implements {ng.IDirective}
	 */
	class SightingsDirective implements ng.IDirective {
		public controller: any;
		public controllerAs: any;
		public replace: boolean;
		public scope: boolean;
		public templateUrl: string;

		constructor() {
			this.controller = SightingsController;
			this.controllerAs = 'Sightings';
			this.replace = true;
			this.scope = true;
			this.templateUrl = '/directives/sightings/views/sightings.html'
		}

		/**
		 * (description)
		 * 
		 * @static
		 * @returns {ng.IDirective} (description)
		 */
		static instance(): ng.IDirective {
			return new SightingsDirective();
		}

		/**
		 * (description)
		 * 
		 * @param {ng.IScope} scope (description)
		 * @param {ng.IAugmentedJQuery} element (description)
		 */
		public link(scope: ng.IScope, element: ng.IAugmentedJQuery): void {

		}
	}

	angular
		.module('Client')
		.directive('sightings', SightingsDirective.instance);
}