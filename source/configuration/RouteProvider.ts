namespace Application {
	export class RouteProvider{
		constructor(
			public RouteProvider: ng.route.IRouteProvider
		){
			RouteProvider
				.when('/page', {
					controller:'PageController',
					controllerAs: 'Page',
					templateUrl:'/templates/page.html'
				})
				.when('/form', {
					controller:'FormController',
					controllerAs: 'Form',
					templateUrl:'/templates/form.html'
				})
				.when('/map', {
					controller:'MapController',
					controllerAs: 'Map',
					templateUrl:'/templates/map.html'
				})
			.otherwise('/map')
		}
	}
	
	angular
		.module('Client')
		.config(['$routeProvider', RouteProvider]);
}