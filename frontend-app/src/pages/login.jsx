import { useState } from 'react';
import { loginUser } from '../services/api';
import React from 'react';
import '../App.css'; // Pastikan path ini sesuai dengan struktur folder Anda  


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await loginUser({ email, password });

    if (result.status === 200) {
      setMessage('Login berhasil');
      console.log(result.data); // Lihat data dari backend

      // Simpan token ke localStorage kalau ada
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
      }

      // Redirect ke halaman dashboard (jika sudah pakai routing)
    } else {
      setMessage(result.data.message || 'Login gagal');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
