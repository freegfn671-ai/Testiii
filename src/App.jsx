import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home.jsx";
import QuestCatalog from "./pages/QuestCatalog.jsx";
import QuestDetails from "./pages/QuestDetails.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import MapPage from "./pages/MapPage.jsx";
import Layout from "./components/Layout.jsx";

import { QuestProvider } from "./hooks/useQuests";

export default function App() {
  return (
    <QuestProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1c1c1f",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="quests" element={<QuestCatalog />} />
            <Route path="quests/:slug" element={<QuestDetails />} />
            <Route path=":lang/quest/:slug" element={<QuestDetails />} />
            <Route path="map" element={<MapPage />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/:tab" element={<AdminDashboard />} />
            <Route path="manager" element={<ManagerDashboard />} />
            <Route path="manager/:tab" element={<ManagerDashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QuestProvider>
  );
}
