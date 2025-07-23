import React from "react";
import { connection } from "next/server";
import ExecutionLogs from "./components/ExecutionLogs";
import { getExecutionLogs, getRedisCount } from "./services/executionLogs";

export default async function Home() {
  // const [[count, rows], redisCount] = await Promise.all([getExecutionLogs(), getRedisCount()]);
  const [count, rows] = await getExecutionLogs()
  const redisCount = await getRedisCount()
  await connection(); // 用于禁用缓存
  return (
    <div>
      <ExecutionLogs
        initCount={count}
        initRedisCount={redisCount}
        initList={
          rows as {
            effect_rows: number;
            start_time: string;
            end_time: string;
            id: number;
            output: string;
            userName: string;
          }[]
        }
      />
    </div>
  );
}
