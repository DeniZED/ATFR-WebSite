/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AcademyLayout } from '@/components/layout/AcademyLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { RequireModuleAccess } from '@/components/layout/RequireModuleAccess';
import { RequireClanAccess } from '@/components/layout/RequireClanAccess';
import { ClanLayout } from '@/components/clan/ClanLayout';
import { Spinner } from '@/components/ui';

const Home = lazy(() => import('@/pages/Home'));
const CwEventsList = lazy(() => import('@/pages/clan/CwEventsList'));
const CwEventDetail = lazy(() => import('@/pages/clan/CwEventDetail'));
const ClanHome = lazy(() => import('@/pages/clan/ClanHome'));
const ClanChars = lazy(() => import('@/pages/clan/ClanChars'));
const ClanRoles = lazy(() => import('@/pages/clan/ClanRoles'));
const ClanStrategies = lazy(() => import('@/pages/clan/ClanStrategies'));
const ClanMaps = lazy(() => import('@/pages/clan/ClanMaps'));
const ClanDoctrine = lazy(() => import('@/pages/clan/ClanDoctrine'));
const ClanLiens = lazy(() => import('@/pages/clan/ClanLiens'));
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
const AdminPlayers = lazy(() => import('@/pages/admin/AdminPlayers'));
const AdminPlayerDetail = lazy(() => import('@/pages/admin/AdminPlayerDetail'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminCwEvents = lazy(() => import('@/pages/admin/AdminCwEvents'));
const AdminCwEventDetail = lazy(() => import('@/pages/admin/AdminCwEventDetail'));
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
const AdminClanPages = lazy(() => import('@/pages/admin/AdminClanPages'));
const AdminClanContent = lazy(() => import('@/pages/admin/AdminClanContent'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminAcademie = lazy(() => import('@/pages/admin/AdminAcademie'));

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
          { path: '/recrutement', element: <Recruitment /> },
          { path: '/auth/wg/callback', element: <AuthWgCallback /> },
          { path: '/clan-hub', element: <Navigate to="/clan" replace /> },
          { path: '/clan-hub/*', element: <Navigate to="/clan" replace /> },
          {
            element: <RequireClanAccess slug="clan-hub" />,
            children: [
              {
                element: <ClanLayout />,
                children: [
                  { path: '/clan', element: <ClanHome /> },
                  { path: '/clan/chars', element: <ClanChars /> },
                  { path: '/clan/roles', element: <ClanRoles /> },
                  { path: '/clan/strategies', element: <ClanStrategies /> },
                  { path: '/clan/maps', element: <ClanMaps /> },
                  { path: '/clan/doctrine', element: <ClanDoctrine /> },
                  { path: '/clan/liens', element: <ClanLiens /> },
                  { path: '/clan/evenements', element: <CwEventsList /> },
                  { path: '/clan/evenements/:eventId', element: <CwEventDetail /> },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <AcademyLayout />,
        children: [
          { path: '/modules', element: <Modules /> },
          { path: '/modules/guide-bots', element: <GuideBots /> },
          { path: '/modules/wot-geoguesser', element: <Geoguesser /> },
          { path: '/modules/:slug', element: <ModuleStub /> },
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
          {
            element: <RequireModuleAccess moduleKey="candidatures" />,
            children: [{ path: 'candidatures', element: <AdminApplications /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="membres" />,
            children: [{ path: 'membres', element: <AdminMembers /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="rh" />,
            children: [
              { path: 'rh', element: <AdminPlayers /> },
              { path: 'rh/:id', element: <AdminPlayerDetail /> },
            ],
          },
          {
            element: <RequireModuleAccess moduleKey="evenements" />,
            children: [{ path: 'evenements', element: <AdminEvents /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="clan-wars" />,
            children: [
              { path: 'clan-wars', element: <AdminCwEvents /> },
              { path: 'clan-wars/:eventId', element: <AdminCwEventDetail /> },
            ],
          },
          {
            element: <RequireModuleAccess moduleKey="contenu" />,
            children: [{ path: 'contenu', element: <AdminContent /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="galerie" />,
            children: [{ path: 'galerie', element: <AdminGallery /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="moments" />,
            children: [{ path: 'moments', element: <AdminHighlights /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="palmares" />,
            children: [{ path: 'palmares', element: <AdminAchievements /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="temoignages" />,
            children: [{ path: 'temoignages', element: <AdminTestimonials /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="modules" />,
            children: [{ path: 'modules', element: <AdminModules /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="quiz" />,
            children: [
              { path: 'quiz', element: <AdminQuizList /> },
              { path: 'quiz/categories', element: <AdminQuizCategories /> },
              { path: 'quiz/stats', element: <AdminQuizStats /> },
              { path: 'quiz/new', element: <AdminQuizEdit /> },
              { path: 'quiz/:id', element: <AdminQuizEdit /> },
            ],
          },
          {
            element: <RequireModuleAccess moduleKey="geoguesser" />,
            children: [
              { path: 'geoguesser', element: <AdminGeoHome /> },
              { path: 'geoguesser/maps', element: <AdminGeoMaps /> },
              { path: 'geoguesser/shots', element: <AdminGeoShots /> },
              { path: 'geoguesser/shots/bulk', element: <AdminGeoShotsBulk /> },
              { path: 'geoguesser/shots/new', element: <AdminGeoShotEdit /> },
              { path: 'geoguesser/shots/:id', element: <AdminGeoShotEdit /> },
              { path: 'geoguesser/settings', element: <AdminGeoSettings /> },
            ],
          },
          {
            element: <RequireModuleAccess moduleKey="academie" />,
            children: [{ path: 'academie', element: <AdminAcademie /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="pages-clan" />,
            children: [
              { path: 'pages-clan', element: <AdminClanPages /> },
              { path: 'pages-clan/contenu', element: <AdminClanContent /> },
            ],
          },
          {
            element: <RequireModuleAccess moduleKey="utilisateurs" />,
            children: [{ path: 'utilisateurs', element: <AdminUsers /> }],
          },
          {
            element: <RequireModuleAccess moduleKey="parametres" />,
            children: [{ path: 'parametres', element: <AdminSettings /> }],
          },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
