
import React, { useState } from 'react';
import type { Ad } from '../../types';
import { PencilIcon, TrashIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface AdsManagementProps {
    ads: Ad[];
    actions: any;
}

const emptyAd: Omit<Ad, 'id'> = {
    imageUrl: '',
    name: '',
    price: '',
    url: ''
};

export const AdsManagement: React.FC<AdsManagementProps> = ({ ads, actions }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [currentSlot, setCurrentSlot] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    const slots = Array.from({ length: 10 }, (_, i) => i + 1);

    const getAdForSlot = (slot: number) => {
        return ads.find(ad => ad.id === `ad_slot_${slot}`);
    };

    const handleOpenModal = (slot: number) => {
        const existingAd = getAdForSlot(slot);
        setCurrentSlot(slot);
        // On initialise toujours avec des chaînes vides pour éviter les undefined dans Firestore
        setEditingAd(existingAd ? { ...existingAd } : { 
            imageUrl: '', 
            name: '', 
            price: '', 
            url: '', 
            id: `ad_slot_${slot}` 
        } as Ad);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAd(null);
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
                    
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const resizedImage = await resizeImage(file);
                setEditingAd(prevAd => {
                    if (!prevAd) return null;
                    return { ...prevAd, imageUrl: resizedImage };
                });
            } catch (error) {
                console.error("Erreur redimensionnement", error);
                alert("Impossible de traiter cette image.");
            }
        }
    };

    const handleSaveAd = async () => {
        if (!editingAd) return;
        
        setIsSaving(true);
        try {
            // Nettoyage final pour s'assurer qu'aucun champ n'est undefined (rejeté par Firestore)
            const adToSave: Ad = {
                id: `ad_slot_${currentSlot}`,
                name: editingAd.name || '',
                imageUrl: editingAd.imageUrl || '',
                price: editingAd.price || '',
                url: editingAd.url || ''
            };
            
            await actions.saveAdSlot(adToSave);
            alert(`Publicité de l'emplacement N°${currentSlot} enregistrée avec succès !`);
            handleCloseModal();
        } catch (error) {
            console.error("Erreur sauvegarde pub:", error);
            alert("Erreur lors de la sauvegarde. Vérifiez votre connexion ou la taille de l'image.");
            setIsSaving(false);
        }
    };
    
    const handleDeleteAd = async (slot: number) => {
        if (window.confirm(`Vider l'emplacement N°${slot} ?`)) {
            try {
                await actions.deleteAd(`ad_slot_${slot}`);
                alert("Emplacement vidé.");
            } catch (error) {
                console.error(error);
                alert("Erreur lors de la suppression");
            }
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-bold">Gestion des 10 Pages Publicitaires</h3>
                <p className="text-gray-400 text-sm mt-1">Ces 10 emplacements s'affichent en boucle dans la bande passante de l'application.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {slots.map(slot => {
                    const ad = getAdForSlot(slot);
                    const isFilled = !!ad;

                    return (
                        <div key={slot} className={`relative rounded-xl border-2 overflow-hidden transition-all ${isFilled ? 'border-gray-700 bg-gray-800' : 'border-dashed border-gray-700 bg-gray-900/50 flex flex-col items-center justify-center h-48'}`}>
                            <div className="absolute top-0 left-0 bg-yellow-400 text-black font-bold px-2 py-1 text-xs z-10 rounded-br-lg">
                                Page {slot}
                            </div>
                            
                            {isFilled ? (
                                <>
                                    <div className="h-32 w-full">
                                        <img src={getSafeImageUrl(ad.imageUrl)} alt={ad.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm truncate">{ad.name}</h4>
                                        <p className="text-yellow-400 text-xs font-bold">{ad.price}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button onClick={() => handleOpenModal(slot)} className="p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 text-white shadow-sm" title="Modifier">
                                            <PencilIcon className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteAd(slot)} className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 text-white shadow-sm" title="Vider">
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <PhotoIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs font-medium mb-3">Emplacement Libre</p>
                                    <button 
                                        onClick={() => handleOpenModal(slot)} 
                                        className="flex items-center justify-center mx-auto bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full text-xs transition-colors"
                                    >
                                        <PlusIcon className="w-3 h-3 mr-1" />
                                        Ajouter
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && editingAd && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg shadow-2xl">
                        <h4 className="text-lg font-bold mb-4 text-white">Modifier la Page Publicitaire N°{currentSlot}</h4>
                        
                        <div className="space-y-4">
                             <div>
                                <label className="block mb-2 text-xs font-bold text-gray-400 uppercase">Image de la pub</label>
                                <div className="flex items-start gap-4">
                                    {editingAd.imageUrl ? (
                                        <img src={getSafeImageUrl(editingAd.imageUrl)} alt="Aperçu" className="w-24 h-24 object-cover rounded-lg border border-gray-600" />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 border border-gray-600">
                                            <PhotoIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload} 
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-300 cursor-pointer"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-2">Image optimisée automatiquement (max 800px)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-gray-400 uppercase">Nom du produit</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Maillot" 
                                        value={editingAd.name} 
                                        onChange={(e) => setEditingAd({...editingAd, name: e.target.value})} 
                                        className="w-full p-2.5 bg-gray-900 rounded-lg border border-gray-600 text-white text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-gray-400 uppercase">Prix / Promo</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: -20%" 
                                        value={editingAd.price} 
                                        onChange={(e) => setEditingAd({...editingAd, price: e.target.value})} 
                                        className="w-full p-2.5 bg-gray-900 rounded-lg border border-gray-600 text-white text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-400 uppercase">Lien de redirection</label>
                                <input 
                                    type="text" 
                                    placeholder="https://..." 
                                    value={editingAd.url} 
                                    onChange={(e) => setEditingAd({...editingAd, url: e.target.value})} 
                                    className="w-full p-2.5 bg-gray-900 rounded-lg border border-gray-600 text-white text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                            <button 
                                type="button"
                                onClick={handleCloseModal} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button 
                                type="button"
                                onClick={handleSaveAd} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
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
