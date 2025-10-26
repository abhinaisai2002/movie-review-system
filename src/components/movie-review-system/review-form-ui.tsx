'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PublicKey } from '@solana/web3.js'
import { Star, Plus } from 'lucide-react'
import React, { useState, useEffect } from 'react'

interface ReviewFormProps {
  onCreateReview: (data: {
    movieName: string
    movieRating: number
    reviewComment: string
    reviewerName: string
  }) => void
  isLoading: boolean
  movies: Array<{
    publicKey: PublicKey
    account: {
      movie: string
      director: string
      hero: string
      releaseYear: number
    }
  }>
  preselectedMovie?: string
  onPreselectedMovieChange?: (movieName: string | undefined) => void
}

export function ReviewForm({ onCreateReview, isLoading, movies, preselectedMovie, onPreselectedMovieChange }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    movieName: '',
    movieRating: 5,
    reviewComment: '',
    reviewerName: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.movieName && formData.reviewComment && formData.reviewerName) {
      onCreateReview({
        movieName: formData.movieName,
        movieRating: formData.movieRating,
        reviewComment: formData.reviewComment,
        reviewerName: formData.reviewerName,
      })
      setFormData({
        movieName: '',
        movieRating: 5,
        reviewComment: '',
        reviewerName: '',
      })
      setIsOpen(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedMovie = movies.find(movie => movie.account.movie === formData.movieName)

  // Handle preselected movie
  useEffect(() => {
    if (preselectedMovie) {
      setFormData(prev => ({
        ...prev,
        movieName: preselectedMovie
      }))
      setIsOpen(true)
    }
  }, [preselectedMovie])

  // Clear preselected movie when sheet closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && onPreselectedMovieChange) {
      onPreselectedMovieChange(undefined)
      setFormData({
        movieName: '',
        movieRating: 5,
        reviewComment: '',
        reviewerName: '',
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Write Review
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Write Movie Review
          </SheetTitle>
          <SheetDescription>
            Share your thoughts about a movie with a rating and review.
          </SheetDescription>
        </SheetHeader>
        <div className="px-3">
          <form onSubmit={handleSubmit} className="space-y-3 py-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="movie-select">Select Movie</Label>
                <select
                  id="movie-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.movieName}
                  onChange={(e) => handleInputChange('movieName', e.target.value)}
                  required
                >
                  <option value="">Choose a movie...</option>
                  {movies.map((movie) => (
                    <option key={movie.publicKey.toString()} value={movie.account.movie}>
                      {movie.account.movie} ({movie.account.releaseYear})
                    </option>
                  ))}
                </select>
                {selectedMovie && (
                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    <div><strong>Director:</strong> {selectedMovie.account.director}</div>
                    <div><strong>Hero:</strong> {selectedMovie.account.hero}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewer-name">Your Name</Label>
                <Input
                  id="reviewer-name"
                  placeholder="Enter your name"
                  value={formData.reviewerName}
                  onChange={(e) => handleInputChange('reviewerName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="movie-rating">Rating (1-10)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="movie-rating"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Enter rating"
                    value={formData.movieRating}
                    onChange={(e) => handleInputChange('movieRating', parseInt(e.target.value) || 5)}
                    required
                    className="w-20"
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < formData.movieRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Review Comment</Label>
                <textarea
                  id="review-comment"
                  placeholder="Write your review here..."
                  value={formData.reviewComment}
                  onChange={(e) => handleInputChange('reviewComment', e.target.value)}
                  required
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="text-xs text-muted-foreground">
                  {formData.reviewComment.length}/200 characters
                </div>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.movieName || !formData.reviewComment || !formData.reviewerName}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating Review...
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
