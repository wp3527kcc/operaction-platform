import React from "react";
// import { AntdRegistry } from "@ant-design/nextjs-registry";
import BasicLayout from "./BasicLayout";
import AntdRegistry from './components/AntdRegistry';

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <BasicLayout>
        <AntdRegistry>{children}</AntdRegistry>
      </BasicLayout>
    </body>
  </html>
);

export default RootLayout;
