"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export function PhotoUpload({ photos, onChange, maxPhotos = 3 }: {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(photos);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = maxPhotos - previews.length;

    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPreviews((prev) => {
          const next = [...prev, dataUrl];
          onChange(next);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onChange(next);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-2">Fotos ({previews.length}/{maxPhotos})</label>
      <div className="grid grid-cols-3 gap-2">
        {previews.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-2 group">
            <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 33vw, 150px" />
            <button onClick={() => remove(i)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
              ✕
            </button>
          </div>
        ))}
        {previews.length < maxPhotos && (
          <button onClick={() => inputRef.current?.click()}
            type="button" aria-label="Adicionar foto"
            className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-text-3 hover:text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="text-[10px]">Adicionar</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}
