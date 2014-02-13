/**
 * Created by Andrew on 2/4/14.
 */

'use strict';
var model_kind = 'Photo'

var photoView = angular.module('photoView',
	    [ 'api_services',
	      'endpointApp',
	      'ui.bootstrap']
	    );
	    
photoView.controller("PhotoCtrl",['$scope','$routeParams','$location','testEndpointsAPI','Auth',
  function($scope,$routeParams,$location,testEndpointsAPI,Auth){
	$scope.photo_id = $routeParams.photoID;
	$scope.photo = {};
	$scope.comment;
	$scope.saving = false;
	$scope.auth = Auth.isAuth();
	$scope.user = Auth.getUser();
	var promise = testEndpointsAPI.getPhoto($scope.photo_id);
	
	promise.then(function(result){
		$scope.photo = result;
	},function(reason){
		//TODO: handle error
		alert("Error: " + reason);
	});
	
		$scope.deletePhoto = function(){
			var promise = testEndpointsAPI.deletePhoto($scope.photo_id);
			  promise.then(function(result){
					//append comment to list of comments
					if(result){
						//redirect to home
						$location.path("/");
					}
			  },function(reason){
				  //TODO: handle error
				  alert("Error: " + reason);
			  });
		}
		
		$scope.deleteComment = function(comment){
			var promise = testEndpointsAPI.deleteComment(comment.id,$scope.photo_id,model_kind);
			  promise.then(function(result){
					//remove from list of comments
					if(result){
						//remove comment
						if($scope.photo && $scope.photo.comments){
							var index = $scope.photo.comments.indexOf(comment)
							if(index > -1){
								$scope.photo.comments.splice(index, 1);
							}								
						}						
					}
			  },function(reason){
				  //TODO: handle error
				  alert("Error: " + reason);
			  });
		}
		
		
		$scope.addComment = function(){
			if($scope.comment){
			  //save new comment
			  $scope.saving = true;
			  var promise = testEndpointsAPI.addComment($scope.comment,$scope.photo_id,model_kind);
			  //clear comment
			  $scope.comment = "";
			  promise.then(function(result){
					//append comment to list of comments
					if(result && $scope.photo.comments && $scope.photo.comments.length > 0){
						$scope.photo.comments.unshift(result);
					}else{
						$scope.photo.comments = [];
						$scope.photo.comments.push(result)
					}
					$scope.saving = false;
			  },function(reason){
				  //TODO: handle error
				  $scope.saving = false;
				  alert("Error: " + reason);
			  });
			}
		}
}]);