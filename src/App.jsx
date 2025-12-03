import { lazy, Suspense, memo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

// Lazy loading для оптимизации
const Home = lazy(() => import('./pages/Home'))
const HallMap = lazy(() => import('./pages/HallMap'))
const Booking = lazy(() => import('./pages/Booking'))
const Profile = lazy(() => import('./pages/Profile'))
const Shop = lazy(() => import('./pages/Shop'))
const Tournaments = lazy(() => import('./pages/Tournaments'))
const Social = lazy(() => import('./pages/Social'))
const QRCode = lazy(() => import('./pages/QRCode'))

const App = memo(() => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hall" element={<HallMap />} />
            <Route path="/booking/:pcId?" element={<Booking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/social" element={<Social />} />
            <Route path="/qr" element={<QRCode />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
})

App.displayName = 'App'

export default App
