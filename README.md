# imapper-auth-s3
imapper-auth-s3 is a a S3-based authentication plugin for imapper. It uses an S3 bucket to store a mailbox user's password credentials. User credentials are stored as a JSON file named after the username plus a suffix. 

Since S3 does not allow the `@` character in its bucket or file names, the `@` is converted to two hyphens `--`. So a user named after the email address such as `user@email.com` would get converted to `user--email.com`.

## Configuration
imapper-auth-s3 uses the Amazon SDK. Make sure you have set up the SDK per the [Amazon JavaScript SDK Getting Started Guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

Add imapper-auth-s3 to your node project using `npm`:
```sh
npm install imapper-auth-s3 --save
```
Import the auth module and configure the S3 options: 
```javascript
var userAuth = require("imapper-auth-s3");
userAuth.setS3Options('S3BucketName', 'YourS3Bucket');
userAuth.setS3Options('S3KeySuffix', '.suffix'); // key suffix. Default is '.auth.json'
```
Then add the auth module to the imapper configuration options:
```javascript
var options = {
	users: userAuth,
    ...
};
var server = imapper(options);
server.listen(143);
```
See the [imapper documentation](https://www.npmjs.com/package/imapper) for more details.

## Setting user passwords
Included is a command-line-utility `setuserpwd.js` that is used to create the user credential file and store it in the S3 bucket. To use it, call it from the imapper-auth-s3 directory as follows:
```sh
node setuserpwd --user <user> --password <password> [--bucket <S3Bucket>] [--keysuffix <suffix>]
```
### Command-line arguments:
* `--user` : The username for the account. Email addresses are common.
* `--password` : The password to use.  
* `--bucket` : The name of the S3 bucket where the file will be stored.
* `--suffix` : The suffix added to the file name.

`--bucket` and `--suffix` are optional parameters. If omitted, the defaults will be used. The default suffix is '.auth.json', while the default bucket is 'YourBucketName'. These may be changed by changing the vars `S3KeySuffix` and `S3BucketName` in `setuserpwd.js` respectively.

**IMPORTANT NOTE:** Make sure that the suffix used in `setuserpwd.js` matches the one used in `imapper-auth-s3`!

## License
**MIT**
