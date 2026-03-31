import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { URL } from '../environment';

/* Design Tokens */
const C = {
  navy:'#0d2b55', navyDark:'#071a36', navyMid:'#163d6e',
  gold:'#b8922a', goldLight:'#d4a843',
  teal:'#1a6b6b', tealLight:'#e6f4f4',
  white:'#ffffff',
  g50:'#f8f9fb', g100:'#eef1f5', g200:'#dde2ea',
  g300:'#c4cdd8', g400:'#8d9aaa', g600:'#4a5568', g800:'#1e2a3a',
  danger:'#c0392b', success:'#1a6b3c',
};

const shadow = {
  sm:'0 1px 3px rgba(13,43,85,0.08)',
  md:'0 4px 16px rgba(13,43,85,0.10)',
  lg:'0 12px 40px rgba(13,43,85,0.13)',
};

const font = { serif:"'EB Garamond',Georgia,serif", sans:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" };

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#eef1f5;min-height:100vh;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}
@keyframes pulseGlow{0%{box-shadow:0 0 0 0 rgba(184,146,42,0.24);}100%{box-shadow:0 0 0 16px rgba(184,146,42,0);}}
input::placeholder{color:#c4cdd8;}
input:focus,select:focus{outline:none;}
a{text-decoration:none;}
.member-main{position:relative;}
.member-main::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 20%, rgba(15,98,200,0.08), transparent 34%);pointer-events:none;}
.brand-badge{transition:transform .28s ease, box-shadow .28s ease, background .28s ease;}
.brand-badge:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 12px 26px rgba(13,43,85,0.24);background:rgba(255,255,255,0.14)!important;}
.brand-badge strong{color:#f0d57d;}
.member-form-panel{background:linear-gradient(160deg,#ffffff 0%,#fbfcfe 100%);border:1px solid #e3e8f0;border-radius:14px;padding:2rem 1.75rem;box-shadow:0 18px 42px rgba(13,43,85,.12);transition:transform .3s ease, box-shadow .3s ease;animation:fadeUp .5s ease;}
.member-form-panel:hover{transform:translateY(-3px);box-shadow:0 24px 54px rgba(13,43,85,.18);}
.ml-field-wrap{transition:border-color .24s ease, box-shadow .24s ease, transform .2s ease;}
.ml-field-wrap:hover{border-color:#cfd9e8!important;transform:translateY(-1px);}
.ml-field-wrap:focus-within{border-color:#b8922a!important;box-shadow:0 0 0 3px rgba(184,146,42,.16)!important;background:#fff!important;}
.ml-submit-btn{position:relative;overflow:hidden;}
.ml-submit-btn::after{content:'';position:absolute;top:0;left:-130%;width:120%;height:100%;background:linear-gradient(115deg, transparent 0%, rgba(255,255,255,.26) 45%, transparent 100%);transition:left .55s ease;}
.ml-submit-btn:hover:not(:disabled){transform:translateY(-2px)!important;box-shadow:0 16px 28px rgba(13,43,85,.25)!important;background:#163d6e!important;}
.ml-submit-btn:hover:not(:disabled)::after{left:120%;}
.ml-link{position:relative;transition:color .2s ease, border-color .2s ease, transform .2s ease;}
.ml-link:hover{color:#163d6e!important;border-bottom-color:#b8922a!important;transform:translateY(-1px);}
.ml-signup-btn{transition:color .2s ease, transform .2s ease;}
.ml-signup-btn:hover{color:#163d6e!important;transform:translateY(-1px);}
.ml-signup-btn:focus-visible,.ml-link:focus-visible,.ml-submit-btn:focus-visible{outline:2px solid #b8922a;outline-offset:2px;border-radius:6px;}
@media(max-width:980px){
  .member-main{flex-direction:column;}
  .member-form-panel{padding:1.35rem 1rem;}
}
@media(max-width:640px){
  .member-brand-pane{padding:1.25rem 1rem!important;}
  .member-form-pane{padding:1rem!important;}
  .member-form-panel{border-radius:10px;padding:1rem!important;}
  .member-form-panel h2{font-size:1.45rem!important;}
  .member-footer-links{flex-direction:column;align-items:flex-start;}
}
`;

/* Icons */
const IcoHouse = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoMail  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoLock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function MemberLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [token, setToken]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [loginType, setLoginType] = useState('customer'); // 'customer' | 'admin' | 'compliance'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile) { setError('Mobile number is required.'); return; }
    if (!password) { setError('Password is required.'); return; }
    setLoading(true);

    // ── Admin — fixed credentials, real API token ──
    if (loginType === 'admin') {
      const ADMIN_MOBILE = '9999999999';
      const ADMIN_PASS   = 'Admin@KYC2025';
      if (mobile.trim() !== ADMIN_MOBILE || password.trim() !== ADMIN_PASS) {
        setError('Invalid admin credentials.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${URL}api/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ mobileno: ADMIN_MOBILE, password: ADMIN_PASS }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) {
          setError('Admin account not found. Please register it in the backend first.');
          setLoading(false);
          return;
        }
        login({ name: 'Administrator', mobileno: ADMIN_MOBILE, role: 'ADMIN' }, data.token);
        localStorage.setItem('authToken', data.token);
        navigate('/admin-dashboard');
        setLoading(false);
        return;
      } catch {
        setError('Unable to connect. Please try again.');
        setLoading(false);
        return;
      }
    }

    // ── Compliance Officer — fixed credentials, real API token ──
    if (loginType === 'compliance') {
      const COMPLIANCE_MOBILE = '8888888888';
      const COMPLIANCE_PASS   = 'Compliance@KYC2025';
      if (mobile.trim() !== COMPLIANCE_MOBILE || password.trim() !== COMPLIANCE_PASS) {
        setError('Invalid compliance officer credentials.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${URL}api/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ mobileno: COMPLIANCE_MOBILE, password: COMPLIANCE_PASS }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) {
          setError('Compliance account not found. Please register it in the backend first.');
          setLoading(false);
          return;
        }
        login({ name: 'Compliance Officer', mobileno: COMPLIANCE_MOBILE, role: 'COMPLIANCE_OFFICER' }, data.token);
        localStorage.setItem('authToken', data.token);
        navigate('/compliance-dashboard');
        setLoading(false);
        return;
      } catch {
        setError('Unable to connect. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${URL}api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mobileno: mobile, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        setError(data.message || `Invalid credentials (${res.status}). Please try again.`);
        return;
      }
      if (!data.token) { setError('Login succeeded but no token returned.'); return; }
      login({ name: mobile, mobileno: mobile, role: 'USER' }, data.token);
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setShowModal(true);
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── LOGIN SUCCESS MODAL ── */}
      {showModal && (
        <div onClick={() => { setShowModal(false); navigate('/dashboard'); }}
          style={{ position:'fixed', inset:0, background:'rgba(7,26,54,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:C.white, borderRadius:16, boxShadow:'0 24px 64px rgba(13,43,85,0.28)', maxWidth:500, width:'100%', overflow:'hidden' }}>

            {/* Header */}
            <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`, padding:'1.25rem 1.75rem', borderBottom:`3px solid ${C.gold}`, display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:font.serif, fontSize:'1.2rem', fontWeight:700, color:C.white }}>Login Successful</div>
                <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', marginTop:'0.1rem' }}>Welcome back! Your session is active.</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding:'1.5rem 1.75rem' }}>
              <p style={{ fontSize:'0.85rem', color:C.g600, marginBottom:'1.5rem', lineHeight:1.6 }}>
                You have successfully signed in. Welcome back!
              </p>
              <button type="button" onClick={() => { setShowModal(false); navigate('/dashboard'); }}
                style={{ width:'100%', padding:'0.85rem 1rem', background:C.navy, color:C.white, border:'none', borderRadius:8, fontSize:'0.9rem', fontWeight:700, cursor:'pointer', letterSpacing:'0.3px' }}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="member-main" style={{ fontFamily:font.sans, color:C.g800, WebkitFontSmoothing:'antialiased', minHeight:'100vh', display:'flex' }}>
        {/* Left Section - Branding */}
        <div className="member-brand-pane" style={{ flex:1, background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navy} 55%,${C.navyMid} 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
          {/* Decorative Elements */}
          <div style={{ position:'absolute', width:300, height:300, background:C.gold, opacity:0.05, borderRadius:'50%', top:-100, left:-100 }}/>
          <div style={{ position:'absolute', width:200, height:200, background:C.teal, opacity:0.05, borderRadius:'50%', bottom:-50, right:-50 }}/>

          <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:400 }}>
            <div style={{ width:80, height:80, background:`linear-gradient(145deg,${C.navy} 0%,${C.navyMid} 100%)`, borderRadius:'50%', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.white, margin:'0 auto 2rem' }}>
              <IcoHouse />
            </div>
            <h1 style={{ fontFamily:font.serif, fontSize:'3rem', fontWeight:700, color:C.white, marginBottom:'0.75rem', lineHeight:1.1, background:`linear-gradient(92deg, #ffffff 8%, ${C.goldLight} 56%, #f3cf73 100%)`, WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', textShadow:'0 8px 26px rgba(7,26,54,0.4)' }}>Project</h1>
            <p style={{ fontSize:'0.88rem', color:'#c4d6e8', lineHeight:1.6, marginBottom:'2rem', maxWidth:350, marginInline:'auto' }}>AI-Powered Identity Verification and KYC Automation Platform</p>
            
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[['₹12,400 Cr','Loans Disbursed'],['2.5L+','Members'],['37 Yrs','In Service']].map(([val,lbl])=>(
                <div className="brand-badge" key={lbl} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'0.85rem 1rem', fontSize:'0.82rem', color:'#ccdae8', fontWeight:500 }}>
                  <span style={{color:C.goldLight}}>•</span>
                  <span><strong>{val}</strong> {lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="member-form-pane" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:C.white }}>
          <div className="member-form-panel" style={{ width:'100%', maxWidth:420 }}>
            <div style={{ marginBottom:'2rem' }}>
              {/* Role toggle */}
              <div style={{ display:'flex', background:C.g100, borderRadius:8, padding:'4px', marginBottom:'1.5rem', border:`1px solid ${C.g200}` }}>
                {[['customer','Customer'],['compliance','Compliance'],['admin','Admin']].map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setLoginType(val); setMobile(''); setPassword(''); setError(''); }}
                    style={{ flex:1, padding:'0.55rem', borderRadius:6, border:'none', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                      background: loginType === val ? C.navy : 'transparent',
                      color: loginType === val ? C.white : C.g400,
                      boxShadow: loginType === val ? '0 2px 8px rgba(13,43,85,0.2)' : 'none',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <h2 style={{ fontFamily:font.serif, fontSize:'1.8rem', fontWeight:700, color:C.navy, marginBottom:'0.5rem' }}>
                {loginType === 'admin' ? 'Admin Login' : loginType === 'compliance' ? 'Compliance Officer Login' : 'Login'}
              </h2>
              <p style={{ fontSize:'0.9rem', color:C.g400 }}>
                {loginType === 'admin'
                  ? 'Sign in with admin credentials to access the control panel'
                  : loginType === 'compliance'
                  ? 'Sign in to access the compliance monitoring dashboard'
                  : 'Sign in to your account to manage your KYC updates'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {/* Mobile Field */}
              <div>
                <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.5rem' }}>
                  Registered Mobile No
                </label>
                <div className="ml-field-wrap" style={{ position:'relative', display:'flex', alignItems:'center', border:`1.5px solid ${C.g200}`, borderRadius:6, overflow:'hidden', background:C.g50 }}>
                  <span style={{ padding:'0 1rem', color:C.g400 }}><IcoPhone/></span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter registered mobile number"
                    style={{ flex:1, padding:'0.8rem 0', border:'none', background:'transparent', fontSize:'0.92rem', outline:'none', fontFamily:font.sans }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'0.5rem' }}>
                  Password
                </label>
                <div className="ml-field-wrap" style={{ position:'relative', display:'flex', alignItems:'center', border:`1.5px solid ${C.g200}`, borderRadius:6, overflow:'hidden', background:C.g50 }}>
                  <span style={{ padding:'0 1rem', color:C.g400 }}><IcoLock/></span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ flex:1, padding:'0.8rem 0', border:'none', background:'transparent', fontSize:'0.92rem', outline:'none', fontFamily:font.sans }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{ padding:'0.85rem 1rem', background:'#fff8f8', border:`1px solid ${C.danger}`, borderRadius:6, fontSize:'0.82rem', color:C.danger, fontWeight:500, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="ml-submit-btn"
                style={{ padding:'0.9rem', background:C.navy, color:C.white, border:'none', borderRadius:6, fontSize:'0.95rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', cursor:'pointer', boxShadow:shadow.md, transition:'all 0.25s', opacity:loading?0.7:1, transform:loading?'scale(0.98)':'scale(1)' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'1rem 0' }}>
                <div style={{ flex:1, height:1, background:C.g200 }}/>
                <span style={{ fontSize:'0.78rem', color:C.g400, textTransform:'uppercase' }}>Or</span>
                <div style={{ flex:1, height:1, background:C.g200 }}/>
              </div>
            </form>

            {/* Footer Links */}
            <div className="member-footer-links" style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:C.navy, marginTop:'1.5rem', gap:'1rem' }}>
              <a className="ml-link" href="/" style={{ color:C.navy, textDecoration:'none', fontWeight:500, borderBottom:`2px solid transparent`, transition:'all 0.2s' }}>Forgot Password?</a>
              <a className="ml-link" href="/" style={{ color:C.navy, textDecoration:'none', fontWeight:500, borderBottom:`2px solid transparent`, transition:'all 0.2s' }}>Need Help?</a>
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginTop:'1rem', fontSize:'0.85rem', color:C.g600 }}>
              <span>Don&apos;t have an account?</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="ml-signup-btn"
                style={{ marginLeft:'8px', background:'transparent', border:'none', color:C.navy, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
