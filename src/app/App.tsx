import { BrowserRouter as Router, Routes, Route } from "react-router";
import Dashboard from "./mainpages/Dashboard";
import EditorPage from "./EditorPage";
import Login from "./mainpages/Login";
import ProtectedRoute from "./mainpages/ProtectedRoute";
import PostDashboard from "./mainpages/PostDashboard";
import PostDashboardWrapper from "./mainpages/PostDashboardWrapper";
import ViewPage from "./mainpages/ViewPage";
import LostAndFound from "./mainpages/LostAndFound";
// import RTSPStream from "./streaming/RTSPViewer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDashboardWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view/:id"
          element={
            <ProtectedRoute>
              <ViewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lostandfound"
          element={
            <ProtectedRoute>
              <LostAndFound />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path = '/stream'
          element = {
            <ProtectedRoute>
              <RTSPStream />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
}