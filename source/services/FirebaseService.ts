namespace Application {
	declare var firebase: any;

	export class FirebaseService {
		static $inject = [
			'$q'
		]

		private firebase: any;
		private sightings = new Array<Pokemon>();

		constructor(
			private QService: ng.IQService
		) {

		}


		/**
		 * Set up connection to database
		 */
		configure(): void {
			var config = {
				apiKey: "AIzaSyCX8F3OCazrx8A0XlNA4j3KgZmOOuyPbNQ",
				authDomain: "poketrends-1469778144301.firebaseapp.com",
				databaseURL: "https://poketrends-1469778144301.firebaseio.com",
				storageBucket: "poketrends-1469778144301.appspot.com",
			};

			this.firebase = firebase.initializeApp(config);
		}

		
		/**
		 * (description)
		 * 
		 * @param {string} path (description)
		 * @returns {*} (description)
		 */
		get(path: string): ng.IPromise<any> {
			var deferred = this.QService.defer(),
				result = [];
			
			this.firebase.database().ref(path).on('value', ((response) => {
				response.forEach((sighting) => {
					result.push(sighting);
				})

				deferred.resolve(result);
			}))

			return deferred.promise;
		}
		
		/**
		 * (description)
		 * 
		 * @param {Sighting} record (description)
		 */
		push(record: any): ng.IPromise<any> {
			var deferred = this.QService.defer();

			deferred.resolve(this.firebase.database().ref().push(record));

			return deferred.promise;
		}
	}

	angular
		.module('Client')
		.service('FirebaseService', FirebaseService);
}