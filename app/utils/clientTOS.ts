// 2. 初始化上传（支持秒传）
export async function initUpload(file: File, fileHash: string): Promise<{ uploadId: string, key: string, message?: string, exists?: boolean }> {
  const res = await fetch('/api/uploadFile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileHash }),
  });
  return res.json();
}
