namespace Dropdown {
	
	/**
	 * (description)
	 * 
	 * @class DropdownController
	 * @implements {IDropdownController}
	 */
	class DropdownController {
		static $inject = [
			
		];
		
		public state: boolean;

		constructor() {
			this.state = false;
		}

		toggle(): void {
			this.state = !this.state;
		}
	}
	
	/**
	 * (description)
	 * 
	 * @class DropdownDirective
	 * @implements {ng.IDirective}
	 */
	class DropdownDirective implements ng.IDirective {
		public bindToController: any;
		public controller: any;
		public controllerAs: any;
		public replace: boolean;
		public scope: boolean;
		public templateUrl: string;
		public transclude: any;

		constructor() {
			this.bindToController = {
				left: '@',
				object: '@',
				right: '@'
			}
			this.controller = DropdownController;
			this.controllerAs = 'Dropdown';
			this.replace = true;
			this.scope = true;
			this.templateUrl = '/directives/dropdown/views/dropdown.html'
			this.transclude = {
				title: '?dropdownTitle',
				result: '?dropdownResult'
			};
		}
		
		/**
		 * (description)
		 * 
		 * @static
		 * @returns {ng.IDirective} (description)
		 */
		static instance(): ng.IDirective {
			return new DropdownDirective();
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
		.directive('dropdown', DropdownDirective.instance);
}