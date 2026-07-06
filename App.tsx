
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AuthView } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Predictions } from './components/Predictions';
import { Leaderboard } from './components/Leaderboard';
import { Rules } from './components/Rules';
import { Information } from './components/Information';
import { Forum } from './components/Forum';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AdminPanel } from './components/admin/AdminPanel';
import { useAppData } from './hooks/useAppData'; 
import { auth, db } from './firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User, Match } from './types';
import { useNotifications } from './hooks/useNotifications';
import { NotificationToast } from './components/common/NotificationToast';
import { NotificationHub } from './components/common/NotificationHub';

export enum Page {
  AUTH, DASHBOARD, PREDICTIONS, LEADERBOARD, RULES, INFORMATION, FORUM, CONTACT, ABOUT, PRIVACY, ADMIN
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const {
    users, matches, predictions, leaderboard, rules, info, 
    forumMessages, contactMessages, ads, settings, loading: dataLoading,
    actions
  } = useAppData();

  const {
    notifications,
    unreadCount,
    notificationsEnabled,
    pushPermissionStatus,
    activeToast,
    requestPushPermission,
    toggleNotificationsEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    dismissToast
  } = useNotifications();

  const [isNotificationsHubOpen, setIsNotificationsHubOpen] = useState(false);
  const initialMatchesLoaded = useRef(false);
  const prevMatchesRef = useRef<Match[]>([]);

