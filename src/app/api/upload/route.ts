import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ success: false, error: 'Cloudinary config missing' }, { status: 500 });
        }

        const timestamp = Math.round((new Date()).getTime() / 1000);
        
        // Generate signature
        // Note: Parameters must be sorted alphabetically. Here we only have timestamp.
        const paramsToSign = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', apiKey);
        uploadFormData.append('timestamp', timestamp.toString());
        uploadFormData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: uploadFormData
        });

        const data = await response.json();

        if (data.secure_url) {
            return NextResponse.json({ success: true, url: data.secure_url });
        } else {
            console.error('Cloudinary error:', data);
            return NextResponse.json({ success: false, error: data.error?.message || 'Upload failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
