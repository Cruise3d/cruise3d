import { NavLink } from 'react-router-dom'
import { theme } from '../../styles/theme'

const links = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Testimonials', to: '/admin/testimonials' },
]

export default function AdminSidebar() {
  const { colors } = theme

  return (
    <aside 
      className="w-full shrink-0 rounded-[1.5rem] border p-4 lg:w-72"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.low,
      }}
    >
      <div className="mb-6 px-2">
        <p 
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: colors.primary.DEFAULT }}
        >
          Admin
        </p>
        <h2 
          className="mt-2 text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Cruise3D Studio
        </h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'} // Add this line - only match exactly for dashboard
            className={({ isActive }) => {
              const baseClasses = "flex items-center rounded-[1rem] px-4 py-3 text-sm font-medium transition-all duration-200"
              const activeClasses = isActive 
                ? "bg-[#1a1a1a] text-white shadow-sm" 
                : "text-[#404040] hover:bg-[#fafafa] hover:text-[#0a0a0a]"
              return `${baseClasses} ${activeClasses}`
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}