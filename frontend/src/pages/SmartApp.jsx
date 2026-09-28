import '../styles/premium.css';

import { useState, useEffect } from 'react';

import {
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import axios from 'axios';

import {
  LayoutDashboard,
  Leaf,
  FileSpreadsheet,
  LogOut,
  Settings,
  Bell,
  TreePine,
  Sprout,
  CalendarClock,
  Radio,
  Activity,
  ShieldCheck,
  UserRound,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

import Dashboard from './Dashboard';
import Sectores from './Sectores';
import Sensores from './Sensores';
import Umbrales from './Umbrales';
import Reportes from './Reportes';
import Usuarios from './Usuarios';
import MisPlantas from './MisPlantas';
import Programaciones from './Programaciones';
import Cultivos from './Cultivos';
import Comparacion from './Comparacion';
import Permisos from './Permisos';
import Auditoria from './Auditoria';
import Alertas from './Alertas';
import Consolidados from './Consolidados';
import Anomalias from './Anomalias';
import Historicos from './Historicos';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const menuPermissions = {
  '/dashboard': 'REPORTS_VIEW',
  '/dashboard/mis-plantas': 'REPORTS_VIEW',
  '/dashboard/sectores': 'SECTORS_MANAGE',
  '/dashboard/cultivos': 'CROPS_MANAGE',
  '/dashboard/sensores': 'SENSORS_MANAGE',
  '/dashboard/umbrales': 'THRESHOLDS_MANAGE',
  '/dashboard/programaciones': 'SCHEDULES_MANAGE',
  '/dashboard/reportes': 'REPORTS_VIEW',
  '/dashboard/comparacion': 'REPORTS_VIEW',
  '/dashboard/alertas': 'REPORTS_VIEW',
  '/dashboard/anomalias': 'REPORTS_VIEW',
  '/dashboard/consolidados': 'REPORTS_VIEW',
  '/dashboard/historicos': 'REPORTS_VIEW',
  '/dashboard/usuarios': 'USERS_MANAGE',
  '/dashboard/permisos': 'ROLES_MANAGE',
  '/dashboard/auditoria': 'AUDIT_VIEW',
};

export default function SmartApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const role =
    (typeof currentUser.role === 'string'
      ? currentUser.role
      : currentUser.role?.name) || 'Cliente';

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/smart/alertas`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setAlerts(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
  };

  const allMenuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard Analítico',
      icon: <LayoutDashboard size={19} />,
      section: 'Principal',
      roles: ['Administrador', 'Operador', 'Cliente', 'Tecnico'],
    },
    {
      path: '/dashboard/mis-plantas',
      label: 'Mis Plantas',
      icon: <Sprout size={19} />,
      section: 'Principal',
      roles: ['Administrador', 'Cliente'],
    },
    {
      path: '/dashboard/sectores',
      label: 'Zonas y Cultivos',
      icon: <Leaf size={19} />,
      section: 'Operación',
      roles: ['Administrador', 'Operador'],
    },
    {
      path: '/dashboard/cultivos',
      label: 'Cultivos',
      icon: <Sprout size={19} />,
      section: 'Operación',
      roles: ['Administrador', 'Operador'],
    },
    {
      path: '/dashboard/sensores',
      label: 'Sensores IoT',
      icon: <Radio size={19} />,
      section: 'Operación',
      roles: ['Administrador', 'Tecnico'],
    },
    {
      path: '/dashboard/umbrales',
      label: 'Umbrales y Alertas',
      icon: <Bell size={19} />,
      section: 'Operación',
      roles: ['Administrador', 'Tecnico'],
    },
    {
      path: '/dashboard/programaciones',
      label: 'Riego e Iluminación',
      icon: <CalendarClock size={19} />,
      section: 'Operación',
      roles: ['Administrador', 'Operador'],
    },
    {
      path: '/dashboard/reportes',
      label: 'Auditoría y Exportación',
      icon: <FileSpreadsheet size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Cliente'],
    },
    {
      path: '/dashboard/comparacion',
      label: 'Comparar Consumos',
      icon: <Activity size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Operador', 'Cliente'],
    },
    {
      path: '/dashboard/alertas',
      label: 'Centro de Alertas',
      icon: <Bell size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Operador', 'Tecnico'],
    },
    {
      path: '/dashboard/anomalias',
      label: 'Consumos Anormales',
      icon: <Activity size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Operador', 'Tecnico'],
    },
    {
      path: '/dashboard/consolidados',
      label: 'Reportes Consolidados',
      icon: <FileSpreadsheet size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Operador', 'Cliente'],
    },
    {
      path: '/dashboard/historicos',
      label: 'Archivos Históricos',
      icon: <FileSpreadsheet size={19} />,
      section: 'Análisis',
      roles: ['Administrador', 'Operador', 'Cliente'],
    },
    {
      path: '/dashboard/usuarios',
      label: 'Gestión de Personal',
      icon: <Settings size={19} />,
      section: 'Administración',
      roles: ['Administrador'],
    },
    {
      path: '/dashboard/permisos',
      label: 'Roles y Permisos',
      icon: <ShieldCheck size={19} />,
      section: 'Administración',
      roles: ['Administrador'],
    },
    {
      path: '/dashboard/auditoria',
      label: 'Registro de Auditoría',
      icon: <FileSpreadsheet size={19} />,
      section: 'Administración',
      roles: ['Administrador'],
    },
  ];

  const assignedPermissions = new Set(
    Array.isArray(currentUser.permissions)
      ? currentUser.permissions
      : []
  );

  const menuItems = allMenuItems.filter(
    (item) =>
      role === 'Administrador' ||
      (assignedPermissions.size
        ? assignedPermissions.has(menuPermissions[item.path])
        : item.roles.includes(role))
  );

  const canAccess = (path) =>
    role === 'Administrador' ||
    (assignedPermissions.size
      ? assignedPermissions.has(menuPermissions[path])
      : Boolean(
          allMenuItems
            .find((item) => item.path === path)
            ?.roles.includes(role)
        ));

  const protectedPage = (path, element) =>
    canAccess(path)
      ? element
      : <Navigate to="/dashboard" replace />;

  const pages = {
    '/dashboard': <Dashboard />,

    '/dashboard/mis-plantas': protectedPage(
      '/dashboard/mis-plantas',
      <MisPlantas />
    ),

    '/dashboard/sectores': protectedPage(
      '/dashboard/sectores',
      <Sectores />
    ),

    '/dashboard/cultivos': protectedPage(
      '/dashboard/cultivos',
      <Cultivos />
    ),

    '/dashboard/sensores': protectedPage(
      '/dashboard/sensores',
      <Sensores />
    ),

    '/dashboard/umbrales': protectedPage(
      '/dashboard/umbrales',
      <Umbrales />
    ),

    '/dashboard/programaciones': protectedPage(
      '/dashboard/programaciones',
      <Programaciones />
    ),

    '/dashboard/reportes': protectedPage(
      '/dashboard/reportes',
      <Reportes />
    ),

    '/dashboard/comparacion': protectedPage(
      '/dashboard/comparacion',
      <Comparacion />
    ),

    '/dashboard/alertas': protectedPage(
      '/dashboard/alertas',
      <Alertas />
    ),

    '/dashboard/anomalias': protectedPage(
      '/dashboard/anomalias',
      <Anomalias />
    ),

    '/dashboard/consolidados': protectedPage(
      '/dashboard/consolidados',
      <Consolidados />
    ),

    '/dashboard/historicos': protectedPage(
      '/dashboard/historicos',
      <Historicos />
    ),

    '/dashboard/usuarios': protectedPage(
      '/dashboard/usuarios',
      <Usuarios />
    ),

    '/dashboard/permisos': protectedPage(
      '/dashboard/permisos',
      <Permisos />
    ),

    '/dashboard/auditoria': protectedPage(
      '/dashboard/auditoria',
      <Auditoria />
    ),

    '/dashboard/cuenta': (
      <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Configuración
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Mi cuenta
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Consulta la información de tu cuenta dentro de ViveroSmart.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <div className="bg-[#1a2f26] px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500 text-xl font-bold text-white shadow-lg">
                  {(currentUser.name || role)
                    .split(/\s+/)
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {currentUser.name || 'Usuario'}
                  </h3>

                  <p className="mt-1 text-sm text-emerald-300">
                    {role}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nombre
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {currentUser.name || 'Usuario'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rol
                </p>

                <p className="mt-2 font-semibold text-emerald-700">
                  {role}
                </p>
              </div>

              {currentUser.email && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Correo electrónico
                  </p>

                  <p className="mt-2 font-medium text-slate-700">
                    {currentUser.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const normalizedPath =
    location.pathname.replace(/\/+$/, '') || '/';

  const currentPage =
    pages[normalizedPath] || (
      <Navigate to="/dashboard" replace />
    );

  const sections = [
    'Principal',
    'Operación',
    'Análisis',
    'Administración',
  ];

  useEffect(() => {
    setShowNotifications(false);
    setShowAccount(false);
    setWorkspaceOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="premium-shell flex h-screen overflow-hidden bg-[#f4f7f6] font-sans selection:bg-emerald-200">

      {mobileOpen && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          premium-sidebar
          fixed inset-y-0 left-0 z-40
          flex w-72 shrink-0 flex-col
          bg-[#172d24]
          text-emerald-50
          shadow-2xl
          transition-transform
          md:static
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        <div className="border-b border-white/10 bg-black/10 px-5 py-5">
          <div className="flex items-center gap-3">

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-950/40">
              <TreePine
                className="text-white"
                size={25}
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-wide text-white">
                ViveroSmart
              </h1>

              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
                Enterprise Edition
              </p>
            </div>

            <button
              className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-emerald-200 transition hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar navegación"
            >
              <X size={19} />
            </button>

          </div>
        </div>

        <div className="relative px-4 pt-4">

          <button
            onClick={() => {
              setWorkspaceOpen((value) => !value);
              setShowAccount(false);
              setShowNotifications(false);
            }}
            className="workspace-label flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-emerald-500/30 hover:bg-white/10"
          >

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500 font-black text-white">
              V
            </span>

            <span className="flex-1 text-sm font-bold text-white">
              Mi vivero

              <small className="mt-0.5 block font-normal text-emerald-200/60">
                Espacio de trabajo
              </small>
            </span>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                workspaceOpen ? 'rotate-180' : ''
              }`}
            />

          </button>

          {workspaceOpen && (
            <div className="workspace-popover absolute left-4 right-4 top-full z-50 mt-2 overflow-hidden rounded-xl border border-emerald-700/70 bg-[#214438] p-1.5 shadow-xl">

              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  navigate('/dashboard/sectores');
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-emerald-50 transition hover:bg-white/10"
              >
                <span>Ver sectores</span>

                <ArrowUpRight size={14} />
              </button>

              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  navigate('/simulador');
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-emerald-50 transition hover:bg-white/10"
              >
                <span>Abrir simulador</span>

                <ArrowUpRight size={14} />
              </button>

            </div>
          )}

        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-5">

          {sections.map((section) => {

            const sectionItems = menuItems.filter(
              (item) => item.section === section
            );

            if (!sectionItems.length) {
              return null;
            }

            return (
              <div
                key={section}
                className="mt-6"
              >

                <div className="mb-2 px-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/50">
                    {section}
                  </p>
                </div>

                <div className="space-y-1">

                  {sectionItems.map((item) => {

                    const isActive =
                      normalizedPath === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`
                          group
                          flex w-full items-center gap-3
                          rounded-xl
                          px-3.5 py-2.5
                          text-left
                          text-sm
                          font-semibold
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                              : 'text-emerald-100/65 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >

                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                            ${
                              isActive
                                ? 'bg-white/15'
                                : 'bg-white/5 group-hover:bg-white/10'
                            }
                          `}
                        >
                          {item.icon}
                        </span>

                        <span className="truncate">
                          {item.label}
                        </span>

                      </button>
                    );
                  })}

                </div>
              </div>
            );
          })}

          <div className="mt-7 border-t border-white/10 pt-6">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/50">
              Herramientas visuales
            </p>

            <button
              onClick={() => navigate('/simulador')}
              className="group flex w-full items-center gap-3 rounded-xl border border-emerald-700/50 bg-emerald-500/5 px-3.5 py-3 text-left text-sm font-semibold text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >

              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </span>

              <span>
                Simulador Interactivo
              </span>

            </button>

          </div>

        </nav>

        <div className="border-t border-white/10 bg-black/20 p-4">

          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">

            <div
              className={`
                grid h-10 w-10 shrink-0 place-items-center
                rounded-xl
                border
                text-xs font-bold text-white
                ${
                  role === 'Administrador'
                    ? 'border-purple-400 bg-purple-700'
                    : role === 'Operador'
                    ? 'border-blue-400 bg-blue-700'
                    : role === 'Tecnico'
                    ? 'border-orange-400 bg-orange-700'
                    : 'border-emerald-400 bg-emerald-700'
                }
              `}
            >
              {role.substring(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {currentUser.name || 'Usuario'}
              </p>

              <p className="mt-0.5 text-xs text-emerald-400">
                {role}
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

        </div>

      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-auto">

        <header className="premium-topbar sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-stone-200 bg-white/95 px-4 shadow-sm backdrop-blur-md md:px-8">

          <div className="flex items-center gap-3">

            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-emerald-300 hover:text-emerald-600 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu size={20} />
            </button>

            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                ViveroSmart
              </p>

              <p className="mt-0.5 text-sm font-medium text-stone-500">
                Plataforma de gestión inteligente
              </p>
            </div>

          </div>

          <div className="relative flex items-center gap-3">

            <button
              onClick={() => {
                setShowNotifications((value) => !value);
                setShowAccount(false);
                setWorkspaceOpen(false);
              }}
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
              aria-label="Abrir notificaciones"
            >

              <Bell size={20} />

              {alerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-red-500" />
                </span>
              )}

            </button>

            <button
              aria-label="Abrir menú de usuario"
              onClick={() => {
                setShowAccount((value) => !value);
                setShowNotifications(false);
                setWorkspaceOpen(false);
              }}
              className="topbar-avatar grid h-11 w-11 place-items-center rounded-xl border border-emerald-700 bg-emerald-600 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              {(currentUser.name || role)
                .split(/\s+/)
                .map((x) => x[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </button>

            {showAccount && (
              <div className="account-popover absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">

                <div className="bg-[#1a2f26] p-5">
                  <div className="flex items-center gap-3">

                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-sm font-bold text-white">
                      {(currentUser.name || role)
                        .split(/\s+/)
                        .map((x) => x[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {currentUser.name || 'Usuario'}
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-300">
                        {role}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-2">

                  <button
                    onClick={() => {
                      setShowAccount(false);
                      navigate('/dashboard/cuenta');
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                      <UserRound size={17} />
                    </span>

                    <span>Mi cuenta</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600">
                      <LogOut size={17} />
                    </span>

                    <span>Cerrar sesión</span>
                  </button>

                </div>
              </div>
            )}

            {showNotifications && (
              <div className="absolute right-14 top-14 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-4">

                  <div>
                    <h3 className="text-sm font-bold text-stone-800">
                      Últimas alertas
                    </h3>

                    <p className="mt-0.5 text-xs text-stone-400">
                      Notificaciones del sistema
                    </p>
                  </div>

                  {alerts.length > 0 && (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                      {alerts.length}
                    </span>
                  )}

                </div>

                <div className="max-h-80 overflow-y-auto">

                  {alerts.length === 0 ? (
                    <div className="px-6 py-10 text-center">

                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-stone-100 text-stone-400">
                        <Bell size={21} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-stone-700">
                        No hay alertas recientes
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        El sistema no tiene nuevas notificaciones.
                      </p>

                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="border-b border-stone-100 px-5 py-4 transition hover:bg-stone-50"
                      >

                        <div className="flex items-start gap-3">

                          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500">
                            <Bell size={16} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                              {alert.level}
                            </p>

                            <p className="mt-1 text-sm font-medium leading-5 text-stone-800">
                              {alert.reason}
                            </p>

                            <p className="mt-2 text-xs text-stone-400">
                              {new Date(
                                alert.timestamp
                              ).toLocaleString()}
                            </p>

                          </div>

                        </div>

                      </div>
                    ))
                  )}

                </div>

              </div>
            )}

          </div>

        </header>

        <main className="premium-content min-h-0 flex-1 bg-[#f4f7f6] pb-12">

          <div data-dashboard-path={normalizedPath}>
            {currentPage}
          </div>

        </main>

      </div>

    </div>
  );
}