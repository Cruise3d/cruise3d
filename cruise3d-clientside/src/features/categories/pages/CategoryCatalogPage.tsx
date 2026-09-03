import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoriesWithProducts } from '../api'
import type { CategoryWithProducts } from '../types'
import { ProductGrid } from '../../products/components/ProductGrid'
import { normalizeProducts } from '../../products/normalizeProduct'
import { theme } from '../../../styles/theme'

export default function CategoryCatalogPage() {
  const { colors } = theme
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getCategoriesWithProducts()
      .then((result) => {
        if (!cancelled) setCategories(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load categories.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: colors.primary.DEFAULT }}>
          Collections
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight" style={{ color: colors.text.primary }}>
          Browse by category
        </h1>
      </div>

      {isLoading && <p style={{ color: colors.text.secondary }}>Loading categories...</p>}
      {error && <p style={{ color: colors.status.error.DEFAULT }}>{error}</p>}

      {!isLoading && !error && categories.length === 0 && (
        <p style={{ color: colors.text.secondary }}>No categories are available yet.</p>
      )}

      <div className="space-y-16">
        {categories.map((category) => {
          const products = normalizeProducts(category.products as Parameters<typeof normalizeProducts>[0])
          return (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <div className="mb-6 flex items-center gap-4 border-b pb-4" style={{ borderColor: colors.border.DEFAULT }}>
                {category.iconUrl && (
                  <img src={category.iconUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                )}
                <div>
                  <h2 id={`category-${category.id}`} className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                    {category.name}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                    {products.length} product{products.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Link to={`/products?categoryId=${category.id}`} className="ml-auto text-sm font-semibold" style={{ color: colors.primary.DEFAULT }}>
                  View all
                </Link>
              </div>
              <ProductGrid products={products} />
            </section>
          )
        })}
      </div>
    </section>
  )
}