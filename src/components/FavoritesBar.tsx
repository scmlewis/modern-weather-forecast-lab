import { Star, X } from 'lucide-react';
import type { FavoriteEntry } from '../types/weather';

interface FavoritesBarProps {
  favorites: FavoriteEntry[];
  onSelect: (entry: FavoriteEntry) => void;
  onRemove: (id: string) => void;
}

export function FavoritesBar({ favorites, onSelect, onRemove }: FavoritesBarProps) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center gap-2">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
          Favorites
        </p>
      </div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="group flex flex-shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/30 px-3 py-1.5 transition hover:bg-white/50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <button
              className="text-sm font-semibold text-slate-800 dark:text-white"
              onClick={() => onSelect(favorite)}
              type="button"
            >
              {favorite.name}
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                {favorite.country}
              </span>
            </button>
            <button
              className="ml-1 rounded-full p-0.5 text-slate-400 opacity-0 transition hover:bg-white/30 hover:text-slate-600 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(favorite.id);
              }}
              title={`Remove ${favorite.name} from favorites`}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
