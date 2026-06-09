'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erreur de connexion');
        return;
      }

      router.push(data.redirectTo ?? '/dashboard');
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.brandAccent}>Vital</span><span>Grid</span>
          </h1>
          <p className={styles.subtitle}>Réseau Global de Ressources Critiques</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid var(--status-error)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: 'var(--status-error)', marginBottom: 4,
            }}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Adresse email professionnelle</label>
            <input
              type="email" id="email" name="email"
              className="input-field"
              placeholder="votre.nom@organisation.org"
              required autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Mot de passe</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPwd ? 'text' : 'password'}
                id="password" name="password"
                className="input-field"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" className={styles.togglePassword} onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Se souvenir 30 jours</span>
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Mot de passe oublié?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || !email || !password}
          >
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>

          <div className={styles.divider}><span>Connexion SSO</span></div>

          <button type="button" className={styles.ssoBtn} disabled>
            Continuer avec SAML/SSO
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.secureBadge}>
            <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Connexion chiffrée TLS 1.3
          </span>
          <span className={styles.version}>VitalGrid v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
