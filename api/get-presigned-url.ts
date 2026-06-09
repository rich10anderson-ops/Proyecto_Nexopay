import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'documento';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { filename, filetype, filesize, folder = 'identity-documents' } = req.body || {};

  if (!filename || !filetype) {
    return res.status(400).json({ error: 'filename and filetype parameters are required.' });
  }

  if (filesize && Number(filesize) > MAX_UPLOAD_SIZE) {
    return res.status(413).json({ error: 'File is too large. Maximum upload size is 10MB.' });
  }

  if (!/^image\/|application\/pdf$/.test(filetype)) {
    return res.status(400).json({ error: 'Only images and PDF documents are allowed.' });
  }

  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';
  const expiresIn = Number(process.env.S3_PRESIGNED_EXPIRES_IN || 300);
  const safeFolder = String(folder).replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '') || 'uploads';

  if (!awsAccessKey || !awsSecretKey || !bucketName) {
    console.warn('AWS upload environment missing. Instructing client to use local Base64 fallback.');
    return res.status(200).json({
      isMock: true,
      uploadUrl: '',
      fileUrl: '',
      key: '',
      expiresIn,
    });
  }

  try {
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const fileKey = `${safeFolder}/${Date.now()}-${sanitizeFilename(filename)}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: filetype,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      isMock: false,
      uploadUrl,
      fileUrl,
      key: fileKey,
      expiresIn,
    });
  } catch (error: any) {
    console.error('Error generating S3 presigned URL:', error);
    return res.status(500).json({
      error: 'Failed to generate presigned upload URL.',
      details: error.message,
    });
  }
}
