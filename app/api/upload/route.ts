import { uploadFileReq, getUploadList, getFileByKey } from '@/app/services/upload';
import mime from 'mime-types';

export const GET = async (request: Request) => {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (!key) {
        return Response.json({ message: 'Key is required' }, { status: 400 });
    }
    const ext = key.split('.').pop() || '';
    const mimeType = mime.lookup(ext)
    console.log(mimeType)
    const fileContent = await getFileByKey(key);
    return new Response(fileContent, {
        headers: {
            "Content-Type": mimeType + '; charset=utf-8',
        }
    })
}

export const POST = async () => {
    const fileList = await getUploadList();
    return Response.json(fileList)
}

export const PUT = async (request: Request) => {
    const promises = []
    const formData = await request.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
        return Response.json({ message: 'No files uploaded' }, { status: 400 });
    }
    for (const file of files) {
        if (file instanceof Blob) {
            promises.push(uploadFileReq(file));
        }
    }
    await Promise.allSettled(promises)

    return Response.json({ message: 'Files uploaded successfully' });
}