namespace Application {
	export class RouteProvider{
		constructor(
			public RouteProvider: ng.route.IRouteProvider
		){
			RouteProvider
				.when('/', {
					templateUrl:'/templates/map.html'
				})
		}
	}
	
	angular
		.module('Client')
		.config(['$routeProvider', RouteProvider]);
}