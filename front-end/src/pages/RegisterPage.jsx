import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { URL } from '../environment';

const C = {
  navy:'#0d2b55', navyDark:'#071a36', navyMid:'#163d6e',
  gold:'#b8922a', goldLight:'#d4a843',
  white:'#ffffff',
  g50:'#f8f9fb', g100:'#eef1f5', g200:'#dde2ea',
  g400:'#8d9aaa', g600:'#4a5568', g800:'#1e2a3a',
  danger:'#c0392b',
};
const shadow = { md:'0 4px 16px rgba(13,43,85,0.10)' };
const font = { serif:"'EB Garamond',Georgia,serif", sans:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" };

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#eef1f5;min-height:100vh;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
input::placeholder{color:#c4cdd8;}
input:focus{outline:none;}
.reg-field-wrap:focus-within{border-color:#b8922a!important;box-shadow:0 0 0 3px rgba(184,146,42,.16)!important;background:#fff!important;}
.reg-submit-btn:hover:not(:disabled){transform:translateY(-2px)!important;box-shadow:0 16px 28px rgba(13,43,85,.25)!important;background:#163d6e!important;}
@media(max-width:640px){
  .reg-form-panel{padding:1.25rem!important;}
}
`;

const IcoHouse = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoUser  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoMail  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoLock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const inputStyle = { flex:1, padding:'0.8rem 0', border:'none', background:'transparent', fontSize:'0.92rem', outline:'none', fontFamily:font.sans, color:C.g800 };
const labelStyle = { fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.5rem' };
const wrapStyle  = { position:'relative', display:'flex', alignItems:'center', border:`1.5px solid ${C.g200}`, borderRadius:6, overflow:'hidden', background:C.g50, transition:'all 0.24s' };
const iconStyle  = { padding:'0 1rem', color:C.g400, flexShrink:0 };

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'', mobileno:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { name, username, email, password, mobileno } = form;
    if (!name || !username || !email || !password || !mobileno) {
      setError('Please fill in all fields.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${URL}api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, mobileno, role: 'USER' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }
      login({ name, username, email, mobileno }, data.token);
      navigate('/dashboard');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily:font.sans, color:C.g800, WebkitFontSmoothing:'antialiased', minHeight:'100vh', display:'flex' }}>

        {/* Left branding */}
        <div style={{ flex:1, background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navy} 55%,${C.navyMid} 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:300, height:300, background:C.gold, opacity:0.05, borderRadius:'50%', top:-100, left:-100 }}/>
          <div style={{ position:'absolute', width:200, height:200, background:'#1a6b6b', opacity:0.05, borderRadius:'50%', bottom:-50, right:-50 }}/>
          <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:380 }}>
            <div style={{ width:80, height:80, background:`linear-gradient(145deg,${C.navy},${C.navyMid})`, borderRadius:'50%', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.white, margin:'0 auto 2rem' }}>
              <IcoHouse />
            </div>
            <h1 style={{ fontFamily:font.serif, fontSize:'2.8rem', fontWeight:700, lineHeight:1.1, marginBottom:'0.75rem', background:`linear-gradient(92deg,#fff 8%,${C.goldLight} 56%,#f3cf73 100%)`, WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>Project</h1>
            <p style={{ fontSize:'0.88rem', color:'#c4d6e8', lineHeight:1.6, maxWidth:320, marginInline:'auto' }}>AI-Powered Identity Verification and KYC Automation Platform</p>
          </div>
        </div>

        {/* Right form */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:C.white, overflowY:'auto' }}>
          <div className="reg-form-panel" style={{ width:'100%', maxWidth:440, background:'linear-gradient(160deg,#fff,#fbfcfe)', border:`1px solid ${C.g200}`, borderRadius:14, padding:'2rem 1.75rem', boxShadow:'0 18px 42px rgba(13,43,85,.12)', animation:'fadeUp .5s ease' }}>
            <div style={{ marginBottom:'1.75rem' }}>
              <h2 style={{ fontFamily:font.serif, fontSize:'1.8rem', fontWeight:700, color:C.navy, marginBottom:'0.4rem' }}>Create Account</h2>
              <p style={{ fontSize:'0.88rem', color:C.g400 }}>Register to access the KYC platform</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <div className="reg-field-wrap" style={wrapStyle}>
                  <span style={iconStyle}><IcoUser /></span>
                  <input style={inputStyle} type="text" value={form.name} onChange={set('name')} placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <div className="reg-field-wrap" style={wrapStyle}>
                  <span style={iconStyle}><IcoUser /></span>
                  <input style={inputStyle} type="text" value={form.username} onChange={set('username')} placeholder="Choose a username" autoComplete="username" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <div className="reg-field-wrap" style={wrapStyle}>
                  <span style={iconStyle}><IcoMail /></span>
                  <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" autoComplete="email" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <div className="reg-field-wrap" style={wrapStyle}>
                  <span style={iconStyle}><IcoPhone /></span>
                  <input style={inputStyle} type="tel" value={form.mobileno} onChange={(e) => setForm(p => ({ ...p, mobileno: e.target.value.replace(/\D/g,'').slice(0,10) }))} placeholder="10-digit mobile number" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div className="reg-field-wrap" style={wrapStyle}>
                  <span style={iconStyle}><IcoLock /></span>
                  <input style={inputStyle} type="password" value={form.password} onChange={set('password')} placeholder="Create a password" autoComplete="new-password" />
                </div>
              </div>

              {error && (
                <div style={{ padding:'0.85rem 1rem', background:'#fff8f8', border:`1px solid ${C.danger}`, borderRadius:6, fontSize:'0.82rem', color:C.danger, fontWeight:500 }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="reg-submit-btn"
                style={{ marginTop:'0.25rem', padding:'0.9rem', background:C.navy, color:C.white, border:'none', borderRadius:6, fontSize:'0.95rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', cursor:'pointer', boxShadow:shadow.md, transition:'all 0.25s', opacity:loading?0.7:1 }}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:C.g600 }}>
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/member-login')} style={{ background:'none', border:'none', color:C.navy, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
