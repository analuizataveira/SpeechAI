import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import App from "@/presentation/app";
import HomePage from "@/presentation/app/home/page";
import DashboardPage from "@/presentation/app/dashboard/page";
import ExercisePage from "@/presentation/app/exercise/page";
import ResultsPage from "@/presentation/app/results/page";
import ReportsPage from "@/presentation/app/reports/page";
import LoginPage from "@/presentation/app/login/page";
import RegisterPage from "@/presentation/app/register/page";
import SettingsPage from "@/presentation/app/settings/page";

const router = createBrowserRouter([
  {
    path: AppRoutes.BASE.key,
    element: <App />,
    children: [
      {
        path: AppRoutes.BASE.key,
        element: <HomePage />,
      },
      {
        path: AppRoutes.BASE.DASHBOARD.key,
        element: <DashboardPage />,
      },
      {
        path: AppRoutes.BASE.EXERCISE.key,
        element: <ExercisePage />,
      },
      {
        path: AppRoutes.BASE.RESULTS.key,
        element: <ResultsPage />,
      },
      {
        path: AppRoutes.BASE.REPORTS.key,
        element: <ReportsPage />,
      },
      {
        path: AppRoutes.BASE.LOGIN.key,
        element: <LoginPage />,
      },
      {
        path: AppRoutes.BASE.REGISTER.key,
        element: <RegisterPage />,
      },
      {
        path: AppRoutes.BASE.SETTINGS.key,
        element: <SettingsPage />,
      },
    ],
  },
]);

export { router };
