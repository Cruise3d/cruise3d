import { useState, type FormEvent } from 'react'
import { createCategory } from '../api'
import { theme } from '../../../styles/theme'

interface CategoryFormProps {
  onSuccess?: () => void
}

export default function CategoryForm({ onSuccess }: CategoryFormProps) {
  const { colors, shadows } = theme
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value)
    // Only auto-generate slug if user hasn't manually edited it
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()

    if (!trimmedName) {
      setError('Category name is required.')
      return
    }

    if (!trimmedSlug) {
      setError('Slug is required.')
      return
    }

    try {
      setIsSubmitting(true)
      await createCategory({ name: trimmedName, slug: trimmedSlug })
      setSuccess(`Category "${trimmedName}" was created successfully.`)
      setName('')
      setSlug('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="rounded-[1.5rem] border p-6"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.DEFAULT,
        boxShadow: shadows.DEFAULT,
      }}
    >
      <h3 
        className="text-lg font-semibold"
        style={{ color: colors.text.primary }}
      >
        Add category
      </h3>
      <p 
        className="mt-2 text-sm leading-7"
        style={{ color: colors.text.secondary }}
      >
        Create a new collection category for your products.
      </p>

      {error && (
        <div 
          className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
          style={{
            borderColor: colors.status.error.DEFAULT,
            backgroundColor: colors.status.error.light,
            color: colors.status.error.text,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div 
          className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
          style={{
            borderColor: colors.status.success.DEFAULT,
            backgroundColor: colors.status.success.light,
            color: colors.status.success.text,
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text.primary }}
        >
          Category name *
          <input
            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.border.focus
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border.DEFAULT
            }}
            placeholder="Miniatures"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
        </label>

        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text.primary }}
        >
          Slug *
          <input
            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.border.focus
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border.DEFAULT
            }}
            placeholder="miniatures"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
          />
          <p 
            className="mt-1 text-xs"
            style={{ color: colors.text.secondary }}
          >
            URL-friendly identifier (e.g., /products/miniatures)
          </p>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            backgroundColor: colors.primary.DEFAULT,
            color: colors.text.inverted,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.dark
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.DEFAULT
            }
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create category'}
        </button>
      </form>
    </div>
  )
}