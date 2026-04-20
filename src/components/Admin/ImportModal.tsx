/**
 * ImportModal.tsx - Composant modal pour l'import de produits
 * 
 * Permet la sélection de la plateforme (CJ/AliExpress),
 * la recherche de produits et l'import avec configuration.
 */

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Download, RefreshCw, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { ImportProgress } from './ImportProgress';

// Types
export type ImportPlatform = 'cj' | 'aliexpress';

export interface SearchResult {
  productId?: string;
  pid?: string;
  productTitle?: string;
  productNameEn?: string;
  productMainImageUrl?: string;
  productImage?: string;
  salePrice?: string;
  sellPrice?: string;
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
  apiUrl: string;
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function ImportModal({ isOpen, onClose, onImportSuccess, apiUrl, token }: ImportModalProps) {
  // État de la plateforme sélectionnée
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform>('cj');
  
  // État de recherche
  const [keyword, setKeyword] = useState('lingerie');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // État d'import
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{
    jobId?: string;
    progress: number;
    status: string;
    message: string;
  } | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchImporting, setIsBatchImporting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSearchError(null);
      setImportProgress(null);
      setImportedIds(new Set());
      setSelectedIds(new Set());
      setIsBatchImporting(false);
    }
  }, [isOpen]);

  // Gestion du changement de plateforme
  const handlePlatformChange = useCallback((platform: ImportPlatform) => {
    setSelectedPlatform(platform);
    setSearchResults([]);
    setSearchError(null);
    setSelectedIds(new Set());
    if (!keyword.trim()) {
      setKeyword(platform === 'cj' ? 'lingerie' : 'sexy lingerie');
    }
  }, []);

  // Recherche de produits
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedIds(new Set());

    try {
      const response = await fetch(`${apiUrl}/admin/import/${selectedPlatform}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          keyword, 
          page: 1
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const products = data.produits || data.products || [];
        setSearchResults(products);
        if (products.length === 0) {
          setSearchError('Aucun produit trouvé pour cette recherche');
        }
      } else {
        setSearchError(data.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setSearchError('Erreur de connexion au serveur');
    } finally {
      setIsSearching(false);
    }
  }, [keyword, selectedPlatform, apiUrl, token]);

  // Import d'un produit
  const handleImport = useCallback(async (product: SearchResult) => {
    const productId = product.productId || product.pid || '';
    if (!productId || importedIds.has(productId)) return;

    setImportingId(productId);

    try {
      const body = selectedPlatform === 'cj'
        ? { cj_product_id: productId, isAdult: false }
        : { ae_product_id: productId, isAdult: false };

      const response = await fetch(`${apiUrl}/admin/import/${selectedPlatform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setImportedIds(prev => new Set(prev).add(productId));
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        if (response.status === 409) {
          setImportedIds(prev => new Set(prev).add(productId));
        }
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImportingId(null);
    }
  }, [selectedPlatform, apiUrl, token, isAdult, category, importedIds, onImportSuccess]);

  // Import par lot
  const handleBatchImport = useCallback(async () => {
    if (selectedIds.size === 0 || isBatchImporting) return;

    setIsBatchImporting(true);
    setImportProgress({
      progress: 0,
      status: 'running',
      message: `Initialisation de l'import de ${selectedIds.size} produits...`
    });

    try {
      const response = await fetch(`${apiUrl}/admin/import/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          productIds: Array.from(selectedIds),
          options: { isAdult: false }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImportProgress({
          jobId: data.jobId,
          progress: 10,
          status: 'running',
          message: `Import en cours (Job: ${data.jobId})...`
        });
        
        // Simulation de progression simple (le backend fait le travail en arrière-plan)
        // Normalement on utiliserait WebSockets ici, mais on va faire un petit feedback visuel
        let count = 0;
        const total = selectedIds.size;
        
        const interval = setInterval(() => {
          count++;
          const progress = Math.min(90, Math.round((count / total) * 100));
          setImportProgress(prev => prev ? {
            ...prev,
            progress,
            message: `Importation : ${count}/${total} produits envoyés...`
          } : null);
          
          if (count >= total) {
            clearInterval(interval);
            setImportProgress({
              progress: 100,
              status: 'completed',
              message: `✅ Import de ${total} produits terminé avec succès !`
            });
            setIsBatchImporting(false);
            setImportedIds(prev => {
              const next = new Set(prev);
              selectedIds.forEach(id => next.add(id));
              return next;
            });
            setSelectedIds(new Set());
            if (onImportSuccess) onImportSuccess();
          }
        }, 800);
        
      } else {
        setSearchError(data.error || "Erreur lors de l'import par lot");
        setIsBatchImporting(false);
      }
    } catch (err) {
      setSearchError("Erreur de connexion lors de l'import par lot");
      setIsBatchImporting(false);
    }
  }, [selectedIds, isBatchImporting, selectedPlatform, apiUrl, token, isAdult, category, onImportSuccess]);

  const toggleSelectProduct = (productId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === searchResults.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = searchResults.map(p => p.productId || p.pid || '').filter(Boolean);
      setSelectedIds(new Set(allIds));
    }
  };

  // Fermeture avec confirmation si import en cours
  const handleClose = useCallback(() => {
    if (importingId) {
      if (!confirm('Un import est en cours. Voulez-vous vraiment fermer ?')) {
        return;
      }
    }
    onClose();
  }, [importingId, onClose]);

  // Clavier: Enter pour rechercher
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Download className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Importer des produits</h2>
              <p className="text-sm text-gray-500">Recherchez et importez depuis vos fournisseurs</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Sélection de plateforme */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handlePlatformChange('cj')}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedPlatform === 'cj'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="text-3xl mb-2">🏪</div>
              <div className={`font-bold ${selectedPlatform === 'cj' ? 'text-red-600' : 'text-gray-700'}`}>
                CJ Dropshipping
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Livraison rapide • Catalogue vaste
              </div>
            </button>

            <button
              onClick={() => handlePlatformChange('aliexpress')}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedPlatform === 'aliexpress'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <div className="text-3xl mb-2">🛒</div>
              <div className={`font-bold ${selectedPlatform === 'aliexpress' ? 'text-orange-600' : 'text-gray-700'}`}>
                AliExpress
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Prix compétitifs • Millions de produits
              </div>
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: lingerie, body, parfum, bijoux..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !keyword.trim()}
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                selectedPlatform === 'cj'
                  ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                  : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
              } disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isSearching ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </button>
          </div>

          {/* Barre de recherche */}

          {/* Résultats */}
          {searchResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{searchResults.length}</strong> produits trouvés
                </p>
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleSelectAll}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      {selectedIds.size === searchResults.length ? 'Désélectionner tout' : 'Tout sélectionner'}
                    </button>
                    {selectedIds.size > 0 && (
                      <button
                        onClick={handleBatchImport}
                        disabled={isBatchImporting}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isBatchImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Importer la sélection ({selectedIds.size})
                      </button>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-end gap-1">
                  {importedIds.size > 0 && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {importedIds.size} importé(s)
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product, idx) => {
                  const pid = product.productId || product.pid || '';
                  const name = product.productTitle || product.productNameEn || 'Produit';
                  const image = product.productMainImageUrl || product.productImage || '';
                  const price = product.salePrice || product.sellPrice || '0';
                  const isImporting = importingId === pid;
                  const isImported = importedIds.has(pid);

                  return (
                    <div 
                      key={pid || idx} 
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow"
                    >
                      <div className="h-40 bg-gray-100 relative">
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <input 
                            type="checkbox"
                            checked={selectedIds.has(pid)}
                            onChange={() => toggleSelectProduct(pid)}
                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer shadow-sm"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        {isImported && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {name}
                        </p>
                        <p className={`text-lg font-bold mb-3 ${
                          selectedPlatform === 'cj' ? 'text-red-500' : 'text-orange-500'
                        }`}>
                          ${price}
                        </p>
                        
                        <button
                          onClick={() => handleImport(product)}
                          disabled={isImporting || isImported}
                          className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                            isImported
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : selectedPlatform === 'cj'
                                ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
                                : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300'
                          }`}
                        >
                          {isImporting ? (
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Import...
                            </span>
                          ) : isImported ? (
                            '✓ Importé'
                          ) : (
                            '+ Importer'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {searchError && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">{searchError}</p>
            </div>
          )}

          {/* État vide */}
          {!isSearching && searchResults.length === 0 && !searchError && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Recherchez des produits à importer</p>
              <p className="text-sm text-gray-400 mt-1">
                Tapez un mot-clé et cliquez sur Rechercher
              </p>
            </div>
          )}
        </div>

        {/* Footer avec progression */}
        {importProgress && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <ImportProgress 
              progress={importProgress.progress}
              status={importProgress.status}
              message={importProgress.message}
            />
          </div>
        )}
      </div>
    </div>
  );
}
