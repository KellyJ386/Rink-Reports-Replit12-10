import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Page imports
import { Dashboard } from '../pages/Dashboard';
import { IceDepthList } from '../pages/ice-depth/IceDepthList';
import { IceDepthNew } from '../pages/ice-depth/IceDepthNew';
import { IceDepthDetail } from '../pages/ice-depth/IceDepthDetail';
import {
  IceOpsLanding,
  IceMakeNew,
  IceMakeList,
  CircleCheckNew,
  CircleCheckList,
  BladeChangeNew,
  BladeChangeList,
  EndOfDayNew,
  EndOfDayList,
} from '../pages/ice-ops';
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
        path: 'ice-ops',
        children: [
          {
            index: true,
            element: <IceOpsLanding />,
          },
          // Ice Make
          {
            path: 'ice-makes',
            element: <IceMakeList />,
          },
          {
            path: 'ice-make/new',
            element: <IceMakeNew />,
          },
          // Circle Check
          {
            path: 'circle-checks',
            element: <CircleCheckList />,
          },
          {
            path: 'circle-check/new',
            element: <CircleCheckNew />,
          },
          // Blade Change
          {
            path: 'blade-changes',
            element: <BladeChangeList />,
          },
          {
            path: 'blade-change/new',
            element: <BladeChangeNew />,
          },
          // End of Day
          {
            path: 'end-of-day',
            element: <EndOfDayList />,
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
