import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  let filename = '';
  try {
    const resolvedParams = await params;
    filename = resolvedParams.filename;

    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
      })
    );

    if (!response.Body) {
      return new Response('Not Found', { status: 404 });
    }

    const bytes = await response.Body.transformToByteArray();

    return new Response(bytes, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    // If the file is not found in R2 or endpoint failed
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`[R2 GET] Image not found in bucket ${BUCKET_NAME}: ${filename}`);
      return new Response('Image Not Found', { status: 404 });
    }
    console.error('Image retrieval error:', error);
    return new Response('Image Not Found', { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  let filename = '';
  try {
    const resolvedParams = await params;
    filename = resolvedParams.filename;

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
      })
    );

    return Response.json({ success: true });
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`[R2 DELETE] Image to delete not found in bucket ${BUCKET_NAME}: ${filename}`);
      return Response.json({ success: true }); // Still return success since the file is not there anyway
    }
    console.error('Image deletion error:', error);
    return Response.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
