
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// --- TYPES ---
export type LanguageCode = 'fr' | 'en' | 'es' | 'pt' | 'ar' | 'de' | 'it' | 'zh' | string;

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string; // Emoji drapeau
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
}

// --- LISTE DES LANGUES (Liste étendue) ---
export const ALL_LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'sn', name: 'Wolof', flag: '🇸🇳' },
  { code: 'cm', name: 'Camfranglais', flag: '🇨🇲' },
  { code: 'ci', name: 'Baoulé', flag: '🇨🇮' },
  { code: 'ma', name: 'Darija', flag: '🇲🇦' },
  { code: 'dz', name: 'Darja', flag: '🇩🇿' },
  { code: 'tn', name: 'Tounsi', flag: '🇹🇳' },
];

// --- DICTIONNAIRE DE TRADUCTION ---
const TRANSLATIONS: Record<string, Record<string, string>> = {
  fr: {
    'app.title': 'PREDICTION FOOT AFRICA',
    'auth.login': 'Connexion',
    'auth.register': 'Créer un compte',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgot': 'Mot de passe oublié ?',
    'auth.submit_login': 'SE CONNECTER',
    'auth.submit_register': "S'INSCRIRE",
    'auth.no_account': "Pas encore de compte ?",
    'auth.has_account': "Déjà inscrit ?",
    'auth.name': 'Nom complet',
    'auth.gender': 'Sexe',
    'auth.country': 'Pays',
    'auth.phone': 'Téléphone (WhatsApp)',
    'auth.reset_sent': 'Lien de réinitialisation envoyé ! Vérifiez vos spams.',
    'auth.reset_error': "Erreur lors de l'envoi de l'email.",
    'auth.reset_no_user': "L'adresse email n'existe pas.",
    'auth.reset_instruction': 'Entrez votre email pour recevoir un lien de réinitialisation.',
    'auth.reset_submit': 'Réinitialiser mon mot de passe.',
    'auth.error_invalid': 'Identifiants incorrects.',
    'auth.error_no_user': 'Compte inexistant. Inscrivez-vous !',
    'auth.error_wrong_pass': 'Mot de passe erroné.',
    'auth.error_firebase': 'Firebase non initialisé.',
    'auth.gender_male': 'Homme',
    'auth.gender_female': 'Femme',
    'auth.error_all_fields': 'Tous les champs sont requis.',
    'auth.signup_loading_auth': 'Création du compte...',
    'auth.signup_loading_firestore': 'Initialisation du profil...',
    'auth.signup_error_permissions': "ERREUR PERMISSIONS FIRESTORE : Votre profil n'a pas pu être créé. Veuillez vérifier les 'Rules' dans votre console Firebase.",
    'auth.signup_error_duplicate_email': 'Cet email est déjà utilisé par un autre joueur.',
    'auth.signup_error_invalid_email': "Format d'email invalide.",
    'auth.signup_error_weak_password': 'Mot de passe trop court (min. 6).',
    'auth.signup_error_generic': "Erreur d'inscription.",
    'auth.signup_loading': 'Chargement...',
    'auth.welcome_title': 'Bienvenue',
    'auth.welcome_success': 'Votre compte a été créé avec succès.',
    'auth.welcome_start': 'Commencer à Jouer',
    'menu.predictions': 'PRONOSTICS',
    'menu.leaderboard': 'CLASSEMENT',
    'menu.rules': 'RÈGLEMENT',
    'menu.info': 'INFORMATIONS',
    'menu.forum': 'FORUM',
    'menu.contact': 'CONTACT',
    'menu.about': 'À PROPOS',
    'menu.privacy': 'CONFIDENTIALITÉ',
    'dash.points': 'Points',
    'dash.rank': 'Classement',
    'dash.view': 'Voir',
    'search.placeholder': 'Rechercher une langue...',
    'settings.language': 'Langue',
    'common.back': 'Retour',
  },
  en: {
    'app.title': 'AFRICA FOOT PREDICTION',
    'auth.login': 'Login',
    'auth.register': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot Password?',
    'auth.submit_login': 'LOGIN',
    'auth.submit_register': "SIGN UP",
    'auth.no_account': "Don't have an account?",
    'auth.has_account': "Already have an account?",
    'auth.name': 'Full Name',
    'auth.gender': 'Gender',
    'auth.country': 'Country',
    'auth.phone': 'Phone (WhatsApp)',
    'auth.reset_sent': 'Reset link sent! Please check your spam folder.',
    'auth.reset_error': 'Error sending the reset email.',
    'auth.reset_no_user': 'This email address does not exist.',
    'auth.reset_instruction': 'Enter your email to receive a reset link.',
    'auth.reset_submit': 'Reset my password',
    'auth.error_invalid': 'Incorrect credentials.',
    'auth.error_no_user': 'Account does not exist. Please sign up!',
    'auth.error_wrong_pass': 'Incorrect password.',
    'auth.error_firebase': 'Firebase not initialized.',
    'auth.gender_male': 'Male',
    'auth.gender_female': 'Female',
    'auth.error_all_fields': 'All fields are required.',
    'auth.signup_loading_auth': 'Creating account...',
    'auth.signup_loading_firestore': 'Initializing profile...',
    'auth.signup_error_permissions': 'FIRESTORE PERMISSIONS ERROR: Your profile could not be created. Please check the "Rules" in your Firebase console.',
    'auth.signup_error_duplicate_email': 'This email is already in use by another player.',
    'auth.signup_error_invalid_email': 'Invalid email format.',
    'auth.signup_error_weak_password': 'Password too short (min. 6).',
    'auth.signup_error_generic': 'Registration error.',
    'auth.signup_loading': 'Loading...',
    'auth.welcome_title': 'Welcome',
    'auth.welcome_success': 'Your account has been successfully created.',
    'auth.welcome_start': 'Start Playing',
    'menu.predictions': 'PREDICTIONS',
    'menu.leaderboard': 'LEADERBOARD',
    'menu.rules': 'RULES',
    'menu.info': 'NEWS',
    'menu.forum': 'FORUM',
    'menu.contact': 'CONTACT',
    'menu.about': 'ABOUT',
    'menu.privacy': 'PRIVACY',
    'dash.points': 'Points',
    'dash.rank': 'Rank',
    'dash.view': 'View',
    'search.placeholder': 'Search language...',
    'settings.language': 'Language',
    'common.back': 'Back',
  },
  es: {
    'app.title': 'PREDICCIÓN FÚTBOL ÁFRICA',
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.forgot': '¿Olvidaste tu contraseña?',
    'auth.submit_login': 'ENTRAR',
    'auth.submit_register': "REGISTRARSE",
    'auth.no_account': "¿No tienes cuenta?",
    'auth.has_account': "¿Ya estás registrado?",
    'auth.reset_sent': '¡Enlace de restablecimiento enviado! Revisa tu correo.',
    'auth.reset_error': 'Error al enviar el correo.',
    'auth.reset_no_user': 'La cuenta no existe.',
    'auth.reset_instruction': 'Introduce tu email para recibir un enlace.',
    'auth.reset_submit': 'Restablecer contraseña',
    'auth.error_invalid': 'Credenciales incorrectas.',
    'auth.error_no_user': 'La cuenta no existe. ¡Regístrate!',
    'auth.error_wrong_pass': 'Contraseña incorrecta.',
    'menu.predictions': 'PRONÓSTICOS',
    'menu.leaderboard': 'CLASIFICACIÓN',
    'menu.rules': 'REGLAS',
    'menu.info': 'INFORMACIÓN',
    'menu.forum': 'FORO',
    'menu.contact': 'CONTACTO',
    'menu.about': 'ACERCA DE',
    'menu.privacy': 'PRIVACIDAD',
    'dash.points': 'Puntos',
    'dash.rank': 'Rango',
    'dash.view': 'Ver',
  },
  pt: {
    'app.title': 'PREVISÃO FUTEBOL ÁFRICA',
    'auth.login': 'Entrar',
    'auth.register': 'Criar conta',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.forgot': 'Esqueceu a senha?',
    'auth.submit_login': 'ENTRAR',
    'auth.submit_register': "INSCREVER-SE",
    'auth.no_account': 'Não tem uma conta?',
    'auth.has_account': 'Já tem uma conta?',
    'auth.reset_sent': 'Link de redefinição enviado! Verifique seu e-mail.',
    'auth.reset_error': 'Erro ao enviar o e-mail.',
    'auth.reset_no_user': 'Esta conta não existe.',
    'auth.reset_instruction': 'Insira seu e-mail para receber um link.',
    'auth.reset_submit': 'Redefinir senha',
    'auth.error_invalid': 'Credenciais incorretas.',
    'auth.error_no_user': 'Conta não existe. Inscreva-se!',
    'auth.error_wrong_pass': 'Senha incorreta.',
    'menu.predictions': 'PALPITES',
    'menu.leaderboard': 'CLASSIFICAÇÃO',
    'menu.rules': 'REGULAMENTO',
    'menu.info': 'INFORMAÇÕES',
    'menu.forum': 'FÓRUM',
    'menu.contact': 'CONTATO',
    'menu.about': 'SOBRE',
    'menu.privacy': 'PRIVACIDADE',
    'dash.points': 'Pontos',
    'dash.rank': 'Ranking',
    'dash.view': 'Ver',
  },
  ar: {
    'app.title': 'توقعات كرة القدم أفريقيا',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.forgot': 'هل نسيت كلمة السر؟',
    'auth.submit_login': 'دخول',
    'auth.submit_register': "تسجيل",
    'auth.no_account': "ليس لديك حساب؟",
    'auth.has_account': "لديك حساب بالفعل؟",
    'auth.reset_sent': 'تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني.',
    'auth.reset_error': 'خطأ في إرسال البريد الإلكتروني.',
    'auth.reset_no_user': 'هذا الحساب غير موجود.',
    'auth.reset_instruction': 'أدخل بريدك الإلكتروني لتلقي الرابط.',
    'auth.reset_submit': 'إعادة تعيين كلمة المرور',
    'auth.error_invalid': 'بيانات الاعتماد غير صحيحة.',
    'auth.error_no_user': 'الحساب غير موجود. يرجى التسجيل!',
    'auth.error_wrong_pass': 'كلمة المرور غير صحيحة.',
    'menu.predictions': 'التوقعات',
    'menu.leaderboard': 'الترتيب',
    'menu.rules': 'القواعد',
    'menu.info': 'معلومات',
    'menu.forum': 'المنتدى',
    'menu.contact': 'اتصل بنا',
    'menu.about': 'حول',
    'menu.privacy': 'الخصوصية',
    'dash.points': 'نقاط',
    'dash.rank': 'مرتبة',
    'dash.view': 'عرض',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(ALL_LANGUAGES[0]);

  useEffect(() => {
    const savedCode = localStorage.getItem('app_language');
    if (savedCode) {
      const found = ALL_LANGUAGES.find(l => l.code === savedCode);
      if (found) setLanguageState(found);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang.code);
    // Gestion rudimentaire de la direction du texte pour l'arabe
    document.dir = lang.code === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    const langCode = language.code;
    // 1. Essayer la langue sélectionnée
    if (TRANSLATIONS[langCode] && TRANSLATIONS[langCode][key]) {
      return TRANSLATIONS[langCode][key];
    }
    // 2. Fallback sur le français
    if (TRANSLATIONS['fr'] && TRANSLATIONS['fr'][key]) {
      return TRANSLATIONS['fr'][key];
    }
    // 3. Fallback sur l'anglais
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
        return TRANSLATIONS['en'][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: ALL_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
