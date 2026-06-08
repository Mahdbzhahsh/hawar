import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  endpoint: process.env.r2_endpoint || '',
  credentials: {
    accessKeyId: process.env.Access_Key_ID || '',
    secretAccessKey: process.env.Secret_Access_Key || '',
  },
  region: 'auto',
});

export const BUCKET_NAME = process.env.bucket_name || 'drhawar';
