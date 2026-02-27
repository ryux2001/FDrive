import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" />;

  return children;
}

export default RutaProtegida;
