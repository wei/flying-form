import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin";
import AdminNew from "./pages/AdminNew";
import AdminFormDetail from "./pages/AdminFormDetail";
import Fill from "./pages/Fill";
import { LangProvider } from "./lib/lang";

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/new" element={<AdminNew />} />
        <Route path="/admin/form/:formId" element={<AdminFormDetail />} />
        <Route path="/admin/form/:formId/sub/:subId" element={<AdminFormDetail />} />
        <Route path="/f/:formId" element={<Fill />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}
