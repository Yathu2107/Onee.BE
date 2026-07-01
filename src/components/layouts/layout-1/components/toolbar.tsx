import { Breadcrumb } from './breadcrumb'

interface ToolbarProps {
  title: string
  description?: string
}

export function Toolbar({ title, description }: ToolbarProps) {
  return (
    <div className="border-border bg-card border-b px-5 py-5">
      <Breadcrumb />
      <div className="mt-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
      </div>
    </div>
  )
}
