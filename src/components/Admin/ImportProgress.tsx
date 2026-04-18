/**
 * ImportProgress.tsx - Composant de progression d'import en temps réel
 * 
 * Affiche une barre de progression avec statut et messages.
 * Se connecte via WebSocket pour les mises à jour en temps réel.
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Progress } from '../../progress';
import { CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';

export interface ImportProgressData {
  jobId: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  processedItems?: number;
  totalItems?: number;
  errors?: string[];
  timestamp?: number;
}

export interface ImportProgressProps {
  jobId?: string;
  progress?: number;
  status?: string;
  message?: string;
  token?: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ImportProgress({ 
  jobId, 
  progress: initialProgress = 0, 
  status: initialStatus = 'pending',
  message: initialMessage = 'En attente...',
  token,
  onComplete,
  onError 
}: ImportProgressProps) {
  const [data, setData] = useState<ImportProgressData>({
    jobId: jobId || '',
    progress: initialProgress,
    status: initialStatus as any,
    message: initialMessage,
    processedItems: 0,
    totalItems: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connexion WebSocket
  useEffect(() => {
    if (!jobId || !token) return;

    const socket = io(API_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connecté');
      setIsConnected(true);
      
      // Authentification
      socket.emit('auth', token);
      
      // S'abonner aux mises à jour de cet import
      socket.emit('subscribe-import', jobId);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket déconnecté');
      setIsConnected(false);
    });

    socket.on('auth-success', () => {
      console.log('✅ Authentifié WebSocket');
    });

    socket.on('auth-error', (err) => {
      console.error('❌ Erreur auth WebSocket:', err);
    });

    // Écouter les mises à jour de progression
    socket.on('import-progress', (update: ImportProgressData) => {
      if (update.jobId === jobId) {
        setData(prev => ({
          ...prev,
          ...update,
          timestamp: Date.now(),
        }));

        // Callbacks
        if (update.status === 'completed' && onComplete) {
          onComplete(update);
        } else if (update.status === 'error' && onError) {
          onError(update.message);
        }
      }
    });

    socket.on('subscribed', (info) => {
      console.log('📡 Abonné:', info);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('unsubscribe-import', jobId);
        socket.disconnect();
      }
    };
  }, [jobId, token, onComplete, onError]);

  // Ping/Pong pour maintenir la connexion
  useEffect(() => {
    if (!socketRef.current || !isConnected) return;

    const interval = setInterval(() => {
      socketRef.current?.emit('ping');
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Calcul du pourcentage d'affichage
  const displayProgress = Math.min(100, Math.max(0, data.progress));
  
  // Couleur selon le statut
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Icône selon le statut
  const StatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Download className="w-5 h-5 text-gray-400" />;
    }
  };

  // Affichage des erreurs
  const hasErrors = data.errors && data.errors.length > 0;

  return (
    <div className="w-full">
      {/* Header avec statut */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon />
          <span className="font-medium text-gray-700">
            {data.status === 'completed' ? 'Import terminé' :
             data.status === 'error' ? 'Erreur' :
             data.status === 'running' ? 'Import en cours...' :
             'En attente'}
          </span>
          {isConnected && (
            <span className="text-xs text-green-500">● Live</span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {displayProgress}%
        </span>
      </div>

      {/* Barre de progression */}
      <div className="relative">
        <Progress 
          value={displayProgress} 
          className="h-3"
        />
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Message et détails */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">{data.message}</span>
        {data.processedItems !== undefined && data.totalItems !== undefined && data.totalItems > 0 && (
          <span className="text-gray-500">
            {data.processedItems} / {data.totalItems}
          </span>
        )}
      </div>

      {/* Liste des erreurs */}
      {hasErrors && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-700 mb-2">
            Erreurs ({data.errors?.length}):
          </p>
          <ul className="text-xs text-red-600 space-y-1 max-h-24 overflow-y-auto">
            {data.errors?.slice(0, 5).map((err, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{err}</span>
              </li>
            ))}
            {(data.errors?.length || 0) > 5 && (
              <li className="text-red-500 italic">
                ...et {data.errors!.length - 5} autres erreurs
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Timestamp de dernière mise à jour */}
      {data.timestamp && (
        <p className="text-xs text-gray-400 mt-2">
          Dernière mise à jour: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

/**
 * Hook personnalisé pour gérer la progression d'import
 */
export function useImportProgress(jobId?: string, token?: string) {
  const [progress, setProgress] = useState<ImportProgressData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jobId || !token) return;

    const socket = io(API_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('auth', token);
      socket.emit('subscribe-import', jobId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('import-progress', (update: ImportProgressData) => {
      if (update.jobId === jobId) {
        setProgress(update);
      }
    });

    return () => {
      socket.emit('unsubscribe-import', jobId);
      socket.disconnect();
    };
  }, [jobId, token]);

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return { progress, isConnected, disconnect };
}
