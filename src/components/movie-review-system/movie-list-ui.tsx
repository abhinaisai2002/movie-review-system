'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Film, Calendar, User, Star } from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import React from 'react'

interface Movie {
  publicKey: PublicKey
  account: {
    movie: string
    director: string
    hero: string
    releaseYear: number
    bump: number
  }
}

interface MovieListProps {
  movies: Movie[] | undefined
  isLoading: boolean
}

export function MovieList({ movies, isLoading }: MovieListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Film className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No movies found</h3>
          <p className="text-muted-foreground text-center">
            No movies have been added to the system yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <Card key={movie.publicKey.toString()} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">{movie.account.movie}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {movie.account.releaseYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">Director:</span>
                <span className="line-clamp-1">{movie.account.director}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span className="font-medium">Hero:</span>
                <span className="line-clamp-1">{movie.account.hero}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Released:</span>
                <span>{movie.account.releaseYear}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function LatestMovie({ movies, isLoading }: MovieListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Latest Movie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No movies available yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Get the latest movie (assuming they're ordered by creation time)
  const latestMovie = movies[0]

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Latest Movie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">{latestMovie.account.movie}</h3>
            <Badge variant="default" className="mt-1">
              {latestMovie.account.releaseYear}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Director:</span>
              <span>{latestMovie.account.director}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Hero:</span>
              <span>{latestMovie.account.hero}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
