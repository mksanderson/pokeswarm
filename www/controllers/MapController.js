var Application;
(function (Application) {
    /**
     * (description)
     *
     * @class MapController
     * @implements {IMapController}
     */
    var MapController = (function () {
        function MapController(FirebaseService, GeolocationService, MapService) {
            this.FirebaseService = FirebaseService;
            this.GeolocationService = GeolocationService;
            this.MapService = MapService;
            GeolocationService.get().then(function (response) {
                MapService.createMap(document.getElementById('map'), response.coords.latitude, response.coords.longitude, 16);
                MapService.addGeoMarker(response);
            }).catch(function (reason) {
                MapService.createMap(document.getElementById('map'), 27, 153, 2);
            }).then(function () {
                FirebaseService.get('/').then(function (response) {
                    var markers = [];
                    for (var i = 0; i < response.length; i++) {
                        markers.push(response[i].val());
                    }
                    MapService.addMarkers(markers);
                });
            });
        }
        /**
         * Filter the map items based on the search model
         *
         * @param {string} [search] (description)
         */
        MapController.prototype.filter = function (search) {
            var _this = this;
            this.MapService.filterMarkers(search).then(function () {
                _this.MapService.filterHeatMap();
            });
        };
        /**
         * Reset the map state
         */
        MapController.prototype.reset = function () {
            this.MapService.reset();
            this.search = '';
        };
        /**
         * (description)
         *
         * @param {Sighting} record (description)
         */
        MapController.prototype.submit = function (name) {
            var _this = this;
            this.GeolocationService.get().then(function (response) {
                var position = response;
                _this.FirebaseService.push({
                    'position': {
                        'coords': {
                            'latitude': position.coords.latitude,
                            'longitude': position.coords.longitude
                        },
                        'timestamp': position.timestamp
                    },
                    'name': name
                }).then(function (response) {
                    _this.FirebaseService.get('/').then(function (response) {
                        var markers = [];
                        for (var i = 0; i < response.length; i++) {
                            markers.push(response[i].val());
                        }
                        _this.MapService.addMarkers(markers);
                    });
                });
            });
        };
        MapController.$inject = [
            'FirebaseService',
            'GeolocationService',
            'MapService',
            'PokemonService'
        ];
        return MapController;
    }());
    angular
        .module('Client')
        .controller('MapController', MapController);
})(Application || (Application = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxXQUFXLENBb0dwQjtBQXBHRCxXQUFVLFdBQVcsRUFBQyxDQUFDO0lBRXRCOzs7OztPQUtHO0lBQ0g7UUFZQyx1QkFDUyxlQUFnQyxFQUNqQyxrQkFBc0MsRUFDdEMsVUFBc0I7WUFGckIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2pDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDdEMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtZQUU3QixrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO2dCQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlHLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTTtnQkFDZixVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1AsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO29CQUN0QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBRWpCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxDQUFDO29CQUVELFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBR0Q7Ozs7V0FJRztRQUNILDhCQUFNLEdBQU4sVUFBTyxNQUFlO1lBQXRCLGlCQUlDO1lBSEEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxQyxLQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOztXQUVHO1FBQ0gsNkJBQUssR0FBTDtZQUNDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUdEOzs7O1dBSUc7UUFDSCw4QkFBTSxHQUFOLFVBQU8sSUFBWTtZQUFuQixpQkF5QkM7WUF4QkEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7Z0JBQzNDLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFFeEIsS0FBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLFVBQVUsRUFBRTt3QkFDWCxRQUFRLEVBQUU7NEJBQ1QsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUTs0QkFDcEMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUzt5QkFDdEM7d0JBQ0QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxTQUFTO3FCQUMvQjtvQkFDRCxNQUFNLEVBQUUsSUFBSTtpQkFDWixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTtvQkFDaEIsS0FBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTt3QkFDM0MsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUVqQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzt3QkFDakMsQ0FBQzt3QkFFRCxLQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQTtRQUNILENBQUM7UUFyRk0scUJBQU8sR0FBRztZQUNoQixpQkFBaUI7WUFDakIsb0JBQW9CO1lBQ3BCLFlBQVk7WUFDWixnQkFBZ0I7U0FDaEIsQ0FBQztRQWlGSCxvQkFBQztJQUFELENBdkZBLEFBdUZDLElBQUE7SUFFRCxPQUFPO1NBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNoQixVQUFVLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzlDLENBQUMsRUFwR1MsV0FBVyxLQUFYLFdBQVcsUUFvR3BCIiwiZmlsZSI6ImNvbnRyb2xsZXJzL01hcENvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQXBwbGljYXRpb24ge1xyXG5cclxuXHQvKipcclxuXHQgKiAoZGVzY3JpcHRpb24pXHJcblx0ICogXHJcblx0ICogQGNsYXNzIE1hcENvbnRyb2xsZXJcclxuXHQgKiBAaW1wbGVtZW50cyB7SU1hcENvbnRyb2xsZXJ9XHJcblx0ICovXHJcblx0Y2xhc3MgTWFwQ29udHJvbGxlciB7XHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFtcclxuXHRcdFx0J0ZpcmViYXNlU2VydmljZScsXHJcblx0XHRcdCdHZW9sb2NhdGlvblNlcnZpY2UnLFxyXG5cdFx0XHQnTWFwU2VydmljZScsXHJcblx0XHRcdCdQb2tlbW9uU2VydmljZSdcclxuXHRcdF07XHJcblxyXG5cdFx0cHVibGljIGxvY2F0aW9uOiBQb3NpdGlvbjtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcblx0XHRwdWJsaWMgc2VhcmNoOiBzdHJpbmc7XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoXHJcblx0XHRcdHByaXZhdGUgRmlyZWJhc2VTZXJ2aWNlOiBGaXJlYmFzZVNlcnZpY2UsXHJcblx0XHRcdHB1YmxpYyBHZW9sb2NhdGlvblNlcnZpY2U6IEdlb2xvY2F0aW9uU2VydmljZSxcclxuXHRcdFx0cHVibGljIE1hcFNlcnZpY2U6IE1hcFNlcnZpY2VcclxuXHRcdCkge1xyXG5cdFx0XHRHZW9sb2NhdGlvblNlcnZpY2UuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRNYXBTZXJ2aWNlLmNyZWF0ZU1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIHJlc3BvbnNlLmNvb3Jkcy5sYXRpdHVkZSwgcmVzcG9uc2UuY29vcmRzLmxvbmdpdHVkZSwgMTYpO1xyXG5cdFx0XHRcdE1hcFNlcnZpY2UuYWRkR2VvTWFya2VyKHJlc3BvbnNlKTtcclxuXHRcdFx0fSkuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG5cdFx0XHRcdE1hcFNlcnZpY2UuY3JlYXRlTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgMjcsIDE1MywgMik7XHJcblx0XHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdEZpcmViYXNlU2VydmljZS5nZXQoJy8nKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG5cdFx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdG1hcmtlcnMucHVzaChyZXNwb25zZVtpXS52YWwoKSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0TWFwU2VydmljZS5hZGRNYXJrZXJzKG1hcmtlcnMpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEZpbHRlciB0aGUgbWFwIGl0ZW1zIGJhc2VkIG9uIHRoZSBzZWFyY2ggbW9kZWxcclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IFtzZWFyY2hdIChkZXNjcmlwdGlvbilcclxuXHRcdCAqL1xyXG5cdFx0ZmlsdGVyKHNlYXJjaD86IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHR0aGlzLk1hcFNlcnZpY2UuZmlsdGVyTWFya2VycyhzZWFyY2gpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuTWFwU2VydmljZS5maWx0ZXJIZWF0TWFwKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgdGhlIG1hcCBzdGF0ZVxyXG5cdFx0ICovXHJcblx0XHRyZXNldCgpIHtcclxuXHRcdFx0dGhpcy5NYXBTZXJ2aWNlLnJlc2V0KCk7XHJcblx0XHRcdHRoaXMuc2VhcmNoID0gJyc7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1NpZ2h0aW5nfSByZWNvcmQgKGRlc2NyaXB0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRzdWJtaXQobmFtZTogc3RyaW5nKSB7XHJcblx0XHRcdHRoaXMuR2VvbG9jYXRpb25TZXJ2aWNlLmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzcG9uc2U7XHJcblxyXG5cdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLnB1c2goe1xyXG5cdFx0XHRcdFx0J3Bvc2l0aW9uJzoge1xyXG5cdFx0XHRcdFx0XHQnY29vcmRzJzoge1xyXG5cdFx0XHRcdFx0XHRcdCdsYXRpdHVkZSc6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRcdFx0XHQnbG9uZ2l0dWRlJzogcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQndGltZXN0YW1wJzogcG9zaXRpb24udGltZXN0YW1wXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0J25hbWUnOiBuYW1lXHJcblx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuRmlyZWJhc2VTZXJ2aWNlLmdldCgnLycpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcblx0XHRcdFx0XHRcdHZhciBtYXJrZXJzID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0bWFya2Vycy5wdXNoKHJlc3BvbnNlW2ldLnZhbCgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5NYXBTZXJ2aWNlLmFkZE1hcmtlcnMobWFya2Vycyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXHJcblx0XHQuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIE1hcENvbnRyb2xsZXIpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
