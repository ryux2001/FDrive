import {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setCargando(true)

        const {error} = await supabase.auth.signInWithPassword({email,password})
        
        if (error) {
            setError(error.message)
            setCargando(false)
            return
        }
        navigate("/dashboard")
    }

  return (
    <>
        <div>
            <h2>Iniciar Sesion</h2>
            <form action="" onSubmit={handleSubmit}>
                <input type="email"
                    placeholder='Email'
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    required
                />
                <input type="password"
                    placeholder='Contraseña'
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    required
                />
                <button type='submit' disabled={cargando}>
                    {cargando ? 'Cargando...' : 'Iniciar Sesion'}
                </button>
                {error && <p>{error}</p>}
                
            </form>
            <Link to="/register">¿No tienes cuenta aun? Registrarse</Link>
        </div>
    </>
  )
}

export default Login