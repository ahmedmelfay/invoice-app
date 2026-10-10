"use client";

import { Flex } from "antd";

const LOGO_SIZE_MAP: Record<
  "desktop" | "tablet" | "mobile",
  React.JSX.Element
> = {
  desktop: (
    <svg
      width="40"
      height="38"
      viewBox="0 0 40 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6942 0L20 18.7078L29.3058 4.74611e-08C35.6645 3.34856 40 10.0219 40 17.7078C40 28.7535 31.0457 37.7078 20 37.7078C8.9543 37.7078 0 28.7535 0 17.7078C0 10.0219 4.33546 3.34856 10.6942 0Z"
        fill="white"
      />
    </svg>
  ),
  tablet: (
    <svg
      width="31"
      height="29"
      viewBox="0 0 31 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.28804 7.4459e-05L15.5 14.3877L22.712 7.4801e-05C27.64 2.57535 31 7.70759 31 13.6186C31 22.1135 24.0604 29 15.5 29C6.93959 29 0 22.1135 0 13.6186C0 7.70759 3.35998 2.57535 8.28804 7.4459e-05Z"
        fill="white"
      />
    </svg>
  ),
  mobile: (
    <svg
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.48597 0.000311013L14 12.8995L20.514 0.000310863C24.9652 2.30918 28 6.9105 28 12.21C28 19.8261 21.732 26.0002 14 26.0002C6.26801 26.0002 0 19.8261 0 12.21C0 6.9105 3.03482 2.30918 7.48597 0.000311013Z"
        fill="white"
      />
    </svg>
  ),
};

export const SiderLogo: React.FC<{
  type?: "desktop" | "tablet" | "mobile";
}> = ({ type = "desktop" }) => (
  <Flex
    justify="center"
    align="center"
    style={{
      width: "100%",
      height: 103,
      position: "sticky",
      backgroundColor: "#7C5DFA",
      borderBottomRightRadius: 20,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "relative", zIndex: 2 }}>{LOGO_SIZE_MAP[type]}</div>

    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "50%",
        width: "100%",
        backgroundColor: "#9277FF",
        borderTopLeftRadius: 20,
        zIndex: 1,
      }}
    />
  </Flex>
);
