// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextInput, PasswordInput, Button, Title, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../hooks/useAuth";
import GlowCard from "../components/GlowCard";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@hospital.local");
  const [password, setPassword] = useState("ChangeMe_123!");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (!ok) {
      notifications.show({ color: "red", title: "Error", message: "Credenciales inválidas" });
      return;
    }
    notifications.show({ color: "green", title: "Bienvenido", message: "Inicio de sesión correcto" });
    navigate("/", { replace: true });
  }

  return (
    <GlowCard>
    <div className="min-h-screen flex items-center justify-center">
      <Card withBorder shadow="sm" style={{ width: 380 }}>
        <form onSubmit={onSubmit}>
          <Stack>
            <Title order={3}>Iniciar sesión</Title>
            <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
            <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
            <Button type="submit" loading={busy}>Entrar</Button>
          </Stack>
        </form>
      </Card>
    </div>
    </GlowCard>
  );
}

