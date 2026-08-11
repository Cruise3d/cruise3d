import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import { fetchAdminTestimonials } from '../api'
import type { AdminTestimonial } from '../types'
import { theme } from '../../../styles/theme'

export default function AdminTestimonialsPage() {
  const { colors, shadows } = theme
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTestimonials = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchAdminTestimonials()
      setTestimonials(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load testimonials')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTestimonials()
  }, [loadTestimonials])

  return (
    <AdminLayout
      title="Testimonials"
      description="Approve or moderate customer stories before they appear on the storefront."
    >
      {isLoading ? (
        <div 
          className="p-8 text-center"
          style={{ color: colors.text.secondary }}
        >
          Loading testimonials...
        </div>
      ) : error ? (
        <div 
          className="p-8 text-center"
          style={{ color: colors.status.error.DEFAULT }}
        >
          <p>{error}</p>
          <button
            onClick={() => void loadTestimonials()}
            className="mt-2 text-sm underline"
            style={{ color: colors.primary.DEFAULT }}
          >
            Try again
          </button>
        </div>
      ) : testimonials.length === 0 ? (
        <div 
          className="p-8 text-center"
          style={{ color: colors.text.secondary }}
        >
          No testimonials found.
        </div>
      ) : (
        <section className="space-y-4">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="rounded-[1.5rem] border p-6"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.DEFAULT,
                boxShadow: shadows.DEFAULT,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div 
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {testimonial.author}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {testimonial.role}
                  </div>
                </div>
                <div 
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                  style={{
                    backgroundColor: colors.surface.tint,
                    color: colors.primary.DEFAULT,
                  }}
                >
                  {testimonial.status}
                </div>
              </div>

              <div 
                className="mt-4 text-sm leading-7"
                style={{ color: colors.text.secondary }}
              >
                "{testimonial.content}"
              </div>
              <div 
                className="mt-4 text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Rating: {testimonial.rating}/5
              </div>
            </div>
          ))}
        </section>
      )}
    </AdminLayout>
  )
}