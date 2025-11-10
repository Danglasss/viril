import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent } from 'react';

type ErrorType = 'session' | 'password_length' | 'password_mismatch' | 'email_empty' | 'api_error' | 'already_activated' | null;

export default function Activate() {
  const router = useRouter();
  
  // State
  const [mounted, setMounted] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Initialize Supabase and get auth_user_id
  useEffect(() => {
    const init = async () => {
      // Wait for Supabase to be ready
      if (typeof window !== 'undefined' && (window as any).sbApi) {
        setSupabaseReady(true);
        // Ensure we have a session (anonymous if needed) before reading user
        try { await (window as any).sbApi.ensureSession(); } catch (e) { console.warn('[activate] ensureSession failed', e); }
        // Helper: resolve auth user id with retries (in case session takes a moment)
        const resolveAuthUserId = async (): Promise<string | null> => {
          const deadline = Date.now() + 3000;
          while (Date.now() < deadline) {
            try {
              const sb = (window as any)._sb;
              if (sb && sb.auth) {
                const { data: { user } } = await sb.auth.getUser();
                if (user && user.id) return user.id;
              }
            } catch (_) {}
            await new Promise(res => setTimeout(res, 150));
          }
          // DB fallback: find last quiz_session by client_id cookie/localStorage
          try {
            const sb = (window as any)._sb;
            if (!sb) return null;
            const getClientId = (): string | null => {
              try {
                // cookie first
                const m = document.cookie.match(/(?:^|;\s*)client_id=([^;]+)/);
                if (m && m[1]) return decodeURIComponent(m[1]);
              } catch(_) {}
              try {
                const v = window.localStorage.getItem('client_id');
                if (v) return v;
              } catch(_) {}
              return null;
            };
            const cid = getClientId();
            if (!cid) return null;
            const { data, error } = await sb
              .from('quiz_sessions')
              .select('user_id, step')
              .eq('client_id', cid)
              .order('step', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (!error && data && data.user_id) {
              return data.user_id as string;
            }
          } catch(e) {
            console.warn('[activate] DB fallback (quiz_sessions by client_id) failed', e);
          }
          return null;
        };
        
        // Check URL params first (priority)
        const urlAuthUserId = router.query.auth_user_id as string;
        const urlEmail = router.query.email as string;

        if (urlAuthUserId && urlEmail) {
          // CAS B: Magic link with UTM params
          console.info('[activate] Using UTM params:', { urlAuthUserId, urlEmail });
          setAuthUserId(urlAuthUserId);
          setEmail(urlEmail);
        } else if (urlAuthUserId) {
          // Partial params
          console.info('[activate] Using partial UTM (auth_user_id only)');
          setAuthUserId(urlAuthUserId);
        } else {
          // CAS A: Try to get from current session (best-effort, no blocking error)
          try {
            const uid = await resolveAuthUserId();
            if (uid) {
              console.info('[activate] Using resolved user_id:', uid);
              setAuthUserId(uid);
            }
          } catch (e) {
            console.warn('[activate] session lookup failed (non-blocking)', e);
          }
        }
      }
    };

    if (router.isReady) {
      init();
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getErrorMessage = (errorType: ErrorType): string => {
    switch (errorType) {
      case 'session':
        return 'Session expirée. Utilisez le lien dans votre email.';
      case 'password_length':
        return 'Le mot de passe doit contenir au moins 8 caractères.';
      case 'password_mismatch':
        return 'Les mots de passe ne correspondent pas.';
      case 'email_empty':
        return 'Veuillez saisir votre email.';
      case 'already_activated':
        return 'Ce compte est déjà activé. Connectez-vous dans l\'app.';
      case 'api_error':
        return 'Erreur lors de l\'activation. Réessayez.';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!email.trim()) {
      setError('email_empty');
      return;
    }

    if (password.length < 8) {
      setError('password_length');
      return;
    }

    if (password !== confirmPassword) {
      setError('password_mismatch');
      return;
    }

    // Try to resolve missing auth_user_id one more time before submission
    if (!authUserId) {
      try {
        if ((window as any).sbApi) { await (window as any).sbApi.ensureSession(); }
        const sb = (window as any)._sb;
        if (sb) {
          const { data: { user } } = await sb.auth.getUser();
          if (user && user.id) {
            setAuthUserId(user.id);
          }
          if (!user || !user.id) {
            // DB fallback by client_id
            const getClientId = (): string | null => {
              try {
                const m = document.cookie.match(/(?:^|;\s*)client_id=([^;]+)/);
                if (m && m[1]) return decodeURIComponent(m[1]);
              } catch(_) {}
              try {
                const v = window.localStorage.getItem('client_id');
                if (v) return v;
              } catch(_) {}
              return null;
            };
            const cid = getClientId();
            if (cid) {
              try {
                const { data, error } = await sb
                  .from('quiz_sessions')
                  .select('user_id, step')
                  .eq('client_id', cid)
                  .order('step', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                if (!error && data && data.user_id) {
                  setAuthUserId(data.user_id as string);
                }
              } catch(e2) {
                console.warn('[activate] submit DB fallback failed', e2);
              }
            }
          }
        }
      } catch(_) {}
    }
    if (!authUserId) {
      setError('session');
      return;
    }

    setLoading(true);

    try {
      // Ensure session again before calling edge function
      try { if ((window as any).sbApi) { await (window as any).sbApi.ensureSession(); } } catch(_){}
      // Call the Supabase Edge Function
      const supabaseUrl = 'https://jdglouhvmwozdbuzbngh.supabase.co';
      const anon = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY) ? (window as any).__SUPABASE_ANON_KEY : (process as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const response = await fetch(`${supabaseUrl}/functions/v1/activate-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Required by Supabase Edge Functions
          'Authorization': `Bearer ${anon}`,
          'apikey': anon
        },
        body: JSON.stringify({
          auth_user_id: authUserId,
          email: email.trim(),
          password: password
        })
      });

      let data: any = {};
      try { data = await response.json(); } catch(_) { data = {}; }
      console.info('[activate] function response', { status: response.status, ok: response.ok, data });

      if (response.ok && (data.success || data.ok === true)) {
        // Success - redirect to download page
        router.push('/download');
      } else {
        // Check for specific error messages
        if (data.error && data.error.includes('already activated')) {
          setError('already_activated');
        } else {
          setError('api_error');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('[activate] API error:', err);
      setError('api_error');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Activer votre compte — Viril</title>
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
            maxWidth: 480, 
            width: '100%',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}
        >
          {/* Icon */}
          <div 
            style={{ 
              width: 64, 
              height: 64, 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 32
            }}
          >
            🔐
          </div>

          {/* Title */}
          <h1 
            style={{ 
              fontSize: 32, 
              fontWeight: 900, 
              marginBottom: 8,
              letterSpacing: '-0.02em',
              textAlign: 'center'
            }}
          >
            Créez vos identifiants
          </h1>

          <p 
            style={{ 
              fontSize: 16, 
              opacity: 0.7, 
              marginBottom: 32,
              textAlign: 'center',
              lineHeight: 1.5
            }}
          >
            Pour accéder à votre programme sur l'app mobile
          </p>

          {/* Error Message */}
          {error && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                fontSize: 15,
                lineHeight: 1.5,
                color: '#FCA5A5'
              }}
            >
              {getErrorMessage(error)}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: 20 }}>
              <label 
                htmlFor="email" 
                style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 600,
                  opacity: 0.9
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 16,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  color: '#F2F2F3',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FF7A1A';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 20 }}>
              <label 
                htmlFor="password" 
                style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 600,
                  opacity: 0.9
                }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 16,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  color: '#F2F2F3',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FF7A1A';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              />
              <p style={{ fontSize: 13, opacity: 0.6, margin: '6px 0 0', lineHeight: 1.4 }}>
                Au moins 8 caractères
              </p>
            </div>

            {/* Confirm Password Input */}
            <div style={{ marginBottom: 28 }}>
              <label 
                htmlFor="confirmPassword" 
                style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 600,
                  opacity: 0.9
                }}
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirmez votre mot de passe"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 16,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  color: '#F2F2F3',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FF7A1A';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 18,
                fontWeight: 800,
                background: loading ? 'rgba(255, 122, 26, 0.5)' : 'linear-gradient(135deg, #FF4D00, #FF7A1A)',
                color: '#FFF',
                border: 'none',
                borderRadius: 12,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 24px rgba(255, 77, 0, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 32px rgba(255, 77, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(255, 77, 0, 0.3)';
            }
              }}
            >
          {loading ? 'Activation en cours...' : 'Activer →'}
            </button>
          </form>

        </div>
        </div>
      </div>

      <Script src="/supabaseClient.js" strategy="beforeInteractive" />
    </>
  );
}

