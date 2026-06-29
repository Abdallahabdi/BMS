import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "./utils/UserContext.jsx";
import API from "./api/api";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import ReportItem from "./pages/ReportItem.jsx";
import SearchResults from "./pages/Search&Results.jsx";
import MatchDetails from "./pages/Search&Match.jsx";
import UserMatchView from "./pages/UserMatchView.jsx";
import VerificationFlow from "./pages/VerificationFlow.jsx";
import MessagingPortal from "./pages/Messaging&Claims.jsx";

// Admin Pages
import AdminUsers from "./pages/AdminUsers.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import AdminVerificationView from "./pages/AdminVerificationView.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";
import AdminInventory from "./pages/AdminInventory.jsx";
import AnalyticalReports from "./pages/AnalyticalReports.jsx";
import ReturnedItems from "./pages/ReturnedItems.jsx";
import Notifications from "./pages/Notifications.jsx";
import AdminParkZones from "./pages/AdminParkZones.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import FloatingMessageButton from "./components/FloatingMessageButton.jsx";

function AppContent() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Routes where sidebar/navbar should be hidden (Auth pages)
  const fullScreenRoutes = ["/login", "/register", "/forgotpassword", "/reset-password"];
  const isLanding = location.pathname === "/landing" || (location.pathname === "/" && !user);
  const isAuthPage = fullScreenRoutes.includes(location.pathname.toLowerCase());

  const showSidebar = user && !isAuthPage && !isLanding;
  const showNavbar = !isAuthPage;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me")
        .then((res) => {
          // ✅ FIX: Safe extraction of user data
          const userData = res.data?.user || res.data;
          
          // ✅ FIX: Validate that userData is an object, not an array
          if (userData && typeof userData === "object" && !Array.isArray(userData) && userData.id) {
            setUser(userData);
          } else if (Array.isArray(userData)) {
            // ✅ FIX: If accidentally an array, extract first element
            console.error("❌ User data is an array, expected object. Attempting recovery...");
            if (userData.length > 0 && userData[0].id) {
              console.log("✅ Recovered user from array:", userData[0]);
              setUser(userData[0]);
            } else {
              // Can't recover - invalid data structure
              console.error("❌ Cannot recover user data - array is empty or malformed");
              localStorage.removeItem("token");
              setUser(null);
            }
          } else {
            // Invalid user data
            console.error("❌ Invalid user data structure:", userData);
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("❌ Auth verification failed:", err.message);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-[#FDFDFF] font-sans overflow-x-hidden">
        {showNavbar && <Navbar user={user} onLogout={handleLogout} toggleSidebar={() => setIsMobileSidebarOpen(true)} />}

        <div className="flex">
          {showSidebar && (
            <Sidebar
              user={user}
              isMobileOpen={isMobileSidebarOpen}
              setIsMobileOpen={setIsMobileSidebarOpen}
            />
          )}

          <div className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? "lg:ml-72" : "w-full"}`}>
            <main className="flex-1">
              <Routes>
                {/* Global Access */}
                <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <UserDashboard toggleSidebar={() => setIsMobileSidebarOpen(true)} />) : <LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/register" element={<Register onLogin={setUser} />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />

                {/* User Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute user={user}><Profile setUser={setUser} toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/user-dashboard" element={<Navigate to="/" />} />
                <Route path="/add" element={<ProtectedRoute user={user}><ReportItem user={user} toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute user={user}><SearchResults toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/returned" element={<ProtectedRoute user={user}><ReturnedItems toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute user={user}><Notifications toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute user={user}><MessagingPortal toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/matches/:id" element={<ProtectedRoute user={user}><MatchDetails toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/user-match/:id" element={<ProtectedRoute user={user}><UserMatchView toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/admin/verify-claim/:id" element={<ProtectedRoute user={user} adminOnly><VerificationFlow toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />

                {/* Admin Protected Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute user={user} adminOnly><AdminPortal toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute user={user} adminOnly><AnalyticalReports toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/admin/inventory" element={<ProtectedRoute user={user} adminOnly><AdminInventory toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute user={user} adminOnly><AdminUsers toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/audit-logs" element={<ProtectedRoute user={user} adminOnly><AuditLogs toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/admin/verify/:itemId" element={<ProtectedRoute user={user} adminOnly><AdminVerificationView toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />
                <Route path="/admin/park-zones" element={<ProtectedRoute user={user} adminOnly><AdminParkZones toggleSidebar={() => setIsMobileSidebarOpen(true)} /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            {!isAuthPage && !isLanding && <Footer />}
          </div>
        </div>

        {/* Floating Chatbot Button - shown when logged in */}
        {user && <FloatingMessageButton user={user} />}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          theme="colored"
        />
      </div>
    </UserContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}