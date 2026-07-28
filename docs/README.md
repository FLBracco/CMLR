# CMLR

CMLR es una plataforma SaaS orientada inicialmente a psicólogos y psiquiatras que busca facilitar la gestión de pacientes e historias clínicas digitales.

El objetivo principal es reducir la dependencia del papel y agilizar tareas como registrar pacientes, buscar rápidamente sus datos y consultar el historial de consultas.

> **Estado:** En desarrollo — MVP.

## Objetivo del proyecto

CMLR busca proporcionar a los profesionales una herramienta sencilla para gestionar la información de sus pacientes y registrar las consultas realizadas, permitiendo acceder rápidamente al historial clínico desde un único lugar.

El proyecto comienza enfocado en profesionales de la salud mental, con la posibilidad de evolucionar posteriormente hacia otros profesionales de la salud.

## MVP

El MVP estará centrado en las funcionalidades esenciales:

- Registro e inicio de sesión de profesionales.
- Registro de pacientes.
- Búsqueda de pacientes.
- Visualización de la información de un paciente.
- Registro de consultas.
- Visualización del historial de consultas.
- Edición de consultas.

## Arquitectura

El proyecto utiliza una arquitectura de monorepo:

```text
CMLR/
├── backend/
├── frontend/
├── docs/
└── README.md
```

### Backend

El backend será desarrollado utilizando:

- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- Docker
- Docker Compose
- JWT
- bcrypt
- class-validator

### Frontend

El frontend será desarrollado utilizando:

- React
- Vite
- Tailwind CSS

## Documentación

El proceso de análisis y diseño del proyecto se encuentra documentado en la carpeta `docs/`.

La documentación incluye:

- Definición del problema.
- Dominio.
- Casos de uso.
- Modelo conceptual.
- Modelo lógico.
- Modelo físico.
- Arquitectura del proyecto.

## Estado

Actualmente el proyecto se encuentra en la etapa de implementación del MVP.

El desarrollo seguirá una estrategia incremental, priorizando primero las funcionalidades necesarias para validar el producto y evitando incorporar complejidad que no aporte valor al MVP.

## Licencia

Este proyecto se encuentra actualmente en desarrollo.
