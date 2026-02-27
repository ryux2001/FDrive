import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function Dashboard() {
    const {usuario} = useAuth()
    const nombre = usuario.user_metadata.nombre
    const navigate = useNavigate()

    async function handleLogout(){
        await supabase.auth.signOut()

        navigate("/")
    }
  return (
    <>
        <div>
            <header>
                <h2>Dashboard</h2>
                <h2>Bievenido {nombre}</h2>
                <button onClick={handleLogout}>Cerrar Sesion</button>
            </header>
            <main>
                <ul>
                    <li>
                        <Link to="/employees">Trabajadores</Link>
                    </li>
                </ul>
            </main>
        </div>
    </>
  )
}

export default Dashboard