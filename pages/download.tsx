import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Download() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.viril.app'; 

  return (
    <>
      <Head>
        <title>Télécharger l'app — Viril</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div 
        style={{ 
          background: '#0E0E0F', 
          minHeight: '100vh', 
          color: '#F2F2F3',
          fontFamily: 'Manrope, ui-sans-serif, system-ui, -apple-system'
        }}
      >
        {/* Header with Logo */}
        <header 
          style={{ 
            padding: '20px', 
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <img src="/viril-logo.svg" alt="Viril" style={{ height: 32 }} />
        </header>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
          }}
        >
        <div 
          style={{ 
            maxWidth: 560, 
            width: '100%',
            textAlign: 'center',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}
        >
          {/* Success Icon */}
          <div 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 40
            }}
          >
            ✅
          </div>

          {/* Title */}
          <h1 
            style={{ 
              fontSize: 36, 
              fontWeight: 900, 
              marginBottom: 12,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Compte activé !
          </h1>

          {/* Subtitle */}
          <p 
            style={{ 
              fontSize: 18, 
              opacity: 0.85, 
              marginBottom: 40,
              lineHeight: 1.5
            }}
          >
            Téléchargez l'app pour commencer
          </p>

          {/* Google Play Badge */}
          <div style={{ marginBottom: 32 }}>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                width: '100%',
                maxWidth: 320,
                textDecoration: 'none'
              }}
            >
              <div
                style={{
                  background: '#000',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  padding: '20px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <span style={{ fontSize: 36 }}>▶️</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: '#FFF', opacity: 0.7, marginBottom: 4 }}>
                    Télécharger sur
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#FFF' }}>
                    Google Play
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Login Info Box */}
          <div 
            style={{ 
              background: 'rgba(255, 122, 26, 0.08)',
              border: '1px solid rgba(255, 122, 26, 0.2)',
              borderRadius: 12,
              padding: 24,
              fontSize: 15,
              lineHeight: 1.6
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>💡</div>
            <div style={{ opacity: 0.95, fontWeight: 500 }}>
              Utilisez l'email et le mot de passe que vous venez de créer pour vous connecter dans l'app
            </div>
          </div>

          {/* Additional Help */}
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 12 }}>
              Besoin d'aide ?
            </p>
            <a 
              href="mailto:dan@viril.app" 
              style={{ 
                color: '#FF7A1A', 
                textDecoration: 'none', 
                fontSize: 15,
                fontWeight: 600
              }}
            >
              Contactez le support →
            </a>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

