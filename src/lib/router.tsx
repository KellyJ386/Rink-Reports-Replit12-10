import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Page imports
import { Dashboard } from '../pages/Dashboard';
import { IceDepthList } from '../pages/ice-depth/IceDepthList';
import { IceDepthNew } from '../pages/ice-depth/IceDepthNew';
import { IceDepthDetail } from '../pages/ice-depth/IceDepthDetail';
import { IceMakeList } from '../pages/ice-operations/IceMakeList';
import { IceMakeNew } from '../pages/ice-operations/IceMakeNew';
import { CircleCheckNew } from '../pages/ice-operations/CircleCheckNew';
import { BladeChangeNew } from '../pages/ice-operations/BladeChangeNew';
import { EndOfDayNew } from '../pages/ice-operations/EndOfDayNew';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { FacilitySettings } from '../pages/admin/FacilitySettings';
import { RinkSettings } from '../pages/admin/RinkSettings';
import { ResurfacerSettings } from '../pages/admin/ResurfacerSettings';
import { Login } from '../pages/auth/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Ice Depth Module
      {
        path: 'ice-depth',
        children: [
          {
            index: true,
            element: <IceDepthList />,
          },
          {
            path: 'new',
            element: <IceDepthNew />,
          },
          {
            path: ':id',
            element: <IceDepthDetail />,
          },
        ],
      },
      // Ice Operations Module
      {
        path: 'ice-operations',
        children: [
          {
            index: true,
            element: <IceMakeList />,
          },
          {
            path: 'ice-make/new',
            element: <IceMakeNew />,
          },
          {
            path: 'circle-check/new',
            element: <CircleCheckNew />,
          },
          {
            path: 'blade-change/new',
            element: <BladeChangeNew />,
          },
          {
            path: 'end-of-day/new',
            element: <EndOfDayNew />,
          },
        ],
      },
      // Admin Module
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <UserManagement />,
          },
          {
            path: 'facility',
            element: <FacilitySettings />,
          },
          {
            path: 'rinks',
            element: <RinkSettings />,
          },
          {
            path: 'resurfacers',
            element: <ResurfacerSettings />,
          },
        ],
      },
      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
