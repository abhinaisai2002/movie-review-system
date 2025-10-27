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
} from '@/components/ui/sheet'
import { Star, Edit } from 'lucide-react'
import React, { useState, useEffect } from 'react'

interface EditReviewFormProps {
  onUpdateReview: (data: {
    reviewPublicKey: string
    movieRating: number
    reviewComment: string
    reviewerName: string
  }) => void
  onDeleteReview: (data: { reviewPublicKey: string }) => void
  isLoading: boolean
  isDeleting: boolean
  review: {
    publicKey: { toString: () => string }
    account: {
      movieRating: number
      reviewComment: string
      reviewerName: string
      movieAddress: { toString: () => string }
    }
  }
  movie: {
    account: {
      movie: string
      director: string
      hero: string
      releaseYear: number
    }
  }
  isOpen: boolean
  onClose: () => void
}

export function EditReviewForm({ 
  onUpdateReview, 
  onDeleteReview, 
  isLoading, 
  isDeleting,
  review, 
  movie, 
  isOpen, 
  onClose 
}: EditReviewFormProps) {
  const [formData, setFormData] = useState({
    movieRating: 5,
    reviewComment: '',
    reviewerName: '',
  })

  // Initialize form data when review changes
  useEffect(() => {
    if (review) {
      setFormData({
        movieRating: review.account.movieRating,
        reviewComment: review.account.reviewComment,
        reviewerName: review.account.reviewerName,
      })
    }
  }, [review])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.reviewComment && formData.reviewerName) {
      onUpdateReview({
        reviewPublicKey: review.publicKey.toString(),
        movieRating: formData.movieRating,
        reviewComment: formData.reviewComment,
        reviewerName: formData.reviewerName,
      })
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      onDeleteReview({
        reviewPublicKey: review.publicKey.toString(),
      })
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Movie Review
          </SheetTitle>
          <SheetDescription>
            Update your review for {movie.account.movie} ({movie.account.releaseYear})
          </SheetDescription>
        </SheetHeader>
        <div className="px-3">
          <form onSubmit={handleSubmit} className="space-y-3 py-3">
            <div className="space-y-4">
              {/* Movie Info Display */}
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">{movie.account.movie}</div>
                <div className="text-xs text-muted-foreground">
                  <div><strong>Director:</strong> {movie.account.director}</div>
                  <div><strong>Hero:</strong> {movie.account.hero}</div>
                  <div><strong>Year:</strong> {movie.account.releaseYear}</div>
                </div>
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

        <SheetFooter className="flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete Review'
              )}
            </Button>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isDeleting || !formData.reviewComment || !formData.reviewerName}
            className="w-full flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating Review...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Update Review
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
