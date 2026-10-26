import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { RoadmapDetailPage } from "./pages/RoadmapDetailPage";
import { RoadmapsPage } from "./pages/RoadmapsPage";
import { loadRoadmaps, saveRoadmaps } from "./storage";
import type { Roadmap } from "./types";
import "./App.css";

function AppRoutes() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(loadRoadmaps);

  useEffect(() => {
    saveRoadmaps(roadmaps);
  }, [roadmaps]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage roadmaps={roadmaps} />} />
        <Route path="/roadmaps" element={<RoadmapsPage roadmaps={roadmaps} />} />
        <Route
          path="/roadmaps/:slug"
          element={<RoadmapDetailPage roadmaps={roadmaps} setRoadmaps={setRoadmaps} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
