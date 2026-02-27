import {useState} from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e){
        e.preventDefault()
        setError(null)
        setCargando(true)

        const {error} = await supabase.auth.signUp({email, password,
            options: {
                data: {
                    nombre:nombre
                }
            }}
            
        )
        if (error) {
            setError(error.message)
            setCargando(false)
            return
        }

        navigate("/login")
    }
  return (
    <>
        <div>
            <h2>Registrarse</h2>
            <form onSubmit={handleSubmit}>
                <input type="text"
                    placeholder='Nombre'
                    value={nombre}
                    onChange={(e)=> setNombre(e.target.value)}
                    required
                />
                <input type="email"
                    placeholder='Email'
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    required
                /><input type="password"
                    placeholder='Contraseña'
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    required
                />
                <button type='submit' disabled={cargando}>
                    {cargando ? "Resgistrando...":"Registrarse"}
                </button>
                {error && <p>{error}</p>}
            </form>
            <Link to="/login">¿Ya tienes cuenta? Inicia Sesión</Link>
        </div>
    </>
  )
}

export default Register