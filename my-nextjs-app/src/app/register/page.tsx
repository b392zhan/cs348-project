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

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      <input
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <input
        placeholder="Age"
        type="number"
        value={age}
        onChange={e => setAge(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleRegister} style={{ width: '100%', padding: '10px' }}>Register</button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      <p style={{ marginTop: '16px' }}>
        Already have an account? <a href="/" style={{ color: '#4bc1d2' }}>Login</a>
      </p>
    </div>
  )
}