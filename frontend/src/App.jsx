import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const HomePage = lazy(() => import("./features/notes/HomePage"));
const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const SignUpPage = lazy(() => import("./features/auth/SignUpPage"));

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center text-sm font-medium text-slate-500 dark:text-slate-400">
      Loading…
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "16px",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "14px",
              padding: "12px 14px",
            },
          }}
        />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
