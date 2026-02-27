import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Dashboard() {
    const {usuario} = useAuth()
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)
    const nombre = usuario.user_metadata.nombre
    const navigate = useNavigate()

    async function handleLogout(){
        await supabase.auth.signOut()

        navigate("/")
    }
  return (
    <>
        <div>
            <h2>Dashboard</h2>
            <h2>Bievenido {nombre}</h2>
            <button onClick={handleLogout}>Cerrar Sesion</button>
        </div>
    </>
  )
}

export default Dashboard