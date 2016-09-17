

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

site.controller('siteCtrl', ['$scope', '$window', function($scope, $window) {
	
	$scope.sectionList = ['home', 'about', 'work', 'school', 'hobbies', 'contact'];
	$scope.sectionInfo = {'home': {'name': 'home', 'title': 'Welcome!',
						  'description': 'This is Elena\'s website. [insert cool description here]'},
						'about': {'name': 'about', 'title': 'A little about me',
						  'description': '[insert some description here]'},
						'work': {'name': 'work', 'title': 'My technical work',
						  'description': 'From hardware hacks to front-end development, follow me through my technical works.[insert some description here]'},
						'school': {'name': 'school', 'title': 'My school',
						  'description': '[insert some description here]'},
						'hobbies': {'name': 'hobbies', 'title': 'What I love',
						  'description': '[insert some description here]'},
						'contact': {'name': 'contact', 'title': 'Get in touch',
						  'description': ''}
						};



	$scope.projectList = {'Website':{'name': 'Portfolio Site',
							'img':'images/butterfly_logo.svg',
							'technology':['HTML', 'CSS', 'JS', 'AngularJS'],
							'description':'my personal website and online portfolio'},
						'Nascent':{'name': 'Nascent',
							'img':'images/nascent.jpg',
							'technology':['HTML','CSS','JS','AngularJS','.NET'],
							'description':'first coop term'},
						'Nascent1':{'name': 'Nascent',
							'img':'images/nascent.jpg',
							'technology':['HTML','CSS','JS','AngularJS','.NET'],
							'description':'first coop term'},
						'Nascent2':{'name': 'Nascent',
							'img':'images/nascent.jpg',
							'technology':['HTML','CSS','JS','AngularJS','.NET'],
							'description':'first coop term'},
						'Nascent3':{'name': 'Nascent',
							'img':'images/nascent.jpg',
							'technology':['HTML','CSS','JS','AngularJS','.NET'],
							'description':'first coop term'},
						'Nascent4':{'name': 'Nascent',
							'img':'images/nascent.jpg',
							'technology':['HTML','CSS','JS','AngularJS','.NET'],
							'description':'first coop term'}
						};




	// $scope.scrollTo = function(toSection){
	// 	console.log('Jump to: '+toSection);
	// 	$('body').animate({
	// 		scrollTop: $(toSection).offset().top - $('.nav-bar').height()}, 500);
	// }

	$scope.goTo = function(toSection) {
		$scope.currSection = toSection;
		if (!$scope.desk){
			$scope.showMenu = false;
		}
	}

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


	$(document).ready(function() {
		$scope.currSection = $scope.sectionInfo.home;
		onWindowResize();
	});



}]);


