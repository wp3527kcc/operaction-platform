"use server"
import { neon } from "@neondatabase/serverless";
const sql = neon(`${process.env.REMOTE_URL}`);

export const getExecutionLogs = async (current = 1) => {
    const promises = Promise.all([
        sql.query(`select count(*) from script_execution_logs;`),
        sql.query(`select * from script_execution_logs order by id desc offset ${(current - 1) * 10} limit 10;`),
    ]);
    const [[{ count }], rows] = await promises;
    const temp = rows.map((row) =>
        ({ ...row, execution_duration: JSON.stringify(row.execution_duration) })
    );
    return [count, temp]
}

export const getRedisCount = async () =>{
    const redisUrl = 'https://brief-kid-53738.upstash.io/get/' + process.env.REDIS_KEY;
    const rr = await fetch(redisUrl, {
        headers: {
            Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
        }
    });
    const { result } = await rr.json();
    return result
}