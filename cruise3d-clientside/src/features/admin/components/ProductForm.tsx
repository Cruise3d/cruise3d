import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getCategories } from '@/features/categories/api'
import type { Category } from '@/features/categories/types'
import {
  createProduct,
  updateProduct,
  type ProductColorInput,
  type ProductCreatePayload,
  type ProductImageInput,
  type ProductSpecInput,
} from '@/features/products/api'
import { fetchCloudinarySignature } from '../api'
import type { AdminProduct } from '../types'
import { theme } from '../../../styles/theme'

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
          options: {
            cloudName: string
            api_key?: string
            uploadSignature?: (
              callback: (signature: string) => void,
              paramsToSign: Record<string, string | number | boolean | undefined>
            ) => void
            sources?: string[]
            multiple?: boolean
            cropping?: boolean
            folder?: string
            singleUploadAutoClose?: boolean
            showCompletedButton?: boolean
            showUploadMoreButton?: boolean
          },
        callback: (error: unknown, result: { event?: string; info?: { secure_url?: string } }) => void
      ) => { open: () => void; destroy?: () => void }
    }
  }
}

type ColorType = 'fixed' | 'custom'

interface ColorRow {
  colorName: string
  colorHex: string
  stockOverride: string
  sortOrder: string
}

interface SpecRow {
  specKey: string
  specValue: string
  sortOrder: string
}

interface ImageRow {
  url: string
  sortOrder: string
  isPrimary: boolean
  productColorId: string
}

interface FormState {
  title: string
  sku: string
  price: string
  stock: string
  categoryId: string
  description: string
  material: string
  weightGrams: string
  dimensions: string
  estimatedDelivery: string
  colorType: ColorType
  defaultColorName: string
  defaultColorHex: string
  colors: ColorRow[]
  images: ImageRow[]
  specs: SpecRow[]
  isFeatured: boolean
  isBestseller: boolean
  isActive: boolean
}

const emptyColorRow = (): ColorRow => ({
  colorName: '',
  colorHex: '',
  stockOverride: '',
  sortOrder: '',
})

const emptySpecRow = (): SpecRow => ({
  specKey: '',
  specValue: '',
  sortOrder: '',
})

const emptyImageRow = (): ImageRow => ({
  url: '',
  sortOrder: '',
  isPrimary: false,
  productColorId: '',
})

function mapImagesToFormState(editingProduct: AdminProduct | null): ImageRow[] {
  const productImages = editingProduct?.images || []

  if (productImages.length > 0) {
    return productImages.map((image) => ({
      url: image.url || '',
      sortOrder: image.sortOrder !== undefined ? String(image.sortOrder) : '',
      isPrimary: Boolean(image.isPrimary),
      productColorId: image.productColorId || '',
    }))
  }

  if (editingProduct?.primaryImageUrl) {
    return [
      {
        url: editingProduct.primaryImageUrl,
        sortOrder: '',
        isPrimary: true,
        productColorId: '',
      },
    ]
  }

  return [emptyImageRow()]
}

function mapColorsToFormState(editingProduct: AdminProduct | null): ColorRow[] {
  const productColors = editingProduct?.colors || []

  if (productColors.length > 0) {
    return productColors.map((color) => ({
      colorName: color.colorName || '',
      colorHex: color.colorHex || '',
      stockOverride: color.stockOverride !== undefined ? String(color.stockOverride) : '',
      sortOrder: color.sortOrder !== undefined ? String(color.sortOrder) : '',
    }))
  }

  return [emptyColorRow()]
}

function mapSpecsToFormState(editingProduct: AdminProduct | null): SpecRow[] {
  const productSpecs = editingProduct?.specs || []

  if (productSpecs.length > 0) {
    return productSpecs.map((spec) => ({
      specKey: spec.specKey || '',
      specValue: spec.specValue || '',
      sortOrder: spec.sortOrder !== undefined ? String(spec.sortOrder) : '',
    }))
  }

  return [emptySpecRow()]
}

