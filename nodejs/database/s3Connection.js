const { S3Client } = require('@aws-sdk/client-s3');

const bucketName = process.env.S3_BUCKET_NAME
const bucketRegion = process.env.S3_BUCKET_REGION
const accessKey = process.env.S3_ACCESS_KEY
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});


module.exports = {
    s3: s3,
    bucketName: bucketName,
};