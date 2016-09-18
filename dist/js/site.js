

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

site.controller("SearchController", ["$scope", "$firebaseAuth", "$firebaseArray", "MatchDetails",
	function($scope, $firebaseAuth, $firebaseArray, MatchDetails) {
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

			var bestMatch = null;
			var minDistance = null;

			// find minimum distance between currently active searches
			for(i = 0; i < active.length; i++) {
				var cLat = position.coords.latitude;
				var cLon = position.coords.longitude;

				var dist = calculateDistance(cLat, cLon, active[i].location[0], active[i].location[1]);

				if (dist <= $scope.search.maxRadius) {
		        	console.log("Found a match! Distance = " + dist + " < maxRadius = " + $scope.search.maxRadius);

		        	if (bestMatch == null || dist < bestMatch.distance) {
		        		console.log("Updated min distance match");
						bestMatch = active[i]; 
						bestMatch.distance = dist;
		        	}
				}
			}

			if (bestMatch != null) {
				// Save match details
				MatchDetails.setLatitude(bestMatch.location[0]);
				MatchDetails.setLongitude(bestMatch.location[1]);
				MatchDetails.setMaxRadius($scope.search.maxRadius);

				// redirect
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

site.controller("MatchController", ["$scope", "$firebaseAuth", "$firebaseArray", "MatchDetails", "YelpService",
	function($scope, $firebaseAuth, $firebaseArray, MatchDetails, YelpService) {
		YelpService.searchYelp(MatchDetails.getLatitude(), MatchDetails.getLongitude(), MatchDetails.getMaxRadius(), function(data) {
			console.log("done");
			console.log(data[0]);
		});
	}
]);

site.service("MatchDetails", function() {
	var latitude;
	var longitude;
	var maxRadius;

	return {
		getLatitude: function() {
			return latitude;
		},

		setLatitude: function(lat) {
			latitude = lat;
		},

		getLongitude: function() {
			return longitude;
		},

		setLongitude: function(long) {
			longitude = long;
		},

		getMaxRadius: function() {
			return maxRadius;
		},

		setMaxRadius: function(maxRad) {
			maxRadius = maxRad;
		}
	} 
});

site.factory("YelpService", function($q, $http) {
	function getNonce() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for(var i = 0; i < 32; i++) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;
	}

    return {
        searchYelp: function(lat, long, maxRadius, callback) {
        	var deferred = $q.defer();

            var method = 'GET';
            var url = 'http://api.yelp.com/v2/search';
        	var params = {
	            oauth_consumer_key: 'gol1ZEbWq_Zj5CLA1YJbJg',
	            oauth_token: 'z4519RcSXpdN9g5kIwCJ6G5Iqh1cuC8e',
	            oauth_signature_method: "HMAC-SHA1",
	            oauth_timestamp: new Date().getTime(),
	            oauth_nonce: getNonce(),
	            ll: lat + ',' + long,
	            callback: 'angular.callbacks._0',
	            term: 'food',
	            radius_filter: maxRadius
		    };

            var consumerSecret = 'qY__w0zPqYqu0BC6yQ38plyOYtI';
            var tokenSecret = 'qWmSq31mLiuq9NSqtPnrA7tc_N4';
            var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false });
            params['oauth_signature'] = signature;

            $http.jsonp(url, { params : params }).success(callback);

            return deferred.promise;
        }
    }
});
