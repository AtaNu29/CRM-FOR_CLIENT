import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { MembershipPlans } from "./pages/MembershipPlans";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/customer",
    Component: CustomerDashboard,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/membership-plans",
    Component: MembershipPlans,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
