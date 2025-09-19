import { Group, Title, Text, Breadcrumbs, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";

export function AppBreadcrumbs({ items }: { items: (string | { label: string; to: string })[] }) {
  const nodes = items.map((it, i) =>
    typeof it === "string" ? (
      <Text key={i} c="dimmed">
        {it}
      </Text>
    ) : (
      <Anchor key={it.to} component={Link} to={it.to}>
        {it.label}
      </Anchor>
    )
  );
  return <Breadcrumbs mb="xs">{nodes}</Breadcrumbs>;
}

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Group justify="space-between" mb="lg">
      <div>
        <Title order={2} style={{ letterSpacing: "-0.02em" }}>
          {title}
        </Title>
        {subtitle && (
          <Text c="dimmed" mt={4}>
            {subtitle}
          </Text>
        )}
      </div>
    </Group>
  );
}
