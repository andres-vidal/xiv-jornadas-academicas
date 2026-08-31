import { createRoot } from "react-dom/client";
import {
  createBrowserRouter, createMemoryRouter, Navigate, RouterProvider, useLocation,
} from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

/* the settings travel in the query string, so the redirect has to carry it */
const ToTree = () => <Navigate to={{ pathname: "/arbol", search: useLocation().search }} replace />;

const routes = [
  { path: "/arbol", element: <App /> },
  { path: "/nube", element: <App /> },
  { path: "*", element: <ToTree /> },
];

/* A browser router needs an address bar it can write to. Inside the artifact the
   page runs in a frame, and from the filesystem pushState throws, so there we use
   an in-memory router: same routes, no URL. */
const owned = (() => {
  try { return window.top === window && location.protocol !== "file:"; }
  catch { return false; }
})();

const router = owned
  ? createBrowserRouter(routes, { basename: __BASE_PATH__.replace(/\/+$/, "") || "/" })
  : createMemoryRouter(routes, { initialEntries: ["/arbol"] });

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
