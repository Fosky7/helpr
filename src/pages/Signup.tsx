import { Navigate, useLocation } from 'react-router-dom'

export default function Signup() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set('mode', 'signup')

  return <Navigate to={`/auth?${params.toString()}`} replace />
}
