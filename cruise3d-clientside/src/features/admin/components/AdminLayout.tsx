import type { ReactNode } from 'react'
import AdminSidebar from '../../../components/layout/AdminSidebar'
import { theme } from '../../../styles/theme'

interface AdminLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export default function AdminLayout({ title, description, children }: AdminLayoutProps) {
  const { colors, shadows } = theme

  return (
    <div 
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 lg:flex-row">
        <AdminSidebar />

        <div className="flex-1">
          <div 
            className="mb-6 rounded-[1.5rem] border p-6"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.DEFAULT,
              boxShadow: shadows.DEFAULT,
            }}
          >
            <p 
              className="text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              Operations
            </p>
            <h1 
              className="mt-2 text-3xl font-semibold"
              style={{ color: colors.text.primary }}
            >
              {title}
            </h1>
            <p 
              className="mt-3 max-w-2xl text-sm leading-7"
              style={{ color: colors.text.secondary }}
            >
              {description}
            </p>
          </div>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}