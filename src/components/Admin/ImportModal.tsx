/**
 * ImportModal.tsx - Composant modal pour l'import de produits
 * 
 * Permet la sélection de la plateforme (CJ/AliExpress),
 * la recherche de produits et l'import avec configuration.
 */

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Download, RefreshCw, CheckCircle, AlertCircle, Package, Tag } from 'lucide-react';
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
  
  // État Saisie Multiple
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  
  // État de filtrage import
  const [selectedCategory, setSelectedCategory] = useState<string>('Lingerie');
  
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
      setIsBulkMode(false);
      setBulkInput('');
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
    
    // Détection d'ID ou URL directe
    const aeIdMatch = keyword.match(/(\d{10,20})/);
    const isDirectId = selectedPlatform === 'aliexpress' && aeIdMatch;

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
          keyword: isDirectId ? aeIdMatch[0] : keyword, 
          page: 1
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let products = data.produits || data.products || [];
        
        // Si c'est une recherche par ID et qu'on n'a rien, on peut tenter un import direct simulé
        if (isDirectId && products.length === 0) {
          products = [{
            productId: aeIdMatch[0],
            productTitle: `Produit ID: ${aeIdMatch[0]} (Cliquez sur Importer)`,
            productMainImageUrl: '/placeholder-ae.jpg',
            salePrice: '---'
          }];
        }
        
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

  // Extraction d'IDs depuis le texte en vrac
  const handleProcessBulk = useCallback(() => {
    // Les IDs CJ peuvent être des UUID (ex: 7E3FEDDA-5BFB-4F59-95A1-0F20B08D1121) ou des nombres longs (ex: 1385106472937066496)
    // Les IDs AE sont généralement des nombres
    const regex = /([a-zA-Z0-9-]{10,40})/g;
    const matches = bulkInput.match(regex) || [];
    const uniqueIds = Array.from(new Set(matches));
    
    if (uniqueIds.length === 0) {
      setSearchError('Aucun ID de produit valide trouvé dans le texte');
      return;
    }

    const mockResults: SearchResult[] = uniqueIds.map(id => ({
      productId: id,
      productTitle: `Produit détecté : ${id}`,
      productMainImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200', // Placeholder médical/soin neutre
      salePrice: '---'
    }));

    setSearchResults(mockResults);
    setSelectedIds(new Set(uniqueIds));
    setSearchError(null);
    setIsBulkMode(false);
  }, [bulkInput]);

  // Import d'un produit
  const handleImport = useCallback(async (product: SearchResult) => {
    const productId = product.productId || product.pid || '';
    if (!productId || importedIds.has(productId)) return;

    setImportingId(productId);

    try {
      const body = {
        [`${selectedPlatform === 'cj' ? 'cj_product_id' : 'product_id'}`]: productId,
        isAdult: false,
        category: selectedCategory
      };

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
  }, [selectedPlatform, apiUrl, token, importedIds, onImportSuccess]);

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
          options: { isAdult: false, category: selectedCategory }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImportProgress({
          jobId: data.jobId,
          progress: 5,
          status: 'running',
          message: `Import démarré en arrière-plan (Job: ${data.jobId}). Veuillez patienter...`
        });
        // La progression réelle sera gérée par le composant <ImportProgress /> via WebSocket
      } else {
        setSearchError(data.error || "Erreur lors de l'import par lot");
        setIsBatchImporting(false);
      }
    } catch (err) {
      setSearchError("Erreur de connexion lors de l'import par lot");
      setIsBatchImporting(false);
    }
  }, [selectedIds, isBatchImporting, selectedPlatform, apiUrl, token, selectedCategory]);

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

          {/* Barre de recherche ou Saisie Multiple */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                {isBulkMode ? 'Saisie multiple (URLs ou IDs)' : 'Recherche par mot-clé ou lien'}
              </label>
              <button 
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  setSearchResults([]);
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 underline"
              >
                {isBulkMode ? 'Retour à la recherche classique' : 'Mode Saisie Multiple (+)'}
              </button>
            </div>

            {isBulkMode ? (
              <div className="space-y-3">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Collez ici vos liens AliExpress ou IDs de produits (un par ligne ou séparés par des virgules)..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
                />
                <button
                  onClick={handleProcessBulk}
                  disabled={!bulkInput.trim()}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:bg-gray-300"
                >
                  Extraire les produits ({ (bulkInput.match(/\d{10,20}/g) || []).length })
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedPlatform === 'aliexpress' 
                      ? "Collez un lien AliExpress ou tapez un mot-clé..." 
                      : "Ex: lingerie, body, parfum, bijoux..."}
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
            )}
          </div>

          {/* Barre de recherche */}

          {/* Options d'importation */}
          <div className="bg-red-50/50 p-4 rounded-xl mb-6 border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Tag className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Destination</p>
                <p className="text-[10px] text-gray-500">Choisir la catégorie cible</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 min-w-[160px]"
              >
                <option value="Lingerie">Lingerie</option>
                <option value="Plaisir Adulte">Plaisir Adulte</option>
                <option value="Soins">Soins</option>
                <option value="Parfums">Parfums</option>
                <option value="Accessoires">Accessoires</option>
                <option value="Bijoux">Bijoux</option>
                <option value="Électronique">Électronique</option>
                <option value="Bien-être">Bien-être</option>
                <option value="Confort">Confort</option>
                <option value="Coffrets">Coffrets</option>
                <option value="Couples">Couples</option>
              </select>
            </div>
          </div>

          {/* Résultats */}
          {searchResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{searchResults.length}</strong> produits trouvés
                </p>
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
              jobId={importProgress.jobId}
              token={token || ''}
              progress={importProgress.progress}
              status={importProgress.status}
              message={importProgress.message}
              onComplete={() => {
                setIsBatchImporting(false);
                setImportedIds(prev => {
                  const next = new Set(prev);
                  selectedIds.forEach(id => next.add(id));
                  return next;
                });
                setSelectedIds(new Set());
                if (onImportSuccess) onImportSuccess();
              }}
              onError={(err) => setSearchError(err)}
            />
          </div>
        )}
      </div>
    </div>
  );
}