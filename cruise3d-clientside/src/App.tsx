import AppRouter from './app/router/AppRouter'
import AuthProvider from './app/providers/AuthProvider'
import ToastHost from './components/ui/Toast'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastHost />
    </AuthProvider>
  )
}

export default App
