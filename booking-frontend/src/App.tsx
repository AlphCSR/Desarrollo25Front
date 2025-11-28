import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./page/HomePage";
import { EventDetailPage } from "./components/EventDetailPage";
import { LoginPage } from "./page/LoginPage";
import { RegisterPage } from "./page/RegisterPage";
import { ProfilePage } from "./page/ProfilePage";
import { CreateEventPage } from "./page/CreateEventPage";
import { EditEventPage } from "./page/EditEventPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas que requieran login obligatorio antes de entrar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard en construcción</div>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/edit-event/:id" element={<EditEventPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
