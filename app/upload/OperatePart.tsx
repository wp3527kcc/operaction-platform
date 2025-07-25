"use client";
import React from "react";
import SparkMD5 from "spark-md5";
import {
  Button,
  Upload,
  message,
  List,
  Typography,
  Tooltip,
  Space,
} from "antd";
import { FolderViewOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile, GetProp } from "antd";
import { initUpload } from "../utils/clientTOS";

const { Paragraph } = Typography;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const MAXCOUNT = 10;
const MAXSIZE = 1024 * 1024 * 500; // 500MB

// 新增分片上传相关常量
const CHUNK_SIZE = 1 * 1024 * 1024; // 5MB

const App: React.FC<{
  initFileList: { id: number; fileurl: string; filepath: string }[];
}> = ({ initFileList }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [list, setList] = React.useState(initFileList);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [refreshLoading, setRefreshLoading] = React.useState(false);

  const props: UploadProps = {
    name: "file",
    multiple: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((fileList) => {
        if (fileList.length >= MAXCOUNT) {
          messageApi.error(`单次最多只能上传 ${MAXCOUNT} 个文件`);
          return fileList;
        }
        if (file.size > MAXSIZE) {
          messageApi.error(`单个文件大小不能超过 ${MAXSIZE / 1024 / 1024} MB`);
          return fileList;
        }
        return [...fileList, file];
      });
      return false;
    },
    fileList,
  };
  function refreshList() {
    setRefreshLoading(true);
    fetch("/api/upload", { method: "POST" })
      .then((res) => res.json())
      .then((value) => setList(value))
      .finally(() => {
        setRefreshLoading(false);
      });
  }
  const handleChunkUpload = async () => {
    if (fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of fileList) {
        const rawFile = file as FileType;
        // 1. 计算文件 hash
        const hash = await calculateFileHash(rawFile);
        const chunkCount = Math.ceil(rawFile.size / CHUNK_SIZE);
        const {
          uploadId,
          key,
          exists,
          message: msg,
        } = await initUpload(rawFile, hash);
        if (exists) {
          messageApi.success(msg);
          return;
        }
        const promises = [];
        // 2. 分片上传
        for (let i = 0; i < chunkCount; i++) {
          const partNumber = i + 1; // partNumber 从 1 开始
          const start = i * CHUNK_SIZE;
          const end = Math.min(rawFile.size, start + CHUNK_SIZE);
          const chunk = rawFile.slice(start, end);
          const formData = new FormData();
          formData.append(
            "file",
            new Blob([chunk as FileType], { type: rawFile.type })
          );
          formData.append("UploadId", uploadId);
          formData.append("partNumber", partNumber + "");
          formData.append("objectName", key);
          promises.push(
            new Promise((resolve, reject) => {
              fetch("/api/uploadFile", {
                method: "PUT",
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  resolve({
                    eTag: data.data.ETag,
                    partNumber,
                  });
                })
                .catch(reject);
            })
          );
        }
        // 3. 通知后端合并分片
        const result = await fetch("/api/uploadFile", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId,
            hash,
            key: key,
            parts: await Promise.all(promises),
          }),
        });
        messageApi.success((await result.json()).message);
      }
      setFileList([]);
      refreshList();
    } catch {
      messageApi.error("upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // 计算文件 hash
  async function calculateFileHash(file: FileType): Promise<string> {
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
      fileReader.onerror = () => reject("文件读取失败");
      function loadNext() {
        const start = currentChunk * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      }
      loadNext();
    });
  }
  return (
    <>
      {contextHolder}
      <div style={{ maxWidth: 400 }}>
        <Upload {...props}>
          <Button type="primary">选择文件</Button>
        </Upload>
      </div>
      <Button
        type="primary"
        onClick={handleChunkUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
      <List
        style={{ marginTop: 16 }}
        itemLayout="horizontal"
        dataSource={list}
        loading={refreshLoading}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <>
                  <Paragraph
                    copyable={{
                      text: item.fileurl,
                    }}
                  >
                    <Space>
                      {item.filepath}
                      <Tooltip title="点击预览">
                        <FolderViewOutlined
                          onClick={() => {
                            window.open(item.fileurl, "_blank");
                          }}
                        />
                      </Tooltip>
                      <DeleteOutlined
                        onClick={() => {
                          fetch(`/api/upload?key=${item.id}`, {
                            method: "DELETE",
                          })
                            .then((res) => res.json())
                            .then((result) => {
                              messageApi.success("删除成功");
                              setList(result.rows);
                            })
                            .catch(() => {
                              messageApi.error("删除失败");
                            });
                        }}
                      />
                    </Space>
                  </Paragraph>
                </>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

export default App;
