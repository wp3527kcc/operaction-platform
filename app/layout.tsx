import React from "react";
// import { AntdRegistry } from "@ant-design/nextjs-registry";
import BasicLayout from "./BasicLayout";
import AntdRegistry from "./components/AntdRegistry";

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>
        <BasicLayout>{children}</BasicLayout>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
