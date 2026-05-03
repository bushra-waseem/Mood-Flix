import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Film ,Sparkles, Search, X, Heart, TrendingUp } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import MovieRow from "@/components/MovieRow";
import MovieDetailModal from "@/components/MovieDetailModal";
import MovieCard from "@/components/MovieCard";
import { movies, moods, Mood, Movie, LANGUAGES, Language, getMovieLanguage } from "@/data/movies";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useRatings } from "@/hooks/use-ratings";

// Curated trending picks (high-rated fan favorites)
const TRENDING_IDS = [5, 9, 12, 18, 24, 30, 35, 42, 1, 7];

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | "all">("all");
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const { watchlist, toggle, isInWatchlist } = useWatchlist();
  const { rate, getRating, ratedMovieIds } = useRatings();

  // Apply language filter to any movie list
  const byLanguage = (list: Movie[]) =>
    selectedLanguage === "all" ? list : list.filter((m) => getMovieLanguage(m) === selectedLanguage);

  const filteredMovies = useMemo(() => {
    if (!selectedMood) return [];
    return byLanguage(movies.filter((m) => m.moods.includes(selectedMood)));
  }, [selectedMood, selectedLanguage]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return byLanguage(
      movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, selectedLanguage]);

  const watchlistMovies = useMemo(
    () => byLanguage(movies.filter((m) => watchlist.includes(m.id))),
    [watchlist, selectedLanguage]
  );

  const trendingMovies = useMemo(
    () => byLanguage(TRENDING_IDS.map((id) => movies.find((m) => m.id === id)).filter(Boolean) as Movie[]),
    [selectedLanguage]
  );

  // Personalized recommendations based on rated movies' moods
  const recommendedMovies = useMemo(() => {
    if (ratedMovieIds.length === 0) return [];
    const ratedMovies = movies.filter((m) => ratedMovieIds.includes(m.id));
    const highRated = ratedMovies.filter((m) => (getRating(m.id) ?? 0) >= 4);
    if (highRated.length === 0) return [];

    const moodCounts: Record<string, number> = {};
    highRated.forEach((m) => m.moods.forEach((mood) => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }));

    const topMoods = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood);

    return movies
      .filter((m) => !ratedMovieIds.includes(m.id) && m.moods.some((mood) => topMoods.includes(mood)))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);
  }, [ratedMovieIds, getRating]);

  const isSearching = searchQuery.trim().length > 0;
  const selectedMoodData = moods.find((m) => m.id === selectedMood);

  const genreGroups = useMemo(() => {
    const map = new Map<string, typeof filteredMovies>();
    filteredMovies.forEach((movie) => {
      movie.genres.forEach((g) => {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(movie);
      });
    });
    return Array.from(map.entries()).filter(([, m]) => m.length >= 2);
  }, [filteredMovies]);

  const commonProps = {
    isInWatchlist,
    onToggleWatchlist: toggle,
    userRating: undefined as number | undefined,
    onRate: (movieId: number, score: number) => rate(movieId, score),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Film className="w-7 h-7 text-primary" />
            <span className="font-display text-2xl tracking-wider text-gradient-primary">
              MOODFLIX
            </span>
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-full bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

</div>
      </header>

      {isSearching ? (
        <section className="py-10 px-4 sm:px-8">
<div className="w-full space-y-6">
            <h2 className="font-display text-3xl tracking-wide text-foreground">
              Search Results ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} onClick={setDetailMovie} isInWatchlist={isInWatchlist(movie.id)} onToggleWatchlist={toggle} userRating={getRating(movie.id)} onRate={rate} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No movies found for "{searchQuery}"</p>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Hero */}
          <section className="py-12 sm:py-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 space-y-3"
            >
              <h1 className="font-display text-5xl sm:text-7xl tracking-wider text-foreground">
                HOW ARE YOU <span className="text-gradient-primary">FEELING</span>?
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select your current mood and we'll recommend the perfect movies for you.
              </p>
            </motion.div>
            <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />
          </section>

          {/* Trending Now */}
<section className="pb-10">
            <div className="w-full">
  <div className="flex items-center gap-2 mb-1 px-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-display text-3xl tracking-wide text-foreground">Trending Now</h2>
              </div>
<div className="px-4">
  <MovieRow title="" movies={trendingMovies} onMovieClick={setDetailMovie} {...commonProps} />
</div>            </div>
          </section>

          {/* Personalized Recommendations */}
          {recommendedMovies.length > 0 && (
<section className="pb-10">
             <div className="w-full">
  <div className="flex items-center gap-2 mb-1 px-4">
    <Sparkles className="w-5 h-5 text-primary" />
    <h2 className="font-display text-3xl tracking-wide text-foreground">Recommended For You</h2>
                </div>
<div className="px-4">
  <MovieRow title="" movies={recommendedMovies} onMovieClick={setDetailMovie} {...commonProps} />
</div>              </div>
            </section>
          )}

          {/* Watchlist */}
          {watchlistMovies.length > 0 && (
<section className="pb-10">
              <div className="w-full">
  <div className="flex items-center gap-2 mb-1 px-4">
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="font-display text-3xl tracking-wide text-foreground">My Watchlist</h2>
                  <span className="text-sm text-muted-foreground">({watchlistMovies.length})</span>
                </div>
<div className="px-4">
  <MovieRow title="" movies={watchlistMovies} onMovieClick={setDetailMovie} {...commonProps} />
</div>              </div>
            </section>
          )}

          {/* Mood Results */}
          <AnimatePresence mode="wait">
            {selectedMood && (
              <motion.section
                key={selectedMood}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
className="pb-20 space-y-10"
              >
<div className="flex items-center gap-3 px-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-3xl tracking-wide text-foreground">
                    {selectedMoodData?.label} Picks
                  </h2>
                  <span className="text-sm text-muted-foreground">({filteredMovies.length} movies)</span>
                </div>

<div className="w-full px-4">
                  <MovieRow title="Top Picks For You" movies={filteredMovies} onMovieClick={setDetailMovie} {...commonProps} />
                </div>

<div className="w-full space-y-8 px-4">
                  {genreGroups.map(([genre, genreMovies]) => (
                    <MovieRow key={genre} title={genre} movies={genreMovies} onMovieClick={setDetailMovie} {...commonProps} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </>
      )}

      <MovieDetailModal
        movie={detailMovie}
        open={!!detailMovie}
        onClose={() => setDetailMovie(null)}
        onSelectMovie={setDetailMovie}
        isInWatchlist={detailMovie ? isInWatchlist(detailMovie.id) : false}
        onToggleWatchlist={toggle}
        userRating={detailMovie ? getRating(detailMovie.id) : 0}
        onRate={rate}
      />

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">MOODFLIX — Your mood, your movie.</p>
      </footer>
    </div>
  );
};

export default Index;
