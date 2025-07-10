import { uploadFileReq, getUploadList } from '@/app/services/upload';

export const GET = async () => {
    const fileList = await getUploadList();
    return Response.json(fileList)
}

export const POST = async (request: Request) => {
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