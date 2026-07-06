
import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { CameraIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon, DevicePhoneMobileIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { LanguageSelector } from './common/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { countries } from '../data/countries';

const ADMIN_EMAILS = [
  'admin@predictionfootafrica.com',
  'test@admin.com',
  'anguiley99@gmail.com'
];

interface AuthViewProps {
  onLogin: (user: User) => void;
  adminUser?: { email: string };
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const { t } = useLanguage();

  if (registeredUser) {
    return <WelcomeModal user={registeredUser} onContinue={() => onLogin(registeredUser)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector variant="full" className="shadow-xl bg-gray-800/80 backdrop-blur-md border border-gray-700" />
      </div>

      <div className="w-full max-w-md mx-auto bg-gray-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-fadeIn">
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5 rounded-3xl shadow-lg shadow-yellow-500/20 mb-4">
              <div className="bg-gray-950 p-4 rounded-[1.4rem]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-12 h-12 text-yellow-400">
                    <path fill="currentColor" d="M493.1 319.4c-4.2-1.4-8.6.2-11.4 3.7L405 419.4V84.3c0-3.3-1.8-6.3-4.6-7.9c-2.8-1.6-6.2-1.5-8.9.2L249.3 154.4l-31-38.9c-3.4-4.3-9.5-5.2-13.9-1.8L120.5 174c-4.3 3.4-5.2 9.5-1.8 13.9l43.2 54.2L41.3 222c-4.3-3-10.1-2.2-13.4 2.1l-25.2 32.5c-3.3 4.3-2.5 10.2 1.8 13.6L129.2 355c4.3 3.3 10.1 2.5 13.4-1.8l16.1-20.2l82.6 62.8c4.3 3.3 10.1 2.5 13.4-1.8l1.8-2.2l132.8-173.8c3.4-4.3 2.5-10.2-1.8-13.6zm-193.4 53.2L182.8 285.2l-32.1 40.2l128.2-97.1l-22.9 28.7c-3.4 4.3-2.5 10.2 1.8 13.6l42.6 33.1z"/>
                  </svg>
              </div>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">
               {t('app.title')}
            </h1>
            <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Football • Community • Prizes</p>
          </div>
          
          {mode === 'login' ? (
            <LoginForm 
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                onForgotPassword={() => setMode('forgot')}
            />
          ) : mode === 'signup' ? (
            <SignUpForm 
                onSuccess={setRegisteredUser} 
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
            />
          ) : (
            <ForgotPasswordForm onBack={() => setMode('login')} />
          )}

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'signup' ? t('auth.has_account') : t('auth.no_account')}
              <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="font-black text-yellow-400 hover:text-yellow-300 ml-2 uppercase text-xs tracking-wider transition-colors">
                {mode === 'signup' ? t('auth.login') : t('auth.register')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginForm: React.FC<any> = ({ showPassword, setShowPassword, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
        setError(t('auth.error_firebase'));
        setLoading(false);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    } catch (firebaseError: any) {
        console.error("Login Fail:", firebaseError.code, firebaseError.message);
        let msg = t('auth.error_invalid');
        if (firebaseError.code === 'auth/user-not-found') msg = t('auth.error_no_user');
        if (firebaseError.code === 'auth/wrong-password') msg = t('auth.error_wrong_pass');
        if (firebaseError.code === 'auth/invalid-credential') msg = t('auth.error_invalid');
        if (firebaseError.code === 'auth/operation-not-allowed') {
          msg = "L'authentification par e-mail/mot de passe n'est pas activée dans votre console Firebase. Veuillez l'activer dans 'Authentication' > 'Sign-in method'.";
        }
        setError(msg);
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slideUp">
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t('auth.email')}</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50 transition-all placeholder-gray-600"
          placeholder="votre@email.com"
          required
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">{t('auth.password')}</label>
          <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-yellow-300 transition-colors"
          >
            {t('auth.forgot')}
          </button>
        </div>
        <div className="relative">
          <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50 transition-all placeholder-gray-600"
              placeholder="••••••••"
              required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white">
            {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl flex items-center animate-shake">
              <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-bold">{error}</span>
          </div>
      )}

      <button 
        disabled={loading} 
        type="submit" 
        className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 transition-all"
      >
          {loading ? "Vérification..." : t('auth.submit_login')}
      </button>
    </form>
  );
};

const ForgotPasswordForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth!, email.toLowerCase().trim());
            setMessage(t('auth.reset_sent'));
            setLoading(false);
        } catch (firebaseError: any) {
            console.error("Reset Fail:", firebaseError.code);
            let msg = t('auth.reset_error');
            if (firebaseError.code === 'auth/user-not-found') msg = t('auth.reset_no_user');
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-slideUp">
            <div className="text-center mb-6">
                <h2 className="text-white font-black uppercase tracking-widest text-sm mb-2">{t('auth.forgot')}</h2>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                    {t('auth.reset_instruction')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{t('auth.email')}</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50 transition-all placeholder-gray-600"
                        placeholder="votre@email.com"
                        required
                    />
                </div>

                {message && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-2xl flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-bold">{message}</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                >
                    {loading ? "..." : t('auth.reset_submit')}
                </button>

                <button 
                    type="button" 
                    onClick={onBack}
                    className="w-full text-xs font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors"
                >
                    {t('common.back')}
                </button>
            </form>
        </div>
    );
};

const SignUpForm: React.FC<{
    onSuccess: (user: User) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
}> = ({ onSuccess, showPassword, setShowPassword }) => {
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [phoneDialCode, setPhoneDialCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle'|'auth'|'firestore'>('idle');
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !countryCode || !gender || !phoneNumber) {
            setError(t('auth.error_all_fields'));
            return;
        }

        const selectedCountry = countries.find(c => c.code === countryCode);
        if (!selectedCountry) return;
        
        setLoading(true);
        setStatus('auth');

        try {
            // Étape 1 : Création Auth
            const userCredential = await createUserWithEmailAndPassword(auth!, email.toLowerCase().trim(), password);
            const uid = userCredential.user?.uid;
            
            const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim());
            const shortId = isAdmin ? 'ADMIN1' : generateShortId();

            const newUser: User = {
                id: uid,
                shortId: shortId,
                name: fullName,
                email: email.toLowerCase().trim(),
                profilePictureUrl: `https://picsum.photos/seed/${uid}/200`,
                country: { name: selectedCountry.name, code: selectedCountry.code },
                gender: gender as 'Male'|'Female'|'Other',
                phone: `${phoneDialCode}${phoneNumber}`,
                isAdmin: isAdmin, 
            };

            // Étape 2 : Création Firestore
            setStatus('firestore');
            try {
                await setDoc(doc(db!, "users", uid), newUser);
                await updateProfile(userCredential.user, { displayName: fullName, photoURL: newUser.profilePictureUrl });
                onSuccess(newUser);
            } catch (firestoreError: any) {
                console.error("Firestore Error during Signup:", firestoreError);
                if (firestoreError.code === 'permission-denied') {
                    setError(t('auth.signup_error_permissions'));
                } else {
                    setError(`${t('auth.signup_error_generic')} : ${firestoreError.message}`);
                }
                setLoading(false);
                setStatus('idle');
            }

        } catch (authError: any) {
            console.error("Auth Signup error:", authError);
            let msg = t('auth.signup_error_generic');
            if (authError.code === 'auth/email-already-in-use') msg = t('auth.signup_error_duplicate_email');
            if (authError.code === 'auth/invalid-email') msg = t('auth.signup_error_invalid_email');
            if (authError.code === 'auth/weak-password') msg = t('auth.signup_error_weak_password');
            if (authError.code === 'auth/operation-not-allowed') {
                msg = "L'authentification par e-mail/mot de passe n'est pas activée dans votre console Firebase.";
            }
            setError(msg);
            setLoading(false);
            setStatus('idle');
        }
    };

    return (
    <div className="space-y-4 animate-slideUp">
        <form className="space-y-4" onSubmit={handleSignUp}>
        <input type="text" placeholder={t('auth.name')} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50" required />
        <div className="grid grid-cols-2 gap-4">
            <select className="px-5 py-4 bg-gray-800 rounded-2xl text-white outline-none" value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="" className="bg-gray-800 text-white">{t('auth.gender')}</option>
                <option value="Male" className="bg-gray-800 text-white">{t('auth.gender_male')}</option>
                <option value="Female" className="bg-gray-800 text-white">{t('auth.gender_female')}</option>
            </select>
            <button
                type="button"
                onClick={() => setIsCountryModalOpen(true)}
                className="px-5 py-4 bg-gray-800 rounded-2xl text-white outline-none text-left flex items-center justify-between border-2 border-transparent hover:border-gray-700/50 active:scale-95 transition-all text-sm truncate"
            >
                <span className="flex items-center gap-2 truncate">
                    {countryCode ? (
                        <>
                            <img
                                src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                                alt=""
                                className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0 border border-white/10"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <span className="truncate">{countries.find(c => c.code === countryCode)?.name}</span>
                        </>
                    ) : (
                        t('auth.country')
                    )}
                </span>
                <span className="text-gray-400 text-xs ml-1 flex-shrink-0">▼</span>
            </button>
        </div>
        <div className="flex gap-3">
            <div className="w-1/3 px-4 py-4 bg-gray-900 rounded-2xl text-gray-500 text-center text-sm flex items-center justify-center">
                {phoneDialCode || "+??"}
            </div>
            <input type="tel" placeholder="Mobile" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-2/3 px-5 py-4 bg-gray-800 rounded-2xl text-white outline-none focus:border-yellow-400/50" required />
        </div>
        <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50" required />
        <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-800 border-2 border-transparent rounded-2xl text-white outline-none focus:border-yellow-400/50" required minLength={6} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 text-gray-500">
              {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
            </button>
        </div>
        
        {status !== 'idle' && (
            <div className="flex items-center justify-center space-x-2 py-2">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {status === 'auth' ? t('auth.signup_loading_auth') : t('auth.signup_loading_firestore')}
                </span>
            </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] p-4 rounded-2xl font-bold leading-relaxed">
                <ExclamationCircleIcon className="w-4 h-4 inline mr-1 mb-1" />
                {error}
                {error.includes('PERMISSIONS') && (
                    <div className="mt-2 text-white bg-red-600 p-2 rounded text-[9px] uppercase">
                        Action : Allez sur console.firebase.google.com &gt; Firestore &gt; Rules et mettez 'allow read, write: if true;'
                    </div>
                )}
            </div>
        )}

        <button disabled={loading} type="submit" className="w-full py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 active:scale-95 disabled:opacity-50 transition-all">
             {loading ? t('auth.signup_loading') : t('auth.submit_register')}
        </button>
    </form>

    {/* Modern Country Selector Modal (No Search Bar) */}
    {isCountryModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col p-6 relative max-h-[85vh]">
                
                <button 
                    type="button"
                    onClick={() => {
                        setIsCountryModalOpen(false);
                    }} 
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all transform active:scale-95 z-[10]"
                >
                    <span className="text-lg font-bold">✕</span>
                </button>

                <div className="text-center mb-6">
                    <span className="text-3xl animate-bounce inline-block">🌍</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mt-2">Sélectionnez votre Pays</h3>
                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Choisissez votre pays de résidence</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {countries.map(c => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                                setCountryCode(c.code);
                                const selectedCountry = countries.find(x => x.code === c.code);
                                setPhoneDialCode(selectedCountry?.dial_code || '');
                                setIsCountryModalOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl flex items-center justify-between transition-colors ${
                                countryCode === c.code 
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold' 
                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                    alt=""
                                    className="w-6 h-4 object-cover rounded-sm flex-shrink-0 border border-white/10"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                                <span className="text-sm truncate max-w-[200px]">{c.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono font-bold">{c.dial_code}</span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsCountryModalOpen(false);
                    }}
                    className="mt-6 w-full py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black uppercase tracking-wider text-xs rounded-2xl transition-all"
                >
                    Fermer
                </button>
            </div>
        </div>
    )}
    </div>
    );
}

const WelcomeModal: React.FC<{ user: User, onContinue: () => void }> = ({ user, onContinue }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="w-full max-w-lg bg-gray-900 rounded-[3rem] shadow-2xl border border-white/10 p-12 text-center animate-zoomIn">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 leading-tight">
                    {t('auth.welcome_title')}, <br/><span className="text-yellow-400">{user.name.split(' ')[0]}</span> ! ⚽
                </h2>
                <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6 rounded-full opacity-50"></div>
                <p className="text-gray-400 text-sm mb-8 uppercase tracking-widest font-bold">{t('auth.welcome_success')}</p>
                <button onClick={onContinue} className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    {t('auth.welcome_start')}
                </button>
            </div>
        </div>
    );
};
