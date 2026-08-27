import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { CartDrawer } from '../../features/cart/components/CartDrawer'
import OfferBanner from '../../features/offers/components/OfferBanner'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container font-sans">
      <Header />
      <OfferBanner />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
