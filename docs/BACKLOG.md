# Backlog — Ritmi

## Estados

* [ ] Pendiente
* [~] En progreso
* [x] Completada
* [-] Fuera de alcance
* [!] Requiere revisión

---

# Historias de Usuario

## HU-001 — Interfaz de chat

**Historia de usuario**

> Como usuario, quiero poder escribir y enviar un mensaje a Ritmi para iniciar y mantener una conversación.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Backend

* [x] Recibir los mensajes enviados por el usuario.
* [x] Procesar la solicitud mediante el endpoint de chat.
* [x] Permitir continuar la conversación utilizando el historial de mensajes.
* [x] Manejar entradas inválidas o vacías.

### UI / UX

* [x] Campo de entrada para el mensaje.
* [x] Botón para enviar.
* [x] Envío mediante `Enter`.
* [x] Limpieza del campo después de enviar.
* [x] Evitar el envío de mensajes vacíos.
* [x] Mostrar los mensajes dentro del área de conversación.
* [x] Diferenciar visualmente usuario y asistente.
* [x] Mantener el scroll en los mensajes más recientes.

### Criterios de aceptación

* [x] El usuario puede escribir un mensaje.
* [x] El usuario puede enviarlo mediante el botón.
* [x] El usuario puede enviarlo mediante `Enter`.
* [x] Un mensaje vacío no se envía.
* [x] El mensaje enviado aparece en la conversación.
* [x] El chat permite continuar enviando mensajes.

---

## HU-002 — Streaming de respuestas

**Historia de usuario**

> Como usuario, quiero recibir la respuesta progresivamente para comenzar a leerla mientras Ritmi genera la respuesta.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Backend

* [x] Generar respuestas mediante streaming.
* [x] Enviar el contenido progresivamente.
* [x] Finalizar correctamente el stream.
* [x] Manejar errores durante la generación.

### UI / UX

* [x] Mostrar la respuesta conforme llega.
* [x] Actualizar el mensaje progresivamente.
* [x] Mantener visible la conversación durante la generación.
* [x] Continuar la conversación después de terminar la respuesta.

### Criterios de aceptación

* [x] La respuesta comienza a mostrarse antes de terminar de generarse.
* [x] El contenido se actualiza progresivamente.
* [x] La respuesta termina correctamente.
* [x] Un error durante la generación no inutiliza la interfaz.
* [x] El usuario puede continuar conversando después.

---

## HU-003 — Contexto y persistencia de conversación

**Historia de usuario**

> Como usuario, quiero que Ritmi recuerde los mensajes anteriores para mantener el contexto de la conversación.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Modelo de datos

* [x] Mantener el historial de mensajes.
* [x] Mantener los roles de usuario y asistente.
* [x] Mantener el contenido de cada mensaje.
* [x] Conservar el orden de la conversación.

### Backend

* [x] Recibir el historial junto con las nuevas solicitudes.
* [x] Utilizar los mensajes anteriores como contexto.
* [x] Mantener el contexto mientras la conversación está activa.
* [x] Reiniciar el contexto al limpiar la conversación.

### Persistencia

* [x] Persistir el historial en `localStorage`.
* [x] Recuperar el historial después de un refresh.
* [x] Limpiar la persistencia al reiniciar la conversación.

### Criterios de aceptación

* [x] El asistente utiliza mensajes anteriores para responder.
* [x] Los mensajes conservan su orden.
* [x] El contexto se mantiene durante la conversación.
* [x] El historial sobrevive a un refresh.
* [x] Al reiniciar, el contexto anterior deja de utilizarse.

---

## HU-004 — System Prompt y mentor médico

**Historia de usuario**

> Como administrador, quiero definir la identidad, comportamiento y restricciones de Ritmi para mantener respuestas consistentes y seguras.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Backend

* [x] Definir el system prompt del mentor.
* [x] Definir la identidad de Ritmi como mentor médico.
* [x] Definir personalidad y tono.
* [x] Definir restricciones relacionadas con orientación médica.
* [x] Integrar el system prompt en las solicitudes al modelo.
* [x] Mantener el comportamiento base fuera de la configuración del usuario.

### Criterios de aceptación

* [x] El modelo recibe las instrucciones del system prompt.
* [x] La identidad del mentor permanece consistente.
* [x] Las restricciones se aplican al flujo de respuesta.

---

## HU-005 — Guardrail de seguridad

**Historia de usuario**

> Como usuario, quiero que Ritmi aplique una capa previa de seguridad para que las solicitudes que no deben atenderse normalmente sean rechazadas o redirigidas.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Backend

* [x] Implementar un guardrail separado del mentor.
* [x] Revisar la solicitud antes del flujo normal de respuesta.
* [x] Aplicar reglas de seguridad mediante un modelo/capa independiente.
* [x] Evitar que el mentor procese directamente solicitudes que el guardrail determine como no permitidas.
* [x] Mantener separadas las responsabilidades de seguridad y generación.

### Testing

* [x] Crear pruebas unitarias para la lógica del guardrail.
* [x] Utilizar TDD en partes puntuales de esta lógica.
* [x] Probar casos esperados y escenarios de rechazo.

### Pendiente

