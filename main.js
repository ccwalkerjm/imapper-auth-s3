/**
 * User Authentication
 * 
 * Connects to an AWS S3 bucket and gets a JSON file containing hashed
 * password info, then tests the password sent against the hashed values.
 *
 */

var AWS = require('aws-sdk'); 
var jsSHA = require("jssha");
var extend = require('util')._extend;

var s3 = new AWS.S3(); 

var exports = module.exports = {};

exports.options = {
	S3BucketName: '',
	S3KeySuffix: '.auth.json'
};

exports.authenticate = function(options,callback) {
	// bail if no bucket name set
	if (this.options.S3BucketName == '') {
    	var err = {message: 'Authentication failed.'};
			callback(err,null);
			return;
	}

	var key = options.username.replace('@','--') + this.options.S3KeySuffix;
	
	s3.getObject({Bucket: this.options.S3BucketName, Key: key}, function(error, data) {
	  if (error) {
	    if (error.code == 'NoSuchKey') {
	    	//console.log('The requested object does not exist.');
	    	var err = {message: 'The requested object does not exist.'};
	    	callback(err,null);
	    } else {
		    //console.log('Error retrieving object',error); // error is Response.error   
	    	var err = {message: 'Error retrieving object from S3'};
		    callback(err,null);
	    }
	  } else {
	  	// 
	    var data = JSON.parse(data.Body);
	    //console.log(data);

			var shaObj = new jsSHA("SHA-1", "TEXT");
			shaObj.update(data.S1 + options.password);
			var hash = shaObj.getHash("HEX");

			//console.log(data.S1, options.password, hash);

			if ( data.S2 == hash ) {
				//console.log(true);
				callback(null,true);
			} else {
				//console.log(false);
	    	var err = {message: 'Authentication failed.'};
				callback(err,null);
			}

	  }
	});


}; // authenticate



