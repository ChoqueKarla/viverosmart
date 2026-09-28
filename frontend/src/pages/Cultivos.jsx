import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const empty = {
  name: '',
  species: '',
  sectorId: '',
  userId: '',
  stage: 'Semilla',
  growthPercent: 0,
};

export default function Cultivos() {
  const [crops, setCrops] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  /* =========================================================
     CARGAR DATOS
  ========================================================= */

  const load = async () => {
    try {
      const [c, s, u] = await Promise.all([
        axios.get(`${API_URL}/smart/cultivos`, {
          headers: headers(),
        }),
        axios.get(`${API_URL}/smart/sectores`, {
          headers: headers(),
        }),
        axios.get(`${API_URL}/usuarios`, {
          headers: headers(),
        }).catch(() => ({ data: [] })),
      ]);

      setCrops(c.data);
      setSectors(s.data);
      setUsers(u.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =========================================================
     ACTUALIZAR FORMULARIO
  ========================================================= */

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     GUARDAR
  ========================================================= */

  const save = async (e) => {
    e.preventDefault();

    try {
      const body = {
        ...form,
        sectorId: Number(form.sectorId),
        userId: form.userId ? Number(form.userId) : null,
        growthPercent: Number(form.growthPercent),
      };

      if (editing) {
        await axios.put(
          `${API_URL}/smart/cultivos/${editing}`,
          body,
          {
            headers: headers(),
          }
        );
      } else {
        await axios.post(
          `${API_URL}/smart/cultivos`,
          body,
          {
            headers: headers(),
          }
        );
      }

      setEditing(null);
      setForm(empty);

      await load();
    } catch (error) {
      console.error(
        'Error guardando cultivo:',
        error
      );
    }
  };

  /* =========================================================
     EDITAR
  ========================================================= */

  const edit = (c) => {
    setEditing(c.id);

    setForm({
      name: c.name,
      species: c.species || '',
      sectorId: String(c.sectorId),
      userId: c.userId ? String(c.userId) : '',
      stage: c.stage,
      growthPercent: c.growthPercent,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar cultivo?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/smart/cultivos/${id}`,
        {
          headers: headers(),
        }
      );

      await load();
    } catch (error) {
      console.error(
        'Error eliminando cultivo:',
        error
      );
    }
  };

  /* =========================================================
     CANCELAR EDICIÓN
  ========================================================= */

  const cancelEdit = () => {
    setEditing(null);
    setForm(empty);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">

        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Producción
          </p>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestión de cultivos
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Registra, actualiza y asigna cultivos a los
          diferentes sectores del vivero.
        </p>

      </div>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <section
        className={`mb-6 rounded-2xl border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6 ${
          editing
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-slate-200 bg-white'
        }`}
      >

        {/* CABECERA FORMULARIO */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p
              className={`mb-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                editing
                  ? 'text-amber-700'
                  : 'text-emerald-600'
              }`}
            >
              {editing
                ? 'Editando registro'
                : 'Nuevo registro'}
            </p>

            <h3 className="text-lg font-bold text-slate-900">
              {editing
                ? 'Actualizar cultivo'
                : 'Registrar cultivo'}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? 'Modifica los datos del cultivo seleccionado.'
                : 'Completa la información para registrar un nuevo cultivo.'}
            </p>

          </div>

          {/* CANCELAR */}

          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              <X size={16} />
              Cancelar
            </button>
          )}

        </div>

        {/* FORM */}

        <form
          onSubmit={save}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        >

          {/* =================================================
              NOMBRE
          ================================================= */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Nombre
            </label>

            <input
              required
              type="text"
              placeholder="Nombre del cultivo"
              value={form.name}
              onChange={(e) =>
                updateForm(
                  'name',
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

          </div>

          {/* =================================================
              ESPECIE
          ================================================= */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Especie
            </label>

            <input
              type="text"
              placeholder="Ej. Solanum lycopersicum"
              value={form.species}
              onChange={(e) =>
                updateForm(
                  'species',
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

          </div>

          {/* =================================================
              SECTOR
          ================================================= */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Sector
            </label>

            <select
              required
              value={form.sectorId}
              onChange={(e) =>
                updateForm(
                  'sectorId',
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >

              <option value="">
                Seleccionar sector
              </option>

              {sectors.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.name}
                </option>
              ))}

            </select>

          </div>

          {/* =================================================
              CLIENTE
          ================================================= */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Cliente (Opcional)
            </label>
            <select
              value={form.userId}
              onChange={(e) => updateForm('userId', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Ninguno</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              ETAPA
          ================================================= */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Etapa
            </label>

            <select
              value={form.stage}
              onChange={(e) =>
                updateForm(
                  'stage',
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >

              {[
                'Semilla',
                'Brote',
                'Crecimiento',
                'Floración',
                'Cosecha',
              ].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}

            </select>

          </div>

          {/* =================================================
              PROGRESO
          ================================================= */}

          <div>

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Progreso
            </label>

            <div className="relative">

              <input
                min="0"
                max="100"
                type="number"
                value={form.growthPercent}
                onChange={(e) =>
                  updateForm(
                    'growthPercent',
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                %
              </span>

            </div>

          </div>

          {/* =================================================
              BOTONES
          ================================================= */}

          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-5">

            {/* BOTÓN PRINCIPAL */}

            <button
              type="submit"
              className={`flex h-11 w-fit min-w-[170px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] ${
                editing
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >

              {editing ? (
                <Pencil
                  size={16}
                  strokeWidth={2}
                />
              ) : (
                <Plus
                  size={17}
                  strokeWidth={2}
                />
              )}

              <span>
                {editing
                  ? 'Guardar cambios'
                  : 'Agregar cultivo'}
              </span>

            </button>

            {/* CANCELAR EN EDICIÓN */}

            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancelar
              </button>
            )}

          </div>

        </form>

      </section>

      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        {/* CULTIVOS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cultivos registrados
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {crops.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Registros disponibles
          </p>

        </div>

        {/* SECTORES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sectores
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {sectors.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Sectores disponibles
          </p>

        </div>

        {/* ESTADO */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Estado
          </p>

          <div className="mt-3 flex items-center gap-3">

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-semibold text-slate-700">
              Gestión activa
            </span>

          </div>

          <p className="mt-2 text-sm text-slate-500">
            Los cultivos pueden actualizarse desde esta pantalla.
          </p>

        </div>

      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        {/* CABECERA */}

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-base font-semibold text-slate-900">
                Cultivos registrados
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Consulta y administra los cultivos existentes.
              </p>

            </div>

            {crops.length > 0 && (
              <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {crops.length}{' '}
                {crops.length === 1
                  ? 'registro'
                  : 'registros'}
              </span>
            )}

          </div>

        </div>

        {/* TABLA */}

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cultivo
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Especie
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sector
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cliente
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Etapa
                </th>

                <th className="min-w-[180px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Progreso
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {crops.map((c) => (

                <tr
                  key={c.id}
                  className="transition hover:bg-slate-50/70"
                >

                  {/* CULTIVO */}

                  <td className="px-5 py-4">

                    <span className="text-sm font-semibold text-slate-800">
                      {c.name}
                    </span>

                  </td>

                  {/* ESPECIE */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {c.species || '—'}
                  </td>

                  {/* SECTOR */}

                  <td className="px-5 py-4">

                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {c.sector?.name || '—'}
                    </span>

                  </td>

                  {/* CLIENTE */}

                  <td className="px-5 py-4">

                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {c.user?.name || '—'}
                    </span>

                  </td>

                  {/* ETAPA */}

                  <td className="px-5 py-4">

                    <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {c.stage}
                    </span>

                  </td>

                  {/* PROGRESO */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                c.growthPercent,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      <span className="w-10 text-right text-xs font-semibold text-slate-600">
                        {c.growthPercent}%
                      </span>

                    </div>

                  </td>

                  {/* ACCIONES */}

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() => edit(c)}
                        aria-label="Editar cultivo"
                        title="Editar cultivo"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          remove(c.id)
                        }
                        aria-label="Eliminar cultivo"
                        title="Eliminar cultivo"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {/* SIN CULTIVOS */}

              {!crops.length && (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-14 text-center"
                  >

                    <p className="text-sm font-semibold text-slate-700">
                      No hay cultivos registrados
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Utiliza el formulario superior para
                      agregar el primer cultivo.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}