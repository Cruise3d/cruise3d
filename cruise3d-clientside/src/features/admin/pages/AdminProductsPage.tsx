import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import ProductForm from '../components/ProductForm'
import { deleteProduct, fetchAdminProducts, fetchProductById } from '../api'
import type { AdminProduct } from '../types'
import { theme } from '../../../styles/theme'

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminProductsPage() {
  const { colors } = theme
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchAdminProducts()
      setProducts(response.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const handleEdit = async (product: AdminProduct) => {
    try {
      setEditingId(product.id)
      const fullProduct = await fetchProductById(product.id)
      setEditingProduct(fullProduct)
      document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load product details')
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (product: AdminProduct) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) {
      return
    }

    try {
      setDeletingId(product.id)
      await deleteProduct(product.id)
      if (editingProduct?.id === product.id) {
        setEditingProduct(null)
      }
      await loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = () => {
    setEditingProduct(null)
    void loadProducts()
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  return (
    <AdminLayout
      title="Products"
      description="Manage your catalog, status, pricing, and inventory from one place."
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
              Catalog
            </h3>
            <button
              onClick={() => void loadProducts()}
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
              Loading products...
            </div>
          ) : error ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.status.error.DEFAULT }}
            >
              <p>{error}</p>
              <button
                onClick={() => void loadProducts()}
                className="mt-2 text-sm underline"
                style={{ color: colors.primary.DEFAULT }}
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              No products found. Create your first product using the form.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full text-left text-sm">
                <thead 
                  className="sticky top-0"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.text.secondary,
                  }}
                >
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="border-t"
                      style={{ borderColor: colors.border.DEFAULT }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-12 w-12 overflow-hidden rounded-xl"
                            style={{ backgroundColor: colors.surface.low }}
                          >
                            <img
                              src={product.primaryImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div 
                              className="font-medium"
                              style={{ color: colors.text.primary }}
                            >
                              {product.title}
                            </div>
                            <div 
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              {product.sku}
                            </div>
                            <div 
                              className="mt-1 text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              {product.categoryName || 'Uncategorized'}
                              {product.createdAt ? ` · ${formatDate(product.createdAt)}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {formatCurrency(product.price)}
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]`}
                          style={{
                            backgroundColor: product.isActive ? colors.surface.tint : colors.surface.low,
                            color: product.isActive ? colors.primary.DEFAULT : colors.text.secondary,
                          }}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => void handleEdit(product)}
                            disabled={editingId === product.id}
                            className="rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50"
                            style={{
                              backgroundColor: colors.surface.tint,
                              color: colors.primary.DEFAULT,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = colors.primary.DEFAULT
                                e.currentTarget.style.color = colors.text.inverted
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = colors.surface.tint
                                e.currentTarget.style.color = colors.primary.DEFAULT
                              }
                            }}
                          >
                            {editingId === product.id ? 'Loading...' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
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
                            {deletingId === product.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {products.length > 0 && (
            <div 
              className="border-t px-4 py-3 text-sm"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.secondary,
              }}
            >
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <ProductForm
          editingProduct={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelEdit}
        />
      </section>
    </AdminLayout>
  )
}