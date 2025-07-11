import { pool } from "../utils/db"
import { uploadFile, getFile } from "../utils/tos"

export async function getUploadList() {
    const result = await pool.query(`SELECT id, fileurl, filepath FROM upload_history where create_by = ? ORDER BY create_time DESC`, ['admin']);
    return result[0] as { id: number; fileurl: string; filepath: string }[]
}

export async function uploadFileReq(file: File) {
    const fileName = encodeURIComponent(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tosResult = await uploadFile(fileName, buffer, 'operation-resource/');
    await pool.query('INSERT INTO upload_history (filepath, fileurl, create_by) VALUES (?, ?, ?)', [tosResult, `${process.env.CDNBASEURL}${tosResult}`, 'admin']);
    return tosResult;
}

export async function getFileByKey(key: string) {
    return getFile(key)
}