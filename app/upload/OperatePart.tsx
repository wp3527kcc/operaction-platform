"use client";
import React from "react";
import { Button, Upload, message, List, Typography, Tooltip } from "antd";
import type { UploadProps, UploadFile, GetProp } from "antd";
import { FolderViewOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const MAXCOUNT = 10;
const MAXSIZE = 1024 * 1024 * 500; // 500MB

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
    fetch("/api/upload")
      .then((res) => res.json())
      .then((value) => setList(value))
      .finally(() => {
        setRefreshLoading(false);
      });
  }
  const handleUpload = () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append(
        "files",
        new Blob([file as FileType], { type: file.type }),
        encodeURIComponent(file.name)
      );
    });
    setUploading(true);
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        refreshList();
        message.success("upload successfully.");
      })
      .catch(() => {
        message.error("upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };
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
        onClick={handleUpload}
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
                  <Paragraph copyable={{ text: item.fileurl }}>
                    {item.filepath}
                    <Tooltip title="点击预览">
                      <Button
                        icon={<FolderViewOutlined />}
                        shape="circle"
                        onClick={() => {
                          window.open(item.fileurl, "_blank");
                        }}
                      />
                    </Tooltip>
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
