import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { searchPubMed } from "./Pubmed";

export const tools = {
    calcularIMC: tool({
        description: "Calcula el IMC dado peso y altura, y su categoría.",
        inputSchema: z.object({
            peso_kg: z.number(),
            altura_m: z.number(),
        }),
        execute: async ({ peso_kg, altura_m }) => {
            const imc = peso_kg / (altura_m * altura_m);
            return { imc: Number(imc.toFixed(1)) };
        },
    }),

    calcularDosisPediatrica: tool({
        description: "Calcula una dosis aproximada de referencia según peso corporal (solo orientativo, no reemplaza indicación médica).",
        inputSchema: z.object({
            peso_kg: z.number(),
            mg_por_kg: z.number(),
        }),
        execute: async ({ peso_kg, mg_por_kg }) => {
            return { dosis_mg: Number((peso_kg * mg_por_kg).toFixed(1)) };
        },
    }),

    buscarInfoSintoma: tool({
        description: "Devuelve información general básica sobre un síntoma común (fiebre, dolor de cabeza, tos, etc).",
        inputSchema: z.object({
            sintoma: z.string(),
        }),
        execute: async ({ sintoma }) => {
            return { info: `Datos generales sobre: ${sintoma}` };
        },
    }),


    buscarPapersPubMed: tool({
        description:
            "Busca artículos científicos/papers médicos en PubMed sobre un tema, enfermedad, tratamiento o síntoma. " +
            "Úsala cuando el usuario pida evidencia científica, estudios, papers, investigación reciente o quiera " +
            "respaldo académico sobre un tema de salud. Devuelve título, autores, revista, fecha y link de cada artículo.",
        inputSchema: z.object({
            query: z
                .string()
                .describe("Términos de búsqueda en inglés (PubMed indexa mayormente en inglés), ej. 'type 2 diabetes metformin'"),
            maxResults: z
                .number()
                .int()
                .min(1)
                .max(10)
                .optional()
                .describe("Cantidad de resultados a devolver, por defecto 5"),
        }),
        execute: async ({ query, maxResults }) => {
            try {
                const articles = await searchPubMed(query, maxResults ?? 5);
                if (articles.length === 0) {
                    return { found: false, message: "No se encontraron papers para esa búsqueda." };
                }
                return { found: true, articles };
            } catch (error) {
                return {
                    found: false,
                    message: "No se pudo consultar PubMed en este momento, intenta de nuevo.",
                };
            }
        },
    }),


};