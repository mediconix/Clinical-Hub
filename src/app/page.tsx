"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"trial" | "irb" | "conference" | "cro">("trial");
  const [disease, setDisease] = useState("");
  const [medical, setMedical] = useState("");
  const [drug, setDrug] = useState("");
  const [location, setLocation] = useState("");
  const [beds, setBeds] = useState<string | number>("");
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerSrcIndex, setBannerSrcIndex] = useState(0);
  const bannerCandidates = [
    "/images/clinical-hero.jpg",
    "/images/clinical-hero.jpeg",
    "/images/clinical-hero.png",
    "/images/clinical-hero.JPG",
    "/images/clinical-hero.JPEG",
    "/images/clinical-hero.PNG",
    "/images/clinical-hero",
  ];

  async function fetchTrials(opts?: { page?: number }) {
    const page = opts?.page ?? 1;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "10");
      if (disease) params.set("disease", disease);
      if (medical) params.set("medical", medical);
      if (drug) params.set("drug", drug);
      if (location) params.set("location", location);
      const res = await fetch(`/api/trials?${params.toString()}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setTrials(data?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "trial") {
      fetchTrials();
    }
  }, [activeTab]);
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">CH</span>
          <span className="text-xl font-bold">Clinical-Hub</span>
        </div>
      </header>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <div className="w-full max-w-4xl">
          <div
            className="relative h-44 sm:h-56 md:h-64 rounded-xl overflow-hidden shadow-lg"
            role="img"
            aria-label="Clinical Hub visual banner"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
            <img
              src={bannerCandidates[bannerSrcIndex]}
              alt="Clinical Hub banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={() => {
                setBannerSrcIndex((idx) => (idx + 1 < bannerCandidates.length ? idx + 1 : idx));
              }}
              loading="eager"
            />
          </div>
        </div>


        <div className="w-full max-w-4xl">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("trial")}
              className={`${activeTab === "trial" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 dark:text-gray-300"} -mb-px px-4 py-2 border-b-2 font-medium`}
            >
              진행중인 임상
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("irb")}
              className={`${activeTab === "irb" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 dark:text-gray-300"} -mb-px px-4 py-2 border-b-2 font-medium`}
            >
              IRB
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("conference")}
              className={`${activeTab === "conference" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 dark:text-gray-300"} -mb-px px-4 py-2 border-b-2 font-medium`}
            >
              학술대회
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cro")}
              className={`${activeTab === "cro" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 dark:text-gray-300"} -mb-px px-4 py-2 border-b-2 font-medium`}
            >
              CRO
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg max-w-2xl">
          <h2 className="text-2xl font-semibold mb-3">AI-Powered Clinical Assistant</h2>
          <p className="mb-4">
            Experience the next generation of medical AI with ChatGPT-5 integration. 
            Get intelligent insights, clinical decision support, and streamlined workflows.
          </p>
          <ul className="space-y-2 text-sm">
            <li>• Advanced natural language processing for medical queries</li>
            <li>• Real-time clinical decision support</li>
            <li>• Secure, HIPAA-compliant AI interactions</li>
            <li>• Integrated with your existing clinical workflows</li>
          </ul>
        </div>

        <div className="w-full max-w-4xl bg-white/50 dark:bg-gray-900/30 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">임상 검색</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); fetchTrials({ page: 1 }); }}>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700 dark:text-gray-300">질환명</label>
              <input value={disease} onChange={(e) => setDisease(e.target.value)} type="text" placeholder="예: 당뇨병, 고혈압" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700 dark:text-gray-300">의학용어</label>
              <input value={medical} onChange={(e) => setMedical(e.target.value)} type="text" placeholder="예: Hypertension, Diabetes Mellitus" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700 dark:text-gray-300">약물/약제</label>
              <input value={drug} onChange={(e) => setDrug(e.target.value)} type="text" placeholder="예: Metformin, Atorvastatin" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700 dark:text-gray-300">지역(동까지)</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" placeholder="예: 서울시 강남구 역삼동" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Bed 수</label>
              <input value={beds} onChange={(e) => setBeds(e.target.value)} type="number" min="0" placeholder="예: 500" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 text-sm">검색</button>
            </div>
          </form>
          {activeTab === "trial" && (
            <div className="mt-6">
              {loading && (
                <div className="text-sm text-gray-600 dark:text-gray-300">불러오는 중...</div>
              )}
              
              {!loading && !error && (
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">최근 업데이트된 진행중 임상</div>
                  <ul className="space-y-3">
                    {trials.map((t) => {
                      const loc = (t?.locations?.facility?.[0] || t?.locations?.city?.[0] || t?.locations?.country?.[0] || "");
                      return (
                        <li key={t.nctId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                          <div className="flex items-start justify-between gap-3">
                            <a href={`https://classic.clinicaltrials.gov/ct2/show/${t.nctId}`} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                              {t.title}
                            </a>
                            <span className="text-xs px-2 py-1 rounded-full border border-blue-600 text-blue-600">{t.status}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">NCT: {t.nctId} · 업데이트: {t.lastUpdated}</div>
                          <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 truncate">조건: {(t.conditions || []).slice(0, 3).join(", ")}</div>
                          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200 truncate">중재: {(t.interventions || []).slice(0, 3).join(", ")}</div>
                          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200 truncate">스폰서: {t.sponsor || "-"}</div>
                          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200 truncate">지역: {loc || "-"}</div>
                        </li>
                      );
                    })}
                    {trials.length === 0 && (
                      <li className="text-sm text-gray-600 dark:text-gray-300">표시할 결과가 없습니다</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 transition-colors">
            Start Clinical Session
          </button>
          <button className="rounded-full border border-solid border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 transition-colors">
            View Documentation
          </button>
        </div>

        
      </main>
      
      <footer className="row-start-3 w-full border-t border-gray-200 dark:border-gray-800 pt-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">CH</span>
            <span className="font-semibold">Clinical-Hub</span>
          </div>
          <div>서울특별시 강남구 영동대로 602 (삼성동, 삼성동 미켈란 107) 6층</div>
          <div>
            <span className="mr-3">T. 010-7138-4018</span>
            <span className="mr-3">F. 0504-281-4018</span>
            <span>
              E-mail. <a className="hover:underline" href="mailto:mediconixmail@gmail.com">mediconixmail@gmail.com</a>
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Copyright © Clinical-Hub. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
