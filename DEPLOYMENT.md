# Despliegue de ViveroSmart

Estos archivos preparan el proyecto para tres entornos distintos:

- `docker-compose.yml`: ejecuta la API y el frontend en contenedores, usando
  directamente el PostgreSQL que ya tienes instalado en tu PC.
- `backend/Dockerfile` y `frontend/Dockerfile`: producen las imágenes que se
  publicarán en Amazon ECR.
- `k8s/`: describe los recursos que Amazon EKS ejecutará. Reemplaza siempre
  `ACCOUNT_ID`, `AWS_REGION`, `IMAGE_TAG` y `TU_DOMINIO` antes de aplicarlos.

## Usar Docker con tu base PostgreSQL existente

Compose no crea una base de prueba ni ejecuta `db push`. `backend/.env` mantiene
la configuración normal del backend. El archivo `.env.docker` de la raíz debe
contener únicamente la conexión que Docker utilizará:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASENA@host.docker.internal:5432/viverosmart?schema=public
```

Compose carga primero `backend/.env` y después `.env.docker`, por lo que este
último reemplaza solamente `DATABASE_URL` dentro del contenedor.

`host.docker.internal` significa "la PC anfitriona" desde Docker Desktop. No
uses `localhost` en `.env.docker`: desde el contenedor, `localhost`
sería el propio contenedor de la API y no tu PC.

Después inicia los dos contenedores:

```powershell
docker compose up --build
```

La web queda en `http://localhost:8080`, la API en `http://localhost:5000` y
su comprobación de disponibilidad en `http://localhost:5000/health`. Todos los
cambios hechos desde la aplicación van a tu base real local, así que Docker no
ofrece aislamiento de datos en esta modalidad.

## Qué es `VITE_API_URL`

El navegador no puede conocer la red interna de Kubernetes. `VITE_API_URL` es
la URL pública a la que el JavaScript de React envía las peticiones de API.
El código la usa en `frontend/src/services/api.js`.

Vite lee solo las variables cuyo nombre empieza por `VITE_` y las inserta en
los archivos estáticos **durante `npm run build`**. Por eso no es un secreto y
no se puede cambiar simplemente con una variable al iniciar Nginx. Para AWS,
si el Ingress publica la aplicación en `https://app.ejemplo.com`, el valor
correcto al construir la imagen es:

```text
VITE_API_URL=https://app.ejemplo.com/api
```

La configuración de Ingress enruta `/api` a Express y el resto al frontend,
así el navegador usa un único dominio. Esto evita problemas de CORS.

## Secretos y base de datos

`k8s/secret.example.yaml` enumera las variables que la API necesita, pero no
contiene secretos reales. En AWS crea la base en Amazon RDS PostgreSQL en una
subred privada; permite el puerto 5432 solo desde EKS y guarda las credenciales
en AWS Secrets Manager. Después sincronízalas como el secreto `api-secrets`.

La API recibe `DATABASE_URL`, `JWT_SECRET` y las credenciales SMTP desde ese
secreto. El frontend no recibe esas variables.

## Aplicar en EKS

Primero publica las imágenes en ECR con un tag inmutable, por ejemplo el SHA
del commit. Luego sustituye los marcadores de los manifiestos y ejecuta:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl -n viverosmart create secret generic api-secrets --from-env-file=backend/.env.production
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/web.yaml
kubectl apply -f k8s/ingress.yaml
```

El clúster necesita una clase de Ingress `alb`, proporcionada por EKS Auto Mode
o por AWS Load Balancer Controller. El Ingress crea un ALB público.

## Migraciones de Prisma

El repositorio aún no tiene `prisma/migrations`; por esa razón
`k8s/migrate-job.yaml` es una plantilla para usar **después** de crear y subir
la primera migración versionada. Crea esa migración conectándote a una base de
desarrollo vacía:

```powershell
cd backend
npx prisma migrate dev --name initial
```

Después, en cada versión, ejecuta el Job una vez antes de actualizar la API.
El Job usa `prisma migrate deploy`, que aplica únicamente migraciones ya
versionadas y es seguro para producción. No uses `migrate dev` ni ejecutes
seeds en RDS de producción.

## Escalado

El frontend tiene dos réplicas. La API queda inicialmente en una réplica
porque al arrancar ejecuta tareas cron que generan lecturas y archivos. Antes
de escalar la API, mueve esas tareas a un `CronJob` de Kubernetes o asegúrate
de que exista un único ejecutor; de otro modo, dos pods pueden duplicar tareas.
