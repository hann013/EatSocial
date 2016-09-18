

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
    .state('search', {
    	url: '/search',
    	templateUrl: 'views/search.html',
    	controller: 'SearchController'
    })
    .state('profile', {
    	url: '/profile',
    	templateUrl: 'views/profile.html'
    })
    .state('countdown', {
    	url: '/countdown',
    	templateUrl: 'views/countdown.html',
    	controller: 'CountdownController'
    })
    .state('result', {
    	url: '/result',
    	templateUrl: 'views/result.html',
    	controller: 'ResultController'
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

site.controller("LoginController", ["$scope", "$state", "$firebaseAuth", "$firebaseArray", 
	function($scope, $state, $firebaseAuth, $firebaseArray) {
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
						$state.go('search');
					}
					$state.go('search');
				});
			}).catch(function(error) {
				console.error("Authentication failed:", error);
			});
		}
	}
]);

site.controller("SearchController", ["$scope", "$state", "$firebaseAuth", "$firebaseArray", "MatchDetails", 
	function($scope, $state, $firebaseAuth, $firebaseArray, MatchDetails) {
		var searchesRef = firebase.database().ref('active-searches');
		$scope.searches = $firebaseArray(searchesRef);

		// default fields
		$scope.search = {
			numPeople : 1,
			maxRadius : 5000,
			waitMins : 5
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
			var searches = $scope.searches;

			var bestMatch = null;

			// find minimum distance between currently active searches
			for(i = 0; i < searches.length; i++) {
				var cLat = position.coords.latitude;
				var cLon = position.coords.longitude;

				var dist = calculateDistance(cLat, cLon, searches[i].location[0], searches[i].location[1]);

				if (dist <= $scope.search.maxRadius) {
		        	console.log("Found a match! Distance = " + dist + " < maxRadius = " + $scope.search.maxRadius);

		        	if (bestMatch == null || dist < bestMatch.distance) {
		        		console.log("Updated min distance match");
						bestMatch = searches[i]; 
						bestMatch.distance = dist;
		        	}
				}
			}

			if (bestMatch != null) {
				var newMatch = {
					latitude: bestMatch.location[0],
					longitude: bestMatch.location[1],
					maxRadius: $scope.search.maxRadius,
					activeId: bestMatch.$id,
					expireDate: $scope.search.waitMins
				}

				// Save match details
				MatchDetails.setData(newMatch);

				// go to result page
				$state.go("result");
			} else {
	        	console.log("No matches found");

	        	// save active search
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
			var newSearch = {
				userId: $firebaseAuth().$getAuth().uid,
				numPeople: $scope.search.numPeople,
				maxRadius: $scope.search.maxRadius,
				location: [lat, long]
			};

			searchesRef.push(newSearch, function() {
				console.log("Added search");
			});
    	}
	}
]);

site.controller("ResultController", ["$scope", "$firebaseArray", "MatchDetails", "YelpService",
	function($scope, $firebaseArray, MatchDetails, YelpService) {
		// get best Yelp match
		YelpService.searchYelp(MatchDetails.getLatitude(), MatchDetails.getLongitude(), MatchDetails.getMaxRadius(), function(data) {
			console.log("Got Yelp results");

			if (data.businesses.length > 0) {
				$scope.bestMatch = data.businesses[0];

				$scope.bestMatch.activeId = MatchDetails.getActiveId();

				// Delete active search
				deleteSearch(MatchDetails.getActiveId());

				// Set active match in database
				addMatch($scope.bestMatch);

				console.log($scope.bestMatch);
			}
		});

		function deleteSearch(id) {
			var searchesRef = firebase.database().ref('active-searches');
			$scope.searches = $firebaseArray(searchesRef);

			if ($scope.searches.length > 0) {
				$scope.searches.$remove($scope.searches.$getRecord(id)).then(function() {
					console.log("Removed by ID");
				});
			}
		}

		function addMatch(bestMatch) {
			var matchesRef = firebase.database().ref('active-matches'); 
			matchesRef.push(bestMatch, function() {
				console.log("Added match");
			});
		}
	}
]);

site.controller("CountdownController", ["$scope", "$state", "MatchDetails",
	function($scope, $state, MatchDetails){

		function getTimeRemaining(endtime) {
			  var t = Date.parse(endtime) - Date.parse(new Date());
			  var seconds = Math.floor((t / 1000) % 60);
			  var minutes = Math.floor((t / 1000 / 60) % 60);
			  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			  var days = Math.floor(t / (1000 * 60 * 60 * 24));
			  return {
			    'total': t,
			    'days': days,
			    'hours': hours,
			    'minutes': minutes,
			    'seconds': seconds
			  };
			}

			function initializeClock(id, endtime) {
				var clock = document.getElementById(id);
				var minutesSpan = clock.querySelector('.minutes');
				var secondsSpan = clock.querySelector('.seconds');

				function updateClock() {
					var t = getTimeRemaining(endtime);

					minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
					secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

					if (t.total <= 0) {
						$scope.$apply(function() {
							$scope.sorry = true;
						});
						clearInterval(timeinterval);
					}
				}

				updateClock();
				var timeinterval = setInterval(updateClock, 1000);
			}

			var minsWillWait = (MatchDetails.getExpireDate() <= 0) ? MatchDetails.getExpireDate() : 1;
			
			var deadline = new Date(Date.parse(new Date()) + minsWillWait * 60 * 1000);
			initializeClock('clockdiv', deadline);


	}
]);

site.service("MatchDetails", function() {
	var latitude;
	var longitude;
	var maxRadius;
	var activeId;
	var expireDate;

	return {
		getLatitude: function() {
			return latitude;
		},

		getLongitude: function() {
			return longitude;
		},

		getMaxRadius: function() {
			return maxRadius;
		},

		getActiveId: function() {
			return activeId;
		},

		getExpireDate: function() {
			return expireDate;
		},

		setData: function(newMatch) {
			latitude = newMatch.latitude;
			longitude = newMatch.longitude;
			maxRadius = newMatch.maxRadius;
			activeId = newMatch.activeId;
			expireDate = newMatch.expireDate;
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
