import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import mime from 'mime';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        if (!filename) {
            return new NextResponse('Filename required', { status: 400 });
        }

        // Prevent directory traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), 'uploads', safeFilename);

        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        const contentType = mime.getType(filePath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${safeFilename}"`,
            },
        });

    } catch (error) {
        console.error('File serve error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
