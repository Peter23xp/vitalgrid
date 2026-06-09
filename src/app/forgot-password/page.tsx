import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.card}>
        <div className={styles.backNav}>
          <Link href="/login" className={styles.backLink}>← Retour à la connexion</Link>
        </div>
        
        <h1 className={styles.title}>Réinitialiser votre mot de passe</h1>

        {/* Etape 1 */}
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>ÉTAPE 1 — Entrez votre email professionnel</h2>
          <div className={styles.stepContent}>
            <input 
              type="email" 
              className="input-field" 
              placeholder="votre.nom@organisation.org" 
              required 
            />
            <button className={`btn-primary ${styles.actionBtn}`}>ENVOYER LE CODE</button>
          </div>
        </div>

        {/* Etape 2 */}
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>ÉTAPE 2 — Entrez le code reçu par email (6 chiffres)</h2>
          <div className={styles.stepContent}>
            <div className={styles.otpGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <input 
                  key={i} 
                  type="text" 
                  maxLength={1} 
                  className={`input-field ${styles.otpInput}`} 
                  placeholder="_" 
                />
              ))}
            </div>
            <div className={styles.timerRow}>
              <span className={styles.timerText}>Code expire dans : 09:47</span>
              <button className={styles.resendBtn} disabled>Renvoyer</button>
            </div>
          </div>
        </div>

        {/* Etape 3 */}
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>ÉTAPE 3 — Nouveau mot de passe</h2>
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label>Nouveau mot de passe</label>
              <input type="password" className="input-field" required />
            </div>
            <div className={styles.formGroup}>
              <label>Confirmer le mot de passe</label>
              <input type="password" className="input-field" required />
            </div>
            
            <div className={styles.checklist}>
              <span className={styles.checkItem}><CheckCircle2 size={14} style={{ color: 'var(--status-success)', verticalAlign: 'middle', marginRight: 6 }} />8 caractères min</span>
              <span className={styles.checkItem}><CheckCircle2 size={14} style={{ color: 'var(--status-success)', verticalAlign: 'middle', marginRight: 6 }} />1 majuscule</span>
              <span className={styles.checkItem}><CheckCircle2 size={14} style={{ color: 'var(--status-success)', verticalAlign: 'middle', marginRight: 6 }} />1 chiffre</span>
            </div>
            
            <button className={`btn-primary ${styles.actionBtn}`} disabled>RÉINITIALISER</button>
          </div>
        </div>
      </div>
    </div>
  );
}
