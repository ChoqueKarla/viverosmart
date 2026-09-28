import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  X,
  Sprout,
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Sectores() {
  const [sectores, setSectores] = useState([]);
  const [users, setUsers] = useState([]);

  const [newSector, setNewSector] = useState({
    name: '',
    description: '',
    userId: '',
  });

  const [editingSector, setEditingSector] = useState(null);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const navigate = useNavigate();

  /* =========================================================
     USUARIO ACTUAL Y PERMISOS
  ========================================================= */

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const canManage =
    currentUser.role === 'Administrador' ||
    (currentUser.permissions || []).includes(
      'SECTORS_MANAGE'
    );

  /* =========================================================
     HEADERS
  ========================================================= */

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  /* =========================================================
     CARGAR SECTORES
  ========================================================= */

  const fetchSectores = async () => {
    try {
      const [res, u] = await Promise.all([
        axios.get(
          `${API_URL}/smart/sectores`,
          getHeaders()
        ),
        axios.get(
          `${API_URL}/usuarios`,
          getHeaders()
        ).catch(() => ({ data: [] }))
      ]);

      setSectores(res.data);
      setUsers(u.data);
    } catch (error) {
      console.error(
        'Error al cargar sectores:',
        error
      );

      if (error.response?.status === 401) {
        navigate('/');
        return;
      }

      setMessageType('error');
      setMessage(
        error.response?.data?.error ||
          'No se pudieron cargar los sectores.'
      );
    }
  };

  useEffect(() => {
    fetchSectores();
  }, []);

  /* =========================================================
     CREAR / ACTUALIZAR
  ========================================================= */

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!canManage) {
      return;
    }

    try {
      if (editingSector) {
        await axios.put(
          `${API_URL}/smart/sectores/${editingSector.id}`,
          newSector,
          getHeaders()
        );

        setMessageType('success');
        setMessage(
          'Sector actualizado correctamente.'
        );

        setEditingSector(null);
      } else {
        await axios.post(
          `${API_URL}/smart/sectores`,
          newSector,
          getHeaders()
        );

        setMessageType('success');
        setMessage(
          'Sector creado correctamente.'
        );
      }

      setNewSector({
        name: '',
        description: '',
        userId: '',
      });

      await fetchSectores();
    } catch (error) {
      console.error(
        'Error guardando sector:',
        error
      );

      if (error.response?.status === 401) {
        navigate('/');
        return;
      }

      setMessageType('error');
      setMessage(
        error.response?.data?.error ||
          'No se pudo guardar el sector.'
      );
    }
  };

  /* =========================================================
     EDITAR
  ========================================================= */

  const handleEdit = (sector) => {
    setEditingSector(sector);

    setNewSector({
      name: sector.name,
      description: sector.description || '',
      userId: sector.userId ? String(sector.userId) : '',
    });

    setMessage('');
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '¿Seguro que deseas eliminar este sector y todos sus sensores?'
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/smart/sectores/${id}`,
        getHeaders()
      );

      if (
        editingSector &&
        editingSector.id === id
      ) {
        cancelEdit();
      }

      setMessageType('success');
      setMessage(
        'Sector eliminado correctamente.'
      );

      await fetchSectores();
    } catch (error) {
      console.error(
        'Error eliminando sector:',
        error
      );

      if (error.response?.status === 401) {
        navigate('/');
        return;
      }

      setMessageType('error');
      setMessage(
        error.response?.data?.error ||
          'No se pudo eliminar el sector.'
      );
    }
  };

  /* =========================================================
     CANCELAR EDICIÓN
  ========================================================= */

  const cancelEdit = () => {
    setEditingSector(null);

    setNewSector({
      name: '',
      description: '',
      userId: '',
    });

    setMessage('');
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
        <div className="flex flex-col gap-3">

          <div className="flex items-center gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sprout size={20} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Administración
            </p>

          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Zonas y cultivos
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Gestiona los sectores del vivero y
            consulta los dispositivos IoT asociados.
          </p>

        </div>
      </div>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      {canManage ? (
        <section
          className={`mb-7 rounded-2xl border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6 ${
            editingSector
              ? 'border-amber-200 bg-amber-50'
              : 'border-slate-200 bg-white'
          }`}
        >

          {/* ENCABEZADO DEL FORMULARIO */}

          <div className="mb-6 flex items-start gap-3">

            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                editingSector
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {editingSector ? (
                <Pencil size={18} />
              ) : (
                <Sprout size={18} />
              )}
            </div>

            <div className="min-w-0">

              <h3 className="text-base font-semibold text-slate-900">
                {editingSector
                  ? 'Editar sector'
                  : 'Nuevo sector'}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editingSector
                  ? 'Modifica la información del sector seleccionado.'
                  : 'Registra una nueva zona para organizar el vivero.'}
              </p>

            </div>

            {editingSector && (
              <button
                type="button"
                onClick={cancelEdit}
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                <X size={15} />
                Cancelar
              </button>
            )}

          </div>

          {/* FORM */}

          <form
            onSubmit={handleCreate}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.3fr_190px]"
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
                value={newSector.name}
                onChange={(e) =>
                  setNewSector({
                    ...newSector,
                    name: e.target.value,
                  })
                }
                placeholder="Ej. Invernadero Norte"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* =================================================
                DESCRIPCIÓN
            ================================================= */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Descripción
              </label>

              <input
                type="text"
                value={newSector.description}
                onChange={(e) =>
                  setNewSector({
                    ...newSector,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Descripción del sector"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* =================================================
                CLIENTE
            ================================================= */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Cliente (Opcional)
              </label>
              <select
                value={newSector.userId}
                onChange={(e) =>
                  setNewSector({
                    ...newSector,
                    userId: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Ninguno</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                BOTÓN
            ================================================= */}

            <div className="flex items-end">

              <button
                type="submit"
                className={`flex h-11 min-w-[170px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold text-white transition ${
                  editingSector
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >

                {editingSector ? (
                  <>
                    <Pencil
                      size={17}
                      strokeWidth={2}
                    />

                    <span>
                      Actualizar sector
                    </span>
                  </>
                ) : (
                  <>
                    <Sprout
                      size={17}
                      strokeWidth={2}
                    />

                    <span>
                      Crear sector
                    </span>
                  </>
                )}

              </button>

            </div>

          </form>

        </section>
      ) : (

        /* =====================================================
           SIN PERMISO
        ===================================================== */

        <div className="mb-7 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          Solo puedes consultar las zonas que
          tienes asignadas. La creación y edición
          están reservadas a la administración.
        </div>

      )}

      {/* =====================================================
          MENSAJE
      ===================================================== */}

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            messageType === 'error'
              ? 'border-red-100 bg-red-50 text-red-700'
              : 'border-emerald-100 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* =====================================================
          TABLA
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        {/* CABECERA */}

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-base font-semibold text-slate-900">
                Sectores registrados
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Zonas disponibles y dispositivos
                IoT asociados.
              </p>

            </div>

            <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {sectores.length}{' '}
              {sectores.length === 1
                ? 'sector'
                : 'sectores'}
            </span>

          </div>

        </div>

        {/* TABLA */}

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nombre
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Descripción
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cliente
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sensores IoT
                </th>

                {canManage && (
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Acciones
                  </th>
                )}

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {sectores.map((sector) => (

                <tr
                  key={sector.id}
                  className="transition hover:bg-slate-50/70"
                >

                  {/* ID */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-400">
                    #{sector.id}
                  </td>

                  {/* NOMBRE */}

                  <td className="whitespace-nowrap px-5 py-4">

                    <span className="text-sm font-semibold text-emerald-900">
                      {sector.name}
                    </span>

                  </td>

                  {/* DESCRIPCIÓN */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {sector.description ||
                      'Sin descripción'}
                  </td>

                  {/* CLIENTE */}

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {sector.user ? sector.user.name : '—'}
                    </span>
                  </td>

                  {/* SENSORES */}

                  <td className="whitespace-nowrap px-5 py-4">

                    <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {sector.sensors?.length || 0}{' '}
                      {sector.sensors?.length === 1
                        ? 'dispositivo'
                        : 'dispositivos'}
                    </span>

                  </td>

                  {/* ACCIONES */}

                  {canManage && (
                    <td className="whitespace-nowrap px-5 py-4">

                      <div className="flex justify-end gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(sector)
                          }
                          aria-label="Editar sector"
                          title="Editar"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil
                            size={17}
                            strokeWidth={1.8}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              sector.id
                            )
                          }
                          aria-label="Eliminar sector"
                          title="Eliminar"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={17}
                            strokeWidth={1.8}
                          />
                        </button>

                      </div>

                    </td>
                  )}

                </tr>

              ))}

              {/* =================================================
                  SIN SECTORES
              ================================================= */}

              {sectores.length === 0 && (

                <tr>

                  <td
                    colSpan={
                      canManage ? 5 : 4
                    }
                    className="px-6 py-14 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400">
                        <Sprout size={22} />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No hay sectores registrados
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Crea un sector para comenzar
                        a organizar las zonas del
                        vivero.
                      </p>

                    </div>

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