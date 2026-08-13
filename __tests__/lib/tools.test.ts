import { searchPubMed } from "@/lib/Pubmed";
import { tools } from "@/lib/tools";

// - calcularIMC calcula correctamente el IMC redondeado a 1 decimal
// - calcularIMC maneja valores decimales de peso y altura
// - calcularDosisPediatrica calcula correctamente la dosis redondeada a 1 decimal
// - calcularDosisPediatrica maneja mg_por_kg decimal
// - buscarInfoSintoma retorna un string con el síntoma incluido
// - buscarPapersPubMed llama a searchPubMed con el query y maxResults dados
// - buscarPapersPubMed usa 5 como maxResults por defecto cuando no se especifica
// - buscarPapersPubMed retorna found:true y los articles cuando hay resultados
// - buscarPapersPubMed retorna found:false y mensaje cuando no hay resultados
// - buscarPapersPubMed retorna found:false y mensaje cuando searchPubMed lanza un error


jest.mock("@/lib/Pubmed", () => ({
  searchPubMed: jest.fn(),
}));

const mockedSearchPubMed = searchPubMed as jest.MockedFunction<typeof searchPubMed>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("tools.calcularIMC", () => {
  it("calcula correctamente el IMC redondeado a 1 decimal", async () => {
    const result = await tools.calcularIMC.execute!(
      { peso_kg: 70, altura_m: 1.75 },
      {} as any
    );

    expect(result).toEqual({ imc: 22.9 });
  });

  it("maneja valores decimales de peso y altura", async () => {
    const result = await tools.calcularIMC.execute!(
      { peso_kg: 55.5, altura_m: 1.6 },
      {} as any
    );

    expect(result).toEqual({ imc: 21.7 });
  });
});

describe("tools.calcularDosisPediatrica", () => {
  it("calcula correctamente la dosis redondeada a 1 decimal", async () => {
    const result = await tools.calcularDosisPediatrica.execute!(
      { peso_kg: 20, mg_por_kg: 10 },
      {} as any
    );

    expect(result).toEqual({ dosis_mg: 200 });
  });

  it("maneja mg_por_kg decimal", async () => {
    const result = await tools.calcularDosisPediatrica.execute!(
      { peso_kg: 12.5, mg_por_kg: 4.2 },
      {} as any
    );

    expect(result).toEqual({ dosis_mg: 52.5 });
  });
});

describe("tools.buscarInfoSintoma", () => {
  it("retorna un string con el síntoma incluido", async () => {
    const result = await tools.buscarInfoSintoma.execute!(
      { sintoma: "fiebre" },
      {} as any
    );

    expect(result).toEqual({ info: "Datos generales sobre: fiebre" });
  });
});

describe("tools.buscarPapersPubMed", () => {
  it("llama a searchPubMed con el query y maxResults dados", async () => {
    mockedSearchPubMed.mockResolvedValue([]);

    await tools.buscarPapersPubMed.execute!(
      { query: "type 2 diabetes metformin", maxResults: 3 },
      {} as any
    );

    expect(mockedSearchPubMed).toHaveBeenCalledWith(
      "type 2 diabetes metformin",
      3
    );
  });

  it("usa 5 como maxResults por defecto cuando no se especifica", async () => {
    mockedSearchPubMed.mockResolvedValue([]);

    await tools.buscarPapersPubMed.execute!(
      { query: "hypertension treatment" },
      {} as any
    );

    expect(mockedSearchPubMed).toHaveBeenCalledWith(
      "hypertension treatment",
      5
    );
  });

  it("retorna found:true y los articles cuando hay resultados", async () => {
    const fakeArticles = [
      {
        pmid: "12345",
        title: "Un estudio interesante",
        authors: ["Doe J", "Smith A"],
        journal: "The Lancet",
        pubDate: "2024-01-01",
        url: "https://pubmed.ncbi.nlm.nih.gov/12345",
      },
    ];
    mockedSearchPubMed.mockResolvedValue(fakeArticles);

    const result = await tools.buscarPapersPubMed.execute!(
      { query: "cardiac arrest" },
      {} as any
    );

    expect(result).toEqual({ found: true, articles: fakeArticles });
  });

  it("retorna found:false y mensaje cuando no hay resultados", async () => {
    mockedSearchPubMed.mockResolvedValue([]);

    const result = await tools.buscarPapersPubMed.execute!(
      { query: "consulta muy rara sin resultados" },
      {} as any
    );

    expect(result).toEqual({
      found: false,
      message: "No se encontraron papers para esa búsqueda.",
    });
  });

  it("retorna found:false y mensaje cuando searchPubMed lanza un error", async () => {
    mockedSearchPubMed.mockRejectedValue(new Error("timeout de red"));

    const result = await tools.buscarPapersPubMed.execute!(
      { query: "algo" },
      {} as any
    );

    expect(result).toEqual({
      found: false,
      message: "No se pudo consultar PubMed en este momento, intenta de nuevo.",
    });
  });
});