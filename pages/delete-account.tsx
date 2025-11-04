export default function DeleteAccount() {
  return (
    <div style={{ background:'#0E0E0F', minHeight:'100vh', color:'#F2F2F3' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontWeight: 900, letterSpacing: '.2px', margin: '12px 0 18px' }}>Suppression de compte</h1>
        <p style={{ opacity:.8, marginBottom: 12 }}>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
        <div style={{ border:'1px solid rgba(255,255,255,.12)', borderRadius: 8, overflow:'hidden' }}>
          <iframe src="/delete-account.html" style={{ width: '100%', height: '76vh', border: 0, background:'#161618' }} />
        </div>
        <p style={{ marginTop: 12, opacity:.8, fontSize: 14 }}>Pour toute question, contactez-nous: <a href="mailto:dan@viril.app" style={{ color:'#FF7A1A', textDecoration:'none' }}>dan@viril.app</a></p>
      </div>
    </div>
  );
}
