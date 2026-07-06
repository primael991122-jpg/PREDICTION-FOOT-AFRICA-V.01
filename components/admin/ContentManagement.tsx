
import React, { useState, useEffect } from 'react';
import type { Rule, Info } from '../../types';
import { PencilIcon, TrashIcon, PhotoIcon, PlusIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface ContentManagementProps {
    rules: Rule[];
    info: Info[];
    actions: any;
}

const emptyInfo: Omit<Info, 'id'> = {
    text: '',
    imageUrl: '',
    videoUrl: ''
};

export const ContentManagement: React.FC<ContentManagementProps> = ({ rules, info, actions }) => {
    // Rules State
    const [editedRulesContent, setEditedRulesContent] = useState('');
    
    // Info State
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [editingInfo, setEditingInfo] = useState<Info | null>(null);
    const [currentSlot, setCurrentSlot] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedRulesContent(rules[0]?.content || '');
    }, [rules]);

    const handleSaveRules = async () => {
        await actions.updateRules([{ ...rules[0], content: editedRulesContent }]);
        alert('Règlement sauvegardé !');
    };

    // --- GESTION INFO PAR SLOTS ---
    const slots = [1, 2];

    const getInfoForSlot = (slot: number) => {
        return info.find(item => item.id === `info_slot_${slot}`);
    };

    const handleOpenInfoModal = (slot: number) => {
        const existingInfo = getInfoForSlot(slot);
        setCurrentSlot(slot);
        setEditingInfo(existingInfo ? { ...existingInfo } : { ...emptyInfo, id: `info_slot_${slot}` } as Info);
        setIsInfoModalOpen(true);
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setEditingInfo(null);
        setCurrentSlot(0);
        setIsSaving(false);
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = event.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleInfoImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const resizedImage = await resizeImage(file);
                setEditingInfo(prev => prev ? { ...prev, imageUrl: resizedImage } : null);
            } catch (error) {
                console.error("Erreur redimensionnement", error);
            }
        }
    };

    const handleSaveInfo = async () => {
        if (!editingInfo) return;
        
        if (!editingInfo.text || editingInfo.text.trim() === '') {
            alert("Le texte de l'information est obligatoire.");
            return;
        }
        if (!editingInfo.imageUrl) {
            alert("Une image est obligatoire pour la couverture.");
            return;
        }

        setIsSaving(true);
        
        try {
            const infoToSave = {
                ...editingInfo,
                id: `info_slot_${currentSlot}`
            };

            await actions.saveInfoSlot(infoToSave);
            setIsInfoModalOpen(false);
            setEditingInfo(null);
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteInfo = async (id: string) => {
        if (window.confirm("Vider cet emplacement ?")) {
            await actions.deleteInfo(id);
        }
    };

    // Identifier les infos "orphelines" (qui ne sont pas slot 1 ou 2) pour permettre le nettoyage
    const legacyInfos = info.filter(item => !item.id.startsWith('info_slot_'));

    return (
        <div className="space-y-10">
            {/* SECTION REGLEMENT */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Règlement du Concours</h3>
                </div>
                <textarea 
                    value={editedRulesContent}
                    onChange={(e) => setEditedRulesContent(e.target.value)}
                    rows={10}
                    className="w-full p-4 bg-gray-900/50 rounded-lg text-gray-300 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Entrez le règlement complet ici..."
                />
                <div className="mt-4 flex justify-end">
                    <button onClick={handleSaveRules} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-md">
                        Sauvegarder le Règlement
                    </button>
                </div>
            </div>

            {/* SECTION INFORMATIONS (2 SLOTS) */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Actualités & Infos (2 Emplacements)</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {slots.map(slot => {
                        const item = getInfoForSlot(slot);
                        const isFilled = !!item;

                        return (
                            <div key={slot} className={`relative rounded-2xl border-2 overflow-hidden transition-all flex flex-col ${isFilled ? 'border-gray-600 bg-gray-700' : 'border-dashed border-gray-600 bg-gray-900/30 h-64 justify-center items-center'}`}>
                                <div className="absolute top-0 left-0 bg-purple-500 text-white font-bold px-3 py-1 text-sm z-10 rounded-br-lg">
                                    Info {slot}
                                </div>

                                {isFilled ? (
                                    <>
                                        <div className="h-48 w-full bg-gray-900 relative">
                                            <img src={getSafeImageUrl(item.imageUrl)} alt="Info" className="w-full h-full object-cover" />
                                            {item.videoUrl && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <VideoCameraIcon className="w-12 h-12 text-white opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-grow">
                                            <p className="text-gray-200 text-sm line-clamp-4 whitespace-pre-wrap">{item.text}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex space-x-2">
                                            <button onClick={() => handleOpenInfoModal(slot)} className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 text-white shadow-lg" title="Modifier">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteInfo(item.id)} className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white shadow-lg" title="Vider">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm mb-4">Emplacement Vide</p>
                                        <button 
                                            onClick={() => handleOpenInfoModal(slot)} 
                                            className="flex items-center justify-center mx-auto bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg"
                                        >
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Ajouter
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Zone de nettoyage (si anciennes infos) */}
                {legacyInfos.length > 0 && (
                    <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h4 className="text-red-400 font-bold mb-2 text-sm uppercase">Maintenance</h4>
                        <p className="text-gray-400 text-xs mb-4">Des informations obsolètes (ancienne version) sont encore présentes dans la base de données.</p>
                        <div className="flex flex-wrap gap-2">
                            {legacyInfos.map(item => (
                                <div key={item.id} className="bg-gray-900 px-3 py-2 rounded flex items-center space-x-2 border border-gray-700">
                                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{item.text}</span>
                                    <button onClick={() => handleDeleteInfo(item.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL INFO */}
            {isInfoModalOpen && editingInfo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <h4 className="text-xl font-bold text-white mb-6">Modifier Information N°{currentSlot}</h4>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase">Image de couverture (Obligatoire)</label>
                                <div className="flex items-start space-x-4">
                                    {editingInfo.imageUrl ? (
                                        <img src={getSafeImageUrl(editingInfo.imageUrl)} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-600" />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center text-gray-500">
                                            <PhotoIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            onChange={handleInfoImageChange} 
                                            accept="image/*"
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer"
                                        />
                                        <p className="text-xs text-yellow-400 mt-2 font-bold">
                                            Dimensions recommandées : 800 x 400 pixels (Format Paysage 2:1)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase flex items-center">
                                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                                    Vidéo (Optionnel - 1 min max)
                                </label>
                                <input 
                                    type="text" 
                                    value={editingInfo.videoUrl || ''}
                                    onChange={(e) => setEditingInfo({...editingInfo, videoUrl: e.target.value})}
                                    placeholder="Ex: https://www.youtube.com/watch?v=... ou lien MP4"
                                    className="w-full p-3 bg-gray-900 rounded-lg text-white border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Collez ici un lien YouTube ou un lien direct vers un fichier .mp4</p>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-400 uppercase">Texte <span className="text-red-500">*</span></label>
                                <textarea 
                                    value={editingInfo.text}
                                    onChange={(e) => setEditingInfo({...editingInfo, text: e.target.value})}
                                    rows={6}
                                    className="w-full p-4 bg-gray-900 rounded-lg text-white border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    placeholder="Votre message..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                            <button 
                                onClick={handleCloseInfoModal} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveInfo} 
                                disabled={isSaving}
                                className={`px-4 py-2 font-bold rounded-lg transition-colors shadow-md text-white ${isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
                            >
                                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
