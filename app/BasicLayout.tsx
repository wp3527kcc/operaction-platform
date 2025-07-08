"use client";
import React, { useState } from "react";
import { CloudUploadOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation'
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";

import "./globals.css";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [

  getItem("首页", "/", <HomeOutlined />),
  getItem("资源上传", "/upload", <CloudUploadOutlined />),
];

const BasicLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["/"]}
          onClick={(e) => {
            router.push(e.key);
          }}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "16px" }}>
          {
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          }
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
