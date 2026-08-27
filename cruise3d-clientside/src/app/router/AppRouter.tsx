import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import HomePage from '../../pages/HomePage'
import UIDemo from '../../pages/UIDemo'
import ProductListPage from '../../features/products/pages/ProductListPage'
import ProductDetailPage from '../../features/products/pages/ProductDetailPage'
import CartPage from '../../features/cart/pages/CartPage'
import CheckoutPage from '../../features/orders/pages/CheckoutPage'
import MyOrdersPage from '../../features/orders/pages/MyOrdersPage'
import OrderDetailPage from '../../features/orders/pages/OrderDetailPage'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage'
import UserProfilePage from '../../features/profile/pages/UserProfilePage'
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage'
import AdminProductsPage from '../../features/admin/pages/AdminProductsPage'
import AdminOrdersPage from '../../features/admin/pages/AdminOrdersPage'
import AdminCategoriesPage from '../../features/admin/pages/AdminCategoriesPage'
import AdminOffersPage from '../../features/admin/pages/AdminOffersPage'
import AdminTestimonialsPage from '../../features/admin/pages/AdminTestimonialsPage'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import { theme } from '../../styles/theme'

function PlaceholderPage({ title }: { title: string }) {
  const { colors, shadows } = theme

  return (
    <main className="px-6 py-24">
      <div 
        className="mx-auto max-w-4xl rounded-3xl border p-12 shadow-sm"
        style={{
          borderColor: colors.border.DEFAULT,
          backgroundColor: colors.surface.DEFAULT,
          boxShadow: shadows.sm,
        }}
      >
        <h1 
          className="text-3xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h1>
        <p 
          className="mt-4"
          style={{ color: colors.text.secondary }}
        >
          This page is not implemented yet.
        </p>
      </div>
    </main>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ui-demo" element={<UIDemo />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="testimonials" element={<PlaceholderPage title="Testimonials" />} />
          <Route path="wishlist" element={<PlaceholderPage title="Wishlist" />} />
          <Route path="about" element={<PlaceholderPage title="About Us" />} />
          <Route path="contact" element={<PlaceholderPage title="Contact Us" />} />

          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/products"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/products/new"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/products/:productId/edit"
            element={
              <AdminRoute>
                <AdminProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <AdminRoute>
                <AdminCategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/offers"
            element={
              <AdminRoute>
                <AdminOffersPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/customers"
            element={
              <AdminRoute>
                <PlaceholderPage title="Customer Management" />
              </AdminRoute>
            }
          />
          <Route
            path="admin/testimonials"
            element={
              <AdminRoute>
                <AdminTestimonialsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/newsletter"
            element={
              <AdminRoute>
                <PlaceholderPage title="Newsletter Subscribers" />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}