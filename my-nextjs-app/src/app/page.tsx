'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('user_id', data.user_id)
      router.push('/home') // redirect to main page
    } else {
      setError(data.error || 'Login failed')
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    welcome: {
      textAlign: 'center' as const,
      marginBottom: '32px',
    },
    welcomeText: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px',
    },
    brand: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      marginTop: '8px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    input: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none',
    },
    inputFocus: {
      borderColor: '#3b82f6',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '14px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '8px',
    },
    buttonHover: {
      backgroundColor: '#2563eb',
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      textAlign: 'center' as const,
      padding: '8px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '24px',
      fontSize: '14px',
      color: '#6b7280',
    },
    link: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '500',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.welcome}>
          <div style={styles.welcomeText}>Welcome to</div>
          <div style={styles.brand}>SHELFIE</div>
          <div style={styles.subtitle}>Your personal reading companion</div>
        </div>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button 
            onClick={handleLogin} 
            style={styles.button}
            onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
          >
            Sign In
          </button>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <a href="/register" style={styles.link}>
            Create one here
          </a>
        </div>
      </div>
    </div>
  )
}