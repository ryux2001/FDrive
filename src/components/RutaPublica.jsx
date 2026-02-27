import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function RutaPublica({children}) {
  const {usuario, cargando} = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (usuario) return <Navigate to="/dashboard"/>

  return children
}

export default RutaPublica