import { useState } from 'react'
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

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        
        if (error) {
            setError(error.message)
            setCargando(false)
            return
        }
        navigate("/dashboard")
    }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
                <div className="inline-block bg-blue-600 text-white font-black text-xl p-3 rounded-2xl mb-4">FD</div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h2>
                <p className="text-gray-500 mt-2 font-medium">Introduce tus datos para acceder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email</label>
                    <input type="email"
                        placeholder='Tu correo electrónico'
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                        {/* <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">¿Olvidaste la clave?</a> */}
                    </div>
                    <input type="password"
                        placeholder='••••••••'
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <button 
                    type='submit' 
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50 mt-4"
                >
                    {cargando ? 'Accediendo...' : 'Iniciar Sesión'}
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-4 rounded-xl text-center">
                        {error}
                    </div>
                )}
            </form>

            <div className="mt-10 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    ¿No tienes cuenta aún?{' '}
                    <Link to="/register" className="text-blue-600 font-bold hover:underline">Registrarse gratis</Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Login