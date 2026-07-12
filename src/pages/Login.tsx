import { Navigate, useLocation } from 'react-router-dom'

export default function Login() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set('mode', 'login')

  return <Navigate to={`/auth?${params.toString()}`} replace />
}
