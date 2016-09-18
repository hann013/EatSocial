

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

		// default fields
		$scope.search = {
			numPeople : 1,
			maxRadius : 5000,
			waitMins : 5
		}

		$scope.validate = function() {
			
		}

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

			var minDistanceMatch = null;
			var minDistance = null;

			// find minimum distance between currently active searches
			for(i = 0; i < active.length; i++) {
				var cLat = position.coords.latitude;
				var cLon = position.coords.longitude;

				var dist = calculateDistance(cLat, cLon, active[i].location[0], active[i].location[1]);

				if (dist <= $scope.search.maxRadius) {
		        	console.log("Found a match! Distance = " + dist + " < maxRadius = " + $scope.search.maxRadius);

		        	if (minDistanceMatch == null || dist < minDistanceMatch.distance) {
		        		console.log("Updated min distance match");
						minDistanceMatch = active[i]; 
						minDistanceMatch.distance = dist;
		        	}
				}
			}

			if (minDistanceMatch != null) {
				// redirect to new page
			} else {
	        	console.log("No matches found");
				saveSearch(cLat, cLon);
			}
		}

		function calculateDistance(lat1, lon1, lat2, lon2) {
			var R = 6371000; // Radius of the earth in m
			var dLat = (lat2 - lat1) * Math.PI / 180;  // deg to rad below
			var dLon = (lon2 - lon1) * Math.PI / 180;
			var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

			var distance = R * 2 * Math.asin(Math.sqrt(a));
			return distance;
		}

		function saveSearch(lat, long) {
    		// store search in the database
			var activeRef = firebase.database().ref('active-searches');

			var newSearch = {
				userId: $firebaseAuth().$getAuth().uid,
				numPeople: $scope.search.numPeople,
				maxRadius: $scope.search.maxRadius,
				location: [lat, long]
			};

			activeRef.push(newSearch, function() {
				console.log("Added search");
			});
    	}
	}
]);
