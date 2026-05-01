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
const Gallery = lazy(() => import('@/pages/Gallery'));
const Modules = lazy(() => import('@/pages/Modules'));
const ModuleStub = lazy(() => import('@/pages/ModuleStub'));
const GuideBots = lazy(() => import('@/pages/modules/GuideBots'));
const Geoguesser = lazy(() => import('@/pages/modules/Geoguesser'));
const AuthWgCallback = lazy(() => import('@/pages/AuthWgCallback'));
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
const AdminModules = lazy(() => import('@/pages/admin/AdminModules'));
const AdminQuizList = lazy(() => import('@/pages/admin/AdminQuizList'));
const AdminQuizEdit = lazy(() => import('@/pages/admin/AdminQuizEdit'));
const AdminQuizCategories = lazy(() => import('@/pages/admin/AdminQuizCategories'));
const AdminQuizStats = lazy(() => import('@/pages/admin/AdminQuizStats'));
const AdminGeoHome = lazy(() => import('@/pages/admin/AdminGeoHome'));
const AdminGeoMaps = lazy(() => import('@/pages/admin/AdminGeoMaps'));
const AdminGeoSettings = lazy(() => import('@/pages/admin/AdminGeoSettings'));
const AdminGeoShots = lazy(() => import('@/pages/admin/AdminGeoShots'));
const AdminGeoShotEdit = lazy(() => import('@/pages/admin/AdminGeoShotEdit'));
const AdminGeoShotsBulk = lazy(() => import('@/pages/admin/AdminGeoShotsBulk'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
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
          { path: '/galerie', element: <Gallery /> },
          { path: '/modules', element: <Modules /> },
          { path: '/modules/guide-bots', element: <GuideBots /> },
          { path: '/modules/wot-geoguesser', element: <Geoguesser /> },
          { path: '/modules/:slug', element: <ModuleStub /> },
          { path: '/recrutement', element: <Recruitment /> },
          { path: '/auth/wg/callback', element: <AuthWgCallback /> },
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
          { path: 'modules', element: <AdminModules /> },
          { path: 'quiz', element: <AdminQuizList /> },
          { path: 'quiz/categories', element: <AdminQuizCategories /> },
          { path: 'quiz/stats', element: <AdminQuizStats /> },
          { path: 'quiz/new', element: <AdminQuizEdit /> },
          { path: 'quiz/:id', element: <AdminQuizEdit /> },
          { path: 'geoguesser', element: <AdminGeoHome /> },
          { path: 'geoguesser/maps', element: <AdminGeoMaps /> },
          { path: 'geoguesser/shots', element: <AdminGeoShots /> },
          { path: 'geoguesser/shots/bulk', element: <AdminGeoShotsBulk /> },
          { path: 'geoguesser/shots/new', element: <AdminGeoShotEdit /> },
          { path: 'geoguesser/shots/:id', element: <AdminGeoShotEdit /> },
          { path: 'geoguesser/settings', element: <AdminGeoSettings /> },
          { path: 'utilisateurs', element: <AdminUsers /> },
          { path: 'parametres', element: <AdminSettings /> },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
