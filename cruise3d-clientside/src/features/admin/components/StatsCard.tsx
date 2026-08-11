import { theme } from '../../../styles/theme'

interface StatsCardProps {
  title: string
  value: string
  detail: string
  accent?: string
}

export default function StatsCard({ title, value, detail, accent }: StatsCardProps) {
  const { colors, shadows } = theme

  // Map accent strings to theme colors if provided, otherwise use defaults
  const getAccentStyles = () => {
    if (accent?.includes('primary')) {
      return {
        backgroundColor: colors.surface.tint,
        color: colors.primary.DEFAULT,
      }
    }
    if (accent?.includes('tertiary')) {
      return {
        backgroundColor: colors.surface.tint,
        color: colors.text.primary,
      }
    }
    if (accent?.includes('secondary')) {
      return {
        backgroundColor: colors.surface.tint,
        color: colors.text.secondary,
      }
    }
    if (accent?.includes('error')) {
      return {
        backgroundColor: colors.status.error.light,
        color: colors.status.error.DEFAULT,
      }
    }
    // Default
    return {
      backgroundColor: colors.surface.tint,
      color: colors.primary.DEFAULT,
    }
  }

  const accentStyles = getAccentStyles()

  return (
    <div 
      className="rounded-[1.5rem] border p-5"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.DEFAULT,
        boxShadow: shadows.DEFAULT,
      }}
    >
      <div 
        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
        style={{
          backgroundColor: accentStyles.backgroundColor,
          color: accentStyles.color,
        }}
      >
        {title}
      </div>
      <div 
        className="mt-4 text-3xl font-semibold"
        style={{ color: colors.text.primary }}
      >
        {value}
      </div>
      <p 
        className="mt-2 text-sm"
        style={{ color: colors.text.secondary }}
      >
        {detail}
      </p>
    </div>
  )
}