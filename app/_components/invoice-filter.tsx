"use client";

import { InvoiceTypography } from "@components";
import { Button, Dropdown, MenuProps } from "antd";
import { PropsWithChildren } from "react";

export const InvoiceFilter: React.FC<
  { menuProps?: MenuProps } & PropsWithChildren
> = ({ children, menuProps }) => {
  return (
    <Dropdown trigger={["click"]} menu={menuProps}>
      <Button
        type="text"
        style={{ height: 48, borderRadius: 24, marginInlineEnd: -15 }}
      >
        <InvoiceTypography type="small-variant" style={{ marginInlineEnd: 14 }}>
          {children}
        </InvoiceTypography>
        <svg
          width="10"
          height="7"
          viewBox="0 0 10 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.707031 0.707153L4.93493 4.93505L9.16283 0.707153"
            stroke="#7C5DFA"
            strokeWidth="2"
          />
        </svg>
      </Button>
    </Dropdown>
  );
};
