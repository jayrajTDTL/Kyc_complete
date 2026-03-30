import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { useAuth } from '../context/AuthContext';
import { URL } from '../environment';

/* Only keyframes + font import — cannot be done inline */
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#eef1f5;min-height:100vh;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{100%{transform:rotate(360deg);}}
@keyframes shine{0%{left:-100%;}20%{left:200%;}100%{left:200%;}}
@keyframes modalIn{from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
@keyframes checkDraw{from{stroke-dashoffset:80;}to{stroke-dashoffset:0;}}
@keyframes circlePop{from{transform:scale(0.6);opacity:0;}to{transform:scale(1);opacity:1;}}
input::placeholder{color:#c4cdd8;}
input:focus,select:focus{outline:none;}
a{text-decoration:none;}
@media(max-width:768px){
  .resp-nav{display:none!important;}
  .resp-hamburger{display:flex!important;}
  .resp-hero-right{display:none!important;}
  .resp-grid{grid-template-columns:1fr!important;}
  .resp-actions{flex-direction:column-reverse!important;}
  .resp-sidebar{grid-template-columns:1fr!important;}
  .resp-footer-main{grid-template-columns:1fr!important;gap:1.5rem!important;}
  .resp-hero-title{font-size:1.75rem!important;}
  .resp-main{padding:0 1rem!important;margin:1.5rem auto!important;}
  .resp-form-body{padding:1.5rem!important;}
  .resp-card-header{padding:1.25rem 1.5rem!important;flex-direction:column!important;align-items:flex-start!important;gap:0.75rem!important;}
  .resp-doc-toggle{flex-direction:column!important;}
  .resp-utility{display:none!important;}
}
@media(max-width:1024px){
  .resp-main-grid{grid-template-columns:1fr!important;}
  .resp-sidebar-grid{display:grid!important;grid-template-columns:1fr 1fr!important;}
  .resp-footer-main{grid-template-columns:1fr 1fr!important;}
}
`;

/* ── DESIGN TOKENS ── */
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

/* ── ICONS ── */
const IcoHome  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoShield= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
const IcoLock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoUser  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoMap   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoBank  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="20" width="20" height="2"/><rect x="4" y="8" width="2" height="10"/><rect x="10" y="8" width="2" height="10"/><rect x="18" y="8" width="2" height="10"/><polygon points="12 2 2 6 22 6 12 2"/></svg>;
const IcoFile  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoLoader= () => <svg style={{animation:'spin 1s linear infinite'}} width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IcoPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoMail  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoInfo  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoStar  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoHouse = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

/* ── FIELD COMPONENT ── */
const inputBase = { width:'100%', padding:'0.75rem 1rem', fontSize:'0.92rem', fontFamily:font.sans, color:C.g800, background:C.g50, borderWidth:'1.5px', borderStyle:'solid', borderColor:C.g200, borderRadius:'6px', outline:'none', transition:'all 0.25s', boxShadow:'0 1px 3px rgba(13,43,85,0.08)' };

const Field = ({ label, name, value, onChange, type='text', placeholder, required=true, helperText, fullWidth, error }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', ...(fullWidth ? { gridColumn:'1/-1' } : {}) }}>
    <label style={{ fontSize:'0.78rem', fontWeight:600, color: C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>
      {label}{required && <span style={{ color:C.danger, marginLeft:'2px' }}> *</span>}
    </label>
    <input type={type} name={name} value={value||''} onChange={onChange} placeholder={placeholder} autoComplete="off" required={required}
      style={{ ...inputBase, ...(error ? { borderColor:C.danger, background:'#fff8f8' } : {}) }} />
    {error && <div style={{ fontSize:'0.72rem', color:C.danger, fontWeight:500, marginTop:'0.2rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>{error}</div>}
    {!error && helperText && (
      <div style={{ fontSize:'0.72rem', color:C.teal, display:'flex', alignItems:'center', gap:'0.3rem', background:C.tealLight, padding:'0.3rem 0.6rem', borderRadius:'4px', borderLeft:`2px solid ${C.teal}`, marginTop:'0.1rem' }}>
        <IcoLock /> {helperText}
      </div>
    )}
  </div>
);

/* ── INITIAL STATE ── */
const initialState = {
  fullName:'', dob:'', gender:'', mobile:'', email:'', customerId:'', password:'',
  pan:'', aadhaar:'',
  currentAddress:'', city:'', state:'', pincode:'', country:'India',
  bankName:'', accountNumber:'', ifsc:'', branchName:'', monthlyIncome:'', occupation:'',
  reKycType:'', customerCategory:'', pep:'', sourceOfFunds:'',
  consentPan:false, consentExtract:false, acceptTerms:false
};

export default function ReKycRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialState);
  const [mounted, setMounted] = useState(false);
  const [secondaryType, setSecondaryType] = useState('aadhaar');
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regToken, setRegToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [docs, setDocs] = useState({
    pan:    { status:'idle', file:null, data:null },
    aadhaar:{ status:'idle', file:null, data:null },
    bank:   { status:'idle', file:null, data:null }
  });

  useEffect(() => setMounted(true), []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => { const n={...prev}; delete n[name]; return n; });
  };

  const handleSecondaryTypeChange = (t) => {
    setSecondaryType(t);
    const other = t === 'aadhaar' ? 'bank' : 'aadhaar';
    if (docs[other].status !== 'idle') removeDoc(other);
  };

  const validate = () => {
    const e = {};
    const MOB_RE=/^[6-9]\d{9}$/;
    if (!form.fullName.trim()) e.fullName='Full name is required.';
    else if (form.fullName.trim().length<3) e.fullName='Enter a valid full name.';
    if (!form.mobile.trim()) e.mobile='Mobile number is required.';
    else if (!MOB_RE.test(form.mobile.trim())) e.mobile='Enter a valid 10-digit mobile number.';
    if (!form.password) e.password='Password is required.';
    return e;
  };

  const processOCR = async (docType, file) => {
    if (docType==='pan') {
      try {
        const result=await Tesseract.recognize(file,'eng');
        const text=result.data.text;
        const panMatch=text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        const dobMatch=text.match(/\d{2}[/-]\d{2}[/-]\d{4}/);
        const lines=text.split('\n').map(l=>l.trim().toUpperCase()).filter(l=>l.length>2&&!l.includes('INCOME')&&!l.includes('TAX')&&!l.includes('GOVT')&&!l.includes('INDIA')&&!l.includes('DEPARTMENT'));
        let pan=panMatch?panMatch[0]:'NOT FOUND', dob=dobMatch?dobMatch[0]:'NOT FOUND', fullName='Not Found', fatherName='';
        if (dob!=='NOT FOUND') { const i=lines.findIndex(l=>l.includes(dob)); if(i>=2){fatherName=lines[i-1].replace(/FATHER.*/,'').replace(/NAME.*/,'').trim();fullName=lines[i-2].replace(/NAME.*/,'').trim();} }
        if (fullName==='Not Found'&&lines.length>0) fullName=lines[0];
        return { fullName, pan, dob, fatherName };
      } catch { return { fullName:'Error', pan:'Error', dob:'Error', fatherName:'' }; }
    } else if (docType==='aadhaar') {
      return new Promise(r=>setTimeout(()=>r({ fullName:'Rohan Sharma', aadhaar:'1234 5678 9012', dob:'1998-08-12', gender:'Male', address:'Pune, Maharashtra, India', city:'Pune', state:'Maharashtra', pincode:'411001' }),2000));
    } else {
      return new Promise(r=>setTimeout(()=>r({ accountHolder:'Rohan Sharma', bankName:'HDFC Bank', accountNumber:'XXXX12345678', ifsc:'HDFC0001234', branchName:'Pune Main Branch' }),2000));
    }
  };

  const handleFileUpload = async (e, type) => {
    const file=e.target.files[0]; if(!file) return;
    setDocs(prev=>({...prev,[type]:{status:'extracting',file:file.name,data:null}}));
    const data=await processOCR(type,file);
    setDocs(prev=>({...prev,[type]:{status:'success',file:file.name,data}}));
    setForm(prev=>{ const u={...prev};
      if(type==='pan'){u.fullName=u.fullName||data.fullName;u.pan=data.pan;u.dob=u.dob||data.dob;}
      else if(type==='aadhaar'){u.fullName=u.fullName||data.fullName;u.aadhaar=data.aadhaar;u.dob=u.dob||data.dob;u.gender=data.gender;u.currentAddress=u.currentAddress||data.address;u.city=u.city||data.city;u.state=u.state||data.state;u.pincode=u.pincode||data.pincode;}
      else{u.bankName=data.bankName;u.accountNumber=data.accountNumber;u.ifsc=data.ifsc;u.branchName=data.branchName;}
      return u;
    });
  };

  const removeDoc = (type) => setDocs(prev=>({...prev,[type]:{status:'idle',file:null,data:null}}));

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form entries and uploaded documents?')) {
      setForm(initialState); setErrors({});
      setDocs({pan:{status:'idle',file:null,data:null},aadhaar:{status:'idle',file:null,data:null},bank:{status:'idle',file:null,data:null}});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});

    try {
      // Build JSON payload with exact field names the API expects
      const payload = {
        name:     form.fullName.trim(),
        password: form.password,
        mobileno: form.mobile.trim(),
      };
      console.log('Sending payload:', JSON.stringify(payload));

      const res = await fetch(`${URL}api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log('Register response:', res.status, data);

      if (!res.ok || data.error) {
        setErrors({ _api: data.message || data.error || `Request failed (${res.status}). Please try again.` });
        return;
      }

      if (!data.token) {
        setErrors({ _api: 'Registration succeeded but no token was returned.' });
        return;
      }

      // Store token in localStorage and open success modal
      login({ name: form.fullName, mobileno: form.mobile }, data.token);
      localStorage.setItem('authToken', data.token);
      setRegToken(data.token);
      setShowModal(true);

    } catch (err) {
      console.error('Register error:', err);
      setErrors({ _api: 'Unable to connect to the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(regToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!mounted) return null;

  const STATES=['Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];
  const refNumber=`NHFS-${new Date().getFullYear()}-${Math.random().toString(36).toUpperCase().slice(2,8)}`;

  /* ── shared select style ── */
  const selStyle = (err) => ({ ...inputBase, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238d9aaa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.85rem center', backgroundSize:'1rem', paddingRight:'2.5rem', cursor:'pointer', ...(err?{borderColor:C.danger,background:'#fff8f8'}:{}) });
  const errMsg = (msg) => msg ? <div style={{ fontSize:'0.72rem', color:C.danger, fontWeight:500, marginTop:'0.2rem' }}>{msg}</div> : null;
  const sectionIcon = (ico) => <div style={{ width:34, height:34, background:C.navy, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:C.goldLight, flexShrink:0 }}>{ico}</div>;
  const sectionTitle = (num, title, ico) => (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontFamily:font.serif, fontSize:'1.15rem', fontWeight:700, color:C.navy, paddingBottom:'0.85rem', marginBottom:'1.75rem', borderBottom:`2px solid ${C.g200}`, position:'relative' }}>
      <style>{`.st${num}::after{content:'';position:absolute;bottom:-2px;left:0;width:48px;height:2px;background:${C.gold};}`}</style>
      {sectionIcon(ico)}
      <div className={`st${num}`} style={{ position:'relative' }}>
        <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.gold, textTransform:'uppercase', letterSpacing:'1px', fontFamily:font.sans }}>Section 0{num}</div>
        {title}
      </div>
    </div>
  );

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── SUCCESS MODAL ── */}
      {showModal && (
        <div onClick={()=>{ setShowModal(false); navigate('/dashboard'); }} style={{ position:'fixed', inset:0, background:'rgba(7,26,54,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1rem', animation:'overlayIn 0.25s ease forwards' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, boxShadow:'0 24px 64px rgba(13,43,85,0.28)', maxWidth:520, width:'100%', overflow:'hidden', animation:'modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}>

            {/* Modal header */}
            <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`, padding:'1.5rem 2rem', borderBottom:`3px solid ${C.gold}`, display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:font.serif, fontSize:'1.25rem', fontWeight:700, color:C.white }}>Registration Successful</div>
                <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.65)', marginTop:'0.15rem' }}>Your account has been created</div>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding:'1.75rem 2rem' }}>
              <p style={{ fontSize:'0.88rem', color:C.g600, lineHeight:1.6, marginBottom:'1.5rem' }}>
                Welcome, <strong style={{ color:C.navy }}>{form.fullName}</strong>. Your registration is complete. You can now access the platform.
              </p>
              <button
                type="button"
                onClick={()=>{ setShowModal(false); navigate('/dashboard'); }}
                style={{ width:'100%', padding:'0.85rem 1rem', background:C.navy, color:C.white, border:'none', borderRadius:8, fontSize:'0.9rem', fontWeight:700, cursor:'pointer', letterSpacing:'0.4px' }}
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE ── */}
      <div style={{ fontFamily:font.sans, color:C.g800, WebkitFontSmoothing:'antialiased', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <header style={{ background:C.white, borderBottom:`3px solid ${C.gold}`, boxShadow:shadow.md, position:'sticky', top:0, zIndex:100 }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:72, gap:'2rem' }}>
            <a href="/" style={{ display:'flex', alignItems:'center', gap:'1rem', textDecoration:'none', flexShrink:0 }}>
              <div style={{ width:48, height:48, background:`linear-gradient(145deg,${C.navy} 0%,${C.navyMid} 100%)`, borderRadius:'50%', border:`2px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.white }}>
                <IcoHouse />
              </div>
              <div>
                <div style={{ fontFamily:font.serif, fontSize:'1.9rem', fontWeight:700, color:C.navy, lineHeight:1.05, background:`linear-gradient(95deg, ${C.navy} 10%, ${C.navyMid} 52%, ${C.gold} 100%)`, WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>Project</div>
                <div style={{ fontSize:'0.62rem', color:C.g600, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.68px', whiteSpace:'nowrap' }}>AI-Powered Identity Verification and KYC Automation Platform</div>
              </div>
            </a>
            <nav className="resp-nav" style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
              {['Home','Loan Products','Interest Rates','About Us'].map(l=>(
                <a key={l} href="/" style={{ fontSize:'0.85rem', fontWeight:500, color:C.g600, textDecoration:'none', padding:'0.5rem 0.85rem', borderRadius:6, whiteSpace:'nowrap' }}>{l}</a>
              ))}
              <a href="/" style={{ fontSize:'0.85rem', fontWeight:600, color:C.navy, textDecoration:'none', padding:'0.5rem 0.85rem', borderRadius:6, whiteSpace:'nowrap' }}>Member Services</a>
              <button onClick={() => navigate('/member-login')} style={{ marginLeft:'0.5rem', padding:'0.5rem 1.25rem', background:C.navy, color:C.white, border:'none', borderRadius:6, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>Login</button>
            </nav>
            <button className="resp-hamburger" style={{ display:'none', flexDirection:'column', gap:5, background:'none', border:'none', cursor:'pointer', padding:4 }} aria-label="Menu">
              {[0,1,2].map(i=><span key={i} style={{ display:'block', width:22, height:2, background:C.navy, borderRadius:2 }}/>)}
            </button>
          </div>
        </header>

        {/* Hero */}
        <section style={{ background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navy} 55%,${C.navyMid} 100%)`, color:C.white, padding:'3.5rem 2rem 3rem', position:'relative', overflow:'hidden' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'2rem' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(184,146,42,0.18)', border:'1px solid rgba(184,146,42,0.4)', color:C.goldLight, fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', padding:'0.35rem 0.85rem', borderRadius:20, marginBottom:'1.25rem' }}>
                <IcoStar /> Trusted by 2.5 Lakh+ Members
              </div>
              <h1 style={{ fontFamily:font.serif, fontSize:'2.4rem', fontWeight:700, lineHeight:1.2, marginBottom:'0.85rem' }}>
                Re-KYC  <span style={{ color:C.goldLight }}>Registration Portal</span>
              </h1>
              <p style={{ fontSize:'0.95rem', color:'#b0c4d8', lineHeight:1.65, maxWidth:520, marginBottom:'2rem' }}>
                Complete your periodic Know Your Customer update in compliance with RBI and NHB directives. Your information is encrypted and processed under strict data protection guidelines.
              </p>
              <div style={{ display:'flex', gap:'2.5rem', flexWrap:'wrap' }}>
                {[['₹12,400 Cr','Loans Disbursed'],['2.5L+','Active Members'],['37 Yrs','Of Service']].map(([n,l])=>(
                  <div key={l}>
                    <div style={{ fontFamily:font.serif, fontSize:'1.8rem', fontWeight:700, color:C.goldLight, lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:'0.72rem', color:'#8aaac4', textTransform:'uppercase', letterSpacing:'0.6px', marginTop:'0.2rem' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="resp-hero-right" style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:'0.75rem', minWidth:220 }}>
              {['RBI Regulated Institution','256-bit SSL Encrypted','AI-Powered Document Verification','ISO 27001 Certified'].map(t=>(
                <div key={t} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'0.75rem 1rem', fontSize:'0.82rem', color:'#ccdae8', fontWeight:500 }}>
                  <IcoShield /> {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.g200}`, padding:'0.65rem 2rem' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.78rem', color:C.g400 }}>
            <IcoHome />&nbsp;<a href="/" style={{ color:C.navy, textDecoration:'none', fontWeight:500 }}>Home</a>
            <span style={{ color:C.g300 }}>›</span>
            <a href="/" style={{ color:C.navy, textDecoration:'none', fontWeight:500 }}>Member Services</a>
            <span style={{ color:C.g300 }}>›</span>
            <span style={{ color:C.g600, fontWeight:500 }}>Re-KYC Registration</span>
          </div>
        </div>

        {/* Main */}
        <div className="resp-main resp-main-grid" style={{ maxWidth:1200, margin:'2.5rem auto', padding:'0 2rem', display:'grid', gridTemplateColumns:'1fr 300px', gap:'2rem', alignItems:'start', flex:1 }}>

          {/* Form Card */}
          <div style={{ background:C.white, borderRadius:10, boxShadow:shadow.lg, border:`1px solid ${C.g200}`, overflow:'hidden', animation:'fadeUp 0.5s ease-out forwards' }}>
            <div className="resp-card-header" style={{ background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`, padding:'1.75rem 2.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`3px solid ${C.gold}` }}>
              <div>
                <div style={{ fontFamily:font.serif, fontSize:'1.45rem', fontWeight:700, color:C.white }}>Re-KYC Registration Form</div>
                <div style={{ fontSize:'0.8rem', color:'#9ab5cc', marginTop:'0.25rem' }}>Periodic KYC Update — Mandatory under RBI Master Direction (KYC) 2016</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'rgba(184,146,42,0.15)', border:'1px solid rgba(184,146,42,0.35)', color:C.goldLight, fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', padding:'0.4rem 0.85rem', borderRadius:20, flexShrink:0 }}>
                <IcoLock /> Secure Form
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'2.5rem' }} className="resp-form-body">

              {/* Section 1 — Personal */}
              <div style={{ marginBottom:'2.75rem', animation:'fadeUp 0.5s ease-out 0.05s both' }}>
                {sectionTitle(1,'Personal Information',<IcoUser/>)}
                <div className="resp-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem 2rem' }}>
                  <Field label="Full Name (as per PAN)" name="fullName" value={form.fullName} onChange={handleChange} placeholder="As appearing on official documents" fullWidth error={errors.fullName}/>
                  <Field label="Password" name="password" value={form.password} onChange={handleChange} type="password" placeholder="Enter your password" required={true} error={errors.password}/>
                  <Field label="PAN Number" name="pan" value={form.pan} onChange={handleChange} placeholder="Auto-extracted from PAN card"  required={false} error={errors.pan}/>
                  {secondaryType==='aadhaar'
                    ? <Field label="Aadhaar UID" name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="Auto-extracted from Aadhaar" required={false} error={errors.aadhaar}/>
                    : <div/>}
                  <Field label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} type="date" required={false} error={errors.dob}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Gender</label>
                    <select name="gender" value={form.gender} style={selStyle(errors.gender)} onChange={(e)=>{handleChange(e);if(errors.gender)setErrors(p=>{const n={...p};delete n.gender;return n;});}}>
                      <option value="" disabled>Select Gender</option>
                      <option>Male</option><option>Female</option><option>Transgender</option>
                    </select>
                    {errMsg(errors.gender)}
                  </div>
                  <Field label="Registered Mobile Number" name="mobile" value={form.mobile} onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value }))} type="tel" placeholder="10-digit mobile number" error={errors.mobile}/>
                  <Field label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" placeholder="correspondence@domain.com" required={false} error={errors.email}/>
                  <Field label="Customer ID / Reference" name="customerId" value={form.customerId} onChange={handleChange} placeholder="Optional — Member Reference ID" required={false}/>
                </div>
              </div>

              {/* Section 2 — Address */}
              <div style={{ marginBottom:'2.75rem', animation:'fadeUp 0.5s ease-out 0.10s both' }}>
                {sectionTitle(2,'Residential Address',<IcoMap/>)}
                <div className="resp-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem 2rem' }}>
                  <Field label="Residential Address" name="currentAddress" value={form.currentAddress} onChange={handleChange} placeholder="House No., Street, Locality" fullWidth required={false} error={errors.currentAddress}/>
                  <Field label="City / District" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" required={false} error={errors.city}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>State / Union Territory</label>
                    <select name="state" value={form.state} style={selStyle(errors.state)} onChange={(e)=>{handleChange(e);if(errors.state)setErrors(p=>{const n={...p};delete n.state;return n;});}}>
                      <option value="" disabled>Select State / UT</option>
                      {STATES.map(s=><option key={s}>{s}</option>)}
                    </select>
                    {errMsg(errors.state)}
                  </div>
                  <Field label="PIN Code" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit postal code" required={false} error={errors.pincode}/>
                  <Field label="Country" name="country" value={form.country} onChange={handleChange} required={false}/>
                </div>
              </div>

              {/* Section 3 — Financial */}
              <div style={{ marginBottom:'2.75rem', animation:'fadeUp 0.5s ease-out 0.15s both' }}>
                {sectionTitle(3,'Financial Information',<IcoBank/>)}
                <div className="resp-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem 2rem' }}>
                  <Field label="Primary Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Name of banking institution" fullWidth required={false} error={errors.bankName}/>
                  <Field label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} type="text" placeholder="Enter account number" helperText="Masked for security" required={false} error={errors.accountNumber}/>
                  <Field label="IFSC Code" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. SBIN0001234" required={false} error={errors.ifsc}/>
                  <Field label="Branch Name" name="branchName" value={form.branchName} onChange={handleChange} placeholder="Branch name (optional)" required={false}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Declared Monthly Income</label>
                    <select name="monthlyIncome" value={form.monthlyIncome} style={selStyle(errors.monthlyIncome)} onChange={(e)=>{handleChange(e);if(errors.monthlyIncome)setErrors(p=>{const n={...p};delete n.monthlyIncome;return n;});}}>
                      <option value="" disabled>Select Income Bracket</option>
                      <option value="Below 50K">Below ₹50,000</option>
                      <option value="50K-1L">₹50,000 – ₹1,00,000</option>
                      <option value="1L-5L">₹1,00,000 – ₹5,00,000</option>
                      <option value="Above 5L">Above ₹5,00,000</option>
                    </select>
                    {errMsg(errors.monthlyIncome)}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Occupation Type</label>
                    <select name="occupation" value={form.occupation} style={selStyle(errors.occupation)} onChange={(e)=>{handleChange(e);if(errors.occupation)setErrors(p=>{const n={...p};delete n.occupation;return n;});}}>
                      <option value="" disabled>Select Occupation</option>
                      <option value="Salaried">Salaried (Private / Public Sector)</option>
                      <option value="Self-Employed">Self-Employed / Professional</option>
                      <option value="Business">Business Owner</option>
                      <option value="Retired">Retired / Pensioner</option>
                    </select>
                    {errMsg(errors.occupation)}
                  </div>
                </div>
              </div>

              {/* Section 4 — Documents */}
              <div style={{ marginBottom:'2.75rem', animation:'fadeUp 0.5s ease-out 0.20s both' }}>
                {sectionTitle(4,'Document Upload & Verification',<IcoFile/>)}
                <p style={{ fontSize:'0.85rem', color:C.g400, marginBottom:'1.75rem', lineHeight:1.6 }}>
                  Upload the required documents. Our AI engine will automatically extract and cross-verify your information.
                </p>
                <div className="resp-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem 2rem' }}>

                  {/* PAN upload */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', gridColumn:'1/-1' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      PAN Card
                    </label>
                    <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${docs.pan.status==='success'?C.success:docs.pan.status==='extracting'?C.gold:errors.docPan?C.danger:C.g200}`, borderRadius:6, overflow:'hidden', background:docs.pan.status==='success'?'#f0faf4':docs.pan.status==='extracting'?'#fffdf5':C.g50 }}>
                      <label htmlFor="file-pan" style={{ padding:'0.72rem 1rem', background:C.navy, color:C.white, fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap', cursor:'pointer', border:'none', display:'flex', alignItems:'center', gap:'0.4rem', flexShrink:0 }}>
                        {docs.pan.status==='extracting'?<><IcoLoader/> Extracting…</>:<><IcoFile/> Choose File</>}
                      </label>
                      <input id="file-pan" type="file" style={{ display:'none' }} accept=".jpg,.jpeg,.png,.pdf" onChange={e=>handleFileUpload(e,'pan')} disabled={docs.pan.status==='extracting'}/>
                      <span style={{ flex:1, padding:'0 0.85rem', fontSize:'0.85rem', color:docs.pan.file?C.g800:C.g400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:docs.pan.file?500:'normal' }}>
                        {docs.pan.file||'No file chosen — JPG, PNG or PDF, max 5 MB'}
                      </span>
                      {docs.pan.status==='success'&&<>
                        <span style={{ padding:'0 0.75rem', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem', color:C.success, flexShrink:0 }}><IcoCheck/> Verified</span>
                        <button type="button" onClick={()=>removeDoc('pan')} style={{ background:'none', border:'none', color:C.danger, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', padding:'0 0.75rem', flexShrink:0 }}>Remove</button>
                      </>}
                    </div>
                    {docs.pan.status==='success'&&(
                      <div style={{ background:C.white, border:'1px solid #c8e6c9', borderRadius:6, padding:'0.85rem 1rem', marginTop:'0.5rem', fontSize:'0.82rem' }}>
                        <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Holder Name:</strong> {docs.pan.data.fullName}</p>
                        <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>PAN Number:</strong> {docs.pan.data.pan}</p>
                        <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Date of Birth:</strong> {docs.pan.data.dob}</p>
                        {docs.pan.data.fatherName&&<p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Father's Name:</strong> {docs.pan.data.fatherName}</p>}
                        <div style={{ fontSize:'0.72rem', color:C.navy, fontWeight:600, marginTop:'0.4rem', display:'flex', alignItems:'center', gap:'0.3rem' }}><IcoCheck/> Data cross-verified with form entries</div>
                      </div>
                    )}
                    {errMsg(errors.docPan)}
                  </div>

                  {/* Secondary toggle */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', gridColumn:'1/-1', marginBottom:'-0.75rem' }}>
                    <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Secondary Identification Document</label>
                    <div className="resp-doc-toggle" style={{ display:'flex', gap:'0.75rem', background:C.white, padding:'0.4rem', borderRadius:6, border:`1px solid ${C.g200}` }}>
                      {[['aadhaar','Aadhaar Card (OVD)'],['bank','Bank Statement']].map(([val,lbl])=>(
                        <label key={val} style={{ flex:1, textAlign:'center', padding:'0.6rem 1rem', borderRadius:4, border:`1px solid ${secondaryType===val?C.navy:'transparent'}`, cursor:'pointer', fontWeight:600, fontSize:'0.82rem', color:secondaryType===val?C.white:C.g400, background:secondaryType===val?C.navy:'transparent', transition:'all 0.2s' }}>
                          <input type="radio" name="secDoc" value={val} checked={secondaryType===val} onChange={()=>handleSecondaryTypeChange(val)} style={{ display:'none' }}/>{lbl}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Aadhaar upload */}
                  {secondaryType==='aadhaar'&&(
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', gridColumn:'1/-1' }}>
                      <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Aadhaar Card</label>
                      <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${docs.aadhaar.status==='success'?C.success:docs.aadhaar.status==='extracting'?C.gold:errors.docAadhaar?C.danger:C.g200}`, borderRadius:6, overflow:'hidden', background:docs.aadhaar.status==='success'?'#f0faf4':docs.aadhaar.status==='extracting'?'#fffdf5':C.g50 }}>
                        <label htmlFor="file-aadhaar" style={{ padding:'0.72rem 1rem', background:C.navy, color:C.white, fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap', cursor:'pointer', border:'none', display:'flex', alignItems:'center', gap:'0.4rem', flexShrink:0 }}>
                          {docs.aadhaar.status==='extracting'?<><IcoLoader/> Extracting…</>:<><IcoFile/> Choose File</>}
                        </label>
                        <input id="file-aadhaar" type="file" style={{ display:'none' }} accept=".jpg,.jpeg,.png,.pdf" onChange={e=>handleFileUpload(e,'aadhaar')} disabled={docs.aadhaar.status==='extracting'}/>
                        <span style={{ flex:1, padding:'0 0.85rem', fontSize:'0.85rem', color:docs.aadhaar.file?C.g800:C.g400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {docs.aadhaar.file||'No file chosen — JPG, PNG or PDF, max 5 MB'}
                        </span>
                        {docs.aadhaar.status==='success'&&<>
                          <span style={{ padding:'0 0.75rem', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem', color:C.success, flexShrink:0 }}><IcoCheck/> Verified</span>
                          <button type="button" onClick={()=>removeDoc('aadhaar')} style={{ background:'none', border:'none', color:C.danger, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', padding:'0 0.75rem', flexShrink:0 }}>Remove</button>
                        </>}
                      </div>
                      {docs.aadhaar.status==='success'&&(
                        <div style={{ background:C.white, border:'1px solid #c8e6c9', borderRadius:6, padding:'0.85rem 1rem', marginTop:'0.5rem', fontSize:'0.82rem' }}>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Name:</strong> {docs.aadhaar.data.fullName}</p>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Aadhaar UID:</strong> {docs.aadhaar.data.aadhaar}</p>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Address:</strong> {docs.aadhaar.data.address}</p>
                          <div style={{ fontSize:'0.72rem', color:C.navy, fontWeight:600, marginTop:'0.4rem', display:'flex', alignItems:'center', gap:'0.3rem' }}><IcoCheck/> Data cross-verified with form entries</div>
                        </div>
                      )}
                      {errMsg(errors.docAadhaar)}
                    </div>
                  )}

                  {/* Bank upload */}
                  {secondaryType==='bank'&&(
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', gridColumn:'1/-1' }}>
                      <label style={{ fontSize:'0.78rem', fontWeight:600, color:C.g600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Bank Statement</label>
                      <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${docs.bank.status==='success'?C.success:docs.bank.status==='extracting'?C.gold:errors.docBank?C.danger:C.g200}`, borderRadius:6, overflow:'hidden', background:docs.bank.status==='success'?'#f0faf4':docs.bank.status==='extracting'?'#fffdf5':C.g50 }}>
                        <label htmlFor="file-bank" style={{ padding:'0.72rem 1rem', background:C.navy, color:C.white, fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap', cursor:'pointer', border:'none', display:'flex', alignItems:'center', gap:'0.4rem', flexShrink:0 }}>
                          {docs.bank.status==='extracting'?<><IcoLoader/> Extracting…</>:<><IcoFile/> Choose File</>}
                        </label>
                        <input id="file-bank" type="file" style={{ display:'none' }} accept=".jpg,.jpeg,.png,.pdf" onChange={e=>handleFileUpload(e,'bank')} disabled={docs.bank.status==='extracting'}/>
                        <span style={{ flex:1, padding:'0 0.85rem', fontSize:'0.85rem', color:docs.bank.file?C.g800:C.g400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {docs.bank.file||'No file chosen — JPG, PNG or PDF, max 5 MB'}
                        </span>
                        {docs.bank.status==='success'&&<>
                          <span style={{ padding:'0 0.75rem', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem', color:C.success, flexShrink:0 }}><IcoCheck/> Verified</span>
                          <button type="button" onClick={()=>removeDoc('bank')} style={{ background:'none', border:'none', color:C.danger, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', padding:'0 0.75rem', flexShrink:0 }}>Remove</button>
                        </>}
                      </div>
                      {docs.bank.status==='success'&&(
                        <div style={{ background:C.white, border:'1px solid #c8e6c9', borderRadius:6, padding:'0.85rem 1rem', marginTop:'0.5rem', fontSize:'0.82rem' }}>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Account Holder:</strong> {docs.bank.data.accountHolder}</p>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Bank:</strong> {docs.bank.data.bankName}</p>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>Account No.:</strong> {docs.bank.data.accountNumber}</p>
                          <p style={{ marginBottom:'0.25rem', color:C.g600 }}><strong style={{ color:C.success }}>IFSC:</strong> {docs.bank.data.ifsc}</p>
                          <div style={{ fontSize:'0.72rem', color:C.navy, fontWeight:600, marginTop:'0.4rem', display:'flex', alignItems:'center', gap:'0.3rem' }}><IcoCheck/> Data cross-verified with form entries</div>
                        </div>
                      )}
                      {errMsg(errors.docBank)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="resp-actions" style={{ display:'flex', gap:'1rem', paddingTop:'2rem', borderTop:`1px solid ${C.g200}`, marginTop:'1rem', flexDirection:'column' }}>
                {errors._api && (
                  <div style={{ padding:'0.85rem 1rem', background:'#fff8f8', border:`1px solid ${C.danger}`, borderRadius:6, fontSize:'0.82rem', color:C.danger, fontWeight:500 }}>
                    ⚠ {errors._api}
                  </div>
                )}
                <div style={{ display:'flex', gap:'1rem' }}>
                  <button type="button" onClick={handleReset} style={{ flex:1, background:C.white, color:C.g600, border:`1.5px solid ${C.g200}`, borderRadius:6, padding:'0.9rem 1.5rem', fontSize:'0.88rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer' }}>
                    Reset Form
                  </button>
                  <button type="submit" disabled={submitting} style={{ flex:2, background: submitting ? C.navyMid : C.navy, color:C.white, border:'none', borderRadius:6, padding:'0.9rem 2rem', fontSize:'0.95rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', cursor: submitting ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', boxShadow:'0 4px 12px rgba(13,43,85,0.25)', position:'relative', overflow:'hidden', opacity: submitting ? 0.8 : 1 }}>
                    <IcoShield/> {submitting ? 'Submitting…' : 'Submit Re-KYC Application'}
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Sidebar */}
          <aside className="resp-sidebar resp-sidebar-grid" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* How to Complete */}
            <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g200}`, boxShadow:shadow.sm, overflow:'hidden' }}>
              <div style={{ background:C.navy, color:C.white, padding:'0.85rem 1.25rem', fontSize:'0.82rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ color:C.goldLight }}><IcoInfo/></span> How to Complete
              </div>
              <div style={{ padding:'1.25rem' }}>
                {[['Keep Documents Ready','PAN card and Aadhaar / Bank Statement in digital format.'],['Fill Personal Details','Enter your name, DOB, and contact information accurately.'],['Upload Documents','Upload clear scans for AI-powered data extraction.'],['Review & Submit','Verify auto-filled data and submit your application.']].map(([t,d],i,a)=>(
                  <div key={i} style={{ display:'flex', gap:'0.85rem', alignItems:'flex-start', padding:'0.75rem 0', borderBottom: i<a.length-1?`1px solid ${C.g100}`:'none' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:C.navy, color:C.white, fontSize:'0.7rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</div>
                    <div style={{ fontSize:'0.8rem', color:C.g600, lineHeight:1.45 }}>
                      <strong style={{ color:C.g800, display:'block', marginBottom:'0.1rem' }}>{t}</strong>{d}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Support */}
            <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g200}`, boxShadow:shadow.sm, overflow:'hidden' }}>
              <div style={{ background:C.navy, color:C.white, padding:'0.85rem 1.25rem', fontSize:'0.82rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ color:C.goldLight }}><IcoPhone/></span> Member Support
              </div>
              <div style={{ padding:'1.25rem' }}>
                {[
                  [<IcoPhone/>, 'Helpline', '1800-XXX-XXXX'],
                  [<IcoMail/>,  'Email Support', 'kyc@nhfs.org.in'],
                  [<IcoInfo/>,  'Working Hours', 'Mon–Sat, 9:30 AM – 5:30 PM'],
                ].map(([ico, lbl, val], i, a) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.82rem', color:C.g600, padding:'0.6rem 0', borderBottom: i<a.length-1?`1px solid ${C.g100}`:'none' }}>
                    <span style={{ color:C.navy, flexShrink:0 }}>{ico}</span>
                    <div>
                      <div style={{ fontSize:'0.68rem', color:C.g400, textTransform:'uppercase', letterSpacing:'0.5px' }}>{lbl}</div>
                      <div style={{ fontWeight:600, color:C.g800 }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g200}`, boxShadow:shadow.sm, overflow:'hidden' }}>
              <div style={{ background:C.navy, color:C.white, padding:'0.85rem 1.25rem', fontSize:'0.82rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ color:C.goldLight }}><IcoShield/></span> Security &amp; Compliance
              </div>
              <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                {['All data is encrypted with 256-bit SSL during transmission.','Documents are processed under RBI KYC Master Direction 2016.','Personal data is never shared with third parties without consent.','This portal is ISO 27001 certified for information security.'].map((t,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', fontSize:'0.82rem', color:C.g600, lineHeight:1.5 }}>
                    <span style={{ color:C.teal, flexShrink:0, marginTop:1 }}><IcoCheck/></span>{t}
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>

        {/* Footer */}
        <footer style={{ background:C.navyDark, color:'#7a94ad', marginTop:'auto' }}>
          <div className="resp-footer-main" style={{ maxWidth:1200, margin:'0 auto', padding:'2.5rem 2rem', display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'2.5rem' }}>
            <div>
              <div style={{ fontFamily:font.serif, fontSize:'1.22rem', fontWeight:700, color:C.white, marginBottom:'0.5rem' }}>Project</div>
              <p style={{ fontSize:'0.8rem', lineHeight:1.6, color:'#7a94ad', maxWidth:280 }}>A government-backed cooperative housing finance institution committed to making homeownership accessible and affordable for every Indian family since 1987.</p>
            </div>
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:C.goldLight, marginBottom:'1rem' }}>Quick Links</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {['Home Loan Products','EMI Calculator','Interest Rates','Branch Locator','Grievance Portal'].map(l=>(
                  <a key={l} href="/" style={{ fontSize:'0.8rem', color:'#7a94ad', textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color:C.goldLight, marginBottom:'1rem' }}>Regulatory</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {['RBI Guidelines','NHB Directives','Privacy Policy','Terms of Service','RTI Act'].map(l=>(
                  <a key={l} href="/" style={{ fontSize:'0.8rem', color:'#7a94ad', textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'1rem 2rem', textAlign:'center', fontSize:'0.72rem', color:'#4a6070' }}>
            © {new Date().getFullYear()} Project. All rights reserved. | Regulated by National Housing Bank | CIN: U65922DL1987GOI000000
          </div>
        </footer>

      </div>
    </>
  );
}
