import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Droplet,
  Zap,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [consumptions, setConsumptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    Promise.all([
      axios.get(`${API_URL}/smart/consumos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      axios
        .get(`${API_URL}/smart/alertas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .catch(() => ({ data: [] })),
    ])
      .then(([consumptionResponse, alertResponse]) => {
        setConsumptions(
          Array.isArray(consumptionResponse.data)
            ? consumptionResponse.data
            : []
        );

        setAlerts(
          Array.isArray(alertResponse.data)
            ? alertResponse.data
            : []
        );
      })
      .catch(() => {
        setError(
          'No se pudieron cargar los consumos del vivero.'
        );
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const recordedLatest = consumptions.reduce(
    (date, item) => {
      const current = new Date(item.timestamp);

      return current > date ? current : date;
    },
    new Date(0)
  );

  const latest = recordedLatest.getTime()
    ? recordedLatest
    : new Date();

  const data = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(latest);

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + offset);

    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const rows = consumptions.filter((item) => {
      const value = new Date(item.timestamp);

      return value >= date && value < next;
    });

    return {
      name: date
        .toLocaleDateString('es', {
          weekday: 'short',
        })
        .replace('.', ''),

      agua: rows
        .filter(
          (item) =>
            String(item.resourceType).toUpperCase() ===
            'AGUA'
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.quantity || 0),
          0
        ),

      energia: rows
        .filter(
          (item) =>
            String(item.resourceType).toUpperCase() ===
            'ENERGIA'
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.quantity || 0),
          0
        ),
    };
  });

  const water = consumptions
    .filter(
      (item) =>
        String(item.resourceType).toUpperCase() ===
        'AGUA'
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  const energy = consumptions
    .filter(
      (item) =>
        String(item.resourceType).toUpperCase() ===
        'ENERGIA'
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  const value = (amount) =>
    loading
      ? '…'
      : new Intl.NumberFormat('es', {
          maximumFractionDigits: 1,
        }).format(amount);

  return (
    <div className="dashboard-page min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-7">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Panel principal
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              Resumen general
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Monitoreo centralizado del consumo de agua,
              energía y alertas del vivero.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/dashboard/reportes')
            }
            className="group flex h-11 items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <FileText size={17} />

            <span>
              Generar reporte
            </span>

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* KPI */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">

        {/* AGUA */}
        <article className="metric-water group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Consumo de agua
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Acumulado registrado
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
              <Droplet size={21} />
            </div>

          </div>

          <div className="mt-6 flex items-end gap-2">

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {value(water)}
            </h2>

            <span className="mb-1 text-sm font-semibold text-slate-400">
              L
            </span>

          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[68%] rounded-full bg-blue-500" />
          </div>

        </article>

        {/* ENERGÍA */}
        <article className="metric-energy group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Consumo de energía
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Acumulado registrado
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105">
              <Zap size={21} />
            </div>

          </div>

          <div className="mt-6 flex items-end gap-2">

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {value(energy)}
            </h2>

            <span className="mb-1 text-sm font-semibold text-slate-400">
              kWh
            </span>

          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[52%] rounded-full bg-amber-500" />
          </div>

        </article>

        {/* ALERTAS */}
        <article className="metric-alerts group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Alertas activas
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Requieren seguimiento
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:scale-105">
              <AlertTriangle size={21} />
            </div>

          </div>

          <div className="mt-6 flex items-end gap-2">

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {loading ? '…' : alerts.length}
            </h2>

            <span className="mb-1 text-sm font-semibold text-slate-400">
              activas
            </span>

          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                alerts.length
                  ? 'w-[70%] bg-rose-500'
                  : 'w-0'
              }`}
            />
          </div>

        </article>

      </div>

      {/* CHARTS */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* AGUA */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-100 px-5 py-5 lg:px-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Consumo semanal
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Agua
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Evolución de litros registrados durante los últimos siete días.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Droplet size={19} />
              </div>

            </div>

          </div>

          <div className="h-80 px-3 pb-5 pt-5 lg:px-5">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eef0ed"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94a3b8',
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94a3b8',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: '#f8fafc',
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow:
                      '0 8px 25px rgba(15,23,42,0.08)',
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                />

                <Bar
                  dataKey="agua"
                  name="Litros consumidos"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </section>

        {/* ENERGÍA */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-100 px-5 py-5 lg:px-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Consumo semanal
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Energía
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Evolución de kWh registrados durante los últimos siete días.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Zap size={19} />
              </div>

            </div>

          </div>

          <div className="h-80 px-3 pb-5 pt-5 lg:px-5">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eef0ed"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94a3b8',
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94a3b8',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow:
                      '0 8px 25px rgba(15,23,42,0.08)',
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="energia"
                  name="kWh consumidos"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{
                    strokeWidth: 2,
                    r: 4,
                    fill: '#ffffff',
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </section>

      </div>

      {/* FOOTER DE INFORMACIÓN */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-slate-700">
              Monitoreo del vivero
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Los gráficos muestran los registros disponibles de los últimos siete días.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/dashboard/reportes')
            }
            className="flex w-fit items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            Ver reportes
            <ArrowRight size={15} />
          </button>

        </div>

      </section>

    </div>
  );
}