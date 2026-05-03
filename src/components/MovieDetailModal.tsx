import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, Clock, X, Heart, Play, Loader2 } from "lucide-react";
import { Movie, movies, moods, getMovieLanguage } from "@/data/movies";
import { posterMap } from "@/data/posters";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "./StarRating";

interface MovieDetailModalProps {
  movie: Movie | null;
  open: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movieId: number) => void;
  userRating?: number;
  onRate?: (movieId: number, score: number) => void;
}

const MovieDetailModal = ({ movie, open, onClose, onSelectMovie, isInWatchlist, onToggleWatchlist, userRating, onRate }: MovieDetailModalProps) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState<string | null>(null);

  // Reset trailer when movie changes
  useEffect(() => {
    setTrailerKey(null);
    setShowTrailer(false);
    setTrailerError(null);
  }, [movie?.id]);

const fetchTrailer = async () => {

  if (!movie || trailerLoading) return;
  if (trailerKey) { setShowTrailer(true); return; }

  setTrailerLoading(true);
  setTrailerError(null);

  try {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.tmdbId}/videos?api_key=${apiKey}&language=en-US`
    );
    const data = await res.json();

    const trailer = data.results?.find(
      (v: { type: string; site: string; key: string }) =>
        v.type === "Trailer" && v.site === "YouTube"
    );

    if (trailer?.key) {
      setTrailerKey(trailer.key);
      setShowTrailer(true);
    } else {
      setTrailerError("Trailer not found");
    }
  } catch {
    setTrailerError("Failed to load trailer");
  } finally {
    setTrailerLoading(false);
  }
};

  if (!movie) return null;

  const poster = posterMap[movie.id];
  const moodLabels = movie.moods.map(m => moods.find(md => md.id === m)).filter(Boolean);
  const language = getMovieLanguage(movie);

  // Find similar movies (share at least one mood, exclude current)
  const similar = movies
    .filter(m => m.id !== movie.id && m.moods.some(mood => movie.moods.includes(mood)))
    .slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border max-h-[90vh] overflow-y-auto">
        {/* Hero */}
        <div className="relative h-72 sm:h-96">
          {showTrailer && trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${movie.title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : poster ? (
            <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-background" />
          )}
          {!showTrailer && (
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          )}

          {/* Play trailer button overlay */}
          {!showTrailer && (
            <button
              onClick={fetchTrailer}
              disabled={trailerLoading}
              className="absolute inset-0 flex items-center justify-center group/play z-10"
              aria-label="Play trailer"
            >
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-primary transition-all shadow-lg">
                {trailerLoading ? (
                  <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
                ) : (
                  <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                )}
              </span>
            </button>
          )}

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {onToggleWatchlist && movie && (
              <button
                onClick={() => onToggleWatchlist(movie.id)}
                className="p-2 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
              >
                <Heart className={`w-5 h-5 transition-colors ${isInWatchlist ? 'fill-primary text-primary' : 'text-foreground'}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
<div className={`px-6 pb-6 relative z-10 space-y-5 ${showTrailer ? 'mt-4' : '-mt-20'}`}>
          <div>
            <h2 className="font-display text-4xl sm:text-5xl tracking-wide text-foreground">
              {movie.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                {movie.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {movie.duration}
              </span>
              <span>{movie.year}</span>
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">
                {language}
              </span>
            </div>
          </div>

          {trailerError && (
            <p className="text-xs text-destructive">{trailerError}</p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map(g => (
              <span key={g} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                {g}
              </span>
            ))}
          </div>

          {/* Moods */}
          <div className="flex flex-wrap gap-2">
            {moodLabels.map(m => m && (
              <span key={m.id} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                {m.label}
              </span>
            ))}
          </div>

          {/* Your Rating */}
          {onRate && movie && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Your Rating:</span>
              <StarRating rating={userRating ?? 0} onRate={(s) => onRate(movie.id, s)} size="md" />
            </div>
          )}

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{movie.description}</p>

          {/* Similar Movies */}
          {similar.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-2xl tracking-wide text-foreground">Similar Movies</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {similar.map(m => (
                  <button
                    key={m.id}
                    onClick={() => onSelectMovie(m)}
                    className="group/sim rounded-md overflow-hidden hover:ring-2 ring-primary transition-all"
                  >
                    <div className="aspect-[2/3] relative">
                      {posterMap[m.id] ? (
                        <img src={posterMap[m.id]} alt={m.title} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/sim:opacity-100 transition-opacity flex items-end p-1">
                        <span className="text-[10px] text-foreground font-medium leading-tight">{m.title}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailModal;