function getInitialState(editingProduct: AdminProduct | null): FormState {
  if (!editingProduct) {
    return {
      title: '',
      sku: '',
      price: '',
      stock: '',
      categoryId: '',
      description: '',
      material: '',
      weightGrams: '',
      dimensions: '',
      estimatedDelivery: '',
      colorType: 'fixed',
      defaultColorName: '',
      defaultColorHex: '#000000',
      colors: [emptyColorRow()],
      images: [emptyImageRow()],
      specs: [emptySpecRow()],
      isFeatured: false,
      isBestseller: false,
      isActive: true,
    }
  }

  return {
    title: editingProduct.title,
    sku: editingProduct.sku,
    price: String(editingProduct.price),
    stock: String(editingProduct.stock),
    categoryId: editingProduct.categoryId || '',
    description: editingProduct.description || '',
    material: editingProduct.material || '',
    weightGrams: editingProduct.weightGrams ? String(editingProduct.weightGrams) : '',
    dimensions: editingProduct.dimensions || '',
    estimatedDelivery: editingProduct.estimatedDelivery || '',
    colorType: editingProduct.colorType || 'fixed',
    defaultColorName: editingProduct.defaultColorName || '',
    defaultColorHex: editingProduct.defaultColorHex || '#000000',
    colors: mapColorsToFormState(editingProduct),
    images: mapImagesToFormState(editingProduct),
    specs: mapSpecsToFormState(editingProduct),
    isFeatured: editingProduct.isFeatured,
    isBestseller: editingProduct.isBestseller,
    isActive: editingProduct.isActive,
  }
}

