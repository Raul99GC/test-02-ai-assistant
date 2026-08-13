import { PubMedArticle } from "./types";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function searchPubMed(query: string, maxResults: number = 5): Promise<PubMedArticle[]> {

    const apiKey = process.env.NCBI_API_KEY;
    const apiKeyParam = apiKey ? `&api_key=${apiKey}` : "";

    const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&retmode=json` + `&retmax=${maxResults}&sort=relevance` + `&term=${encodeURIComponent(query)}${apiKeyParam}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
        throw new Error(`Error al buscar en PubMed (esearch): ${searchRes.status}`);
    }
    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist ?? [];

    if (ids.length === 0) return [];

    const summaryUrl =
        `${EUTILS_BASE}/esummary.fcgi?db=pubmed&retmode=json` +
        `&id=${ids.join(",")}${apiKeyParam}`;

    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
        throw new Error(`Error al obtener resumen de PubMed (esummary): ${summaryRes.status}`);
    }
    const summaryData = await summaryRes.json();
    const result = summaryData?.result;

    if (!result) return [];

    return ids
        .map((pmid) => {
            const item = result[pmid];
            if (!item) return null;

            return {
                pmid,
                title: item.title || "Sin título",
                authors: (item.authors ?? []).map((a: { name: string }) => a.name),
                journal: item.fulljournalname || item.source || "Revista no especificada",
                pubDate: item.pubdate || "Fecha no disponible",
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            } satisfies PubMedArticle;
        })
        .filter((a): a is PubMedArticle => a !== null);
}