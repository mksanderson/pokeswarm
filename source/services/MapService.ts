namespace Application {

	/**
	 * (description)
	 * 
	 * @class MapService
	 * @implements {IMapService}
	 */
	export class MapService {
		static $inject = [
			'$filter',
			'$http',
			'PokemonService',
			'$q',
			'$timeout'
		];

		private location: L.Marker;
		private infoWindow: google.maps.InfoWindow;
		private infoWindows: google.maps.InfoWindow[];
		private map: L.Map;
		private marker: google.maps.Marker;
		private markers: google.maps.Marker[];

		constructor(
			private FilterService: ng.IFilterService,
			private HttpService: ng.IHttpService,
			private PokemonService: PokemonService,
			private QService: ng.IQService,
			private TimeoutService: ng.ITimeoutService
		) {
			this.infoWindow = new google.maps.InfoWindow();
			this.infoWindows = new Array<google.maps.InfoWindow>();
			this.marker = new google.maps.Marker();
			this.markers = new Array<google.maps.Marker>();
		}

		/**
		 * (description)
		 * 
		 * @param {HTMLElement} element (description)
		 * @param {Position} center (description)
		 * @param {number} zoom (description)
		 */
		configure(element: HTMLElement, center: Position, zoom: number): void {
			this.map = L.map(element);

			this.locate();

			L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWtzYW5kZXJzb24iLCJhIjoiRTI5SUlZQSJ9.WUx-mVx949iRWfG-s7YZvA', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(this.map);

			this.map.on('resize', () => {
				this.map.invalidateSize({
					animate: true
				})
			})
		}

		/**
		 * (description)
		 */
		locate(): void {
			this.map.locate({
				enableHighAccuracy: true,
				setView: true
			}).on('locationfound', (response) => {
				if(this.location){
					this.map.removeLayer(this.location);
				}

				this.location = L.marker(response['latlng'], {
					draggable: true,
					icon: L.divIcon({
						className:'location',
						iconSize:[32,32]
					}),
					title: 'Your location'
				});

				this.map.addLayer(this.location);

			}).on('locationerror', (response) => {
				alert('Geolocation error: ' + response);
			})
		}

		/**
		 * (description)
		 * 
		 * @template T
		 * @param {Array<T>} values (description)
		 */
		points<T>(values: Array<T>): void {
			for (var i = 0; i < values.length; i++) {
				L.marker([values[i]['position']['coords']['latitude'], values[i]['position']['coords']['longitude']], {
					icon: L.icon({
						iconSize: [60, 60],
						iconUrl: '/api/pokemon/icons/' + values[i]['number'] + '.ico'
					}),
					riseOnHover: true,
					title: values[i]['name']
				}).addTo(this.map);
			}
		}
		
		/**
		 * (description)
		 * 
		 * @returns {ng.IPromise<L.LatLng>} (description)
		 */
		position(): ng.IPromise<L.LatLng>{
			var deferral = this.QService.defer();

			if(this.location){
				deferral.resolve(this.location.getLatLng());
			}
			else{
				deferral.reject('No location available');
			}

			return deferral.promise;
		}
	}

	angular
		.module('Client')
		.service('MapService', MapService);
}