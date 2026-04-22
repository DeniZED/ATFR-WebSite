/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { Spinner } from '@/components/ui';

const Home = lazy(() => import('@/pages/Home'));
const Members = lazy(() => import('@/pages/Members'));
const Events = lazy(() => import('@/pages/Events'));
const Recruitment = lazy(() => import('@/pages/Recruitment'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Login = lazy(() => import('@/pages/admin/Login'));
const AdminHome = lazy(() => import('@/pages/admin/AdminHome'));
const AdminApplications = lazy(() => import('@/pages/admin/AdminApplications'));
const AdminMembers = lazy(() => import('@/pages/admin/AdminMembers'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminContent = lazy(() => import('@/pages/admin/AdminContent'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminHighlights = lazy(() => import('@/pages/admin/AdminHighlights'));
const AdminAchievements = lazy(() => import('@/pages/admin/AdminAchievements'));
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

function Loading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner label="Chargement…" />
    </div>
  );
}

const Lazy = () => (
  <Suspense fallback={<Loading />}>
    <Outlet />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Lazy />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/membres', element: <Members /> },
          { path: '/evenements', element: <Events /> },
          { path: '/recrutement', element: <Recruitment /> },
        ],
      },
      { path: '/admin/login', element: <Login /> },
      {
        path: '/admin',
        element: (
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <AdminHome /> },
          { path: 'candidatures', element: <AdminApplications /> },
          { path: 'membres', element: <AdminMembers /> },
          { path: 'evenements', element: <AdminEvents /> },
          { path: 'contenu', element: <AdminContent /> },
          { path: 'galerie', element: <AdminGallery /> },
          { path: 'moments', element: <AdminHighlights /> },
          { path: 'palmares', element: <AdminAchievements /> },
          { path: 'temoignages', element: <AdminTestimonials /> },
          { path: 'parametres', element: <AdminSettings /> },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