interface ProductFormProps {
  editingProduct?: AdminProduct | null
  onSuccess?: () => void
  onCancel?: () => void
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

function buildColorPayload(colors: ColorRow[]): ProductColorInput[] {
  return colors
    .map((color) => ({
      colorName: color.colorName.trim(),
      colorHex: color.colorHex.trim(),
      stockOverride: parseOptionalNumber(color.stockOverride),
      sortOrder: parseOptionalNumber(color.sortOrder),
    }))
    .filter((color) => color.colorName && color.colorHex)
}

function buildSpecPayload(specs: SpecRow[]): ProductSpecInput[] {
  return specs
    .map((spec) => ({
      specKey: spec.specKey.trim(),
      specValue: spec.specValue.trim(),
      sortOrder: parseOptionalNumber(spec.sortOrder),
    }))
    .filter((spec) => spec.specKey && spec.specValue)
}

function buildImagePayload(images: ImageRow[]): ProductImageInput[] {
  const normalized = images
    .map((image) => ({
      url: image.url.trim(),
      sortOrder: parseOptionalNumber(image.sortOrder),
      isPrimary: image.isPrimary,
      productColorId: image.productColorId.trim() || undefined,
    }))
    .filter((image) => image.url)

  if (normalized.length === 0) {
    return []
  }

  const primaryIndex = normalized.findIndex((image) => image.isPrimary)

  return normalized.map((image, index) => ({
    url: image.url,
    sortOrder: image.sortOrder,
    productColorId: image.productColorId,
    isPrimary: primaryIndex >= 0 ? index === primaryIndex : index === 0,
  }))
}

export default function ProductForm({ editingProduct, onSuccess, onCancel }: ProductFormProps) {
  const { colors, shadows } = theme
  const [form, setForm] = useState<FormState>(() => getInitialState(editingProduct ?? null))
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditing = Boolean(editingProduct)

  // Reset form when editing product changes
  useEffect(() => {
    setForm(getInitialState(editingProduct ?? null))
  }, [editingProduct])

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        setIsLoadingCategories(true)
        const response = await getCategories()
        const categoriesData = Array.isArray(response) ? response : []
        if (!cancelled) {
          setCategories(categoriesData)
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedCategoryLabel = useMemo(
    () => categories.find((category) => category.id === form.categoryId)?.name ?? '',
    [categories, form.categoryId]
  )

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateColorRow(index: number, field: keyof ColorRow, value: string) {
    setForm((current) => ({
      ...current,
      colors: current.colors.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }))
  }

  function updateSpecRow(index: number, field: keyof SpecRow, value: string) {
    setForm((current) => ({
      ...current,
      specs: current.specs.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }))
  }

  function addColorRow() {
    setForm((current) => ({
      ...current,
      colors: [...current.colors, emptyColorRow()],
    }))
  }

  function removeColorRow(index: number) {
    setForm((current) => ({
      ...current,
      colors: current.colors.length === 1 ? current.colors : current.colors.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  function addSpecRow() {
    setForm((current) => ({
      ...current,
      specs: [...current.specs, emptySpecRow()],
    }))
  }

  function removeSpecRow(index: number) {
    setForm((current) => ({
      ...current,
      specs: current.specs.length === 1 ? current.specs : current.specs.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  function updateImageRow(index: number, field: keyof ImageRow, value: string | boolean) {
    setForm((current) => ({
      ...current,
      images: current.images.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }))
  }

  function addImageRow() {
    setForm((current) => ({
      ...current,
      images: [...current.images, emptyImageRow()],
    }))
  }

  function removeImageRow(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.length === 1 ? current.images : current.images.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  function uploadImageFromCloudinary(index: number) {
    if (!window.cloudinary?.createUploadWidget) {
      setError('Cloudinary upload widget is not loaded.')
      return
    }

    setError(null)
    setUploadingImageIndex(index)

    void (async () => {
      try {
        // Single warm-up: get cloudName/apiKey/folder from the backend. The
        // response's timestamp/signature are NOT used here — the widget will
        // call `uploadSignature` again with its own paramsToSign right before
        // uploading, and we sign THAT request on demand.
        const widgetConfig = await fetchCloudinarySignature('placeholder')
        const uploadFolder = widgetConfig.folder || 'cruise3d/products'

        const widget = window.cloudinary!.createUploadWidget(
          {
            cloudName: widgetConfig.cloudName,
            api_key: widgetConfig.apiKey,
            sources: ['local'],
            multiple: false,
            folder: uploadFolder,
            // Cloudinary calls this just before uploading. Sign exactly the
            // paramsToSign the widget gives us — do NOT regenerate the
            // timestamp; the widget's value is what gets hashed on
            // Cloudinary's side.
            uploadSignature: (callback, paramsToSign) => {
              void (async () => {
                try {
                  const data = new URLSearchParams(
                    Object.entries(paramsToSign)
                      .filter(([, value]) => value !== undefined && value !== null && value !== '')
                      .map(([key, value]) => [key, String(value)])
                  ).toString()

                  const signatureResponse = await fetchCloudinarySignature(data, uploadFolder)
                  callback(signatureResponse.signature)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to load Cloudinary signature.')
                  setUploadingImageIndex(null)
                }
              })()
            },
            singleUploadAutoClose: false,
            showCompletedButton: true,
            showUploadMoreButton: false,
          },
          (widgetError, result) => {
            if (widgetError) {
              setError(widgetError instanceof Error ? widgetError.message : 'Failed to upload image.')
              setUploadingImageIndex(null)
              return
            }

            if (result?.event === 'success' && result.info?.secure_url) {
              updateImageRow(index, 'url', result.info.secure_url)
              updateImageRow(index, 'isPrimary', index === 0)
              setSuccess('Image uploaded successfully.')
              setUploadingImageIndex(null)
            }

            if (result?.event === 'close' || result?.event === 'display-changed') {
              setUploadingImageIndex(null)
            }
          }
        )

        widget.open()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Cloudinary signature.')
        setUploadingImageIndex(null)
      }
    })()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const title = form.title.trim()
    const sku = form.sku.trim()
    const price = Number(form.price)
    const stock = parseOptionalNumber(form.stock)
    const weightGrams = parseOptionalNumber(form.weightGrams)
    const colors = buildColorPayload(form.colors)
    const images = buildImagePayload(form.images)
    const specs = buildSpecPayload(form.specs)

    if (!title) {
      setError('Title is required.')
      return
    }

    if (!sku) {
      setError('SKU is required.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Price must be a valid positive number.')
      return
    }

    if (form.colorType === 'fixed' && !form.defaultColorName.trim()) {
      setError('Fixed-color products require a default color name.')
      return
    }

    if (form.colorType === 'fixed' && !form.defaultColorHex.trim()) {
      setError('Fixed-color products require a default color hex value.')
      return
    }

    if (form.colorType === 'custom' && colors.length === 0) {
      setError('Custom-color products require at least one color row.')
      return
    }

    if (images.length === 0) {
      setError('Upload at least one product image.')
      return
    }

    const payload: ProductCreatePayload = {
      title,
      sku,
      price,
      stock,
      categoryId: form.categoryId.trim() || undefined,
      description: form.description.trim() || undefined,
      material: form.material.trim() || undefined,
      weightGrams,
      dimensions: form.dimensions.trim() || undefined,
      estimatedDelivery: form.estimatedDelivery.trim() || undefined,
      colorType: form.colorType,
      defaultColorName: form.colorType === 'fixed' ? form.defaultColorName.trim() || undefined : undefined,
      defaultColorHex: form.colorType === 'fixed' ? form.defaultColorHex.trim() || undefined : undefined,
      colors: form.colorType === 'custom' ? colors : undefined,
      images,
      specs: specs.length ? specs : undefined,
      isFeatured: form.isFeatured,
      isBestseller: form.isBestseller,
      isActive: form.isActive,
    }

    try {
      setIsSubmitting(true)

      if (isEditing && editingProduct) {
        await updateProduct(editingProduct.id, payload)
        setSuccess(`Product "${title}" was updated successfully.`)
      } else {
        await createProduct(payload)
        setSuccess(`Product "${title}" was created successfully.`)
      }

      onSuccess?.()

      if (!isEditing) {
        setForm(getInitialState(null))
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : `Failed to ${isEditing ? 'update' : 'create'} the product.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    onCancel?.()
  }

  return (
    <div
      id="admin-product-form"
      className="rounded-[1.5rem] border p-6"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.DEFAULT,
        boxShadow: shadows.DEFAULT,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            {isEditing ? 'Edit product' : 'Add product'}
          </h3>
          <p 
            className="mt-2 text-sm leading-7"
            style={{ color: colors.text.secondary }}
          >
            {isEditing
              ? 'Update the product details below.'
              : 'Create a catalog item with the fields required by the API.'}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition"
            style={{
              borderColor: colors.border.DEFAULT,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.surface.low
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div 
          className="mt-5 rounded-[1rem] border px-4 py-3 text-sm"
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
          className="mt-5 rounded-[1rem] border px-4 py-3 text-sm"
          style={{
            borderColor: colors.status.success.DEFAULT,
            backgroundColor: colors.status.success.light,
            color: colors.status.success.text,
          }}
        >
          {success}
        </div>
      )}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Title *
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
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="3D Printed Phone Stand"
                required
              />
            </label>

            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              SKU *
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
                value={form.sku}
                onChange={(event) => updateField('sku', event.target.value)}
                placeholder="PHONE-STAND-001"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Price *
              <input
                type="number"
                step="0.01"
                min="0"
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
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="499.99"
                required
              />
            </label>

            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Stock
              <input
                type="number"
                min="0"
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
                value={form.stock}
                onChange={(event) => updateField('stock', event.target.value)}
                placeholder="25"
              />
            </label>

            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Category
              <select
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
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                disabled={isLoadingCategories}
              >
                <option value="">{isLoadingCategories ? 'Loading categories...' : 'No category'}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {selectedCategoryLabel ? (
                <p 
                  className="mt-2 text-xs"
                  style={{ color: colors.text.secondary }}
                >
                  Selected: {selectedCategoryLabel}
                </p>
              ) : null}
            </label>
          </div>

          <label 
            className="block text-sm font-medium"
            style={{ color: colors.text.primary }}
          >
            Description
            <textarea
              className="mt-2 min-h-28 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
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
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Adjustable stand for desk use"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Material
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
                value={form.material}
                onChange={(event) => updateField('material', event.target.value)}
                placeholder="PLA"
              />
            </label>

            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Weight in grams
              <input
                type="number"
                min="0"
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
                value={form.weightGrams}
                onChange={(event) => updateField('weightGrams', event.target.value)}
                placeholder="120"
              />
            </label>

            <label 
              className="block text-sm font-medium"
              style={{ color: colors.text.primary }}
            >
              Dimensions
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
                value={form.dimensions}
                onChange={(event) => updateField('dimensions', event.target.value)}
                placeholder="12x8x10 cm"
              />
            </label>
          </div>

          <label 
            className="block text-sm font-medium"
            style={{ color: colors.text.primary }}
          >
            Estimated delivery
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
              value={form.estimatedDelivery}
              onChange={(event) => updateField('estimatedDelivery', event.target.value)}
              placeholder="5-7 days"
            />
          </label>
        </section>

        <section 
          className="space-y-4 rounded-[1.25rem] border p-4"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.low,
          }}
        >
          <div>
            <h4 
              className="text-sm font-semibold uppercase tracking-[0.24em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              Colors
            </h4>
            <p 
              className="mt-2 text-sm"
              style={{ color: colors.text.secondary }}
            >
              Choose a fixed default color or provide multiple custom color variants.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <label 
              className="flex items-center gap-2 text-sm"
              style={{ color: colors.text.primary }}
            >
              <input
                type="radio"
                name="colorType"
                checked={form.colorType === 'fixed'}
                onChange={() => updateField('colorType', 'fixed')}
              />
              Fixed color
            </label>

            <label 
              className="flex items-center gap-2 text-sm"
              style={{ color: colors.text.primary }}
            >
              <input
                type="radio"
                name="colorType"
                checked={form.colorType === 'custom'}
                onChange={() => updateField('colorType', 'custom')}
              />
              Custom colors
            </label>
          </div>

          {form.colorType === 'fixed' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label 
                className="block text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Default color name *
                <input
                  className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.surface.DEFAULT,
                    color: colors.text.primary,
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.border.focus
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.DEFAULT
                  }}
                  value={form.defaultColorName}
                  onChange={(event) => updateField('defaultColorName', event.target.value)}
                  placeholder="Matte Black"
                />
              </label>

              <label 
                className="block text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Default color hex
                <input
                  className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.surface.DEFAULT,
                    color: colors.text.primary,
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.border.focus
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.DEFAULT
                  }}
                  value={form.defaultColorHex}
                  onChange={(event) => updateField('defaultColorHex', event.target.value)}
                  placeholder="#000000"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {form.colors.map((color, index) => (
                <div 
                  key={`color-${index}`} 
                  className="grid gap-3 rounded-[1rem] border p-4 md:grid-cols-4"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.surface.DEFAULT,
                  }}
                >
                  <label 
                    className="block text-sm font-medium md:col-span-2"
                    style={{ color: colors.text.primary }}
                  >
                    Color name *
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
                      value={color.colorName}
                      onChange={(event) => updateColorRow(index, 'colorName', event.target.value)}
                      placeholder="Red"
                    />
                  </label>

                  <label 
                    className="block text-sm font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Color hex *
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
                      value={color.colorHex}
                      onChange={(event) => updateColorRow(index, 'colorHex', event.target.value)}
                      placeholder="#FF0000"
                    />
                  </label>

                  <label 
                    className="block text-sm font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Stock override
                    <input
                      type="number"
                      min="0"
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
                      value={color.stockOverride}
                      onChange={(event) => updateColorRow(index, 'stockOverride', event.target.value)}
                      placeholder="10"
                    />
                  </label>

                  <label 
                    className="block text-sm font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Sort order
                    <input
                      type="number"
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
                      value={color.sortOrder}
                      onChange={(event) => updateColorRow(index, 'sortOrder', event.target.value)}
                      placeholder="0"
                    />
                  </label>

                  <div className="md:col-span-4 flex justify-end">
                    <button
                      type="button"
                      className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
                      style={{
                        borderColor: colors.border.DEFAULT,
                        color: colors.text.primary,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.surface.low
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={() => removeColorRow(index)}
                      disabled={form.colors.length === 1}
                    >
                      Remove color
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
                style={{
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.primary,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surface.low
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onClick={addColorRow}
              >
                Add color
              </button>
            </div>
          )}
        </section>

        <section 
          className="space-y-4 rounded-[1.25rem] border p-4"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.low,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 
                className="text-sm font-semibold uppercase tracking-[0.24em]"
                style={{ color: colors.primary.DEFAULT }}
              >
                Images
              </h4>
              <p 
                className="mt-2 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Upload gallery images from your device. Mark one as primary to control the main thumbnail customers see.
              </p>
            </div>
            <button
              type="button"
              className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.primary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface.low
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={addImageRow}
            >
              Add image
            </button>
          </div>

          <div className="space-y-3">
            {form.images.map((image, index) => (
              <div
                key={`image-${index}`}
                className="grid gap-3 rounded-[1rem] border p-4 md:grid-cols-6"
                style={{
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.surface.DEFAULT,
                }}
              >
                <div className="md:col-span-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div 
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        Product image *
                      </div>
                      <p 
                        className="mt-1 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Upload from device. Cloudinary returns the secure URL automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-[1rem] border px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        borderColor: colors.border.DEFAULT,
                        color: colors.text.primary,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.surface.low
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                      onClick={() => uploadImageFromCloudinary(index)}
                      disabled={uploadingImageIndex === index}
                    >
                      {uploadingImageIndex === index ? 'Uploading...' : 'Upload from device'}
                    </button>
                  </div>

                  <div 
                    className="flex items-center gap-3 rounded-[1rem] border border-dashed px-4 py-3"
                    style={{
                      borderColor: colors.border.DEFAULT,
                      backgroundColor: colors.surface.low,
                    }}
                  >
                    <div 
                      className="h-14 w-14 overflow-hidden rounded-xl"
                      style={{ backgroundColor: colors.surface.DEFAULT }}
                    >
                      <img
                        src={image.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {image.url ? 'Image uploaded' : 'No image uploaded yet'}
                      </div>
                      <div 
                        className="truncate text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        {image.url || 'Choose a file from your device to add it here.'}
                      </div>
                    </div>
                  </div>
                </div>

                <label 
                  className="block text-sm font-medium md:col-span-1"
                  style={{ color: colors.text.primary }}
                >
                  Sort order
                  <input
                    type="number"
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
                    value={image.sortOrder}
                    onChange={(event) => updateImageRow(index, 'sortOrder', event.target.value)}
                    placeholder="0"
                  />
                </label>

                <label 
                  className="flex items-center gap-2 text-sm md:col-span-1 md:justify-end md:pt-9"
                  style={{ color: colors.text.primary }}
                >
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    onChange={(event) => updateImageRow(index, 'isPrimary', event.target.checked)}
                  />
                  Primary
                </label>

                <label 
                  className="block text-sm font-medium md:col-span-4"
                  style={{ color: colors.text.primary }}
                >
                  Product color ID
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
                    value={image.productColorId}
                    onChange={(event) => updateImageRow(index, 'productColorId', event.target.value)}
                    placeholder="Optional color variant ID"
                  />
                </label>

                <div className="md:col-span-2 flex justify-end md:items-end">
                  <button
                    type="button"
                    className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
                    style={{
                      borderColor: colors.border.DEFAULT,
                      color: colors.text.primary,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surface.low
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => removeImageRow(index)}
                    disabled={form.images.length === 1}
                  >
                    Remove image
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section 
          className="space-y-4 rounded-[1.25rem] border p-4"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.low,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 
                className="text-sm font-semibold uppercase tracking-[0.24em]"
                style={{ color: colors.primary.DEFAULT }}
              >
                Specs
              </h4>
              <p 
                className="mt-2 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Add technical specs that match the backend spec list.
              </p>
            </div>
            <button
              type="button"
              className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.primary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface.low
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={addSpecRow}
            >
              Add spec
            </button>
          </div>

          <div className="space-y-3">
            {form.specs.map((spec, index) => (
              <div 
                key={`spec-${index}`} 
                className="grid gap-3 rounded-[1rem] border p-4 md:grid-cols-4"
                style={{
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.surface.DEFAULT,
                }}
              >
                <label 
                  className="block text-sm font-medium md:col-span-2"
                  style={{ color: colors.text.primary }}
                >
                  Spec key
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
                    value={spec.specKey}
                    onChange={(event) => updateSpecRow(index, 'specKey', event.target.value)}
                    placeholder="Layer Height"
                  />
                </label>

                <label 
                  className="block text-sm font-medium md:col-span-1"
                  style={{ color: colors.text.primary }}
                >
                  Spec value
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
                    value={spec.specValue}
                    onChange={(event) => updateSpecRow(index, 'specValue', event.target.value)}
                    placeholder="0.2 mm"
                  />
                </label>

                <label 
                  className="block text-sm font-medium md:col-span-1"
                  style={{ color: colors.text.primary }}
                >
                  Sort order
                  <input
                    type="number"
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
                    value={spec.sortOrder}
                    onChange={(event) => updateSpecRow(index, 'sortOrder', event.target.value)}
                    placeholder="0"
                  />
                </label>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    className="rounded-[1rem] border px-4 py-2 text-sm font-medium transition"
                    style={{
                      borderColor: colors.border.DEFAULT,
                      color: colors.text.primary,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surface.low
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={() => removeSpecRow(index)}
                    disabled={form.specs.length === 1}
                  >
                    Remove spec
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-4">
          <label 
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => updateField('isFeatured', event.target.checked)}
            />
            Featured product
          </label>

          <label 
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={form.isBestseller}
              onChange={(event) => updateField('isBestseller', event.target.checked)}
            />
            Bestseller
          </label>

          <label 
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField('isActive', event.target.checked)}
            />
            Active (visible in store)
          </label>
        </section>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
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
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditing
              ? 'Updating product...'
              : 'Creating product...'
            : isEditing
              ? 'Update product'
              : 'Create product'}
        </button>
      </form>
    </div>
  )
}