  useEffect(() => {
    if (dataLoading || matches.length === 0) return;

    if (!initialMatchesLoaded.current) {
      prevMatchesRef.current = matches;
      initialMatchesLoaded.current = true;
      return;
    }

    const prevMatches = prevMatchesRef.current;

    const addedMatches = matches.filter(m => !prevMatches.some(pm => pm.id === m.id));

    const validatedMatches = matches.filter(m => {
      const prevM = prevMatches.find(pm => pm.id === m.id);
      return m.result && (!prevM || !prevM.result);
    });

    addedMatches.forEach(match => {
      addNotification(
        "🏟️ Nouveau match disponible !",
        `Le match ${match.homeTeam?.name || ''} vs ${match.awayTeam?.name || ''} (${match.competition}) est prêt ! Pronostiquez maintenant.`,
        match.id,
        'added'
      );
    });

    validatedMatches.forEach(match => {
      addNotification(
        "⚽ Résultat validé !",
        `${match.homeTeam?.name || ''} ${match.result?.homeScore} - ${match.result?.awayScore} ${match.awayTeam?.name || ''} : les points ont été calculés !`,
        match.id,
        'validated'
      );
    });

    prevMatchesRef.current = matches;
  }, [matches, dataLoading, addNotification]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // On attend un peu ou on boucle si nécessaire pour laisser le temps au SignUpForm de créer le doc
          const userRef = doc(db!, "users", firebaseUser.uid);
          let userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // On attend 2.5 secondes au cas où un SignUpForm est en train de créer le document
            await new Promise((resolve) => setTimeout(resolve, 2500));
            userDoc = await getDoc(userRef);
          }
          
          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), id: firebaseUser.uid } as User;
            setCurrentUser(userData);
            
            // On ne redirige vers Dashboard que si on est sur la page AUTH
            if (currentPage === Page.AUTH) {
                setCurrentPage(userData.isAdmin ? Page.ADMIN : Page.DASHBOARD);
            }
          } else {
            // Si le document n'existe toujours pas après l'attente, on le crée automatiquement
            console.log("Firestore user doc not found. Auto-generating for UID:", firebaseUser.uid);
            const email = firebaseUser.email || "";
            const adminEmails = [
              'admin@predictionfootafrica.com',
              'test@admin.com',
              'anguiley99@gmail.com'
            ];
            const isAdmin = adminEmails.includes(email.toLowerCase().trim());
            const shortId = isAdmin ? 'ADMIN1' : Math.random().toString(36).substring(2, 8).toUpperCase();
            const fullName = firebaseUser.displayName || email.split('@')[0] || "Supporter";
            
            const newUser: User = {
                id: firebaseUser.uid,
                shortId: shortId,
                name: fullName,
                email: email.toLowerCase().trim(),
                profilePictureUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200`,
                country: { name: "Afrique", code: "AF" },
                gender: "Male",
                phone: "",
                isAdmin: isAdmin, 
            };

            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
            if (currentPage === Page.AUTH) {
                setCurrentPage(newUser.isAdmin ? Page.ADMIN : Page.DASHBOARD);
            }
          }
        } catch (e) {
          console.warn("User doc fetch error (permissions?):", e);
        }
      } else {
        setCurrentUser(null);
        setCurrentPage(Page.AUTH);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [currentPage]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(user.isAdmin ? Page.ADMIN : Page.DASHBOARD);
  };
  
  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setCurrentUser(null);
    setCurrentPage(Page.AUTH);
  };
  
  const navigate = (page: Page) => setCurrentPage(page);
  const handleUpdateUser = (data: Partial<User>) => setCurrentUser(prev => prev ? { ...prev, ...data } : null);

  if (authLoading || (dataLoading && currentUser)) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Initialisation</p>
        </div>
      );
  }

  const renderPage = () => {
    if (!currentUser) return <AuthView onLogin={handleLogin} />;
    
    let content = null;

    switch (currentPage) {
      case Page.DASHBOARD: 
        content = (
          <Dashboard 
            navigate={navigate} 
            onLogout={handleLogout} 
            currentUser={currentUser} 
            ads={ads} 
            settings={settings} 
            actions={actions} 
            onUpdateUser={handleUpdateUser}
            onOpenNotifications={() => setIsNotificationsHubOpen(true)}
            unreadNotificationsCount={unreadCount}
          />
        ); 
        break;
      case Page.PREDICTIONS: content = <Predictions navigate={navigate} currentUser={currentUser} matches={matches} predictions={predictions} onSubmit={actions.submitPredictions} ads={ads} settings={settings} />; break;
      case Page.LEADERBOARD: content = <Leaderboard navigate={navigate} currentUser={currentUser} leaderboard={leaderboard} ads={ads} settings={settings} />; break;
      case Page.ADMIN: 
        content = currentUser.isAdmin ? (
          <AdminPanel 
            onLogout={handleLogout} 
            matches={matches} 
            actions={actions} 
            rules={rules} 
            info={info} 
            forumMessages={forumMessages} 
            contactMessages={contactMessages} 
            ads={ads} 
            users={users} 
            predictions={predictions} 
            settings={settings} 
          />
        ) : (
          <Dashboard 
            navigate={navigate} 
            onLogout={handleLogout} 
            currentUser={currentUser} 
            ads={ads} 
            actions={actions} 
            onUpdateUser={handleUpdateUser} 
            settings={settings} 
            onOpenNotifications={() => setIsNotificationsHubOpen(true)}
            unreadNotificationsCount={unreadCount}
          />
        ); 
        break;
      case Page.RULES: content = <Rules navigate={navigate} currentUser={currentUser} rules={rules} ads={ads} settings={settings} />; break;
      case Page.INFORMATION: content = <Information navigate={navigate} currentUser={currentUser} info={info} ads={ads} settings={settings} />; break;
      case Page.FORUM: content = <Forum navigate={navigate} currentUser={currentUser} messages={forumMessages} onSend={actions.sendForumMessage} ads={ads} settings={settings} />; break;
      case Page.CONTACT: content = <Contact navigate={navigate} currentUser={currentUser} messages={contactMessages} onSend={actions.sendContactMessage} adminUser={users.find(u=>u.isAdmin) || currentUser} ads={ads} settings={settings} />; break;
      case Page.ABOUT: content = <About navigate={navigate} currentUser={currentUser} ads={ads} settings={settings} />; break;
      case Page.PRIVACY: content = <PrivacyPolicy navigate={navigate} currentUser={currentUser} ads={ads} settings={settings} />; break;
      default: 
        content = (
          <Dashboard 
            navigate={navigate} 
            onLogout={handleLogout} 
            currentUser={currentUser} 
            ads={ads} 
            settings={settings} 
            actions={actions} 
            onUpdateUser={handleUpdateUser} 
            onOpenNotifications={() => setIsNotificationsHubOpen(true)}
            unreadNotificationsCount={unreadCount}
          />
        );
    }

    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">{content}</div>
        
        {/* Toast alerts overlay for real-time notifications */}
        <NotificationToast 
          toast={activeToast}
          onClose={dismissToast}
          onClick={() => {
            dismissToast();
            navigate(Page.PREDICTIONS);
          }}
        />

        {/* Notifications list and setup hub */}
        <NotificationHub 
          isOpen={isNotificationsHubOpen}
          onClose={() => setIsNotificationsHubOpen(false)}
          notifications={notifications}
          notificationsEnabled={notificationsEnabled}
          pushPermissionStatus={pushPermissionStatus}
          onToggleEnabled={toggleNotificationsEnabled}
          onRequestPermission={requestPushPermission}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
          onSelectNotification={(matchId) => {
            setIsNotificationsHubOpen(false);
            navigate(Page.PREDICTIONS);
          }}
        />
      </div>
    );
  };

  return <div className="min-h-screen bg-gray-950 font-sans text-white selection:bg-yellow-400 selection:text-black">{renderPage()}</div>;
};

export default App;
