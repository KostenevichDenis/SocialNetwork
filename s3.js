const crypto = require("crypto");
let util = require("util");
const bucketName = "denver.social.images";
const aws = require('aws-sdk');
const randomBytes = util.promisify(crypto.randomBytes);
const region = "eu-central-1";
const accessKeyID = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const accessKeyID_admin = process.env.AWS_ACCESS_KEY_ID_ADMIN;
const secretAccessKey_admin = process.env.AWS_SECRET_ACCESS_KEY_ADMIN;

const S3 = new aws.S3({
    region,
    accessKeyID,
    secretAccessKey,
    signatureVersion: "v4"
    }
);

async function deleteUserAvatar (url) {
    const params = {
        Bucket: bucketName, 
        Key: url
       };
    
    S3.config.update({
        accessKeyId: accessKeyID,
        secretAccessKey: secretAccessKey
    })

    S3.config.update({
        accessKeyId: accessKeyID_admin,
        secretAccessKey: secretAccessKey_admin
    })

    console.log(`bucket: ${bucketName}`);
/*     console.log(`accessKeyID_admin: ${accessKeyID_admin}`);
    console.log(`secretAccessKey_admin: ${secretAccessKey_admin}`); */
    console.log(`url: ${url}`);
    
    const result = S3.deleteObject(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else     console.log(`READY: data`);           // successful response
         /*
         data = {
         }
         */
       });
    return result
};

async function generateUploadURL() {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');
    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    })
    const uploadURL = await S3.getSignedUrlPromise('putObject', params);
    return uploadURL 
};

module.exports = {generateUploadURL, deleteUserAvatar};