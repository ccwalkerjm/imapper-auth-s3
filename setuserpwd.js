/**
 * CLI utility to create user credentials for imapper-auth-s3
 * 
 * General usage:
 * 		node setuserpwd --user <user> --password <password> [--bucket <S3Bucket>] [--keysuffix <suffix>]
 *
 * where user is a standard email address, password
 * is a string with no spaces, optional S3Bucket is the 
 * S3 bucket to write to, and optional suffix is the 
 * suffix added to the key.
 *
 * If --bucket and/or --keysuffix are omitted, the default 
 * values defined below will be used.
 *
 * Creates a JSON object with two properties, S1 and S2.
 * S1 is the security salt that is generated at runtime
 * S2 is the salted password hash
 *
 * This is then stored in the appropriate S3 bucket
 *
 * NOTE: Make sure the shell account you are using has the 
 * proper credentials to access the AWS account. See the
 * Amazon SDK documentation for details.
 */

var AWS = require('aws-sdk'); 
var jsSHA = require("jssha");


/**
 * Suffix used in the S3 Bucket name after address
 * It is assumed that the bucket is named using the following
 * convention:
 * 
 * user + suffix
 */
var S3BucketName = 'yourBucketName';

/**
 * Name of the object (file) the data is stored in on S3
 */
var S3KeySuffix = '.auth.json';

/*****   *****/
var s3 = new AWS.S3(); 

/** 
 * Extract command-line arguments
 * Works whether using 'node setuserpwd' or 'setuserpwd'
 */

// extract command line argument list
var params = process.argv;

// if the first arg is node then remove the second arg which is the filename
if (params.shift().toLowerCase() == 'node') params.shift();

var arg, 
		user,
		password;

while (arg = params.shift()) {
	switch(arg.toLowerCase()) {
		case '--bucket': 
			S3BucketName = params.shift();
		break;
		case '--keysuffix': 
			S3KeySuffix = params.shift();
		break;
		case '--user': 
			user = params.shift();
		break;
		case '--password': 
			password = params.shift();
		break;
	} // switch
} // while arg


var data = {};

var shaObj = new jsSHA("SHA-1", "TEXT");
// create salt using the current timestamp
shaObj.update(new Date().getTime().toString());
data.S1 = shaObj.getHash("HEX");

shaObj = new jsSHA("SHA-1", "TEXT"); // must get a new object each time
shaObj.update(data.S1 + password);
data.S2  = shaObj.getHash("HEX");

//console.log(data);

/**
 * Now store the data as an object in the bucket
 *
 * Note that S3 doesn't allow the '@' character in its bucket names, 
 * so the '@' in the address gets replaced with '--'.
 */
var bucket = user.replace('@','--') + S3BucketSuffix;

s3.upload({Bucket: bucket, Key: S3KeyName, Body: JSON.stringify(data)}, function(err, response) {
  if (err) {
    console.log("Error uploading data: ", err);
  } else {
    console.log("Uploaded to ",bucket + '/' + S3KeyName);
    console.log(data);
  }
});



