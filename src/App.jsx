import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import RutaProtegida from "./components/RutaProtegida";
import RutaPublica from "./components/RutaPublica";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <RutaPublica>
              <Home />
            </RutaPublica>
          }
        />
        <Route
          path="/login"
          element={
            <RutaPublica>
              <Login />
            </RutaPublica>
          }
        />
        <Route
          path="/register"
          element={
            <RutaPublica>
              <Register />
            </RutaPublica>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />
        <Route path="/employees" element={
          <RutaProtegida>
            <Employees/>
          </RutaProtegida>
        }/>
      </Routes>
    </>
  );
}

export default App;
