import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AboutPage } from "../pages/AboutPage";
import { AdminDataPage } from "../pages/AdminDataPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { EventDetailPage } from "../pages/EventDetailPage";
import { EventsPage } from "../pages/EventsPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SubmitEventPage } from "../pages/SubmitEventPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventsPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      { path: "submit", element: <SubmitEventPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "admin/login", element: <AdminLoginPage /> },
      { path: "admin", element: <AdminDashboardPage /> },
      { path: "admin/data", element: <AdminDataPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
