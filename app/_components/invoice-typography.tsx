"use client";
import { TypographyProps, ConfigProvider, ThemeConfig, Typography } from "antd";
import { CSSProperties } from "react";

type InvoiceTypographyProps = {
  type?:
    | "large"
    | "medium"
    | "small"
    | "small-variant"
    | "body"
    | "body-variant";
} & TypographyProps;

export const InvoiceTypography: React.FC<InvoiceTypographyProps> = ({
  type = "large",
  ...rest
}) => (
  <ConfigProvider
    theme={{
      token: { fontFamily: "League Spartan" },
      components: generateTypography(type),
    }}
  >
    <Typography.Text
      {...rest}
      style={{ ...TYPOGRAPHY_STYLE_MAP[type], ...rest.style }}
    />
  </ConfigProvider>
);

const generateTypography: (
  type: InvoiceTypographyProps["type"],
) => ThemeConfig["components"] = () => {
  return {
    Typography: {
      colorText: "#0C0E16",
      fontFamily: "League Spartan",
      fontFamilyCode: "League Spartan",
    },
  };
};

const TYPOGRAPHY_STYLE_MAP: Partial<
  Record<NonNullable<InvoiceTypographyProps["type"]>, CSSProperties>
> = {
  large: {
    fontWeight: 700,
    letterSpacing: -1.125,
    lineHeight: "33px",
    fontSize: 36,
  },
  medium: {
    fontWeight: 700,
    letterSpacing: -0.75,
    lineHeight: "22px",
    fontSize: 24,
  },
  small: {
    fontWeight: 700,
    letterSpacing: -0.25,
    lineHeight: "24px",
    fontSize: 15,
  },
  "small-variant": {
    fontWeight: 700,
    letterSpacing: -0.25,
    lineHeight: "15px",
    fontSize: 15,
  },
  body: {
    fontWeight: 700,
    letterSpacing: -0.1,
    lineHeight: "18px",
    fontSize: 13,
  },
  "body-variant": {
    fontWeight: 700,
    letterSpacing: -0.25,
    lineHeight: "15px",
    fontSize: 13,
  },
};
