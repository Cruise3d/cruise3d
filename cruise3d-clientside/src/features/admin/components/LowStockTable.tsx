import type { LowStockProduct } from '../types'
import { theme } from '../../../styles/theme'

interface LowStockTableProps {
  products: LowStockProduct[]
}

export default function LowStockTable({ products }: LowStockTableProps) {
  const { colors } = theme

  if (products.length === 0) {
    return (
      <div 
        className="overflow-hidden rounded-[1.5rem] border"
        style={{
          borderColor: colors.border.DEFAULT,
          backgroundColor: colors.surface.DEFAULT,
        }}
      >
        <div 
          className="border-b px-4 py-3"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.low,
          }}
        >
          <h3 
            className="text-sm font-semibold uppercase tracking-[0.3em]"
            style={{ color: colors.primary.DEFAULT }}
          >
            Low stock
          </h3>
        </div>
        <div 
          className="p-8 text-center"
          style={{ color: colors.text.secondary }}
        >
          No low stock products
        </div>
      </div>
    )
  }

  return (
    <div 
      className="overflow-hidden rounded-[1.5rem] border"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.DEFAULT,
      }}
    >
      <div 
        className="border-b px-4 py-3"
        style={{
          borderColor: colors.border.DEFAULT,
          backgroundColor: colors.surface.low,
        }}
      >
        <h3 
          className="text-sm font-semibold uppercase tracking-[0.3em]"
          style={{ color: colors.primary.DEFAULT }}
        >
          Low stock
        </h3>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead 
          className=""
          style={{
            backgroundColor: colors.surface.low,
            color: colors.text.secondary,
          }}
        >
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr 
              key={product.id} 
              className="border-t"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              <td 
                className="px-4 py-3 font-medium"
                style={{ color: colors.text.primary }}
              >
                {product.title}
              </td>
              <td 
                className="px-4 py-3"
                style={{ color: colors.text.secondary }}
              >
                {product.sku || '-'}
              </td>
              <td className="px-4 py-3">
                <span 
                  className="font-medium"
                  style={{
                    color: product.stock <= 5 ? colors.status.error.DEFAULT : colors.text.secondary,
                  }}
                >
                  {product.stock}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}