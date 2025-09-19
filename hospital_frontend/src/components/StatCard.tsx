import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import GlowCard from "./GlowCard";

export default function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <GlowCard>
      <Group align="flex-start" justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        {icon}
      </Group>
      <Text fw={800} fz={34} lh={1.2}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed" mt={6}>
          {hint}
        </Text>
      )}
    </GlowCard>
  );
}
