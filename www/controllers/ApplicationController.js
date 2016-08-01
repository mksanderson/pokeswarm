var Application;
(function (Application) {
    /**
     * Core controller for global functions
     *
     * @class ApplicationController
     * @implements {IApplicationController}
     */
    var ApplicationController = (function () {
        function ApplicationController(FirebaseService) {
            this.FirebaseService = FirebaseService;
            FirebaseService.configure();
        }
        ApplicationController.$inject = [
            'FirebaseService'
        ];
        return ApplicationController;
    }());
    angular
        .module('Client')
        .controller('ApplicationController', ApplicationController);
})(Application || (Application = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL0FwcGxpY2F0aW9uQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLFdBQVcsQ0F3QnBCO0FBeEJELFdBQVUsV0FBVyxFQUFDLENBQUM7SUFDdEI7Ozs7O09BS0c7SUFDSDtRQU9DLCtCQUNTLGVBQWdDO1lBQWhDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUV4QyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQVZNLDZCQUFPLEdBQUc7WUFDaEIsaUJBQWlCO1NBQ2pCLENBQUM7UUFTSCw0QkFBQztJQUFELENBWkEsQUFZQyxJQUFBO0lBRUQsT0FBTztTQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDaEIsVUFBVSxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDOUQsQ0FBQyxFQXhCUyxXQUFXLEtBQVgsV0FBVyxRQXdCcEIiLCJmaWxlIjoiY29udHJvbGxlcnMvQXBwbGljYXRpb25Db250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEFwcGxpY2F0aW9uIHtcblx0LyoqXG5cdCAqIENvcmUgY29udHJvbGxlciBmb3IgZ2xvYmFsIGZ1bmN0aW9uc1xuXHQgKiBcblx0ICogQGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlclxuXHQgKiBAaW1wbGVtZW50cyB7SUFwcGxpY2F0aW9uQ29udHJvbGxlcn1cblx0ICovXG5cdGNsYXNzIEFwcGxpY2F0aW9uQ29udHJvbGxlciB7XG5cdFx0c3RhdGljICRpbmplY3QgPSBbXG5cdFx0XHQnRmlyZWJhc2VTZXJ2aWNlJ1xuXHRcdF07XG5cblx0XHRwdWJsaWMgZGF0YTogYW55O1xuXG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRwcml2YXRlIEZpcmViYXNlU2VydmljZTogRmlyZWJhc2VTZXJ2aWNlXG5cdFx0KSB7XG5cdFx0XHRGaXJlYmFzZVNlcnZpY2UuY29uZmlndXJlKCk7XG5cdFx0fVxuXHR9XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ0NsaWVudCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FwcGxpY2F0aW9uQ29udHJvbGxlcicsIEFwcGxpY2F0aW9uQ29udHJvbGxlcik7XG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
