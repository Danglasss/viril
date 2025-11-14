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

const ALIAS_MAP: Record<string, string> = { demo_age: '__landing' };

type QuestionDef = { id: string; label: string };
type QuestionOption = { value: string; label: string };

export default function Admin() {
  const [data, setData] = React.useState<SessionRow[]>([]);
  const [totals, setTotals] = React.useState<Record<string, { sessions: number; completed: number }>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState<string>('all');
  const [availableVersions, setAvailableVersions] = React.useState<string[]>([]);
  const [funnel, setFunnel] = React.useState<Array<{ step: number | string; users: number; label?: string }>>([]);
  const [answers, setAnswers] = React.useState<Record<string, { label: string; rows: Array<{ value: string; n: number }> }>>({});
  const [filterQuestionId, setFilterQuestionId] = React.useState<string>('');
  const [filterAnswerValue, setFilterAnswerValue] = React.useState<string>('');
  const [questionDefs, setQuestionDefs] = React.useState<QuestionDef[]>([]);
  const [questionOptions, setQuestionOptions] = React.useState<Record<string, QuestionOption[]>>({});
  
  // Dates par défaut : 90 derniers jours
  const getDefaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  };
  const getDefaultEndDate = () => new Date().toISOString().split('T')[0];
  
  const [startDate, setStartDate] = React.useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = React.useState<string>(getDefaultEndDate());

  React.useEffect(() => {
    async function loadClient() {
      if (!(window as any).supabase) return; // CDN not yet loaded
      setLoading(true); setError(null);
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (window as any).__SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (window as any).__SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        const sb = (window as any).supabase.createClient(url, key);
        
        const startISO = new Date(startDate).toISOString();
        const endISO = new Date(endDate + 'T23:59:59').toISOString();

        // Charger quiz_sessions (avec filtres de date)
        let sessionsQuery = sb.from('quiz_sessions').select('*')
          .gte('started_at', startISO)
          .lte('started_at', endISO);
        const { data: sessions, error: sessErr } = await sessionsQuery;
        if (sessErr) throw sessErr;

        // Charger TOUS les profiles (pas de filtre de date, car un profile peut avoir été créé avant mais avoir laissé son email récemment)
        const { data: profiles, error: profErr } = await sb.from('profiles').select('id, email, quiz_version, created_at');
        if (profErr) {
          console.error('[admin] profiles load error:', profErr);
          console.warn('[admin] RLS bloque probablement l\'accès aux profiles. On va utiliser les sessions pour estimer les plans.');
        }

        console.log('[admin] loaded', sessions?.length, 'sessions,', profiles?.length || 0, 'profiles');
        
        // Fallback : si on ne peut pas charger les profiles, on utilise les sessions qui ont answers.__email
        let profilesFromSessions: any[] = [];
        if (!profiles || profiles.length === 0) {
          console.warn('[admin] Using fallback: detecting email from quiz_sessions.answers.__email');
          profilesFromSessions = (sessions || [])
            .filter((s: any) => s.answers && s.answers.__email && s.answers.__email.email)
            .map((s: any) => ({
              id: s.user_id,
              email: s.answers.__email.email,
              quiz_version: s.quiz_version,
              created_at: s.created_at || s.started_at
            }));
          console.log('[admin] Found', profilesFromSessions.length, 'profiles from sessions');
        }
        
        const allProfiles = profiles && profiles.length > 0 ? profiles : profilesFromSessions;

        // Filtrer les sessions
        const filterQidQuery = filterQuestionId ? (ALIAS_MAP[filterQuestionId] || filterQuestionId) : null;
        const filterVal = filterAnswerValue || null;
        
        let filteredSessions = (sessions || []).filter((s: any) => {
          // Filtre version
          if (version !== 'all' && s.quiz_version !== version) return false;
          // Filtre réponse
          if (filterQidQuery && filterVal) {
            const answerVal = s.answers && s.answers[filterQidQuery];
            if (answerVal !== filterVal) return false;
          }
          return true;
        });

        // Calcul overview (sessions → plans par jour)
        const overviewMap: Record<string, Record<string, { sessions: Set<string>; plans: Set<string> }>> = {};
        filteredSessions.forEach((s: any) => {
          const d = (s.created_at || s.started_at || s.updated_at) ? (s.created_at || s.started_at || s.updated_at).split('T')[0] : 'unknown';
          const v = s.quiz_version || 'unknown';
          if (!overviewMap[d]) overviewMap[d] = {};
          if (!overviewMap[d][v]) overviewMap[d][v] = { sessions: new Set(), plans: new Set() };
          overviewMap[d][v].sessions.add(s.user_id);
        });
        
        // Calculer Plans reçus : profiles avec email parmi les users des sessions filtrées
        const userIdsInFilteredSessions = new Set(filteredSessions.map((s: any) => s.user_id));
        const profilesFiltered = (allProfiles || []).filter((p: any) => {
          // Doit avoir un email
          if (!p.email) return false;
          // Doit correspondre à un user dans les sessions filtrées
          if (!userIdsInFilteredSessions.has(p.id)) return false;
          return true;
        });
        
        profilesFiltered.forEach((p: any) => {
          const d = p.created_at ? p.created_at.split('T')[0] : 'unknown';
          const v = p.quiz_version || 'unknown';
          if (!overviewMap[d]) overviewMap[d] = {};
          if (!overviewMap[d][v]) overviewMap[d][v] = { sessions: new Set(), plans: new Set() };
          overviewMap[d][v].plans.add(p.id);
        });

        const normalized: SessionRow[] = [];
        Object.keys(overviewMap).forEach(d => {
          Object.keys(overviewMap[d]).forEach(v => {
            const sessCount = overviewMap[d][v].sessions.size;
            const plansCount = overviewMap[d][v].plans.size;
            const cr = sessCount > 0 ? Math.round((plansCount / sessCount) * 1000) / 10 : 0;
            normalized.push({
              d,
              quiz_version: v,
              sessions: sessCount,
              completed: plansCount,
              cr_percent: cr
            });
          });
        });
        normalized.sort((a, b) => b.d.localeCompare(a.d));
        setData(normalized);

        // Calcul totals
        const totalsCalc: Record<string, { sessions: number; completed: number }> = {};
        normalized.forEach(r => {
          if (!totalsCalc[r.quiz_version]) totalsCalc[r.quiz_version] = { sessions: 0, completed: 0 };
          totalsCalc[r.quiz_version].sessions += r.sessions;
          totalsCalc[r.quiz_version].completed += r.completed;
        });
        setTotals(totalsCalc);

        // Versions disponibles
        const vSet = new Set<string>();
        (sessions || []).forEach((s: any) => {
          if (s.quiz_version) vSet.add(String(s.quiz_version));
        });
        const vList = Array.from(vSet).sort();
        setAvailableVersions(vList);
        if (version !== 'all' && !vList.includes(version)) {
          setVersion('all');
        }

        // Funnel par step : compter combien de users ont atteint AU MOINS chaque step
        // Map user_id -> max step atteint
        const userMaxStep: Record<string, number> = {};
        filteredSessions.forEach((s: any) => {
          const userId = s.user_id;
          const step = Number(s.step) || 0;
          if (step > 24) return; // on ignore au-delà de 24
          if (!userMaxStep[userId] || step > userMaxStep[userId]) {
            userMaxStep[userId] = step;
          }
        });
        
        // Construire le funnel complet de 0 à 24
        const funnelRows: Array<{ step: number | string; users: number; label?: string }> = [];
        for (let s = 0; s <= 24; s++) {
          const usersAtThisStep = Object.values(userMaxStep).filter(maxStep => maxStep >= s).length;
          funnelRows.push({ step: s, users: usersAtThisStep });
        }
        
        // Ajouter Plans reçus (profiles.email not null) à la fin
        const plansRecusCount = profilesFiltered.length;
        funnelRows.push({ step: 'plans', users: plansRecusCount, label: 'Plans reçus' });
        
        setFunnel(funnelRows);

        // Répartition de réponses (toutes les questions définies dans test.json)
        const map: Record<string, { label: string; rows: Array<{value:string;n:number}> }> = {};
        try {
          const quiz = await fetch('/data/test.json').then(r=>r.json()).catch(()=>null);
          const qdefs: Array<{ id: string; qidQuery: string; label: string }> = (quiz?.questions || [])
            .filter((q:any)=> q && q.id && (q.type==='QCM' || q.type==='ImageChoice' || q.type==='Slider' || q.type==='Text'))
            .map((q:any)=> ({ id: String(q.id), qidQuery: ALIAS_MAP[String(q.id)] || String(q.id), label: String((q.text?.fr || q.text?.en || q.id)) }));
          // Enregistrer les questions filtrables + leurs options pour le segment filter
          setQuestionDefs(qdefs.map(q => ({ id: q.id, label: q.label })));
          const optsMap: Record<string, QuestionOption[]> = {};
          (quiz?.questions || []).forEach((q:any) => {
            if (!q || !q.id || !Array.isArray(q.options)) return;
            const qid = String(q.id);
            optsMap[qid] = q.options.map((opt:any) => ({
              value: String(opt.value),
              label: String(opt.label?.fr || opt.label?.en || opt.value)
            }));
          });
          setQuestionOptions(optsMap);
          
          // Calcul de la distribution des réponses côté front (pas de RPC)
          qdefs.forEach(def => {
            const distMap: Record<string, number> = {};
            filteredSessions.forEach((s: any) => {
              if (!s.answers) return;
              const val = s.answers[def.qidQuery];
              if (val != null) {
                const valStr = String(val);
                distMap[valStr] = (distMap[valStr] || 0) + 1;
              }
            });
            const rows = Object.keys(distMap).map(k => ({ value: k, n: distMap[k] }));
            rows.sort((a, b) => b.n - a.n);
            if (rows.length > 0) {
              map[def.id] = { label: def.label, rows };
            }
          });
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
  }, [version, filterQuestionId, filterAnswerValue, startDate, endDate]);

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
            {availableVersions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom: 16 }}>
        <label style={{ opacity:.8 }}>Segment</label>
        <select
          value={filterQuestionId}
          onChange={e => { setFilterQuestionId(e.target.value); setFilterAnswerValue(''); }}
          style={{ background:'#111', color:'#FFF', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px', minWidth: 200 }}
        >
          <option value="">Tous les profils</option>
          {questionDefs.map(q => (
            <option key={q.id} value={q.id}>{q.label}</option>
          ))}
        </select>
        {filterQuestionId && (
          <select
            value={filterAnswerValue}
            onChange={e => setFilterAnswerValue(e.target.value)}
            style={{ background:'#111', color:'#FFF', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px', minWidth: 200 }}
          >
            <option value="">Toutes les réponses</option>
            {(questionOptions[filterQuestionId] || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom: 20 }}>
        <label style={{ opacity:.8 }}>Période</label>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ background:'#111', color:'#FFF', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px' }}
          />
          <span style={{ opacity:.6 }}>→</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ background:'#111', color:'#FFF', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'6px 10px' }}
          />
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
            <Card title="Taux de complétion par step" subtitle={`Nombre d'utilisateurs ayant atteint chaque step — ${version==='all'?'toutes versions':'version '+version}`}>
              <div style={{ display:'grid', gap:8 }}>
                {(() => { 
                  // Calculer % par rapport au nombre initial (step 0)
                  const step0 = funnel.find(f => f.step === 0);
                  const baseUsers = step0 ? step0.users : 1;
                  
                  return funnel.map((r, i)=> {
                    const pct = baseUsers > 0 ? Math.round((r.users / baseUsers) * 1000) / 10 : 0;
                    const isPlansRecus = r.step === 'plans';
                    const stepLabel = isPlansRecus ? (r.label || 'Plans reçus') : `Step ${r.step}`;
                    const bgColor = isPlansRecus ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #00B67A, #F5A623)';
                    
                    return (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'140px 1fr 120px', alignItems:'center', gap:10 }}>
                        <div style={{ opacity:.85, fontWeight: isPlansRecus ? 700 : 400 }}>{stepLabel}</div>
                      <div style={{ background:'rgba(255,255,255,.08)', height:12, borderRadius:999, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background: bgColor }} />
                      </div>
                      <div style={{ textAlign:'right', fontSize:12 }}>
                        <span style={{ opacity:.85 }}>{r.users}</span>
                          <span style={{ marginLeft:8, padding:'2px 8px', background:'rgba(255,255,255,.1)', borderRadius:999 }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  });
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


