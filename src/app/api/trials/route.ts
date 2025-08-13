import { NextRequest, NextResponse } from "next/server";

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function quotePhrase(value: string): string {
  if (/\s/.test(value)) {
    return `"${value}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get("page") ?? 1);
    const pageSizeParam = Number(searchParams.get("pageSize") ?? 20);
    const disease = searchParams.get("disease")?.trim();
    const medical = searchParams.get("medical")?.trim();
    const drug = searchParams.get("drug")?.trim();
    const location = searchParams.get("location")?.trim();
    const statusesParam = searchParams.get("statuses");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100 ? pageSizeParam : 20;

    const statuses = (statusesParam ? statusesParam.split(",") : [
      "Recruiting",
      "Not yet recruiting",
      "Enrolling by invitation",
      "Active, not recruiting",
    ]).map((s) => s.trim()).filter(Boolean);

    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const since = formatDateYYYYMMDD(oneYearAgo);

    const statusExpr = `(${statuses.map((s) => `AREA[OverallStatus]${quotePhrase(s)}`).join(" OR ")})`;
    const updatedExpr = `AREA[LastUpdatePostDate]RANGE[${since},MAX]`;

    const extraFilters: string[] = [];
    if (disease) {
      extraFilters.push(`AREA[Condition]${quotePhrase(disease)}`);
    }
    if (medical) {
      extraFilters.push(`AREA[Condition]${quotePhrase(medical)}`);
    }
    if (drug) {
      extraFilters.push(`AREA[InterventionName]${quotePhrase(drug)}`);
    }
    if (location) {
      const locPhrase = quotePhrase(location);
      extraFilters.push(`(AREA[LocationCity]${locPhrase} OR AREA[LocationState]${locPhrase} OR AREA[LocationCountry]${locPhrase} OR AREA[LocationFacility]${locPhrase})`);
    }

    const expr = [statusExpr, updatedExpr, ...extraFilters].join(" AND ");

    const fields = [
      "NCTId",
      "BriefTitle",
      "OverallStatus",
      "LastUpdatePostDate",
      "Condition",
      "InterventionName",
      "LeadSponsorName",
      "StudyType",
      "StartDate",
      "PrimaryCompletionDate",
      "LocationCity",
      "LocationState",
      "LocationCountry",
      "LocationFacility",
    ];

    const minRank = (page - 1) * pageSize + 1;
    const maxRank = page * pageSize;

    const url = `https://classic.clinicaltrials.gov/api/query/study_fields?expr=${encodeURIComponent(expr)}&fields=${encodeURIComponent(fields.join(","))}&min_rnk=${minRank}&max_rnk=${maxRank}&fmt=json`;

    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return NextResponse.json({ error: "Upstream API error", status: response.status }, { status: 502 });
    }
    const json = await response.json();
    const body = json?.StudyFieldsResponse;
    const studies = (body?.StudyFields ?? []) as Array<Record<string, unknown>>;

    // Sort by LastUpdatePostDate desc on server
    const parsed = studies
      .map((s) => {
        const getFirst = (k: string) => Array.isArray((s as any)[k]) ? ((s as any)[k][0] ?? null) : (s as any)[k] ?? null;
        return {
          nctId: getFirst("NCTId"),
          title: getFirst("BriefTitle"),
          status: getFirst("OverallStatus"),
          lastUpdated: getFirst("LastUpdatePostDate"),
          conditions: (s as any).Condition ?? [],
          interventions: (s as any).InterventionName ?? [],
          sponsor: getFirst("LeadSponsorName"),
          studyType: getFirst("StudyType"),
          startDate: getFirst("StartDate"),
          primaryCompletionDate: getFirst("PrimaryCompletionDate"),
          locations: {
            city: (s as any).LocationCity ?? [],
            state: (s as any).LocationState ?? [],
            country: (s as any).LocationCountry ?? [],
            facility: (s as any).LocationFacility ?? [],
          },
        };
      })
      .sort((a, b) => {
        const ad = a.lastUpdated ? Date.parse(a.lastUpdated as string) : 0;
        const bd = b.lastUpdated ? Date.parse(b.lastUpdated as string) : 0;
        return bd - ad;
      });

    return NextResponse.json({
      page,
      pageSize,
      total: body?.NStudiesFound ?? parsed.length,
      data: parsed,
    }, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 });
  }
}