* [ ] Aumentar la cobertura de casos límite del guardrail.
* [ ] Añadir pruebas adicionales de seguridad.

---

## HU-006 — Tools médicas

**Historia de usuario**

> Como usuario, quiero que Ritmi pueda utilizar herramientas específicas para resolver tareas concretas con mayor control que una respuesta libre del modelo.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Tools

* [x] Tool para cálculo de IMC.
* [x] Tool para cálculo de dosis.
* [x] Tool para consultas de PubMed.
* [x] Validación de entradas y datos con Zod.
* [x] Integración de las tools con el flujo del mentor.

### Criterios de aceptación

* [x] Las tools reciben datos con la estructura esperada.
* [x] Las entradas inválidas pueden detectarse mediante validación.
* [x] El mentor puede utilizar las tools cuando corresponde.
* [x] Los resultados de las tools pueden incorporarse a la respuesta.

### Pendiente

* [x] Aumentar la cobertura de tests de cada tool.
* [ ] Ampliar casos límite y escenarios de error.

---

## HU-007 — Manejo de errores

**Historia de usuario**

> Como usuario, quiero recibir información clara cuando ocurra un error para poder continuar utilizando la aplicación.

**Prioridad:** Alta  
**Estado:** [x] Completada

### Backend

* [x] Detectar errores durante el procesamiento.
* [x] Manejar errores durante streaming.
* [x] Informar al frontend cuando corresponde.
* [x] Evitar exponer información técnica innecesaria.

### UI / UX

* [x] Mostrar mensajes de error visibles.
* [x] Utilizar mensajes comprensibles.
* [x] Mantener la interfaz utilizable después de un error.
* [x] Permitir continuar utilizando el chat.

---

## HU-008 — Reiniciar conversación

**Historia de usuario**

> Como usuario, quiero limpiar la conversación para comenzar nuevamente sin el contexto anterior.

**Prioridad:** Alta  
**Estado:** [x] Completada

### UI / UX

* [x] Agregar opción para limpiar/reiniciar la conversación.
* [x] Eliminar los mensajes visibles.
* [x] Restablecer el estado del chat.
* [x] Eliminar el contexto persistido anterior.
* [x] Dejar la interfaz lista para una nueva conversación.

---

# Pruebas

## TEST-001 — Estrategia de testing

**Estado:** [x] Completada

* [x] Utilizar TDD en partes puntuales del proyecto, especialmente alrededor del guardrail.
* [x] Utilizar pruebas unitarias para otras funcionalidades.
* [x] Probar la lógica del guardrail de forma aislada.
* [x] Probar el endpoint del chat.
* [x] Utilizar IA como apoyo para proponer tests adicionales, mocks y edge cases.
* [x] Revisar manualmente las sugerencias de IA antes de incorporarlas.

## TEST-002 — Pruebas end-to-end

**Estado:** [ ] Pendiente

* [ ] Implementar pruebas E2E con Playwright.
* [ ] Validar los flujos principales desde el navegador.
* [ ] Validar envío de mensajes.
* [ ] Validar streaming.
* [ ] Validar manejo de errores.
* [ ] Validar reinicio de conversación.

## TEST-003 — Automatización con IA

**Estado:** [-] Siguiente iteración

* [ ] Explorar Stagehand para pruebas y automatización de UI apoyadas por IA.

---

# Fuera de alcance actual

Las siguientes ideas se conservaron como referencia, pero no forman parte de la implementación actual del proyecto:

* [-] Múltiples personalidades/modos seleccionables por el usuario.
* [-] Persistencia mediante base de datos.
* [-] Funcionalidades adicionales no incluidas en el reto.
* [-] Nuevos mecanismos de automatización de pruebas no implementados.

---

# Estado general

| Historia | Descripción | Estado |
|---|---|---|
| HU-001 | Interfaz de chat | [x] Completada |
| HU-002 | Streaming de respuestas | [x] Completada |
| HU-003 | Contexto y persistencia | [x] Completada |
| HU-004 | System Prompt y mentor médico | [x] Completada |
| HU-005 | Guardrail de seguridad | [x] Completada |
| HU-006 | Tools médicas | [x] Completada |
| HU-007 | Manejo de errores | [x] Completada |
| HU-008 | Reiniciar conversación | [x] Completada |
| TEST-001 | Estrategia de testing | [x] Completada |
| TEST-002 | Pruebas E2E con Playwright | [ ] Pendiente |
| TEST-003 | Stagehand | [-] Siguiente iteración |

---

# Notas técnicas

## Flujo general

```text
Usuario
  ↓
Interfaz de chat
  ↓
Endpoint de chat
  ↓
Guardrail de seguridad
  ↓
Mentor médico
  ↓
Tools (IMC / dosis / PubMed)
  ↓
Streaming de respuesta
  ↓
Interfaz
  ↓
Persistencia del historial en localStorage
```

## Orden de prioridades para una siguiente iteración

```text
Pruebas adicionales de seguridad
        ↓
Pruebas E2E con Playwright
        ↓
Mayor cobertura de tools y endpoint
        ↓
Explorar Stagehand
        ↓
Persistencia de servidor / observabilidad
```
