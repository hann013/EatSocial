

var site = angular.module('site', ['ui.router']);

site.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/')
	// $urlRouterProvider.when('/', {
 //        	templateUrl: 'index.html',
 //        	activetab: 'frontendfun',
 //        	controller: siteController })
	// .otherwise({ redirectTo: '/'});
        // when('/project/:projectId', {
        //   templateUrl: function (params) { return 'pages/' + params.projectId + '.html'; },
        //   controller: ProjectCtrl,
        //   activetab: 'projects'
        // }).
        // when('/privacy', {
        //   templateUrl: 'pages/privacy.html',
        //   controller: PrivacyCtrl,
        //   activetab: 'privacy'
        // }).

    $stateProvider.state('home', {
    	url: '/',
    	templateUrl: 'views/home.html'
    })
    .state('results', {
    	url: '/results',
    	templateUrl: 'views/results.html'
    })
    .state('profile', {
    	url: '/profile',
    	templateUrl: 'views/profile.html'
    });

});

// site.run(['$route', '$rootScope', function($route, $scope) {
// 	$scope.$on("$routeChangeSuccess", function (scope, next, current) {
// 		$scope.part = $route.current.activetab;
// 	});
// }]);


///////////////////////////////////////////////////////////////
//				OLD STUFF FROM MY WEBSITE
///////////////////////////////////////////////////////////////

site.controller('siteCtrl', ['$scope', '$window', '$state', function($scope, $window, $state) {
	




	// $scope.scrollTo = function(toSection){
	// 	console.log('Jump to: '+toSection);
	// 	$('body').animate({
	// 		scrollTop: $(toSection).offset().top - $('.nav-bar').height()}, 500);
	// }

	// $scope.goTo = function(toSection) {
	// 	$scope.currSection = toSection;
	// 	if (!$scope.desk){
	// 		$scope.showMenu = false;
	// 	}
	// }

	$scope.showNavMenu = function() {
		console.log("toggling menu");
		$scope.showMenu = ($scope.showMenu ? false: true);
	}


	//boolean for whether device has touch screen
    $scope.isTouch = ($window.ontouchstart || ('ontouchstart' in window) || $window.navigator.MaxTouchPoints || $window.navigator.msMaxTouchPoints) ? true : false;
    console.log("TOUCH: " + $scope.isTouch);
    $scope.isTouch = true;


	var onWindowResize = function() {
		$scope.$apply(function() {
			if ($(window).innerWidth() < 720){
                // $scope.mobile = false;
                $scope.desk = false;
                console.log("mobile");
                $scope.showMenu = false;
            }

            // else if ($(window).innerWidth() < 921){
            //     $scope.tablet = true;
            //     $scope.desk = false;
            //     //console.log("tablet");
            // }

            else {
                // $scope.tablet = true;
                $scope.desk = true;
                console.log("desk");
                $scope.showMenu = true;
            }
		});
	}
	$(window).resize(onWindowResize);



///////////////HTN////////////////
	$scope.gotoProfile = function() {
		$state.go('');
	}


	$(document).ready(function() {
		// $scope.currSection = $scope.sectionInfo.home;
		onWindowResize();

		$scope.showSignIn = false;
		$scope.signedIn = false;
	});



}]);


