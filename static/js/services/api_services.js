


var services = angular.module('api_services',['ngCookies'])  


services.factory('testEndpointsAPI',['$q',function($q){
	var endpoints = {}
	
	//get list of photos from the data store
	endpoints.getPhotos = function(limit){
		var deferred = $q.defer();
		gapi.client.endpointsTest.photos.list({'limit': limit}).execute(function(resp) {	
			if(!resp.code){		
				return deferred.resolve(resp.items);
			}else{
				return deferred.reject(resp.code);
			}
		});
		
		return  deferred.promise;
	};
	
	//get list of photos from the data store
	endpoints.getPhoto = function(photo_id){
		var deferred = $q.defer();
		gapi.client.endpointsTest.photo.get({'id': photo_id}).execute(function(resp) {	
			if(!resp.code){		
				return deferred.resolve(resp.result);
			}else{
				return deferred.reject(resp.code);
			}
		});
		return  deferred.promise;
	};
	
	//Add new photo to datastore
	endpoints.addNewPhoto = function(photo){
		var deferred = $q.defer();
		gapi.client.endpointsTest.photo.insert(photo).execute(function(resp) {
			if(!resp.code){
				return deferred.resolve(resp);
			}else{
				return deferred.reject("Error:" + resp.code);
			}
		});
		return deferred.promise;
	}
	
	//Add new photo to datastore
	endpoints.deletePhoto = function(photo_id){
		var deferred = $q.defer();
		gapi.client.endpointsTest.photo.delete_photo({'id': photo_id}).execute(function(resp) {
			if(!resp.code){
				return deferred.resolve(resp);
			}else{
				return deferred.reject("Error:" + resp.code);
			}
		});
		return deferred.promise;
	}
	
	endpoints.addComment = function(comment_text,parent, parent_kind){
		var deferred = $q.defer();
		gapi.client.endpointsTest.comment.insert({'comment_text':comment_text,'parent':parent,'parent_kind': parent_kind}).execute(function(resp) {
			if(!resp.code){
				return deferred.resolve(resp);
			}else{
				return deferred.reject("Error:" + resp.code);
			}
		});
		return deferred.promise;
	}
	
	//Add new photo to datastore
	endpoints.deleteComment = function(comment_id,parent,parent_kind){
		var deferred = $q.defer();
		gapi.client.endpointsTest.comment.delete_comment({'parent':parent,'parent_kind': parent_kind,'id': comment_id}).execute(function(resp) {
			if(!resp.code){
				return deferred.resolve(resp);
			}else{
				return deferred.reject("Error:" + resp.code);
			}
		});
		return deferred.promise;
	}
	
	return endpoints;
}]);