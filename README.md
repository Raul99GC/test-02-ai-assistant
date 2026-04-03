# Test 02 — AI Assistant

**Chat con streaming integrado en Next.js**

| Stack | |
|---|---|
| Next.js 16 | App Router |
| TypeScript | Tailwind CSS |
| Vercel AI SDK | Anthropic API |
| Streaming SSE | ESLint |

---

## Contexto del reto

Construye un **asistente de IA especializado**. Puedes elegir el dominio: soporte técnico, recetas, coach de fitness, asistente legal básico, lo que prefieras. Lo importante es que el asistente tenga una **identidad clara** definida por un system prompt que tú diseñes.



| Plazo | Trabajo estimado | Puntos totales |
|---|---|---|
| 3 días | 3–5 horas | 100 |

---

## Requerimientos base (obligatorios)

- [ ] **Interfaz de chat** con input, botón de envío y área de mensajes con scroll automático
- [ ] **Streaming de respuestas** — el texto debe aparecer token a token, no de golpe
- [ ] **Historial de conversación** — el modelo debe recordar mensajes anteriores dentro de la sesión
- [ ] **System prompt configurable** que defina la personalidad y restricciones del asistente
- [ ] **Manejo de errores visible** — si la API falla, el usuario debe saberlo con un mensaje claro
- [ ] **Botón para limpiar / reiniciar** la conversación
- [ ] **README** explicando: el dominio elegido, por qué, y el diseño del system prompt

---

## Extras para ir más allá (opcionales)

- [ ] Indicador de escritura ("Claude está pensando...") durante la respuesta
- [ ] Múltiples modos o personalidades seleccionables en la UI
- [ ] Contador de tokens o costo estimado visible en la UI
- [ ] Botón para copiar la respuesta del asistente
- [ ] Persistir el historial en `localStorage` para que sobreviva un refresh
- [ ] Tool calling / function calling — darle al asistente acceso a una herramienta simple (ej. consultar el clima, hacer un cálculo)
- [ ] Rate limiting en el API route para prevenir abuso
- [ ] Deploy en Vercel con URL pública

---

## Criterios de evaluación específicos

- Implementación de **streaming** (SSE / ReadableStream)
- Diseño y calidad del **system prompt**
- Manejo de la **API key** (nunca expuesta al cliente)
- Manejo del **contexto de conversación** (messages array)
- **Error handling** para fallos de API y timeouts

---

## Rúbrica de evaluación — 100 puntos

### 1. Funcionalidad (30 pts)

| Criterio | Puntos |
|---|---|
| El proyecto corre sin errores desde el primer intento | 12 |
| Todos los requerimientos base implementados | 10 |
| Edge cases manejados (inputs vacíos, errores de red) | 8 |

### 2. Calidad de código (25 pts)

| Criterio | Puntos |
|---|---|
| Estructura de carpetas y archivos clara | 7 |
| Componentes reutilizables, sin duplicación innecesaria | 7 |
| TypeScript correctamente tipado (sin `any` sin justificar) | 6 |
| Nombres de variables, funciones y componentes descriptivos | 5 |

### 3. Decisiones técnicas y README (20 pts)

| Criterio | Puntos |
|---|---|
| README completo con instrucciones y `.env.example` | 7 |
| Trade-offs explicados con criterio | 7 |
| "Qué haría con más tiempo" — honesto y con visión | 6 |

### 4. UX y UI (15 pts)

| Criterio | Puntos |
|---|---|
| La app es usable sin instrucciones previas | 6 |
| Loading y error states visibles y útiles | 5 |
| Diseño visual coherente (no necesita ser elaborado) | 4 |

### 5. Extras (10 pts)

| Criterio | Puntos |
|---|---|
| Features opcionales implementados y funcionales | 5 |
| Tests (unit o integration) | 3 |
| Deploy público funcionando | 2 |

> **Rechazo inmediato:** el proyecto no corre, dependencias rotas, no hay README, o el candidato no puede explicar su propio código en la revisión técnica.

