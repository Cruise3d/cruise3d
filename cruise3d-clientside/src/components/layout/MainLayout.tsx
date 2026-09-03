import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { CartDrawer } from '../../features/cart/components/CartDrawer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container font-sans">
      <Header />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
