import { theme } from '../../styles/theme'

export default function Footer() {
  const { colors } = theme
  const footerLinks = ['Privacy', 'Terms', 'Shipping', 'Sustainability']

  return (
    <footer 
      style={{
        backgroundColor: colors.surface.low,
        color: colors.text.secondary,
      }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-center md:text-left">
          <div 
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Cruise3D
          </div>
          <p 
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            PRECISION ENGINEERED.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {footerLinks.map((link) => (
            <a 
              key={link} 
              href="#" 
              className="transition"
              style={{
                color: colors.text.secondary,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.secondary
              }}
            >
              {link}
            </a>
          ))}
        </div>

        <div 
          className="text-sm text-center md:text-right"
          style={{ color: colors.text.secondary }}
        >
          © 2024 Cruise3D. PRECISION ENGINEERED.
        </div>
      </div>
    </footer>
  )
}