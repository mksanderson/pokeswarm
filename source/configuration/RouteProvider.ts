namespace Application {
	export class RouteProvider{
		constructor(
			public RouteProvider: ng.route.IRouteProvider
		){
			RouteProvider
				.when('/form/', {
					controller:'FormController',
					controllerAs: 'Form',
					templateUrl:'/templates/form.html'
				})
				.when('/form/location', {
					controller:'FormController',
					controllerAs: 'Form',
					templateUrl:'/templates/location.html'
				})
				.when('/form/success', {
					controller:'FormController',
					controllerAs: 'Form',
					templateUrl:'/templates/success.html'
				})
				.when('/index', {
					controller:'IndexController',
					controllerAs: 'Index',
					templateUrl:'/templates/index.html'
				})
				.when('/index/:id', {
					controller:'IndexController',
					controllerAs: 'Index',
					templateUrl:'/templates/pokemon.html'
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