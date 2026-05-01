export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="panel p-10 text-center">
      {icon && <div className="flex justify-center text-muted-foreground mb-4">{icon}</div>}
      <h3 className="font-semibold mb-2">{title}</h3>
      {body && <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{body}</p>}
      {action}
    </div>
  );
}