import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import CategoryForm from '../components/CategoryForm'
import { fetchAdminCategories, deleteCategory } from '../api'
import type { AdminCategory } from '../types'
import { theme } from '../../../styles/theme'

export default function AdminCategoriesPage() {
  const { colors } = theme
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchAdminCategories()
      setCategories(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const handleDelete = async (category: AdminCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      setDeletingId(category.id)
      await deleteCategory(category.id)
      await loadCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = () => {
    void loadCategories()
  }

  return (
    <AdminLayout
      title="Categories"
      description="Create and organize the collections that shoppers browse."
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div 
          className="overflow-hidden rounded-[1.5rem] border"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
          }}
        >
          <div 
            className="flex items-center justify-between border-b px-4 py-3"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
            }}
          >
            <h3 
              className="text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              Collections
            </h3>
            <button
              onClick={() => void loadCategories()}
              className="text-sm transition"
              style={{ 
                color: colors.primary.DEFAULT,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary.dark}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.primary.DEFAULT}
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              Loading categories...
            </div>
          ) : error ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.status.error.DEFAULT }}
            >
              <p>{error}</p>
              <button
                onClick={() => void loadCategories()}
                className="mt-2 text-sm underline"
                style={{ color: colors.primary.DEFAULT }}
              >
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              No categories found. Create your first category using the form.
            </div>
          ) : (
            <div 
              className="divide-y"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-start justify-between px-4 py-4"
                  style={{ borderColor: colors.border.DEFAULT }}
                >
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {category.name}
                    </div>
                    <div 
                      className="mt-1 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      /{category.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="text-right text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      <div 
                        className="text-xs uppercase tracking-[0.24em]"
                        style={{ color: colors.primary.DEFAULT }}
                      >
                        {category.sortOrder !== undefined ? `#${category.sortOrder}` : 'Active'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                      className="rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50"
                      style={{
                        backgroundColor: colors.status.error.light,
                        color: colors.status.error.DEFAULT,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.status.error.DEFAULT
                          e.currentTarget.style.color = colors.text.inverted
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.status.error.light
                          e.currentTarget.style.color = colors.status.error.DEFAULT
                        }
                      }}
                    >
                      {deletingId === category.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {categories.length > 0 && (
            <div 
              className="border-t px-4 py-3 text-sm"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.secondary,
              }}
            >
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </div>
          )}
        </div>

        <CategoryForm onSuccess={handleFormSuccess} />
      </section>
    </AdminLayout>
  )
}