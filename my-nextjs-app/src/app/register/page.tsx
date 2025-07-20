'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    const res = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: Number(age), username, password }),
    })

    const data = await res.json()
    if (res.ok) {
      router.push('/')
    } else {
      setError(data.error || 'Registration failed')
    }
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    marginBottom: '16px',
    border: '2px solid #e3f2fd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'white',
    transition: 'border-color 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1976d2',
            margin: '0 0 8px 0'
          }}>
            Welcome to <strong>SHELFIE</strong>
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
            margin: '0'
          }}>
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <div>
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1976d2'}
            onBlur={e => e.target.style.borderColor = '#e3f2fd'}
          />
          <input
            placeholder="Age"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1976d2'}
            onBlur={e => e.target.style.borderColor = '#e3f2fd'}
          />
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1976d2'}
            onBlur={e => e.target.style.borderColor = '#e3f2fd'}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1976d2'}
            onBlur={e => e.target.style.borderColor = '#e3f2fd'}
          />
          
          <button
            onClick={handleRegister}
            style={buttonStyle}
            onMouseOver={e => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={e => e.target.style.backgroundColor = '#1976d2'}
          >
            Register
          </button>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '16px',
              border: '1px solid #ffcdd2'
            }}>
              {error}
            </div>
          )}

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#666',
            fontSize: '14px'
          }}>
            Already have an account?{' '}
            <a
              href="/"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}