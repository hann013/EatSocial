

var site = angular.module('site', ['ui.router', 'firebase']);

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
    	templateUrl: 'views/home.html',
    	controller: 'LoginController'
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

site.controller("FirebaseController", ["$scope", "$firebaseObject", 
	function($scope, $firebaseObject) {
		var ref = firebase.database().ref();
		var obj = $firebaseObject(ref);

		// to take an action after the data loads, use the $loaded() promise
	    obj.$loaded().then(function() {
	        console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

	        // To iterate the key/value pairs of the object, use angular.forEach()
	        angular.forEach(obj, function(value, key) {
	            console.log(key, value);
	        });
	    });

	     // To make the data available in the DOM, assign it to $scope
	     $scope.firebase = obj;

	     // For three-way data bindings, bind it to the scope instead
	     obj.$bindTo($scope, "firebase");
	}
]);

site.controller("LoginController", ["$scope", "$firebaseAuth", "$firebaseArray",
	function($scope, $firebaseAuth, $firebaseArray) {
		// OAuth login
		$scope.login = function(oauthProvider) {		
			$firebaseAuth().$signInWithPopup(oauthProvider).then(function(userData) {	
				var userId = userData.user.uid;
				var userName = userData.user.displayName;

				console.log("User ID: " + userId);

				var userRef = firebase.database().ref('users/' + userId);

				userRef.once("value").then(function(user) {
					// save new user 
					if (!user.exists()) {
						var newUser = { displayName : userName };

						userRef.set(newUser, function() {
							console.log("New user " + userName + " added");
						});
					} else {
						console.log("User already exists");
					}
				});
			}).catch(function(error) {
				console.error("Authentication failed:", error);
			});
		}
	}
]);
