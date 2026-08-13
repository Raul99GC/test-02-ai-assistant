# Requerimientos funcionales — Ritmi

## Requerimientos implementados

| Requerimiento / Historia de usuario | Backend — Comportamiento actual | UI / UX — Comportamiento actual |
|---|---|---|
| **1. Interfaz de chat**<br><br>Como usuario, quiero poder escribir y enviar un mensaje a Ritmi para iniciar y mantener una conversación. | - Recibir mensajes.<br>- Procesar la solicitud.<br>- Mantener el historial de conversación.<br>- Manejar entradas inválidas. | - Campo para escribir.<br>- Botón para enviar.<br>- Envío con `Enter`.<br>- Limpieza del campo.<br>- Evitar mensajes vacíos.<br>- Mostrar mensajes del usuario y asistente.<br>- Scroll automático. |
| **2. Streaming de respuestas**<br><br>Como usuario, quiero recibir la respuesta progresivamente. | - Generar mediante streaming.<br>- Enviar contenido progresivamente.<br>- Finalizar correctamente.<br>- Manejar errores durante la generación. | - Mostrar la respuesta conforme llega.<br>- Actualizarla progresivamente.<br>- Mantener visible la conversación mientras se genera. |
| **3. Contexto y persistencia**<br><br>Como usuario, quiero que Ritmi recuerde mensajes anteriores. | - Recibir y mantener el contexto.<br>- Conservar el orden.<br>- Utilizar mensajes anteriores como contexto.<br>- Reiniciar el contexto al limpiar.<br>- Persistir el historial en `localStorage`. | - Mostrar el historial cronológicamente.<br>- Diferenciar usuario y asistente.<br>- Mantener el historial durante la sesión.<br>- Recuperar la conversación después de un refresh.<br>- Limpiar la conversación al reiniciar. |
| **4. Mentor médico / System Prompt**<br><br>Como administrador, quiero definir la identidad y restricciones del asistente. | - Definir identidad de mentor médico.<br>- Aplicar personalidad y tono.<br>- Aplicar restricciones.<br>- Integrar el system prompt en las solicitudes al modelo. | - Reflejar la identidad y comportamiento definidos.<br>- No permitir modificar el comportamiento base. |
| **5. Guardrail de seguridad**<br><br>Como usuario, quiero una capa de seguridad antes de recibir una respuesta normal. | - Analizar la solicitud antes del mentor.<br>- Separar la lógica de seguridad de la generación.<br>- Rechazar o redirigir solicitudes según las reglas del guardrail. | - Mostrar la respuesta de seguridad correspondiente cuando la solicitud no puede seguir el flujo normal. |
| **6. Tools médicas**<br><br>Como usuario, quiero que Ritmi utilice herramientas específicas para tareas concretas. | - Tool de IMC.<br>- Tool de cálculo de dosis.<br>- Tool de consultas a PubMed.<br>- Validación con Zod.<br>- Integración de tools con el mentor. | - Mostrar los resultados de las tools como parte de la respuesta del asistente. |
| **7. Manejo de errores**<br><br>Como usuario, quiero saber cuando una operación falla. | - Detectar errores de procesamiento y streaming.<br>- Informar al frontend.<br>- Evitar exponer detalles técnicos innecesarios. | - Mostrar errores comprensibles.<br>- Mantener la interfaz funcional.<br>- Permitir continuar utilizando el chat. |
| **8. Reiniciar conversación**<br><br>Como usuario, quiero comenzar una conversación nueva sin contexto anterior. | - Eliminar el contexto anterior.<br>- Evitar reutilizar mensajes después del reinicio. | - Limpiar mensajes visibles.<br>- Limpiar la conversación persistida.<br>- Restablecer el estado de la interfaz. |

---

## Persistencia — Alcance actual

| Tema | Comportamiento |
|---|---|
| **Contexto durante la sesión** | El asistente utiliza el historial de la conversación activa. |
| **Refresh de la página** | El historial se conserva mediante `localStorage`. |
| **localStorage** | Implementado para persistir el historial. |
| **Base de datos** | No implementada; no es necesaria para el alcance actual. |
| **Persistencia entre sesiones** | Se limita a la persistencia local del navegador. |
| **Reinicio** | El historial y contexto anterior se limpian. |

---

# Testing

## Estrategia actual

La estrategia de pruebas combina **TDD** y **pruebas unitarias** dependiendo de la tarea.

* Para partes puntuales, especialmente el guardrail, se definieron primero pruebas y después la implementación.
* Para otras funcionalidades se utilizaron pruebas unitarias de manera tradicional.
* Se probaron la lógica del guardrail y el endpoint del chat de forma aislada.
* La inteligencia artificial se utilizó como apoyo para generar tests, proponer mocks, edge cases y escenarios adicionales.
* Las sugerencias de IA fueron revisadas y se decidió manualmente cuáles incorporar.

## Pendiente

* Pruebas adicionales de seguridad del guardrail.
* Pruebas end-to-end con Playwright.
* Mayor cobertura de las tools y del endpoint.
* Exploración de Stagehand en una siguiente iteración.

---

# Fuera del alcance actual

| Funcionalidad | Estado |
|---|---|
| Persistencia mediante base de datos | Fuera del alcance actual |
| Múltiples personalidades seleccionables por el usuario | Fuera del alcance actual |
| Pruebas E2E con Playwright | Pendiente |
| Automatización con Stagehand | Siguiente iteración |
| Otras funcionalidades no especificadas en el proyecto actual | Fuera del alcance actual |

---

# Notas técnicas

## Separación de responsabilidades

```text
Solicitud del usuario
       ↓
Guardrail de seguridad
       ↓
   ¿Permitida?
     ↙     ↘
   No       Sí
   ↓         ↓
Respuesta   Mentor médico
de seguridad     ↓
             Tools
      IMC / dosis / PubMed
             ↓
          Streaming
             ↓
          Usuario
```

## Persistencia

```text
Conversación
     ↓
Historial de mensajes
     ↓
localStorage
     ↓
Refresh
     ↓
Recuperación del historial
```

## Siguiente iteración de testing

```text
Cobertura adicional del guardrail
            ↓
Playwright E2E
            ↓
Mayor cobertura de tools y endpoint
            ↓
Explorar Stagehand
```
