import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function AECallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="rounded-[28px] border border-white/8 bg-[#141414] p-10 max-w-xl w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.26em] text-[#FFD700] mb-4">AliExpress OAuth</p>
        {code ? (
          <>
            <p className="text-green-400 font-semibold mb-4">✅ Code reçu ! Copie-le :</p>
            <div className="bg-black/40 rounded-2xl p-4 break-all text-white font-mono text-sm select-all">
              {code}
            </div>
            <p className="mt-4 text-white/50 text-xs">Sélectionne tout et copie ce code</p>
          </>
        ) : (
          <p className="text-red-400">Aucun code reçu</p>
        )}
      </div>
    </div>
  );
}