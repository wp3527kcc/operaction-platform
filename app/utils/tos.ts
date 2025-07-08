// 导入 SDK, 当 TOS Node.JS SDK 版本小于 2.5.2 请把下方 TosClient 改成 TOS 导入
// import { TosClient } from '@volcengine/tos-sdk';
import { TosClient, TosClientError, TosServerError } from '@volcengine/tos-sdk'
const accessKeyId = process.env.TOS_ACCESS_KEY_ID || ""
const accessKeySecret = process.env.TOS_ACCESS_KEY_SECRET || ''
const bucketName = 'tc-prod-fe-staticfile';
const region = process.env.TOS_REGION || '' // 填写 Bucket 所在地域。以华北2（北京)为例，则 "Provide your region" 填写为 cn-beijing。
const endpoint = process.env.TOS_ENDPOINT || '' // 填写域名地址

// 创建客户端
const client = new TosClient({
    accessKeyId,
    accessKeySecret,
    region,
    endpoint
});

function handleError(error: unknown) {
    if (error instanceof TosClientError) {
        console.log('Client Err Msg:', error.message);
        console.log('Client Err Stack:', error.stack);
    } else if (error instanceof TosServerError) {
        console.log('Request ID:', error.requestId);
        console.log('Response Status Code:', error.statusCode);
        console.log('Response Header:', error.headers);
        console.log('Response Err Code:', error.code);
        console.log('Response Err Msg:', error.message);
    } else {
        console.log('unexpected exception, message: ', error);
    }
}

export async function getFile(key: string) {
    try {
        console.log('file key', key)
        const {
            data: { content },
        } = await client.getObjectV2({
            bucket: bucketName,
            key: key,
        });

        // 获取返回的 stream 中的所有内容
        let allContent = Buffer.from([]);
        for await (const chunk of content) {
            allContent = Buffer.concat([allContent, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
        }
        return allContent
    } catch {
        return '404 not found ' + `<h2>${key}</h2>`
    }
}
export async function getFileList() {
    try {
        const { data } = await client.listObjectsType2({
            bucket: bucketName,
            prefix: 'operation-resource/',
        });
        return data.Contents
    } catch (error) {
        handleError(error);
    }
}
export async function uploadFile(filename: string, body: Buffer, folder = '', raw = false) {
    const randomPrefix = Math.random().toString(16).slice(2, 6) + '_';
    const key = folder + (raw ? '' : randomPrefix) + filename
    await client.putObject({
        body,
        key,
        bucket: bucketName,
    });
    return key
}
