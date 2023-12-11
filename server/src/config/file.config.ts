import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  defaultS3Bucket: process.env.DEFAULT_S3_BUCKET,
  // defaultS3Url: process.env.DEFAULT_S3_URL,
  // s3Region: process.env.S3_REGION,
  lifespan: process.env.FILE_LIFESPAN,
  deletionCron: process.env.FILE_DELETION_CRON,
  maxDocSize: process.env.FILE_MAX_DOC_SIZE,
  maxImageSize: process.env.FILE_MAX_IMAGE_SIZE,
}));
