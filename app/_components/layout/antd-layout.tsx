"use client";

import { Flex, Layout } from "antd";
import { PropsWithChildren } from "react";
import { SiderLogo } from "./sider-logo";

export const AntdLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Layout style={{ backgroundColor: "#F8F8FB" }}>
      <Layout.Sider
        width="103px"
        style={{
          borderRadius: "0px 20px 20px 0px",
          backgroundColor: "#373B53",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
        }}
      >
        <SiderLogo />
      </Layout.Sider>
      <Layout.Content style={{ backgroundColor: "#F8F8FB", marginTop: 65 }}>
        <Flex justify="center">
          <div style={{ width: 730 }}>{children}</div>
        </Flex>
      </Layout.Content>
    </Layout>
  );
};
