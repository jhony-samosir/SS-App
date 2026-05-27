import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] || Icons.Circle;
  return <IconComponent {...props} />;
}
