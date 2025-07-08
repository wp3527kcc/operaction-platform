import mysql2 from 'mysql2/promise';
import { uploadFile } from '../../utils/tos';

const pool = mysql2.createPool({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const GET = async () => {
    // const tosList = await getFileList();
    const [fileList] = await pool.query(`SELECT * FROM upload_history where create_by = '${'admin'}' ORDER BY create_time DESC`);
    return Response.json(fileList)
}
export const POST = async (request: Request) => {
    const formData = await request.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
        return Response.json({ message: 'No files uploaded' }, { status: 400 });
    }

    const fileUrls = [];
    for (const file of files) {
        if (file instanceof Blob) {
            const fileName = encodeURIComponent(file.name);
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const tosResult = await uploadFile(fileName, buffer, 'operation-resource/');
            fileUrls.push({ filepath: tosResult, fileurl: `${process.env.CDNBASEURL}${tosResult}` });
        }
    }

    for (const file of fileUrls) {
        await pool.query('INSERT INTO upload_history (filepath, fileurl, create_by) VALUES (?, ?, ?)', [file.filepath, file.fileurl, 'admin']);
    }

    return Response.json(fileUrls);
}