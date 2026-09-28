import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowUpRight, Cloud, Droplets, Leaf, MapPin, Play, Plus,
  RotateCcw, SlidersHorizontal, Sprout, Sun, Trash2
} from 'lucide-react';
import PixelArtVivero from './components/PixelArtVivero';
import MapaPin from './components/MapaPin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_LOCATION = { lat: -17.783, lng: -63.182 };
const SELECTED_PLANT_KEY = 'viverosmart.simulatorPlantId';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function loadErrorMessage(error) {
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Inicia el backend y vuelve a intentar.';
  }
  if (error.response.status === 404) {
    return 'No se encontró la planta o la ruta del simulador. Selecciona otra planta; si acabas de actualizar la aplicación, reinicia el backend.';
  }
  return 'No pudimos consultar las plantas del simulador. Comprueba la conexión del backend con la base de datos.';
}

export default function OldApp() {
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const requestedId = params.get('planta');
  const createRequested = params.get('nueva') === '1';
  return (
    <Simulator
      key={`${requestedId || 'auto'}-${revision}`}
      demo={false}
      requestedId={requestedId}
      createRequested={createRequested}
      onRetry={() => setRevision(value => value + 1)}
      onSelectPlant={id => setParams(id ? { planta: String(id) } : {})}
    />
  );
}

