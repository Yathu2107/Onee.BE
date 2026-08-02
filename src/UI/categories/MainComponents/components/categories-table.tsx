import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CategoryListItem } from '../core/types'

interface CategoriesTableProps {
  categories: CategoryListItem[]
  isLoading: boolean
  onEdit: (categoryId: number) => void
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CategoriesTable({ categories, isLoading, onEdit }: CategoriesTableProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Loading categories...
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        No categories found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-border text-muted-foreground border-b">
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created by</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isActive = !category.isdelete

            return (
              <tr key={category.id} className="border-border border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{category.category_Name}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isActive
                        ? 'inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                        : 'bg-destructive/10 text-destructive inline-flex rounded-md px-2 py-0.5 text-xs font-medium'
                    }
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {category.createdBy || '—'}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatDate(category.createdOn)}
                </td>
                <td className="px-4 py-3 text-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(category.id)}
                  >
                    <Pencil />
                    Edit
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
