'use client';

import { useState, useCallback } from 'react';

export function useSaveState() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async (fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, saved, save };
}

interface SaveButtonProps {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function SaveButton({ saving, saved, onClick, disabled, className }: SaveButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={saving || disabled}
        className={className ?? 'px-5 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50'}
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
      {saved && <span className="text-sm text-green-600">Guardado</span>}
    </div>
  );
}
