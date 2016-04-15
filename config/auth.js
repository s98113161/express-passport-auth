// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
		'clientID' 		: '535827976571653', // your App ID
		'clientSecret' 	: '8282f0ef7e721fb4dbbe5507520f0303', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};