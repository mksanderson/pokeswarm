namespace Application {
	
	export class LocationProvider{
		constructor(
			public LocationProvider: ng.ILocationProvider
		){
			
		}
	}
	
	angular
		.module('Client')
		.config(['$locationProvider', LocationProvider]);
}