function Simulator({ demo, requestedId, createRequested, onRetry, onSelectPlant }) {
  const [plants, setPlants] = useState([]);
  const [collectionLoaded, setCollectionLoaded] = useState(false);
  const [plant, setPlant] = useState(null);
  const [moisture, setMoisture] = useState(45);
  const [growth, setGrowth] = useState(80);
  const [weather, setWeather] = useState('soleado');
  const [mapPosition, setMapPosition] = useState(DEFAULT_LOCATION);
  const [watering, setWatering] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(createRequested);
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('');
  const [sectors, setSectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [newSectorId, setNewSectorId] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const timer = useRef(null);
  const authenticated = Boolean(localStorage.getItem('token'));
  const accountPath = authenticated ? '/dashboard' : '/';
  const soilState = moisture <= 10 ? 'seco' : moisture <= 50 ? 'media' : 'mojado';
  const savedMoisture = plant?.soilStates?.[0]?.moisturePercentage;
  const draftMoisture = !demo && moisture !== savedMoisture;

  function applyPlant(data) {
    setPlant(data);
    setMoisture(data.soilStates?.[0]?.moisturePercentage ?? 45);
    setWeather(data.weatherStates?.[0]?.state || 'sin-registro');
    setMapPosition({ lat: data.lat, lng: data.lng });
    localStorage.setItem(SELECTED_PLANT_KEY, String(data.id));
  }

  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    async function loadPlants() {
      try {
        const [{ data }, { data: sectorData }, { data: userData }] = await Promise.all([
          axios.get(`${API_URL}/plantas`, { signal: controller.signal, headers: authHeaders() }),
          axios.get(`${API_URL}/smart/sectores`, { signal: controller.signal, headers: authHeaders() }),
          axios.get(`${API_URL}/usuarios`, { signal: controller.signal, headers: authHeaders() }).catch(() => ({ data: [] }))
        ]);
        setSectors(sectorData);
        setUsers(userData);
        setNewSectorId(current => current || String(sectorData[0]?.id || ''));
        if (!Array.isArray(data)) throw new Error('Respuesta de plantas no válida');
        setPlants(data);
        setCollectionLoaded(true);
        const rememberedId = localStorage.getItem(SELECTED_PLANT_KEY);
        const selected = requestedId
          ? data.find(item => String(item.id) === requestedId)
          : data.find(item => String(item.id) === rememberedId) || data[0];
        if (!selected) {
          if (requestedId) setError('La planta seleccionada ya no existe. Elige otra planta o registra una nueva.');
          return;
        }
        const response = await axios.get(`${API_URL}/plantas/${selected.id}`, { signal: controller.signal, headers: authHeaders() });
        if (!controller.signal.aborted) applyPlant(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) setError(loadErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadPlants();
    return () => controller.abort();
  }, [requestedId, demo]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function animateWater() {
    setWatering(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setWatering(false), 2800);
  }

  async function updatePlant(action, body, success) {
    if (!plant || pending) return;
    setPending(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`${API_URL}/plantas/${plant.id}/${action}`, body, { headers: authHeaders() });
      const { data } = await axios.get(`${API_URL}/plantas/${plant.id}`, { headers: authHeaders() });
      applyPlant(data);
      setMessage(success);
      if (action === 'riego') animateWater();
    } catch {
      setError('No se pudo completar la operación o actualizar los datos. Revisa la conexión antes de reintentar.');
    } finally {
      setPending(false);
    }
  }

  async function createPlant(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/plantas`, {
        name: newName.trim(),
        species: newSpecies.trim(),
        lat: mapPosition.lat,
        lng: mapPosition.lng,
        sectorId: Number(newSectorId),
        userId: newUserId ? Number(newUserId) : null
      }, { headers: authHeaders() });
      localStorage.setItem(SELECTED_PLANT_KEY, String(data.id));
      onSelectPlant(data.id);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo registrar la planta. Revisa los datos y la conexión con el backend.');
    } finally {
      setPending(false);
    }
  }

  async function deletePlant() {
    if (!plant || pending || !window.confirm(`¿Eliminar ${plant.name} del simulador?`)) return;
    setPending(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/plantas/${plant.id}`, { headers: authHeaders() });
      const remainingPlants = plants.filter(item => item.id !== plant.id);
      setPlants(remainingPlants);
      setPlant(null);
      setShowCreate(false);
      setMessage('Planta eliminada del simulador.');
      localStorage.removeItem(SELECTED_PLANT_KEY);
      onSelectPlant(remainingPlants[0]?.id || null);
    } catch {
      setError('No se pudo eliminar la planta del simulador.');
    } finally {
      setPending(false);
    }
  }

  function water() {
    if (demo) {
      setMoisture(100);
      animateWater();
      setMessage('Riego simulado. La humedad ahora es del 100 %.');
    } else {
      updatePlant('riego', {}, 'Riego registrado correctamente.');
    }
  }

  function changeLocation(lat, lng) {
    if (demo || !plant || showCreate) {
      setMapPosition({ lat, lng });
      if (demo) setMessage('Ubicación de demostración actualizada. No se guardó ningún cambio.');
    } else {
      updatePlant('ubicacion', { lat, lng }, 'Ubicación y clima actualizados.');
    }
  }

  const creating = !demo && !loading && ((!plant && collectionLoaded) || showCreate);
  const canExplore = demo || Boolean(plant);
  const weatherLabel = weather === 'soleado' ? 'Soleado' : weather === 'nublado' ? 'Nublado' : 'Sin registro';

  return (
    <main className="simulator-page">
      <header className="simulator-nav">
        <Link to={accountPath} className="brand">
          <span className="brand-symbol"><Leaf size={22} /></span>vivero<span>smart</span>
        </Link>
        <div className="simulator-nav-actions">
          <a className="text-link" href="#mapa-invernadero"><MapPin size={16} /> Ver mapa</a>
          <Link className="text-link" to={accountPath}><ArrowLeft size={16} /> {authenticated ? 'Volver a mi cuenta' : 'Volver'}</Link>
        </div>
      </header>
      <div className="simulator-body">
        <div className="page-heading">
          <div>
            <span className="eyebrow">BOTANICAL LAB / EXPERIENCIA INTERACTIVA</span>
            <h1>Tu vivero, <em>más vivo.</em></h1>
            <p>Explora las plantas y observa cómo cambia su entorno.</p>
          </div>
          <span className="badge"><span className="status-dot" />{plant ? 'Planta registrada' : 'Conecta tu invernadero'}</span>
        </div>

        <div className="demo-notice">
          <SlidersHorizontal size={17} />
          <span>Selecciona una planta registrada para guardar el riego, la humedad y la ubicación.</span>
        </div>

        {!demo && !loading && (
          <div className="simulator-plant-toolbar">
            <label htmlFor="simulator-plant">Planta del simulador
              <select
                id="simulator-plant"
                value={plant?.id || ''}
                disabled={pending || plants.length === 0}
                onChange={event => onSelectPlant(event.target.value)}
              >
                <option value="" disabled>{plants.length ? 'Selecciona una planta' : 'Sin plantas registradas'}</option>
                {plants.map(item => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}
              </select>
            </label>
            {plant && <button className="button button-soft" disabled={pending} onClick={() => {
              setMapPosition({ lat: plant.lat, lng: plant.lng });
              setShowCreate(value => !value);
            }}>
              <Plus size={16} />{showCreate ? 'Cancelar registro' : 'Registrar planta'}
            </button>}
            {plant && <button className="button button-soft" disabled={pending} onClick={deletePlant}><Trash2 size={16} />Eliminar planta</button>}
          </div>
        )}

        {error && <div className="feedback error" role="alert">
          <span>{error}</span>
          {!demo && <button className="text-link" disabled={pending} onClick={onRetry}><RotateCcw size={14} /> Volver a intentar</button>}
        </div>}
        {loading && <div className="loading-panel" role="status"><Sprout className="spin" size={30} /><p>Preparando tu invernadero…</p></div>}

        {creating && (
          <section className="simulator-create">
            <div>
              <span className="eyebrow">PLANTAS DEL INVERNADERO</span>
              <h2>{plant ? 'Agrega una planta al simulador' : plants.length ? 'Selecciona o registra una planta' : 'Registra tu primera planta'}</h2>
              <p>Las plantas del simulador tienen su propia ubicación e historial de riego. Los cultivos de «Mis plantas» se gestionan por separado.</p>
              <a href="#mapa-invernadero" className="text-link"><MapPin size={15} /> Elige su ubicación en el mapa</a>
            </div>
            <form onSubmit={createPlant}>
              <label htmlFor="plant-name">Nombre
                <input id="plant-name" required maxLength={100} value={newName} onChange={event => setNewName(event.target.value)} placeholder="Ej. Tomate del invernadero norte" />
              </label>
              <label htmlFor="plant-species">Especie
                <input id="plant-species" required maxLength={100} value={newSpecies} onChange={event => setNewSpecies(event.target.value)} placeholder="Ej. Solanum lycopersicum" />
              </label>
              <label htmlFor="plant-sector">Zona
                <select id="plant-sector" required value={newSectorId} onChange={event => setNewSectorId(event.target.value)}>
                  <option value="">Selecciona una zona</option>
                  {sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                </select>
              </label>
              {users.length > 0 && (
                <label htmlFor="plant-user">Cliente (Opcional)
                  <select id="plant-user" value={newUserId} onChange={event => setNewUserId(event.target.value)}>
                    <option value="">Ninguno</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </label>
              )}
              {!sectors.length && <p className="feedback error">No tienes zonas disponibles. Un administrador debe crear una zona y asignarte un cultivo antes de registrar plantas.</p>}
              <p className="small-muted">Ubicación: {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}. Puedes cambiarla en el mapa.</p>
              <button className="button button-dark" disabled={pending || !newName.trim() || !newSpecies.trim() || !newSectorId}>
                <Plus size={17} /> {pending ? 'Registrando…' : 'Registrar en el simulador'}
              </button>
            </form>
          </section>
        )}

        {!loading && canExplore && !showCreate && (
          <div className="simulator-layout">
            <section className="scene-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">01 / ECOSISTEMA</span><h2>{demo ? 'Invernadero experimental' : plant.name}</h2></div>
                <span className="small-muted">Selecciona una especie para explorar</span>
              </div>
              <PixelArtVivero soilState={soilState} weatherState={weather} watering={watering} growth={growth} />
              <div className="scene-metrics">
                <div><Droplets size={19} /><span>{draftMoisture ? 'Humedad en vista previa' : 'Humedad del suelo'}<strong>{moisture}%</strong></span></div>
                <div>{weather === 'soleado' ? <Sun size={19} /> : <Cloud size={19} />}<span>Ambiente<strong>{weatherLabel}</strong></span></div>
                <div><Sprout size={19} /><span>Estado del suelo<strong>{soilState === 'seco' ? 'Seco' : soilState === 'media' ? 'Humedad media' : 'Mojado'}</strong></span></div>
              </div>
            </section>
            <aside className="simulator-controls">
              <div className="panel-heading"><div><span className="eyebrow">02 / CONTROLES</span><h2>Ajusta el entorno</h2></div><SlidersHorizontal size={19} /></div>
              <div className="control-group">
                <label htmlFor="moisture">Humedad del suelo <strong>{moisture}%</strong></label>
                <input id="moisture" type="range" min="0" max="100" value={moisture} disabled={pending} onChange={event => setMoisture(Number(event.target.value))} />
                <div className="range-labels"><span>Seco</span><span>Saturado</span></div>
                {draftMoisture && <p className="small-muted">Vista previa sin guardar. {savedMoisture == null ? 'Todavía no hay una lectura registrada.' : `Última lectura: ${savedMoisture}%.`}</p>}
                {!demo && <button className="button button-soft" disabled={pending} onClick={() => updatePlant('simular-humedad', { moisturePercentage: moisture }, 'Humedad guardada.')}>Guardar humedad <ArrowUpRight size={16} /></button>}
              </div>
              <div className="control-group">
                <label>Iluminación <span>{demo ? 'Simulada' : 'Según ubicación'}</span></label>
                <div className="segmented">
                  <button disabled={!demo} aria-pressed={weather === 'soleado'} className={weather === 'soleado' ? 'active' : ''} onClick={() => setWeather('soleado')}><Sun size={17} /> Soleado</button>
                  <button disabled={!demo} aria-pressed={weather === 'nublado'} className={weather === 'nublado' ? 'active' : ''} onClick={() => setWeather('nublado')}><Cloud size={17} /> Nublado</button>
                </div>
                {!demo && weather === 'sin-registro' && <p className="small-muted">Selecciona la ubicación en el mapa para consultar el clima.</p>}
              </div>
              <div className="control-group">
                <label htmlFor="growth">Crecimiento visual <strong>{growth}%</strong></label>
                <input id="growth" type="range" min="0" max="100" value={growth} onChange={event => setGrowth(Number(event.target.value))} />
                <div className="range-labels"><span>Brote</span><span>Desarrollo</span></div>
                <p className="small-muted">Vista ilustrativa; no representa una medición real.</p>
              </div>
              <button className="button button-dark" disabled={pending || watering} onClick={water}>
                <Droplets size={18} />{pending ? 'Guardando…' : watering ? 'Regando…' : demo ? 'Simular riego' : 'Registrar riego (100%)'}<Play size={15} />
              </button>
              {demo && <button className="text-link reset-control" onClick={() => {
                setMoisture(45); setGrowth(80); setWeather('soleado'); setMapPosition(DEFAULT_LOCATION);
                setMessage(''); setWatering(false); clearTimeout(timer.current);
              }}><RotateCcw size={14} /> Restablecer simulación</button>}
              {message && <p className="feedback success" role="status">{message}</p>}
              <div className="care-note">
                <Leaf size={20} />
                <div><strong>Una mirada a tus raíces</strong><p>{demo
                  ? moisture <= 10 ? 'El suelo está seco. Prueba el riego y observa cómo cambia su color.'
                    : moisture > 50 ? 'El suelo está mojado. Explora un nivel menor de humedad para comparar.'
                    : 'Mueve los controles para descubrir cómo responde el invernadero.'
                  : plant.recommendations?.[0]?.message || 'Sin recomendaciones registradas para esta planta.'}</p></div>
              </div>
            </aside>
          </div>
        )}

        <section className="simulator-map-section" id="mapa-invernadero" aria-labelledby="map-title">
          <div className="panel-heading">
            <div><span className="eyebrow">03 / UBICACIÓN</span><h2 id="map-title"><MapPin size={19} /> Mapa del invernadero</h2></div>
            <span className="badge">{demo ? 'Mapa de demostración' : creating ? 'Ubicación para registrar' : plant ? 'Ubicación guardada' : 'Ubicación de referencia'}</span>
          </div>
          <p>{demo
            ? 'Selecciona cualquier punto para explorar. La ubicación solo cambia en esta demostración.'
            : creating
              ? 'Elige dónde estará la nueva planta. Esta ubicación se guardará al registrarla.'
              : plant ? 'Selecciona un punto para guardar la ubicación de esta planta y actualizar su clima.'
                : 'El mapa permanece disponible. Al conectar una planta podrás guardar su ubicación.'}</p>
          <MapaPin
            currentLat={mapPosition.lat}
            currentLng={mapPosition.lng}
            disabled={loading || pending}
            onLocationChange={changeLocation}
          />
          <div className="map-coordinates"><span>Latitud: {mapPosition.lat.toFixed(5)}</span><span>Longitud: {mapPosition.lng.toFixed(5)}</span>{pending && <span role="status">Guardando cambios…</span>}</div>
        </section>

        <div className="simulator-bottom">
          <div><span className="eyebrow">DISEÑADO PARA EXPLORAR</span><h2>Cada detalle cuenta.</h2><p>Selecciona las plantas, acerca la escena y compara el suelo con distintos niveles de humedad.</p></div>
          <div className="lab-card"><Sprout size={32} /><div>
            <h3>Del primer brote al siguiente paso.</h3>
            <p>{authenticated ? 'Tu cuenta sigue activa. Regresa a tus cultivos y recursos cuando quieras.' : 'Ingresa a tu cuenta para consultar tus cultivos y recursos.'}</p>
            <Link className="text-link" to={accountPath}>Ir a mi cuenta <ArrowUpRight size={16} /></Link>
          </div></div>
        </div>
        <footer className="workspace-footer"><span>VIVEROSMART / BOTANICAL LAB</span><span>Tecnología que acompaña a la naturaleza.</span></footer>
      </div>
    </main>
  );
}
