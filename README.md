# Ritmi — Mentor médico con IA

## Demo

**Demo en vivo:** [https://ritmi-assistant.vercel.app/](https://ritmi-assistant.vercel.app/)

> **Nota sobre la demo:** la versión publicada utiliza modelos de menor tamaño para mantener controlados los costos de la demo. Por ello, ocasionalmente puede haber respuestas incompletas, errores al procesar algún mensaje o comportamientos menos consistentes de lo esperado. Esto está relacionado principalmente con las capacidades del modelo utilizado en la demo y no con la arquitectura de la aplicación. Para un entorno de producción se recomienda utilizar un modelo más robusto, lo cual puede configurarse mediante `OPENROUTER_MODEL_NAME` y `OPENROUTER_SAFETY_MODEL_NAME` sin modificar la arquitectura principal del proyecto.

## ¿Qué construí?

Construí **Ritmi**, un asistente de IA orientado a funcionar como un **mentor médico para dudas comunes de salud**.

La idea principal del proyecto no es sustituir a un médico ni realizar diagnósticos, sino ofrecer una primera orientación útil y estructurada para preguntas relacionadas con síntomas comunes, manteniendo límites claros de seguridad.

Para esto separé el flujo en dos responsabilidades principales:

- Un **guardrail de seguridad**, encargado de revisar las solicitudes y detectar situaciones que no deberían ser atendidas de forma normal por el asistente.
- Un **mentor médico**, encargado de responder las consultas permitidas siguiendo las restricciones definidas en el system prompt.

Además, el asistente cuenta con tools para resolver tareas concretas, como el cálculo de **IMC**, el cálculo de **dosis** y la consulta de información en **PubMed**.

Elegí este dominio porque me permitía trabajar un caso donde la calidad de las respuestas no depende únicamente del modelo, sino también de cómo se diseñan las restricciones, la validación y las herramientas alrededor del modelo.

## Cómo correrlo

1. Instalar las dependencias:

```bash
npm install
```

2. Crear el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

3. Configurar las variables descritas en la sección de variables de entorno.

4. Levantar el servidor de desarrollo:

```bash
npm run dev
```

5. Abrir la aplicación en:

```text
http://localhost:3000
```

## Variables de entorno

El proyecto utiliza variables de entorno para mantener las credenciales y la configuración de los modelos fuera del código del cliente.

| Variable | Descripción |
|---|---|
| `OPENROUTER_API_KEY` | API key utilizada para acceder a los modelos mediante OpenRouter. |
| `OPENROUTER_MODEL_NAME` | Nombre del modelo utilizado por el mentor. |
| `OPENROUTER_SAFETY_MODEL_NAME` | Nombre del modelo utilizado para la capa de seguridad / guardrail. |
| `NCBI_API_KEY` | Variable opcional para utilizar las funcionalidades relacionadas con NCBI/PubMed cuando corresponda. |

La API key de OpenRouter se mantiene del lado del servidor y no se expone al cliente.


## Diseño del system prompt

El system prompt define la identidad del asistente como un **mentor médico**, no como un médico que pueda sustituir una valoración profesional.

La personalidad está orientada a ser clara, útil y prudente. La respuesta debe intentar explicar el contexto de una duda de salud de forma comprensible, evitando presentar una conclusión como diagnóstico definitivo cuando la información disponible no lo permite.

Las restricciones de seguridad son especialmente importantes en este proyecto. Por eso el flujo cuenta con un guardrail separado del mentor: antes de permitir que la solicitud llegue al flujo normal de respuesta, se revisa si el contenido debe ser rechazado, redirigido o tratado con mayor cautela.

También se definieron reglas para que las herramientas se utilicen en los casos para los que fueron creadas. Por ejemplo, el cálculo de IMC, el cálculo de dosis y las consultas a PubMed se resuelven mediante tools específicas en lugar de depender únicamente de una respuesta libre del modelo.

La separación entre **seguridad** y **respuesta** fue una decisión importante: permite modificar o reforzar las reglas del guardrail sin tener que convertir todo el comportamiento del mentor en una única instrucción enorme.

## Decisiones técnicas

### Next.js + Vercel AI SDK + OpenRouter

Elegí Next.js como base de la aplicación porque permite mantener en el mismo proyecto la interfaz y las rutas del servidor necesarias para interactuar con los modelos.

El **Vercel AI SDK** se utilizó para manejar la comunicación con el modelo y el streaming de respuestas. Una de las razones para apoyarme en esta librería fue que no tenía experiencia previa profunda con ella, pero el reto pedía una integración de IA real y el SDK proporciona las abstracciones necesarias para trabajar con el flujo de chat y el streaming sin tener que construir toda esa capa desde cero.

Para los modelos utilicé **OpenRouter**, principalmente porque permite desacoplar la aplicación de un proveedor/modelo concreto y configurar los modelos mediante variables de entorno.

### Guardrail separado del mentor

Una de las decisiones principales fue no depender únicamente de un system prompt para resolver la seguridad.

Separé el **guardrail** del **mentor** para poder razonar sobre la seguridad como una responsabilidad independiente. Esto también permite probar la lógica de moderación de forma aislada y evitar que toda la seguridad dependa de que el segundo modelo interprete correctamente todas las instrucciones.

### Tools y validación con Zod

Las funcionalidades específicas se implementaron como tools para que el modelo pueda delegar determinadas tareas a lógica controlada por la aplicación.

Entre ellas se encuentran el cálculo de IMC, el cálculo de dosis y la consulta de información en PubMed.

Para validar los datos utilizados por estas funcionalidades utilicé **Zod**, de modo que las entradas y salidas tengan una estructura definida y sea más fácil detectar datos inválidos antes de continuar con el flujo.

### Persistencia y experiencia de usuario

Para conservar el historial de conversación después de un refresh utilicé `localStorage`. Para este reto me pareció una solución adecuada porque permite persistir la sesión sin introducir una base de datos ni una infraestructura adicional.

También implementé el **scroll automático** del chat para que la conversación permanezca posicionada en los mensajes más recientes mientras llegan las respuestas por streaming.

### Pruebas: TDD y pruebas unitarias

Durante el desarrollo combiné **TDD** y pruebas unitarias dependiendo de la tarea que estuviera resolviendo.

En partes puntuales del proyecto, especialmente en la lógica del **guardrail**, utilicé un enfoque de TDD: primero definía mediante pruebas qué comportamiento quería que se cumpliera y después implementaba la lógica necesaria para pasar esos casos.

En otras partes utilicé pruebas unitarias de forma más tradicional. La elección dependía de la naturaleza de la tarea y de qué resultaba más útil validar primero.

También agregué pruebas para el guardrail y para el endpoint del chat con el objetivo de poder validar la lógica de moderación y el flujo del endpoint de forma aislada, sin depender exclusivamente de que el modelo del mentor respondiera de una determinada manera.

### Uso de IA durante el desarrollo

Utilicé inteligencia artificial como herramienta de apoyo durante prácticamente todo el proceso de aprendizaje e implementación, pero no como un sustituto de entender el código.

Una de las principales formas en las que la utilicé fue para **consultar documentación**. Cuando no conocía una tecnología o una API, utilizaba IA para entender la documentación, revisar ejemplos y aterrizar cómo podía incorporarla al proyecto.

También utilicé **DeepWiki** para explorar repositorios de GitHub y obtener documentación navegable sobre determinadas tecnologías y librerías.

Hubo funcionalidades concretas donde necesitaba investigar cómo se implementaban, por ejemplo `localStorage`, el scroll automático del chat o determinadas partes del Vercel AI SDK. En esos casos utilizaba IA para revisar la documentación y entender la solución antes de integrarla con mis propios archivos y estructura.

Con el Vercel AI SDK esto fue especialmente importante porque inicialmente no tenía experiencia con la librería. La IA me ayudó a entender su funcionamiento y a implementar las funcionalidades necesarias, pero el proceso consistía en revisar lo que generaba, entender por qué funcionaba y después adaptarlo al código que ya existía en el proyecto.

En otras palabras, no trabajé bajo un esquema de simplemente **copiar y pegar**. Utilicé la IA para investigar, proponer soluciones y acelerar la implementación, mientras yo evaluaba qué partes tenían sentido, cómo encajaban con la arquitectura existente y qué cambios necesitaba hacer.

### Uso de IA para las pruebas

También utilicé IA como apoyo específicamente para testing.

Primero definía las pruebas que consideraba obligatorias, es decir, los comportamientos que quería comprobar sí o sí. Después le pedía a la IA que me ayudara a generar esos tests.

Una vez cubiertos esos casos, también le pedía que propusiera **casos adicionales, escenarios, mocks o edge cases** que pudiera estar pasando por alto. Esas sugerencias no se incorporaban automáticamente: las revisaba y decidía cuáles eran relevantes para el proyecto y cuáles no.

De esta forma, la IA funcionó como una segunda perspectiva para ampliar la cobertura de las pruebas, mientras que la decisión final sobre qué debía probar el proyecto seguía siendo mía.

## Qué haría con más tiempo

Todavía quedan algunas mejoras que me gustaría implementar en una siguiente iteración.

La primera sería completar algunas **pruebas adicionales de seguridad** que quedaron pendientes, especialmente alrededor del comportamiento del guardrail y de diferentes casos límite.

También implementaría **pruebas end-to-end con Playwright** para validar la aplicación desde el navegador y no solamente probar funciones o endpoints de forma aislada. Esto permitiría comprobar flujos completos de la UI, como escribir y enviar un mensaje, recibir el streaming correctamente, manejar errores, limpiar la conversación y verificar que las funcionalidades principales realmente funcionan desde la perspectiva del usuario.

Otra herramienta que me interesa explorar para una siguiente instancia es **Stagehand**, especialmente para experimentar con pruebas y automatización de interfaces apoyadas por inteligencia artificial. No forma parte de la implementación actual; sería una línea de trabajo futura para complementar las pruebas E2E tradicionales.

También aumentaría la cobertura de las pruebas de las diferentes tools y del endpoint del chat, especialmente en casos límite y escenarios de error.

Finalmente, si el proyecto evolucionara de reto técnico a una aplicación utilizada por usuarios reales, sustituiría la persistencia basada en `localStorage` por una solución de almacenamiento en servidor y añadiría más observabilidad sobre errores, uso de modelos y ejecución de tools.

Estas mejoras reflejan principalmente cosas que no alcancé a implementar dentro del tiempo del reto, más que problemas que hayan impedido que la aplicación cumpliera con su objetivo actual.
