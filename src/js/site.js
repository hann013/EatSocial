

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
    	templateUrl: 'views/results.html',
    	controller: 'SearchController'
    })
    .state('profile', {
    	url: '/profile',
    	templateUrl: 'views/profile.html'
    })
    .state('countdown', {
    	url: '/countdown',
    	templateUrl: 'views/countdown.html'
    });

});

// site.run(['$route', '$rootScope', function($route, $scope) {
// 	$scope.$on("$routeChangeSuccess", function (scope, next, current) {
// 		$scope.part = $route.current.activetab;
// 	});
// }]);



site.controller('siteCtrl', ['$scope', '$window', '$state', function($scope, $window, $state) {
	
///////////////HTN////////////////
	$scope.gotoProfile = function() {
		$state.go('');
	}


	$(document).ready(function() {

		// $scope.showSignIn = false;
		// $scope.showRegister = false;
		// $scope.signedIn = false;
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

site.controller("LoginController", ["$scope", "$firebaseAuth", "$firebaseArray", "$state",
	function($scope, $firebaseAuth, $firebaseArray, $state) {
		// OAuth login
		$scope.login = function(oauthProvider) {		
			$firebaseAuth().$signInWithPopup(oauthProvider).then(function(userData) {
				var userInfo = userData.user;	
				var userId = userInfo.uid;
				var userName = userInfo.displayName;

				console.log(userData);
				console.log("User ID: " + userId);

				var userRef = firebase.database().ref('users/' + userId);

				userRef.once("value").then(function(user) {
					// save new user 
					if (!user.exists()) {
						var newUser = { 
							displayName : userName,
							photoUrl : userInfo.photoURL
						};

						userRef.set(newUser, function() {
							console.log("New user " + userName + " added");
						});
					} else {
						console.log("User already exists");
						$state.go('results');
					}
					$state.go('results');
				});
			}).catch(function(error) {
				console.error("Authentication failed:", error);
			});
		}
	}
]);

site.controller("SearchController", ["$scope", "$firebaseAuth", "$firebaseArray", 
	function($scope, $firebaseAuth, $firebaseArray) {
		var activeRef = firebase.database().ref('active-searches');
		$scope.active = $firebaseArray(activeRef);

		$scope.submit = function() {
			// get current location
			if (navigator.geolocation) {
				console.log("Has geolocation");
	        	navigator.geolocation.getCurrentPosition(compareActiveSearches);
		    } else {
		        console.log("Error: couldn't get current location");
		    }
		}

		function compareActiveSearches(position) {
			var active = $scope.active;
			
			console.log(active);

			for(i = 0; i < active.length; i++) {
				var cLat = position.coords.latitude;
				var cLon = position.coords.longitude;

				calculateDistance(cLat, cLon, active[i].location[0], active[i].location[1]);
			}

			saveSearch(cLat, cLon);
		}

		function calculateDistance(lat1, lon1, lat2, lon2) {
			var R = 6371e3; // metres
		    var φ1 = lat1 * Math.PI / 180;
		    var φ2 = lat2 * Math.PI / 180;
		    var Δφ = (lat2 - lat1) * Math.PI / 180;
		    var Δλ = (lon2 - lon1) * Math.PI / 180;

		    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		    console.log(R * c);
		}

		function saveSearch(lat, long) {
    		// store search in the database
			var activeRef = firebase.database().ref('active-searches');

			var newSearch = {
				userId: $firebaseAuth().$getAuth().uid,
				numPeople: $scope.request.people,
				maxRadius: $scope.request.radius,
				location: [lat, long]
			};

			activeRef.push(newSearch, function() {
				console.log("Added search");
			});
    	}
	}
]);
