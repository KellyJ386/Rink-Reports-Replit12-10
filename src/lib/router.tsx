import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingPage } from '../components/ui';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })));

// Ice Depth Module
const IceDepthList = lazy(() => import('../pages/ice-depth/IceDepthList').then(m => ({ default: m.IceDepthList })));
const IceDepthNew = lazy(() => import('../pages/ice-depth/IceDepthNew').then(m => ({ default: m.IceDepthNew })));
const IceDepthDetail = lazy(() => import('../pages/ice-depth/IceDepthDetail').then(m => ({ default: m.IceDepthDetail })));

// Ice Operations Module
const IceOpsLanding = lazy(() => import('../pages/ice-ops/IceOpsLanding').then(m => ({ default: m.IceOpsLanding })));
const IceMakeNew = lazy(() => import('../pages/ice-ops/IceMakeNew').then(m => ({ default: m.IceMakeNew })));
const IceMakeList = lazy(() => import('../pages/ice-ops/IceMakeList').then(m => ({ default: m.IceMakeList })));
const CircleCheckNew = lazy(() => import('../pages/ice-ops/CircleCheckNew').then(m => ({ default: m.CircleCheckNew })));
const CircleCheckList = lazy(() => import('../pages/ice-ops/CircleCheckList').then(m => ({ default: m.CircleCheckList })));
const BladeChangeNew = lazy(() => import('../pages/ice-ops/BladeChangeNew').then(m => ({ default: m.BladeChangeNew })));
const BladeChangeList = lazy(() => import('../pages/ice-ops/BladeChangeList').then(m => ({ default: m.BladeChangeList })));
const EndOfDayNew = lazy(() => import('../pages/ice-ops/EndOfDayNew').then(m => ({ default: m.EndOfDayNew })));
const EndOfDayList = lazy(() => import('../pages/ice-ops/EndOfDayList').then(m => ({ default: m.EndOfDayList })));

// Reports Module
const ReportsDashboard = lazy(() => import('../pages/reports/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })));

// Admin Module
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('../pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const FacilitySettings = lazy(() => import('../pages/admin/FacilitySettings').then(m => ({ default: m.FacilitySettings })));
const RinkSettings = lazy(() => import('../pages/admin/RinkSettings').then(m => ({ default: m.RinkSettings })));
const ResurfacerSettings = lazy(() => import('../pages/admin/ResurfacerSettings').then(m => ({ default: m.ResurfacerSettings })));
const ThresholdSettings = lazy(() => import('../pages/admin/ThresholdSettings').then(m => ({ default: m.ThresholdSettings })));
const NotificationSettings = lazy(() => import('../pages/admin/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const FormBuilder = lazy(() => import('../pages/admin/FormBuilder').then(m => ({ default: m.FormBuilder })));

// Wrapper for lazy components with loading fallback
// eslint-disable-next-line react-refresh/only-export-components
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingPage message="Loading..." />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LazyPage><Login /></LazyPage>,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LazyPage><Dashboard /></LazyPage>,
      },
      // Ice Depth Module
      {
        path: 'ice-depth',
        children: [
          {
            index: true,
            element: <LazyPage><IceDepthList /></LazyPage>,
          },
          {
            path: 'new',
            element: <LazyPage><IceDepthNew /></LazyPage>,
          },
          {
            path: ':id',
            element: <LazyPage><IceDepthDetail /></LazyPage>,
          },
        ],
      },
      // Ice Operations Module
      {
        path: 'ice-ops',
        children: [
          {
            index: true,
            element: <LazyPage><IceOpsLanding /></LazyPage>,
          },
          // Ice Make
          {
            path: 'ice-makes',
            element: <LazyPage><IceMakeList /></LazyPage>,
          },
          {
            path: 'ice-make/new',
            element: <LazyPage><IceMakeNew /></LazyPage>,
          },
          // Circle Check
          {
            path: 'circle-checks',
            element: <LazyPage><CircleCheckList /></LazyPage>,
          },
          {
            path: 'circle-check/new',
            element: <LazyPage><CircleCheckNew /></LazyPage>,
          },
          // Blade Change
          {
            path: 'blade-changes',
            element: <LazyPage><BladeChangeList /></LazyPage>,
          },
          {
            path: 'blade-change/new',
            element: <LazyPage><BladeChangeNew /></LazyPage>,
          },
          // End of Day
          {
            path: 'end-of-day',
            element: <LazyPage><EndOfDayList /></LazyPage>,
          },
          {
            path: 'end-of-day/new',
            element: <LazyPage><EndOfDayNew /></LazyPage>,
          },
        ],
      },
      // Reports Module
      {
        path: 'reports',
        element: <LazyPage><ReportsDashboard /></LazyPage>,
      },
      // Admin Module
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <LazyPage><AdminDashboard /></LazyPage>,
          },
          {
            path: 'users',
            element: <LazyPage><UserManagement /></LazyPage>,
          },
          {
            path: 'facility',
            element: <LazyPage><FacilitySettings /></LazyPage>,
          },
          {
            path: 'rinks',
            element: <LazyPage><RinkSettings /></LazyPage>,
          },
          {
            path: 'resurfacers',
            element: <LazyPage><ResurfacerSettings /></LazyPage>,
          },
          {
            path: 'thresholds',
            element: <LazyPage><ThresholdSettings /></LazyPage>,
          },
          {
            path: 'notifications',
            element: <LazyPage><NotificationSettings /></LazyPage>,
          },
          {
            path: 'forms',
            element: <LazyPage><FormBuilder /></LazyPage>,
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
