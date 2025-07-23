"use client";
import { Table, Button, Modal, Statistic, Space } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getExecutionLogs, getRedisCount } from "../services/executionLogs";

const ModalColumns = [
  {
    title: "点赞数",
    dataIndex: "favoriteCount",
    key: "favoriteCount",
    widht: 160,
  },
  {
    title: "消息",
    dataIndex: "message",
    key: "message",
    width: 120,
  },
  {
    title: "积分",
    dataIndex: "point",
    key: "point",
    width: 120,
  },
  {
    title: "结果",
    dataIndex: "result",
    key: "result",
  },
  {
    title: "帖子ID",
    dataIndex: "post_id",
    key: "post_id",
    render: (post_id: string) => (
      <a href={`https://tuchong.com/2501770/${post_id}`} target="_blank">{post_id}</a>
    ),
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "刷取阅读数",
    dataIndex: "readCount",
    key: "readCount",
  },
];

const ExecutionLogs: React.FC<{
  initList: {
    effect_rows: number;
    start_time: string;
    end_time: string;
    id: number;
    output: string;
    userName: string;
  }[];
  initCount: number;
  initRedisCount: number
}> = ({ initList, initCount, initRedisCount }) => {
  const [list, setList] = useState(initList);
  const [count, setCount] = useState(initCount);
  const [loading, setLoading] = useState(false);
  const [currentOutput, setCurrentOutput] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [redisCount, setRedisCount] = useState(initRedisCount);
  useEffect(() => {
    getRedisCount().then(setRedisCount);
  }, []);
  return (
    <>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space align="center">
          <Statistic title="执行次数" value={redisCount} />
          <Button
            onClick={() => getRedisCount().then(setRedisCount)}
            type="link"
          >
            refresh
          </Button>
        </Space>
        <h2>执行记录</h2>
        <Table
          loading={loading}
          dataSource={list.map(
            ({ effect_rows, start_time, end_time, id, output, userName }) => ({
              effect_rows,
              userName,
              start_time: start_time
                ? dayjs(start_time).format("YYYY-MM-DD HH:mm:ss")
                : "-",
              end_time: end_time
                ? dayjs(end_time).format("YYYY-MM-DD HH:mm:ss")
                : "-",
              id,
              output: output ? JSON.parse(output) : {},
            })
          )}
          rowKey={"id"}
          columns={[
            { dataIndex: "start_time", title: "Start Time" },
            { dataIndex: "end_time", title: "End Time" },
            { dataIndex: "effect_rows", title: "Effect Rows" },
            { dataIndex: "userName", title: "userName" },
            {
              dataIndex: "output",
              title: "output",
              width: 120,
              render: (output) => {
                return (
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentOutput(output);
                      setModalVisible(true);
                    }}
                  >
                    查看
                  </Button>
                );
              },
            },
          ]}
          pagination={{
            total: count,
          }}
          onChange={async ({ current }) => {
            try {
              setLoading(true);
              const [[count, rows], rdCou] = await Promise.all([getExecutionLogs(current), getRedisCount()]);
              // const result = await fetch("/api/executionLog?current=" + current);
              // const { count, rows } = await result.json();
              setRedisCount(rdCou)
              setList(rows);
              setCount(count);
            } finally {
              setLoading(false);
            }
          }}
        />
      </Space>
      <Modal
        open={modalVisible}
        width={900}
        onCancel={() => {
          setModalVisible(false);
        }}
      >
        {currentOutput && (
          <Table
            columns={ModalColumns}
            dataSource={currentOutput}
            rowKey="post_id"
          />
        )}
      </Modal>
    </>
  );
};
export default ExecutionLogs;
