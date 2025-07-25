import { getUploadList, getFileByKey, deleteFileByKey } from '@/app/services/upload';
import mime from 'mime-types';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) {
    return Response.json({ message: 'Key is required' }, { status: 400 });
  }
  const ext = key.split('.').pop() || '';
  const mimeType = mime.lookup(ext);
  const fileContent = await getFileByKey(key);
  return new Response(fileContent, {
    headers: {
      'Content-Type': mimeType + '; charset=utf-8',
    },
  });
};

// 获取上传列表
export const POST = async () => {
  const fileList = await getUploadList();
  return Response.json(fileList);
};

// 删除文件（保留）
export const DELETE = async (request: Request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) {
    return Response.json({ message: 'Key is required' }, { status: 400 });
  }
  await deleteFileByKey(key);
  return Response.json({ message: `File with key ${key} deleted successfully`, rows: await getUploadList() });
};