---

## Cómo empezar

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local y agrega tu ANTHROPIC_API_KEY

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic. Obtenla en [console.anthropic.com](https://console.anthropic.com/) |

Copia `.env.example` a `.env.local` y reemplaza el valor.

---

## Estructura del proyecto

```
test-02-ai-assistant/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # API route con esqueleto del handler (empieza aquí)
│   ├── layout.tsx           # Layout raíz
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globales con Tailwind
├── components/              # Tus componentes van aquí
├── lib/
│   └── types.ts             # Tus tipos van aquí
└── public/                  # Assets estáticos
```

El archivo `app/api/chat/route.ts` ya tiene los imports del Vercel AI SDK y el esqueleto de la función `POST`. Solo necesitas descomentarlo y completarlo.

### Paquetes ya instalados

- **`ai`** — Vercel AI SDK para streaming y hooks del lado del cliente (`useChat`)
- **`@ai-sdk/anthropic`** — Provider de Anthropic para el AI SDK

### Recursos útiles

- [Vercel AI SDK — Documentación](https://sdk.vercel.ai/docs)
- [Vercel AI SDK — `useChat` hook](https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat)
- [Vercel AI SDK — `streamText`](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
- [Anthropic — Modelos disponibles](https://docs.anthropic.com/en/docs/about-claude/models)

---

## Reglas generales

### Lo que sí puedes usar

- Cualquier herramienta de IA: Cursor, Claude Code, GitHub Copilot, ChatGPT — sin restricciones
- Cualquier librería de npm que consideres apropiada
- Documentación oficial, Stack Overflow, blogs técnicos
- Tutoriales y referencias en línea

### Lo que no puedes hacer

- Entregar código de un tercero sin entenderlo — se evaluará en la revisión técnica
- Clonar un proyecto existente que resuelva exactamente el mismo problema
- No documentar nada — el README es obligatorio

> Usas IA, está bien. Lo que evaluamos es si entiendes lo que construiste, por qué tomaste cada decisión y cómo lo extenderías. La revisión técnica post-entrega es donde eso sale a la luz.

---

## Instrucciones de entrega

1. Crea un **repositorio público en GitHub** y envía el link antes de que venzan los 3 días
2. El proyecto debe correr con `npm install` y `npm run dev` sin pasos adicionales no documentados
3. Las variables de entorno deben estar documentadas en un archivo `.env.example`
4. El README debe incluir: qué construiste, cómo correrlo, decisiones técnicas tomadas, qué harías con más tiempo
5. Si hiciste deploy, incluye la URL en el README

---

## Estructura esperada de tu README

```markdown
## ¿Qué construí?
Descripción breve del proyecto, el dominio elegido y por qué.

## Cómo correrlo
Pasos concretos desde cero.

## Variables de entorno
Lista y descripción de cada variable en .env.example.

## Diseño del system prompt
Explica la personalidad, restricciones y decisiones detrás de tu system prompt.

## Decisiones técnicas
¿Por qué elegiste X librería sobre Y? ¿Qué trade-offs hiciste?

## Qué haría con más tiempo
Sé honesto. Esto nos importa tanto como lo que sí entregaste.
```

---

## La revisión técnica post-entrega

Una vez revisado el código, agendaremos una llamada de **30–45 minutos**. No es otro examen — es una conversación. Vamos a preguntarte cosas como:

- "Explícame cómo funciona esta parte de tu código"
- "¿Por qué usaste este approach y no este otro?"
- "Si tuvieras que agregar [feature X], ¿cómo lo harías?"
- "¿Qué parte te resultó más difícil y cómo la resolviste?"
- "¿Qué cambiarías del diseño si tuvieras que escalar esto?"

El objetivo es entender tu proceso de pensamiento, no hacerte tropezar. Si usaste IA para una parte, no hay problema — cuéntanos cómo la usaste y qué aprendiste del resultado.
