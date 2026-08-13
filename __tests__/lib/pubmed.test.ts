import { searchPubMed } from "@/lib/Pubmed";

function mockResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

function mockSearchResponse(ids: string[]): Response {
    return mockResponse({
        esearchresult: {
            idlist: ids,
        },
    });
}

function mockSummaryResponse(
    result: Record<string, unknown>
): Response {
    return mockResponse({
        result,
    });
}

describe("searchPubMed", () => {
    const originalApiKey = process.env.NCBI_API_KEY;

    beforeEach(() => {
        jest.restoreAllMocks();
        delete process.env.NCBI_API_KEY;
    });

    afterAll(() => {
        process.env.NCBI_API_KEY = originalApiKey;
    });

    it("returns PubMed articles successfully", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456", "789012"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Tratamiento de la diabetes tipo 2",
                        authors: [
                            { name: "Juan Pérez" },
                            { name: "María López" },
                        ],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026 Jan",
                    },
                    "789012": {
                        title: "Prevención de enfermedades cardíacas",
                        authors: [{ name: "Carlos García" }],
                        fulljournalname: "Journal of Medicine",
                        pubdate: "2026 Feb",
                    },
                })
            );

        const result = await searchPubMed("diabetes");

        expect(result).toEqual([
            {
                pmid: "123456",
                title: "Tratamiento de la diabetes tipo 2",
                authors: ["Juan Pérez", "María López"],
                journal: "Revista Médica",
                pubDate: "2026 Jan",
                url: "https://pubmed.ncbi.nlm.nih.gov/123456/",
            },
            {
                pmid: "789012",
                title: "Prevención de enfermedades cardíacas",
                authors: ["Carlos García"],
                journal: "Journal of Medicine",
                pubDate: "2026 Feb",
                url: "https://pubmed.ncbi.nlm.nih.gov/789012/",
            },
        ]);

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("uses the default maxResults value", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: [],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        await searchPubMed("diabetes");

        const firstCallUrl = fetchMock.mock.calls[0][0];

        expect(firstCallUrl).toContain("retmax=5");
    });

    it("respects the maxResults parameter", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: [],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        await searchPubMed("hipertensión", 10);

        const firstCallUrl = fetchMock.mock.calls[0][0];

        expect(firstCallUrl).toContain("retmax=10");
    });

    it("encodes the search query", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse([])
            );

        await searchPubMed("diabetes tipo 2");

        const firstCallUrl = fetchMock.mock.calls[0][0];

        expect(firstCallUrl).toContain(
            "term=diabetes%20tipo%202"
        );
    });

    it("returns an empty array when PubMed returns no IDs", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse([])
            );

        const result = await searchPubMed("gripe");

        expect(result).toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws an error when the search request fails", async () => {
        jest.spyOn(global, "fetch").mockResolvedValueOnce(
            mockResponse(null, 500)
        );

        await expect(
            searchPubMed("diabetes")
        ).rejects.toThrow(
            "Error al buscar en PubMed (esearch): 500"
        );
    });

    it("throws an error when the summary request fails", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockResponse(null, 503)
            );

        await expect(
            searchPubMed("diabetes")
        ).rejects.toThrow(
            "Error al obtener resumen de PubMed (esummary): 503"
        );
    });

    it("returns an empty array when summary result is missing", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockResponse({})
            );

        const result = await searchPubMed("diabetes");

        expect(result).toEqual([]);
    });

    it("ignores articles that are missing from the summary result", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456", "789012"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo disponible",
                        authors: [{ name: "Juan Pérez" }],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        const result = await searchPubMed("diabetes");

        expect(result).toEqual([
            {
                pmid: "123456",
                title: "Artículo disponible",
                authors: ["Juan Pérez"],
                journal: "Revista Médica",
                pubDate: "2026",
                url: "https://pubmed.ncbi.nlm.nih.gov/123456/",
            },
        ]);
    });

    it("uses fallback values when article fields are missing", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        authors: undefined,
                        fulljournalname: undefined,
                        source: undefined,
                        pubdate: undefined,
                        title: undefined,
                    },
                })
            );

        const result = await searchPubMed("dolor de cabeza");

        expect(result).toEqual([
            {
                pmid: "123456",
                title: "Sin título",
                authors: [],
                journal: "Revista no especificada",
                pubDate: "Fecha no disponible",
                url: "https://pubmed.ncbi.nlm.nih.gov/123456/",
            },
        ]);
    });

    it("uses source when fulljournalname is missing", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: [],
                        source: "Revista Alternativa",
                        pubdate: "2026",
                    },
                })
            );

        const result = await searchPubMed("migraña");

        expect(result[0].journal).toBe(
            "Revista Alternativa"
        );
    });

    it("maps article authors correctly", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: [
                            { name: "Juan Pérez" },
                            { name: "María López" },
                            { name: "Carlos García" },
                        ],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        const result = await searchPubMed("anemia");

        expect(result[0].authors).toEqual([
            "Juan Pérez",
            "María López",
            "Carlos García",
        ]);
    });

    it("returns an empty authors array when authors are missing", async () => {
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: undefined,
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        const result = await searchPubMed("asma");

        expect(result[0].authors).toEqual([]);
    });

    it("includes the NCBI API key when it is available", async () => {
        process.env.NCBI_API_KEY = "test-api-key";

        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse(["123456"])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({
                    "123456": {
                        title: "Artículo médico",
                        authors: [],
                        fulljournalname: "Revista Médica",
                        pubdate: "2026",
                    },
                })
            );

        await searchPubMed("diabetes");

        expect(fetchMock.mock.calls[0][0]).toContain(
            "api_key=test-api-key"
        );

        expect(fetchMock.mock.calls[1][0]).toContain(
            "api_key=test-api-key"
        );
    });

    it("does not include the NCBI API key when it is not available", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse([])
            );

        await searchPubMed("diabetes");

        const firstCallUrl = fetchMock.mock.calls[0][0];

        expect(firstCallUrl).not.toContain("api_key=");
    });

    it("uses the correct PubMed IDs in the summary request", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse([
                    "123456",
                    "789012",
                    "345678",
                ])
            )
            .mockResolvedValueOnce(
                mockSummaryResponse({})
            );

        await searchPubMed("diabetes");

        const summaryCallUrl = fetchMock.mock.calls[1][0];

        expect(summaryCallUrl).toContain(
            "id=123456,789012,345678"
        );
    });

    it("sorts search results by relevance", async () => {
        const fetchMock = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce(
                mockSearchResponse([])
            );

        await searchPubMed("diabetes");

        const firstCallUrl = fetchMock.mock.calls[0][0];

        expect(firstCallUrl).toContain(
            "sort=relevance"
        );
    });
});