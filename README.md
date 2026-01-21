# CAR-HERO

# Car-Hero — Gestión de recogida de vehículos para ITV

Este repositorio contiene el proyecto **Car-Hero**, una aplicación para gestionar la recogida de vehículos solicitada por clientes, asignación por parte del administrador a empleados (por ubicación), traslado a ITV, seguimiento y devolución al cliente.

**Stack principal**: Frontend (React), Backend (Laravel), BD (MySQL).  
Documentación en este wiki: funcionalidades, arquitectura, ER, API, despliegue y flujo de trabajo.




docker image prune -f
docker compose build --no-cache
docker compose restart backend
docker compose restart frontend
php artisan optimize:clear
docker compose up -d
docker compose down


http://localhost:5173  → frontend
http://localhost:8000  → backend 
http://localhost:8081  → db


