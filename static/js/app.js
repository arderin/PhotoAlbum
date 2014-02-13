'use strict';
/* App Module */


var app = angular.module('endpointApp',
    [ 'ngRoute',
      'photoView',
      'api_services',
      'ngSanitize',
      'ui.bootstrap',
      'ngCookies']
    );
    
app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
            	.when('/photo/:photoID',{ templateUrl: 'views/photo.html' })
                .when('/home',{ templateUrl: 'views/home.html' })
                .otherwise({ redirectTo: '/home' });
        }]);
        
 
app.controller('HeaderCtrl',['$rootScope','$location','$window','Auth','$cookieStore',
function($rootScope,$location,$window,Auth,$cookieStore){
	//check if user is already authenticated
	Auth.checkAuth($rootScope,$location);
	$rootScope.authenticate = function(){
		   Auth.authenticate($rootScope, $location);
	}
	
}]);


app.controller('HomeCtrl',['$scope','$location', '$http','$modal','testEndpointsAPI',
function($scope,$location, $http,$modal,testEndpointsAPI){
	//get list 
	$scope.photos = [];
	//get list of photos
	var promise = testEndpointsAPI.getPhotos(25);
	promise.then(function(result){
				$scope.photos = result;
			},
			function(reason){
				//TODO: Handle error
				alert("Error: " + reason);
			});
	
	//open modal to add new photo
	$scope.addPhoto = function () {
		    var modalInstance = $modal.open({
		      templateUrl: 'views/new_photo.html',
		      controller: ModalInstanceCtrl,
		      resolve: {
		    	  photo: function(){
		    		  return {};
		    	  }
		      }
		    });
		    modalInstance.result.then(function (newPhoto) {
				//append new photo to list
		    	if(newPhoto){
		    		if($scope.photos && $scope.photos.length > 0){
		    			$scope.photos.unshift(newPhoto);
		    		}else{
		    			$scope.photos = [];
		    			$scope.photos.push(newPhoto);
		    		}
		    	}
		    });
	}
	
	//modal control instance for new photo modal
	var ModalInstanceCtrl = function ($scope, $modalInstance,photo) {
		  $scope.photo = photo;
		  $scope.saving = false;		  
		  $scope.ok = function () {
			  //change saving state to true
			  $scope.saving = true;
			  //save new photo
			  var promise = testEndpointsAPI.addNewPhoto($scope.photo)
			  promise.then(function(result){
				  $modalInstance.close(result);
			  },function(reason){
				  $modalInstance.close();
			  });
		  };
		  $scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		  };
	};	
}]);



app.factory('Auth',[ '$cookieStore','$q',function($cookieStore,$q){
	var auth = {}
	var is_auth = false;
	var user = null;
	
	// Loads the application UI after the user has completed auth.
	var userAuthed = function($scope,$location) {
		var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
			if (!resp.code) {
				$scope.auth = true;
				$scope.user = resp;
				user = resp;
				is_auth = true;
			}else{
				$scope.auth = false;
				$scope.user = null;
				is_auth = false;
				user = null;
			}
			//$location.path('');
			$scope.$apply();
		});
	};

	//handle the auth flow, with the given value for immediate mode
	var signin = function(mode, callback) {
		gapi.auth.authorize({
			client_id : google.api.CLIENT_ID,
			scope : google.api.SCOPES,
			immediate : mode
		}, callback)
	};

	/**
	 * Presents the user with the authorization popup.
	 */
	auth.authenticate = function($scope, $location) {
		var authCallback = function(){
			userAuthed($scope, $location);
		}
		
		if (!$scope.auth) {
			signin(false, authCallback);
		} else {
			$scope.auth = false;
			//gapi.auth.setToken(null);
		}
	};
	
	auth.checkAuth = function($scope, $location){
		//check if user is already authenticated
		if(!$scope.auth){
			var authCallback = function(){
				userAuthed($scope, $location);
			}
			signin(true, authCallback);
		}
	}
	
	auth.isAuth = function(){
		return is_auth;
	}
	
	auth.getUser = function(){
		return user;
	}
	
	return auth;
}]);



