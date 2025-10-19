import React from 'react';
import Script from 'next/script';

type SessionRow = { quiz_version: string; d: string; sessions: number; completed: number; cr_percent: number };

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }){
  return (
    <div style={{
      background: 'rgba(255,255,255,.06)',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 12px 32px rgba(0,0,0,.35)',
      backdropFilter: 'blur(6px)'
    }}>
      <div style={{ fontWeight: 800, marginBottom: subtitle ? 2 : 8, letterSpacing: .2 }}>{title}</div>
      {subtitle && <div style={{ opacity:.7, fontSize:12, marginBottom:10 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }){
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,.3)'
    }}>
      <div style={{ opacity: .75, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: .2 }}>{value}</div>
    </div>
  );
}

export default function Admin() {
  const [data, setData] = React.useState<SessionRow[]>([]);
  const [totals, setTotals] = React.useState<Record<string, { sessions: number; completed: number }>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState<string>('all');
  const [funnel, setFunnel] = React.useState<Array<{ step: number; users: number }>>([]);
  const [answers, setAnswers] = React.useState<Record<string, { label: string; rows: Array<{ value: string; n: number }> }>>({});

  React.useEffect(() => {
    async function loadClient() {
      if (!(window as any).supabase) return; // CDN not yet loaded
      setLoading(true); setError(null);
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (window as any).__SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (window as any).__SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        const sb = (window as any).supabase.createClient(url, key);
        // Appel RPC sécurisé (agrégation côté DB)
        const { data, error } = await sb.rpc('admin_overview', { since_days: 90 });
        if (error) throw error;
        console.log('[admin] rpc admin_overview', data);
        const rows = Array.isArray((data as any)?.rows) ? (data as any).rows : (Array.isArray(data) ? (data as any) : []);
        const totalsCalc = rows.reduce((acc:any, r:any)=>{ const t = acc[r.quiz_version] || { sessions:0, completed:0 }; t.sessions += r.sessions||0; t.completed += r.plans||0; acc[r.quiz_version]=t; return acc; }, {});
        // Harmonise key name 'plans' vs 'completed'
        const normalized = rows.map((r:any)=> ({
          d: r.d,
          quiz_version: r.quiz_version,
          sessions: r.sessions||0,
          completed: (r.plans!=null? r.plans : r.completed)||0,
          cr_percent: r.cr_percent||0
        }));
        setData(normalized);
        setTotals(totalsCalc);

        // Funnel par step (RPC simple)
        try {
          const { data: fData, error: fErr } = await sb.rpc('admin_funnel', { since_days: 90, qv: (version==='all'? null : version) });
          if (fErr) throw fErr;
          const fRows = Array.isArray(fData) ? fData : [];
          // Regrouper par step (au cas où la RPC renvoie une ligne par user)
          const agg: Record<number, number> = {};
          for (const r of fRows as any[]) {
            const step = Number((r as any).step) || 0;
            const n = Number((r as any).users ?? (r as any).n ?? 1);
            agg[step] = (agg[step] || 0) + n;
          }
          const grouped = Object.keys(agg).map(k => ({ step: Number(k), users: agg[Number(k)] }));
          setFunnel(grouped.sort((a,b)=> a.step-b.step));
        } catch (e) { console.warn('[admin] funnel rpc skipped', e); setFunnel([]); }

        // Répartition de réponses (toutes les questions définies dans test.json)
        const map: Record<string, { label: string; rows: Array<{value:string;n:number}> }> = {};
        try {
          const quiz = await fetch('/data/test.json').then(r=>r.json()).catch(()=>null);
          const aliasMap: Record<string,string> = { demo_age: '__landing' };
          const qdefs: Array<{ id: string; qidQuery: string; label: string }> = (quiz?.questions || [])
            .filter((q:any)=> q && q.id && (q.type==='QCM' || q.type==='ImageChoice' || q.type==='Slider' || q.type==='Text'))
            .map((q:any)=> ({ id: String(q.id), qidQuery: aliasMap[String(q.id)] || String(q.id), label: String((q.text?.fr || q.text?.en || q.id)) }));
          // Appels parallèles (limités) pour chaque question
          const chunks = qdefs; // simple: tout en parallèle raisonnable
          await Promise.all(chunks.map(async def => {
            try {
              const { data: aData, error: aErr } = await sb.rpc('admin_answer_dist', { qid: def.qidQuery, since_days: 90, qv: (version==='all'? null : version) });
              if (aErr) throw aErr;
              const rows = (Array.isArray(aData) ? aData : []).map((r:any)=>({ value: String(r.value), n: Number(r.n) }));
              map[def.id] = { label: def.label, rows };
            } catch(e) {
              console.warn('[admin] answer_dist rpc skipped', def.id, e);
            }
          }));
        } catch(e) { console.warn('[admin] load test.json failed', e); }
        setAnswers(map);
      } catch (e: any) {
        console.error('[admin] load error', e);
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    // try now and also after a small delay in case script loads slightly after
    loadClient();
    const id = setTimeout(loadClient, 300);
    return () => clearTimeout(id);
  }, [version]);

  const filtered = data.filter(r => version==='all' ? true : r.quiz_version === version);
  const overallSessions = version==='all'
    ? Object.values(totals).reduce((a,b)=>a+b.sessions,0)
    : (totals[version]?.sessions || 0);
  const overallCompleted = version==='all'
    ? Object.values(totals).reduce((a,b)=>a+b.completed,0)
    : (totals[version]?.completed || 0);
  const overallCR = overallSessions ? Math.round((overallCompleted*1000)/overallSessions)/10 : 0;

  return (
    <div style={{ padding: 24, color: '#FFF', background: '#0B0B0B', minHeight: '100vh', fontFamily: 'Manrope, ui-sans-serif, system-ui' }}>
      <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="afterInteractive" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: .3 }}>Viril — Admin Analytics</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ opacity: .8 }}>Version</label>
          <select value={version} onChange={e=>setVersion(e.target.value)} style={{ background:'#111', color:'#FFF', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px' }}>
            <option value="all">All</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
      </div>

      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: '#FF3B30' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <Stat label="Nb users" value={String(overallSessions)} />
            <Stat label="Plans personnalisés remis" value={String(overallCompleted)} />
            <Stat label="Taux de conversion" value={`${overallCR}%`} />
          </div>

          <Card title="Conversion (utilisateurs → plans personnalisés)" subtitle={`Vue ${version==='all'?'toutes versions':'version '+version}`}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 120px 160px 100px', gap: 8, alignItems: 'center', opacity: .75, fontWeight: 700, position:'sticky', top:0 }}>
              <div>Date</div>
              <div>Version</div>
              <div>Nb users</div>
              <div>Plans personnalisés</div>
              <div>CR %</div>
            </div>
            {filtered.map((r, i) => {
              const zebra = i%2===0 ? 'rgba(255,255,255,.03)' : 'transparent';
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 120px 120px 160px 100px', gap: 8, padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,.06)', background: zebra, borderRadius:8 }}>
                  <div>{new Date(r.d).toLocaleDateString()}</div>
                  <div>{r.quiz_version}</div>
                  <div style={{ textAlign:'right' }}>{r.sessions}</div>
                  <div style={{ textAlign:'right' }}>{r.completed}</div>
                  <div style={{ textAlign:'right' }}>{r.cr_percent}%</div>
                </div>
              );
            })}
          </Card>

          {funnel.length>0 && (
            <Card title="Taux de complétion par step" subtitle={`% cumulé depuis la step 0 — ${version==='all'?'toutes versions':'version '+version}`}>
              <div style={{ display:'grid', gap:8 }}>
                {(() => { 
                  // Agrégation: on veut un funnel descendant
                  const counts = new Map<number, number>();
                  funnel.forEach(f => counts.set(f.step, (counts.get(f.step)||0) + f.users));
                  const maxStep = Math.max(...Array.from(counts.keys()));
                  const totalUsers = Array.from(counts.values()).reduce((a,b)=>a+b,0) || 1;
                  // cumul >= step n (descendant)
                  let cum = 0;
                  const rows: Array<{ step:number; users:number; pct:number }> = [];
                  for (let s = maxStep; s >= 0; s--) {
                    cum += counts.get(s) || 0;
                    rows.push({ step: s, users: cum, pct: Math.round((cum/totalUsers)*1000)/10 });
                  }
                  // on a construit de max->0, on inverse pour afficher 0..max
                  rows.reverse();
                  // plateau: déjà garanti par le cumul; la série est non croissante
                  return rows.map((r, i)=> (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'90px 1fr 120px', alignItems:'center', gap:10 }}>
                      <div style={{ opacity:.85 }}>Step {r.step}</div>
                      <div style={{ background:'rgba(255,255,255,.08)', height:12, borderRadius:999, overflow:'hidden' }}>
                        <div style={{ width:`${r.pct}%`, height:'100%', background:'linear-gradient(90deg, #00B67A, #F5A623)' }} />
                      </div>
                      <div style={{ textAlign:'right', fontSize:12 }}>
                        <span style={{ opacity:.85 }}>{r.users}</span>
                        <span style={{ marginLeft:8, padding:'2px 8px', background:'rgba(255,255,255,.1)', borderRadius:999 }}>{r.pct}%</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          )}

          {Object.keys(answers).length>0 && (
            <Card title="Répartition des réponses" subtitle={`Ventilation par question — ${version==='all'?'toutes versions':'version '+version}`}>
              <div style={{ display:'grid', gap:16 }}>
                {Object.entries(answers).map(([qid, payload])=>{
                  const rows = payload.rows || [];
                  const total = rows.reduce((a,b)=>a+b.n,0)||1;
                  const sorted = [...rows].sort((a,b)=> b.n-a.n);
                  return (
                    <div key={qid}>
                      <div style={{ fontWeight:700, marginBottom:6 }}>{payload.label} <span style={{ opacity:.6, fontWeight:400 }}>({qid})</span></div>
                      <div style={{ display:'grid', gap:8 }}>
                        {sorted.map((r,i)=> (
                          <div key={i} style={{ display:'grid', gridTemplateColumns:'minmax(160px, 260px) 1fr 60px', gap:12, alignItems:'center' }}>
                            <div style={{ opacity:.85 }}>{r.value}</div>
                            <div style={{ background:'rgba(255,255,255,.08)', height:10, borderRadius:999, overflow:'hidden' }}>
                              <div style={{ width:`${(r.n/total)*100}%`, height:'100%', background:'linear-gradient(90deg, #6EE7B7, #3B82F6)' }} />
                            </div>
                            <div style={{ textAlign:'right', padding:'2px 8px', background:'rgba(255,255,255,.1)', borderRadius:999 }}>{Math.round((r.n/total)*100)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}


