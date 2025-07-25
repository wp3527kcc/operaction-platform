import SparkMD5 from 'spark-md5';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// 1. 计算文件 hash
async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer);
      currentChunk++;
      if (currentChunk < chunkCount) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };
    fileReader.onerror = () => reject('文件读取失败');
    function loadNext() {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }
    loadNext();
  });
}

// 2. 初始化上传（支持秒传）
export async function initUpload(file: File, fileHash: string): Promise<{ uploadId: string, key: string, message?: string, exists?: boolean }> {
  const res = await fetch('/api/uploadFile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileHash }),
  });
  return res.json();
}

// 3. 查询已上传分片
export async function getUploadedParts(uploadId: string, key: string) {
  const res = await fetch('/api/upload', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, key }),
  });
  return res.json();
}

// 4. 分片直传 TOS（需用 TOS SDK 或签名URL，以下为伪代码）
export async function uploadPartToTOS({ file, key, uploadId, partNumber, chunk }) {
  // 这里建议后端返回分片上传签名URL，前端直接PUT
  // 伪代码：await fetch(signedUrl, { method: 'PUT', body: chunk });
  // 或用 TOS JS SDK
}

// 5. 合并分片
export async function completeUpload({ uploadId, key, fileName, fileHash, totalChunks, parts }) {
  await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, key, fileName, fileHash, totalChunks, parts }),
  });
}

// 6. 主流程
export async function handleUpload(file: File) {
  const fileHash = await calculateFileHash(file);
  // 1. 初始化
  const initRes = await initUpload(file, fileHash);
  if (initRes.exists) {
    // 秒传成功
    // TODO: 展示已存在文件
    return;
  }
  const { uploadId, key } = initRes;
  // 2. 查询已上传分片
  const { uploaded } = await getUploadedParts(uploadId, key);
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  const parts = [];
  for (let i = 0; i < chunkCount; i++) {
    if (uploaded.includes(i + 1)) continue; // 跳过已上传
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);
    // 3. 上传分片到 TOS
    const partRes = await uploadPartToTOS({ file, key, uploadId, partNumber: i + 1, chunk });
    parts.push({ partNumber: i + 1, etag: partRes.etag });
  }
  // 4. 合并分片
  await completeUpload({ uploadId, key, fileName: file.name, fileHash, totalChunks: chunkCount, parts });
}