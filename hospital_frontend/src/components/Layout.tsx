// src/components/Layout.tsx
import { AppShell } from "@mantine/core";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <div className="container-pro">{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}
