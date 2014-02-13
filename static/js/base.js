
/** google namespace*/
var google = google || {};

/** api namespace*/
google.api = google.api || {};

/**
 * Client ID of the application (from the APIs Console).
 * 
 * @type {string}
 */
google.api.CLIENT_ID = 'YOUR CLIENT ID';

/**
 * Scopes used by the application.
 * 
 * @type {string}
 */
google.api.SCOPES = 'https://www.googleapis.com/auth/userinfo.email';
/**


/**
 * Initializes the application. It loads asynchronously all needed libraries
 * 
 * @param {string}
 *            apiRoot Root of the API's path.
 */
google.api.init = function(apiRoot) {
	var apisToLoad;
	
	var callback = function() {
		if (--apisToLoad == 0) {
			//bootstrap manually angularjs after api are loaded
			angular.bootstrap(document, [ "endpointApp" ]);
		}
	}
	apisToLoad = 2; // must match number of calls to gapi.client.load()
	gapi.client.load('endpointsTest', 'v1', callback, apiRoot);
	gapi.client.load('oauth2', 'v2', callback);
};
