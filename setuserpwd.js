var AWS = require('aws-sdk'); 
var jsSHA = require("jssha");

/**
 *
 * This file assumes it's being called using the syntax
 *
 * 		node setuserpwd user password
 *
 * where user is a standard email address and password
 * is a string with no spaces
 *
 * Creates a JSON object with two properties, S1 and S2.
 * S1 is the security salt that is generated at runtime
 * S2 is the salted password hash
 *
 * This is then stored in the appropriate S3 bucket
 */


/**
 * Suffix used in the S3 Bucket name after address
 * It is assumed that the bucket is named using the following
 * convention:
 * 
 * user + suffix
 */
var S3BucketSuffix = '.ses.inbound';

/**
 * Name of the object (file) the data is stored in on S3
 */
var S3KeyName = 'auth.json';

/*****   *****/
var s3 = new AWS.S3(); 

// extract command line argument list
var params = process.argv;

// remove first two params and store the next two
params.shift();
params.shift();
var user = params.shift();
var password = params.shift();

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



