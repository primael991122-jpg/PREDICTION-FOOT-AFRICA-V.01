
import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../types';
import { TrashIcon, ExclamationTriangleIcon, CircleStackIcon, CurrencyDollarIcon, ComputerDesktopIcon, CreditCardIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface SettingsManagementProps {
    onResetCompetition: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    adSenseClientId: 'ca-pub-1974570269609479',
    adSenseSlots: {
        home: '9695227462',
        predictions: '1816737445',
        leaderboard: '8290630549',
        rules: '6016547348',
        info: '8190574104',
        forum: '7329629018',
        contact: '7819857257',
        interstitial: '4934673611',
        about: '',
        privacy: ''
    },
    emergencyMessage: ''
};

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ onResetCompetition }) => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            if (!db) { setLoading(false); return; }
            try {
                const docSnap = await getDoc(doc(db, 'settings', 'config'));
                if (docSnap.exists()) { setSettings(docSnap.data() as AppSettings); }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        loadSettings();
    }, []);

    const handleChange = (field: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSlotChange = (page: keyof AppSettings['adSenseSlots'], value: string) => {
        setSettings(prev => ({
            ...prev,
            adSenseSlots: { ...prev.adSenseSlots, [page]: value }
        }));
    };

    const handleSave = async () => {
        if (!db) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'config'), settings);
            alert("Configuration sauvegardée !");
        } catch (e) { alert("Erreur sauvegarde."); } finally { setSaving(false); }
    };

    if (loading) return <div className="text-gray-400 p-4">Chargement...</div>;

    return (
        <div className="space-y-8 max-w-4xl">
            {/* SECTION MESSAGE D'URGENCE */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center text-red-500">
                    <MegaphoneIcon className="w-6 h-6 mr-2" />
                    Bandeau d'Alerte Critique (Rouge 3D)
                </h3>
                <div className="bg-gray-800 p-6 rounded-lg border-2 border-red-500/50 shadow-xl">
                    <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Message d'alerte (Défilera partout)</label>
                    <textarea 
                        value={settings.emergencyMessage || ''}
                        onChange={(e) => handleChange('emergencyMessage', e.target.value)}
                        placeholder="Ex: 🚨 MAINTENANCE URGENTE / RÉSULTATS EN COURS DE CALCUL..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-red-500 font-black focus:ring-2 focus:ring-red-500 min-h-[100px] text-lg uppercase"
                    />
                    
                    {settings.emergencyMessage && (
                        <div className="mt-4 p-2 bg-black/50 rounded border border-gray-700">
                            <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Aperçu du style :</p>
                            <div className="bg-red-700 text-white p-2 text-center font-black uppercase text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" style={{textShadow: '1px 1px 0px #7f1d1d, 2px 2px 4px rgba(0,0,0,0.5)'}}>
                                {settings.emergencyMessage}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3 italic">⚠️ Laissez vide pour retirer complètement le bandeau de l'application.</p>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-lg shadow-lg transition-all transform active:scale-95"
                        >
                            {saving ? 'Publication...' : 'Publier l\'alerte'}
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* SECTION ADSENSE */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-6 h-6 mr-2 text-green-400" />
                    AdSense Slots
                </h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Client ID</label>
                        <input type="text" value={settings.adSenseClientId} onChange={(e) => handleChange('adSenseClientId', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(settings.adSenseSlots).map((key) => (
                            <div key={key}>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">{key}</label>
                                <input type="text" value={settings.adSenseSlots[key as keyof AppSettings['adSenseSlots']]} onChange={(e) => handleSlotChange(key as any, e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs text-white" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg">Sauvegarder</button>
                    </div>
                </div>
            </div>

            <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Réinitialisation</h4>
                <button onClick={onResetCompetition} className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"><TrashIcon className="w-5 h-5 mr-2" /> Réinitialiser tout</button>
            </div>
        </div>
    );
};
