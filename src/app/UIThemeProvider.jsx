"use client";

import React from "react";
import { ThemeProvider } from "@saleor/macaw-ui";
// import '@saleor/macaw-ui/style.css'; // 确保引入样式
import "@saleor/macaw-ui/style";

export default function UIThemeProvider({ children }) {
	return <ThemeProvider>{children}</ThemeProvider>;
}
