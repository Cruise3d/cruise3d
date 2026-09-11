import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { CartDrawer } from '../../features/cart/components/CartDrawer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] font-sans text-[#0a0a0a] selection:bg-[#e5e5e5] selection:text-[#0a0a0a]">
      <Header />
      <main className="pt-[4rem] md:pt-[3rem]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
