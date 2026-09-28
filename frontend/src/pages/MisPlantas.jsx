
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sun,
  Droplets,
  ArrowRight,
  Leaf,
  Sprout,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PlantAvatar = ({ type }) => {
  const value = String(type || '').toLowerCase();

  const isTomato =
    value.includes('tomat') || value.includes('solanum');

  const isSunflower =
    value.includes('girasol') || value.includes('helianthus');

  const commonClass =
    'drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1';

  if (isTomato) {
    return (
      <svg
        width="92"
        height="105"
        viewBox="0 0 100 120"
        className={commonClass}
        aria-hidden="true"
      >
        <path
          d="M50 120 Q48 70 52 20"
          stroke="#2E7D32"
          strokeWidth="4"
          fill="none"
        />

        <path
          d="M52 80 Q70 70 80 50"
          stroke="#388E3C"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M49 60 Q30 55 20 40"
          stroke="#388E3C"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M80 50 Q85 45 90 52 Q82 58 80 50"
          fill="#4CAF50"
        />

        <path
          d="M20 40 Q15 35 10 42 Q18 48 20 40"
          fill="#4CAF50"
        />

        <circle
          cx="70"
          cy="90"
          r="12"
          fill="#E53935"
          stroke="#B71C1C"
          strokeWidth="1"
        />

        <circle
          cx="30"
          cy="70"
          r="14"
          fill="#E53935"
          stroke="#B71C1C"
          strokeWidth="1"
        />

        <circle
          cx="60"
          cy="30"
          r="10"
          fill="#FF5252"
          stroke="#D32F2F"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (isSunflower) {
    return (
      <svg
        width="92"
        height="105"
        viewBox="0 0 100 120"
        className={commonClass}
        aria-hidden="true"
      >
        <path
          d="M50 120 Q50 70 50 30"
          stroke="#4CAF50"
          strokeWidth="4"
          fill="none"
        />

        <path
          d="M50 80 Q70 70 75 85 Q65 90 50 80"
          fill="#81C784"
        />

        <path
          d="M50 60 Q30 50 25 65 Q35 70 50 60"
          fill="#81C784"
        />

        <circle
          cx="50"
          cy="30"
          r="22"
          fill="#FFD54F"
        />

        <path d="M50 0 L55 15 L45 15 Z" fill="#FFC107" />
        <path d="M50 60 L55 45 L45 45 Z" fill="#FFC107" />
        <path d="M20 30 L35 25 L35 35 Z" fill="#FFC107" />
        <path d="M80 30 L65 25 L65 35 Z" fill="#FFC107" />
        <path d="M28 9 L40 18 L34 23 Z" fill="#FFC107" />
        <path d="M72 9 L60 18 L66 23 Z" fill="#FFC107" />
        <path d="M72 51 L60 42 L66 37 Z" fill="#FFC107" />
        <path d="M28 51 L40 42 L34 37 Z" fill="#FFC107" />

        <circle
          cx="50"
          cy="30"
          r="12"
          fill="#5D4037"
          stroke="#3E2723"
          strokeWidth="2"
        />

        <circle
          cx="50"
          cy="30"
          r="8"
          fill="#4E342E"
          stroke="#3E2723"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  return (
    <svg
      width="92"
      height="105"
      viewBox="0 0 100 120"
      className={commonClass}
      aria-hidden="true"
    >
      <path
        d="M50 120 Q50 80 50 60"
        stroke="#4CAF50"
        strokeWidth="4"
        fill="none"
      />

      <path
        d="M50 60 Q20 60 20 30 Q50 30 50 60"
        fill="#81C784"
        stroke="#4CAF50"
        strokeWidth="2"
      />

      <path
        d="M50 70 Q80 70 80 40 Q50 40 50 70"
        fill="#A5D6A7"
        stroke="#4CAF50"
        strokeWidth="2"
      />
    </svg>
  );
};

export default function MisPlantas() {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlantas = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/smart/mis-plantas`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setPlantas(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlantas();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#f6f7f5] p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="mb-8 h-10 w-64 rounded-lg bg-slate-200" />

          <div className="mb-8 h-4 w-96 max-w-full rounded bg-slate-200" />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[390px] rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  const total = plantas.length;

  return (
    <div className="min-h-full bg-[#f6f7f5] p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            CABECERA
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#092f25] text-emerald-300 shadow-sm">
              <Leaf size={23} strokeWidth={2} />
            </div>

            <div>

              <div className="mb-1 flex items-center gap-2">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Cultivos
                </span>

                <span className="h-1 w-1 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Seguimiento
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Mis plantas
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Supervisa el crecimiento y estado de tus cultivos
                desde un solo lugar.
              </p>

            </div>

          </div>

          {/* RESUMEN */}

          <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Sprout size={19} />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cultivos registrados
              </p>

              <p className="text-lg font-bold leading-5 text-slate-800">
                {total}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            CONTENIDO
        ====================================================== */}

        {plantas.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {plantas.map((planta) => {

              const growth = Math.min(
                100,
                Math.max(
                  0,
                  Number(planta.growthPercent) || 0
                )
              );

              return (

                <div
                  key={planta.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60"
                >

                  {/* =================================================
                      HEADER DE LA PLANTA
                  ================================================== */}

                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#edf8f2] via-white to-[#f5faf7] px-6 py-5">

                    <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" />

                    <div className="absolute -bottom-20 left-20 h-36 w-36 rounded-full bg-lime-100/40 blur-3xl" />

                    <div className="relative z-10 flex h-full justify-between">

                      <div className="flex max-w-[65%] flex-col justify-center">

                        <span className="mb-2 w-fit rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
                          Cultivo activo
                        </span>

                        <h2 className="text-xl font-bold leading-tight text-[#092f25]">
                          {planta.name}
                        </h2>

                        <p className="mt-1 flex flex-col text-xs font-medium uppercase tracking-wider text-emerald-700/70">

                          <span>
                            {planta.species || 'Especie general'}
                          </span>

                          {planta.sector?.name && (
                            <span className="mt-1 flex items-center gap-1 font-bold text-[#092f25]">

                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                              Zona: {planta.sector.name}

                            </span>
                          )}

                        </p>

                      </div>

                      <div className="flex items-end justify-end">

                        <PlantAvatar
                          type={
                            planta.species ||
                            planta.name
                          }
                        />

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      INFORMACIÓN
                  ================================================== */}

                  <div className="p-5">

                    {/* ETAPA */}

                    <div className="mb-6">

                      <div className="mb-2 flex items-center justify-between">

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Etapa actual
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {planta.stage}
                          </p>

                        </div>

                        <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5">

                          <span className="text-sm font-bold text-emerald-700">
                            {growth}%
                          </span>

                        </div>

                      </div>

                      {/* BARRA */}

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#123c30] transition-all duration-1000 ease-out"
                          style={{
                            width: `${growth}%`,
                          }}
                        />

                      </div>

                      <div className="mt-2 flex justify-between">

                        <span className="text-[10px] font-medium text-slate-400">
                          Semilla
                        </span>

                        <span className="text-[10px] font-semibold text-emerald-700">
                          {growth}% de crecimiento
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          Cosecha
                        </span>

                      </div>

                    </div>

                    {/* INDICADORES */}

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">

                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                          <Sun size={17} />
                        </div>

                        <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700/70">
                          Luz recibida
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-amber-900">
                          Óptima
                        </p>

                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">

                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                          <Droplets size={17} />
                        </div>

                        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-700/70">
                          Riego
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-blue-900">
                          Adecuado
                        </p>

                      </div>

                    </div>

                    {/* PIE */}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                      <div className="flex items-center gap-2 text-xs text-slate-400">

                        <Activity size={14} />

                        <span>
                          Seguimiento activo
                        </span>

                      </div>

                      <button
                        type="button"
                        className="group/button flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition hover:text-[#092f25]"
                      >
                        Ver detalle

                        <ChevronRight
                          size={15}
                          className="transition-transform group-hover/button:translate-x-0.5"
                        />

                      </button>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        ) : (

          /* =====================================================
             ESTADO VACÍO
          ====================================================== */

          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="flex w-full max-w-md flex-col items-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Sprout size={30} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Sin cultivos
              </span>

              <h2 className="mt-2 text-center text-xl font-bold text-slate-800">
                Todavía no tienes plantas asignadas
              </h2>

              <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-slate-500">
                Registra una planta para comenzar a realizar el
                seguimiento de su crecimiento y estado.
              </p>

              <button
                type="button"
                onClick={() => navigate('/simulador?nueva=1')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#123c30] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d3026] hover:shadow-md active:scale-[0.98]"
              >
                Registrar una planta

                <ArrowRight size={17} />

              </button>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

