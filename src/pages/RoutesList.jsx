import { Link } from "react-router-dom"

function RoutesList() {
  return (
    <>
     <div>
        <header>
            <h2>Rutas</h2>
            <nav>
                <Link to="/dashboard">Dashboard</Link>
            </nav>
        </header>
     </div>
    </>
  )
}

export default RoutesList