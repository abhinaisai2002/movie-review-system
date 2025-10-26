'use client'

import { useState } from "react";
import { useMovieProgram } from "../movie-review-system/movie-data-access"
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Film, Star, Calendar, User, Eye } from "lucide-react";
import { MovieList } from "../movie-review-system/movie-list-ui";
import { ReviewForm } from "../movie-review-system/review-form-ui";

type TabType = 'overview' | 'write-review' | 'view-all-movies' | 'my-reviews';

export function DashboardFeature() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [preselectedMovie, setPreselectedMovie] = useState<string | undefined>(undefined);
  const {
    accounts,
    reviews,
    myReviews,
    createReview
  } = useMovieProgram();

  if(accounts.isLoading || reviews.isLoading || myReviews.isLoading){
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }  

  const movies = accounts.data || [];
  const allReviews = reviews.data || [];
  const userReviews = myReviews.data || [];
  const totalMovies = movies.length;
  const totalReviews = allReviews.length;
  
  // Calculate average rating from all reviews
  const averageRating = allReviews.length > 0 
    ? allReviews.reduce((sum: number, review: { account: { movieRating: number } }) => sum + review.account.movieRating, 0) / allReviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovies}</div>
            <p className="text-xs text-muted-foreground">
              Movies in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Reviews submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 10 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovies}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          variant={activeTab === 'write-review' ? 'default' : 'outline'} 
          className="flex items-center gap-2"
          onClick={() => setActiveTab('write-review')}
        >
          <Star className="h-4 w-4" />
          Write Review
        </Button>
        <Button 
          variant={activeTab === 'view-all-movies' ? 'default' : 'outline'} 
          className="flex items-center gap-2"
          onClick={() => setActiveTab('view-all-movies')}
        >
          <Eye className="h-4 w-4" />
          View All Movies
        </Button>
        <Button 
          variant={activeTab === 'my-reviews' ? 'default' : 'outline'} 
          className="flex items-center gap-2"
          onClick={() => setActiveTab('my-reviews')}
        >
          <Star className="h-4 w-4" />
          My Reviews
        </Button>
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'} 
          className="flex items-center gap-2"
          onClick={() => setActiveTab('overview')}
        >
          <Film className="h-4 w-4" />
          Overview
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Recent Movies Section */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Movies</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {movies.slice(0, 6).map((movie) => {
                const movieData = movie.account;
                // Find reviews for this specific movie
                const movieReviews = allReviews.filter((review: { account: { movieAddress: { toString: () => string } } }) => 
                  review.account.movieAddress.toString() === movie.publicKey.toString()
                );
                const avgRating = movieReviews.length > 0 
                  ? movieReviews.reduce((sum: number, review: { account: { movieRating: number } }) => sum + review.account.movieRating, 0) / movieReviews.length 
                  : 0;

                return (
                  <Card key={movie.publicKey.toString()} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg line-clamp-2">{movieData.movie}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {movieData.releaseYear}
                          </CardDescription>
                        </div>
                        {avgRating > 0 && (
                          <span className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">Director:</span>
                          <span className="line-clamp-1">{movieData.director}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          <span className="font-medium">Hero:</span>
                          <span className="line-clamp-1">{movieData.hero}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {movieReviews.length} review{movieReviews.length !== 1 ? 's' : ''}
                        </span>
                        <Button variant="outline" size="sm" className="h-8">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          {movies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of your movie collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalMovies}</div>
                    <div className="text-sm text-muted-foreground">Total Movies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalReviews}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'view-all-movies' && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">All Movies</h2>
          <MovieList movies={movies} isLoading={accounts.isLoading} />
        </div>
      )}

      {activeTab === 'write-review' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Write Review</h2>
            <ReviewForm 
              onCreateReview={(data) => createReview.mutate(data)}
              isLoading={createReview.isPending}
              movies={movies}
              preselectedMovie={preselectedMovie}
              onPreselectedMovieChange={setPreselectedMovie}
            />
          </div>
          
          {movies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Film className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Movies Available</h3>
                <p className="text-muted-foreground text-center">
                  There are no movies in the system yet. Add a movie first before writing reviews.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Available Movies</CardTitle>
                <CardDescription>
                  Select a movie from the list above to write a review, or use the &quot;Write Review&quot; button to open the review form.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {movies.map((movie) => {
                    const movieData = movie.account;
                    // Find reviews for this specific movie
                    const movieReviews = allReviews.filter((review: { account: { movieAddress: { toString: () => string } } }) => 
                      review.account.movieAddress.toString() === movie.publicKey.toString()
                    );
                    const avgRating = movieReviews.length > 0 
                      ? movieReviews.reduce((sum: number, review: { account: { movieRating: number } }) => sum + review.account.movieRating, 0) / movieReviews.length 
                      : 0;

                    return (
                      <Card key={movie.publicKey.toString()} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg line-clamp-2">{movieData.movie}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {movieData.releaseYear}
                              </CardDescription>
                            </div>
                            {avgRating > 0 && (
                              <span className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {avgRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span className="font-medium">Director:</span>
                              <span className="line-clamp-1">{movieData.director}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              <span className="font-medium">Hero:</span>
                              <span className="line-clamp-1">{movieData.hero}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {movieReviews.length} review{movieReviews.length !== 1 ? 's' : ''}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => {
                                setPreselectedMovie(movieData.movie);
                              }}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'my-reviews' && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">My Reviews</h2>
          {userReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground text-center">
                  You haven&apos;t written any reviews yet. Start by reviewing a movie!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userReviews.map((review) => {
                const reviewData = review.account;
                // Find the movie for this review
                const movie = movies.find(m => m.publicKey.toString() === reviewData.movieAddress.toString());
                const movieData = movie?.account;

                return (
                  <Card key={review.publicKey.toString()} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {movieData?.movie || 'Unknown Movie'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {movieData?.releaseYear || 'N/A'}
                          </CardDescription>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {reviewData.movieRating}/10
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">Director:</span>
                          <span className="line-clamp-1">{movieData?.director || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          <span className="font-medium">Hero:</span>
                          <span className="line-clamp-1">{movieData?.hero || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Your Review:</div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {reviewData.reviewComment || 'No review text provided'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
