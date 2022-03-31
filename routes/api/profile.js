const express = require( 'express' );
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3' );
const multer = require('multer');
const path = require( 'path' );
const childfork = require("child_process");

const router = express.Router();


// Initialize the Amazon Cognito credentials provider
aws.config.region = "us-east-1"; // Region
aws.config.credentials = new aws.CognitoIdentityCredentials({
	IdentityPoolId: "us-east-1:a593a65b-0778-41b9-8cf0-b84370dfcd8e"
});

const s3 = new aws.S3({
	Bucket: 'testbucket-1h'
});


const videoUpload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'testbucket-1h',
		acl: 'public-read',
		key: function (req, file, cb) {
			cb(null, path.basename( "test.mp4", path.extname( file.originalname ) )  + path.extname( 'test.mp4' ) )
		}
	}),
	limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
}).single('video');

var tmp = ""

/**
 * @route POST /api/profile/notify
 * @desc Notify about CNN results
 * @access public
 */
router.post( '/notify', ( req, res ) => {
	tmp = req.body.name
	console.log('filename is ',tmp);
	res.send(req.body);

})

function exec(cmd, handler = function(error, stdout, stderr){console.log(stdout);if(error !== null){console.log(stderr)}})
{
	const childfork = require('child_process');
	return childfork.exec(cmd, handler);
}


/**
 * @route GET /api/profile/execdocker
 * @access public
 */
router.get( '/execfeatures', ( req, res ) => {
	exec('docker run aboshchenko/features-extraction:latest');
	res.json({ result: 'ready' });
})


/**
 * @route GET /api/profile/notify
 * @access public
 */
router.get( '/execnet', ( req, res ) => {
	exec('curl https://testbucket-1h.s3.amazonaws.com/features.npy --output features.npy');
	exec('curl -X POST -F file=features.npy http://localhost:3000/classify');
	exec('rm features.npy')
	res.json({ result: 'ready' });
})


router.get( '/result', ( req, res ) => {
	console.log('get req')
	res.json({ result: tmp });
})


/**
 * @route POST /api/profile/upload
 * @access public
 */
router.post( '/video-upload', ( req, res ) => {
	videoUpload( req, res, ( error ) => {
		console.log( 'request - ok', req.file );
		console.log( 'error', error );
		if( error ){
			console.log( 'errors', error );
			res.json( { error: error } );
		} else {
			// If File not found
			if( req.file === undefined ){
				console.log( 'Error: No File Selected!' );
				res.json( 'Error: No File Selected' );
			} else {
				// If Success
				tmp = ""
				const videoName = 'test.mp4';
				const videoLocation = req.file.location;
				res.json( {
					image: videoName,
					location: videoLocation
				} );
			}
		}
	});
});

module.exports = router;