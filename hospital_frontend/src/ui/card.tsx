import { cn } from "./cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card card-surface", className)}>{children}</div>;
}
export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-500">{subtitle}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}
export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">{children}</div>;
}
