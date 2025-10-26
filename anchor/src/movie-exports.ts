// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import MovieReviewSystemIDL from '../target/idl/movie_review_system.json'
import type { MovieReviewSystem } from '../target/types/movie_review_system'

// Re-export the generated IDL and type
export { MovieReviewSystem, MovieReviewSystemIDL }

// The programId is imported from the program IDL.
export const MOVIE_REVIEW_SYSTEM_PROGRAM_ID = new PublicKey(MovieReviewSystemIDL.address)

// This is a helper function to get the MovieReviewSystem Anchor program.
export function getMovieReviewSystemProgram(provider: AnchorProvider, address?: PublicKey): Program<MovieReviewSystem> {
  return new Program({ ...MovieReviewSystemIDL, address: address ? address.toBase58() : MovieReviewSystemIDL.address } as MovieReviewSystem, provider)
}

// This is a helper function to get the program ID for the MovieReviewSystem program depending on the cluster.
export function getMovieReviewSystemProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the MovieReviewSystem program on devnet and testnet.
      return new PublicKey('3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy')
    case 'mainnet-beta':
    default:
      return MOVIE_REVIEW_SYSTEM_PROGRAM_ID
  }
}
