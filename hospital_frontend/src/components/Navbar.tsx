// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { Button, Group } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";

const tabs: { to: string; label: string }[] = [
  { to: "/", label: "Dashboard" },
  { to: "/triage", label: "Nuevo triaje" },
  { to: "/patients", label: "Pacientes" },
  { to: "/history", label: "Historial" },
  { to: "/reports", label: "Reportes" },
  { to: "/ai", label: "IA" },
  { to: "/admin/users", label: "Usuarios" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between px-4" style={{ height: 60 }}>
      <div className="font-semibold">HOSPITAL</div>
      <Group gap="xs">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={pathname === t.to ? "text-[--mantine-color-blue-6] font-medium" : "text-gray-700"}
          >
            {t.label}
          </Link>
        ))}
      </Group>
      <Group gap="sm">
<div className="text-sm text-gray-600">{user?.email ?? "—"}</div>
        <Button size="xs" variant="light" onClick={logout}>
          Salir
        </Button>
      </Group>
    </div>
  );
}
