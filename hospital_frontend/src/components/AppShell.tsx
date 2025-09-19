import {
  AppShell as MantineAppShell,
  AppShellHeader,
  AppShellNavbar,
  Burger,
  Group,
  Avatar,
  Text,
  UnstyledButton,
  NavLink,
  ScrollArea,
  Paper,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ActivitySquare,
  ClipboardList,
  Users2,
  BarChart3,
  History,
  Bot,
  Stethoscope,
  LogOut,
} from "lucide-react";
import type { PropsWithChildren } from "react";
import { useAuth } from "../hooks/useAuth";
import AppBackground from "./AppBackground";

const NAV = [
  { to: "/", label: "Dashboard", icon: ActivitySquare },
  { to: "/triage", label: "Nuevo triaje", icon: Stethoscope },
  { to: "/patients", label: "Pacientes", icon: Users2 },
  { to: "/history", label: "Historial", icon: History },
  { to: "/reports", label: "Reportes", icon: BarChart3 },
  { to: "/ai", label: "Consultor IA", icon: Bot },
];

export default function AppShell({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <AppBackground />
      <MantineAppShell
        header={{ height: 68 }}
        navbar={{ width: 268, breakpoint: "sm", collapsed: { mobile: !opened } }}
        padding="lg"
        style={{ position: "relative", zIndex: 1 }}
      >
        <AppShellHeader>
          <Paper
            withBorder
            radius="lg"
            p="sm"
            style={{
              height: "100%",
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.55))",
              borderColor: "rgba(0,0,0,.06)",
              boxShadow: "0 10px 24px rgba(16,24,40,.08)",
            }}
          >
            <Group h="100%" px="sm" justify="space-between">
              <Group gap="sm">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  aria-label="Toggle navigation"
                />
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Group gap={8}>
                    <ClipboardList size={18} />
                    <Text fw={900} size="lg" c="dark" style={{ letterSpacing: "-0.02em" }}>
                      HOSPITAL
                    </Text>
                  </Group>
                </Link>
              </Group>

              <Group gap="sm">
                <Avatar radius="xl" size={30} color="indigo">
                  {user?.email?.[0]?.toUpperCase() ?? "A"}
                </Avatar>
                <Text size="sm" c="dimmed">
                  {user?.email ?? "—"}
                </Text>
                <UnstyledButton
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  title="Salir"
                  style={{ padding: rem(8), borderRadius: 10 }}
                >
                  <Group gap={6}>
                    <LogOut size={18} />
                    <Text size="sm">Salir</Text>
                  </Group>
                </UnstyledButton>
              </Group>
            </Group>
          </Paper>
        </AppShellHeader>

        <AppShellNavbar p="sm">
          <Paper
            withBorder
            radius="lg"
            p="xs"
            style={{
              height: "100%",
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.62), rgba(255,255,255,.5))",
              borderColor: "rgba(0,0,0,.06)",
              boxShadow: "0 10px 24px rgba(16,24,40,.08)",
            }}
          >
            <ScrollArea type="hover" style={{ height: "100%" }}>
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    component={Link}
                    to={item.to}
                    label={item.label}
                    leftSection={<Icon size={18} />}
                    active={active}
                    variant="light"
                    styles={{
                      root: {
                        borderRadius: 12,
                        marginBottom: 8,
                        fontWeight: 600,
                      },
                      label: { letterSpacing: ".01em" },
                    }}
                  />
                );
              })}
            </ScrollArea>
          </Paper>
        </AppShellNavbar>

        <MantineAppShell.Main>
          {/* padding y ancho máximo para que no se vea vacío */}
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 32 }}>
            {children}
          </div>
        </MantineAppShell.Main>
      </MantineAppShell>
    </>
  );
}
