'use client'

import { useMovieProgram } from '@/components/movie-review-system/movie-data-access'
import { MovieForm } from '@/components/movie-review-system/movie-form-ui'
import { LatestMovie, MovieList } from '@/components/movie-review-system/movie-list-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Film } from 'lucide-react'
import React from 'react'

export default function Page() {
    const { accounts, initializeMovie } = useMovieProgram()

    const movies = accounts.data
    const isLoading = accounts.isLoading

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Movie Management</h1>
                    <p className="text-muted-foreground">
                        Manage your movie collection and reviews
                    </p>
                </div>
                <MovieForm 
                    onInitialize={initializeMovie.mutate} 
                    isLoading={initializeMovie.isPending}
                />
            </div>

            {/* Latest Movie Section */}
            <LatestMovie movies={movies} isLoading={isLoading} />

            {/* All Movies Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Film className="h-5 w-5" />
                        All Movies ({movies?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MovieList movies={movies} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    )
}
