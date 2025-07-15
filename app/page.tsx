import React from "react";
import { connection } from "next/server";
import ExecutionLogs from "./components/ExecutionLogs";
import { getExecutionLogs } from "./services/executionLogs";

export default async function Home() {
  const [count, rows] = await getExecutionLogs();
  await connection(); // 用于禁用缓存

  return (
    <div>
      <ExecutionLogs
        initCount={count}
        initList={
          rows as {
            effect_rows: number;
            start_time: string;
            end_time: string;
            id: number;
            output: string;
          }[]
        }
      />
    </div>
  );
}
