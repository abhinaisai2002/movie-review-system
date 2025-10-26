'use client'

import { getMovieReviewSystemProgramId, getMovieReviewSystemProgram  } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useMovieProgram () {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getMovieReviewSystemProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getMovieReviewSystemProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['movies', 'all', { cluster }],
    queryFn: () => program.account.movieAccount.all()
  })

  const reviews = useQuery({
    queryKey: ['reviews', 'all', { cluster }],
    queryFn: () => program.account.movieReview.all()
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeMovie = useMutation({
    mutationKey: ['movie', 'initialize', { cluster }],
    mutationFn: (input: { name: string; director: string; hero: string; releaseYear: number }) =>
      program
        .methods
        .createMovie(input.name, input.director, input.hero, input.releaseYear)
        .accounts({
            user: provider.wallet!.publicKey!,
        }).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize account')
    },
  })

  const myReviews = useQuery({
    queryKey: ['reviews', 'my', { cluster }],
    queryFn: async () => {
      const allReviews = await program.account.movieReview.all()
      return allReviews.filter(review => 
        review.account.reviewer.equals(provider.wallet!.publicKey!)
      )
    }
  })

  console.log('myReviews', myReviews.data);

  const createReview = useMutation({
    mutationKey: ['review', 'create', { cluster }],
    mutationFn: (input: { movieName: string; movieRating: number; reviewComment: string; reviewerName: string }) => {
      // Find the movie account by name
      const movieAccount = accounts.data?.find(movie => movie.account.movie === input.movieName);
      if (!movieAccount) {
        throw new Error('Movie not found');
      }
      
      return program
        .methods
        .createReview(input.movieRating, input.reviewComment, input.reviewerName)
        .accounts({
          user: provider.wallet!.publicKey!,
          movieAccount: movieAccount.publicKey,
        } as Record<string, unknown>).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await reviews.refetch()
      await myReviews.refetch()
    },
    onError: () => {
      toast.error('Failed to create review')
    },
  })

  return {
    program,
    programId,
    accounts,
    reviews,
    getProgramAccount,
    initializeMovie,
    myReviews,
    createReview
  }
}

export function useMovieProgramAccountt({ account }: { account: PublicKey }) {
  return {
    account
  }
}
