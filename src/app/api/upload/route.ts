import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { images, patientId } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];

      // If it's already an uploaded/external URL, keep it as is
      if (dataUrl.startsWith('http') || dataUrl.startsWith('/api/images')) {
        uploadedUrls.push(dataUrl);
        continue;
      }

      // Check if it's a valid data URL
      const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: `Invalid image data format for image at index ${i}` },
          { status: 400 }
        );
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate a clean and unique filename
      const extension = contentType.split('/')[1] || 'jpg';
      const cleanPatientId = (patientId || 'patient').replace(/[^a-zA-Z0-9-_]/g, '');
      const filename = `${cleanPatientId}_${crypto.randomUUID()}.${extension}`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: contentType,
        })
      );

      uploadedUrls.push(`/api/images/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error('Error uploading images to R2:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload images' }, { status: 500 });
  }
}
