import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  const { to, subject, body } = req.body || {};

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject and body are required.' });
  }

  if (!isValidEmail(String(to))) {
    return res.status(400).json({ error: 'Invalid recipient email.' });
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  const source = process.env.SES_EMAIL;
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!source || !awsAccessKey || !awsSecretKey) {
    console.warn('SES environment missing. Returning mock email response.');
    return res.status(200).json({
      isMock: true,
      messageId: `mock-${Date.now()}`,
    });
  }

  try {
    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });

    const command = new SendEmailCommand({
      Source: source,
      Destination: { ToAddresses: [String(to)] },
      Message: {
        Subject: { Data: String(subject), Charset: 'UTF-8' },
        Body: { Text: { Data: String(body), Charset: 'UTF-8' } },
      },
    });

    const response = await sesClient.send(command);

    return res.status(200).json({
      isMock: false,
      messageId: response.MessageId,
    });
  } catch (error: any) {
    console.error('Error sending SES email:', error);
    return res.status(500).json({
      error: 'Failed to send email.',
      details: error.message,
    });
  }
}
