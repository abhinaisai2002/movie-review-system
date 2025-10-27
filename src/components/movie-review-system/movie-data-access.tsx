'use client'

import { getMovieReviewSystemProgramId, getMovieReviewSystemProgram  } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'


const astMint = new PublicKey("8Jv5UC3tUGXSe1MpPBJpdLAbeniWkP18M3cyYirLZ9Nt");
const astMintAuth = new PublicKey("B74kXBibuxZLajBUknuFgMWxxdNeUYUR5Wh4YmAMB1a8");


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

  const createReview = useMutation({
    mutationKey: ['review', 'create', { cluster }],
    mutationFn: (input: { movieName: string; movieRating: number; reviewComment: string; reviewerName: string }) => {
      // Find the movie account by name
      const movieAccount = accounts.data?.find(movie => movie.account.movie === input.movieName);
      if (!movieAccount) {
        throw new Error('Movie not found');
      }
      
      const userVaultPDA = PublicKey.findProgramAddressSync([Buffer.from('user_vault'), provider.wallet!.publicKey!.toBuffer()], programId)[0];
      const astTokenAta = getAssociatedTokenAddressSync(astMint, userVaultPDA, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

      return program
        .methods
        .createReview(input.movieRating, input.reviewComment, input.reviewerName)
        .accounts({
          user: provider.wallet!.publicKey!,
          astMint: astMint,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          // @ts-expect-error asxsa
          movieAccount: movieAccount.publicKey,
          mintAuth: astMintAuth,
          astTokenAta: astTokenAta,
          userVault: userVaultPDA,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        }).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await reviews.refetch()
      await myReviews.refetch()
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to create review')
    },
  })

  const updateReview = useMutation({
    mutationKey: ['review', 'update', { cluster }],
    mutationFn: (input: { reviewPublicKey: string; movieRating: number; reviewComment: string; reviewerName: string }) => {
      // Find the review account
      const reviewAccount = myReviews.data?.find(review => review.publicKey.toString() === input.reviewPublicKey);
      if (!reviewAccount) {
        throw new Error('Review not found');
      }
      
      // Find the movie account
      const movieAccount = accounts.data?.find(movie => 
        movie.publicKey.toString() === reviewAccount.account.movieAddress.toString()
      );
      if (!movieAccount) {
        throw new Error('Movie not found');
      }
      
      return program
        .methods
        .updateReview(input.movieRating, input.reviewComment, input.reviewerName)
        .accounts({
          user: provider.wallet!.publicKey!,
          movieAccount: movieAccount.publicKey,
          movieReview: new PublicKey(input.reviewPublicKey),
        } as Record<string, unknown>).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await reviews.refetch()
      await myReviews.refetch()
    },
    onError: (error) => {
      toast.error('Failed to update review')
    },
  })

  const deleteReview = useMutation({
    mutationKey: ['review', 'delete', { cluster }],
    mutationFn: (input: { reviewPublicKey: string }) => {
      // Find the review account
      const reviewAccount = myReviews.data?.find(review => review.publicKey.toString() === input.reviewPublicKey);
      if (!reviewAccount) {
        throw new Error('Review not found');
      }
      
      // Find the movie account
      const movieAccount = accounts.data?.find(movie => 
        movie.publicKey.toString() === reviewAccount.account.movieAddress.toString()
      );
      if (!movieAccount) {
        throw new Error('Movie not found');
      }
      
      return program
        .methods
        .deleteMovieReview()
        .accounts({
          user: provider.wallet!.publicKey!,
          movieAccount: movieAccount.publicKey,
          movieReview: new PublicKey(input.reviewPublicKey),
        } as Record<string, unknown>).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await reviews.refetch()
      await myReviews.refetch()
    },
    onError: () => {
      toast.error('Failed to delete review')
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
    createReview,
    updateReview,
    deleteReview
  }
}

export function useMovieProgramAccountt({ account }: { account: PublicKey }) {
  return {
    account
  }
}
