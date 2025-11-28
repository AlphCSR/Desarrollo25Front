import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./page/HomePage";
import { EventDetailPage } from "./components/EventDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La Home se encarga de mostrar Login o Eventos */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas que requieran login obligatorio antes de entrar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard en construcción</div>} />
          <Route path="/event/:id" element={<EventDetailPage />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
