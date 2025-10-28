//file: src/app/api/movies/review/route.ts

import { Program } from "@coral-xyz/anchor";
import {
    ActionGetResponse,
    ActionPostRequest,
    ACTIONS_CORS_HEADERS,
    BLOCKCHAIN_IDS,
    createPostResponse,
} from "@solana/actions";

import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
} from "@solana/web3.js";

import { MovieReviewSystemIDL } from "@/../anchor/src/movie-exports";
import { MovieReviewSystem } from "types/movie_review_system";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.devnet;

// Create headers with CAIP blockchain ID
const headers = {
    ...ACTIONS_CORS_HEADERS,
    "x-blockchain-ids": blockchain,
    "x-action-version": "2.4",
};

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
    return new Response(null, { headers });
};

export const GET = async (req: Request) => {

    const url = new URL(req.url);
    const movie = url.searchParams.get("movie");
    const movieName = url.searchParams.get("movieName");
    const movieDirector = url.searchParams.get("movieDirector");
    const movieHero = url.searchParams.get("movieHero");
    const movieReleaseYear = url.searchParams.get("movieReleaseYear");

    if (!movie || !movieName || !movieDirector || !movieHero || !movieReleaseYear) {
        return Response.json({ error: "Missing required parameters" }, { status: 400, headers });
    }

    const response: ActionGetResponse = {
        icon: `https://variety.com/wp-content/uploads/2023/03/Movie-Theater-Film-Cinema-Exhibition-Placeholder.jpg?w=1000&h=562&crop=1`,
        label: `Review ${movieName}`,
        title: "Submit Movie Review",
        description:
            `Share your thoughts about ${movieName} — rate it, add comments, and be part of the community!`,
        links: {
            actions: [
                {
                    type: "transaction",
                    label: "Submit Review",
                    href: `/api/movies/submit-review?movie=${movie}`, // this will be your POST endpoint
                    parameters: [
                        {
                            name: "reviewer_name",
                            label: "Your Name",
                            type: "text",
                            required: true,
                        },
                        {
                            name: "rating",
                            label: "Rating (1–10)",
                            type: "number",
                            min: 1,
                            max: 10,
                            required: true,
                        },
                        {
                            name: "comment",
                            label: "Your Comment",
                            type: "textarea",
                            required: true,
                        },
                    ],
                },
            ],
        },
    };

    return Response.json(response, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            ...headers
        },
    })
};

// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
    try {

        const url = new URL(req.url);
        const movie = url.searchParams.get("movie");


        const astMint = new PublicKey("8Jv5UC3tUGXSe1MpPBJpdLAbeniWkP18M3cyYirLZ9Nt");

        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const program: Program<MovieReviewSystem> = new Program(MovieReviewSystemIDL as unknown as MovieReviewSystem, { connection });

        const body: ActionPostRequest = await req.json();

        const { account } = body;
        const { reviewer_name, rating, comment } = body.data as unknown as { reviewer_name: string, rating: number, comment: string };

        const programId = new PublicKey('3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy')

        const userVaultPDA = PublicKey.findProgramAddressSync([Buffer.from('user_vault'), new PublicKey(account as string).toBuffer()], programId)[0];
        const astTokenAta = getAssociatedTokenAddressSync(astMint, userVaultPDA, true, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

        const [movieReviewPDA] = PublicKey.findProgramAddressSync([
            Buffer.from('review'),
            new PublicKey(movie as string).toBuffer(),
            new PublicKey(account).toBuffer()
        ], programId);

        const [mintAuthPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("mint_auth")],
            program.programId
        );
        const movieReviewInstruction = await program
            .methods
            .createReview(rating, comment, reviewer_name)
            .accounts({
                user: new PublicKey(account as string),
                // @ts-expect-error asxsa
                movieAccount: new PublicKey(movie as string),
                movieReview: movieReviewPDA,
                userVault: userVaultPDA,
                astTokenAta: astTokenAta,
                astMint: astMint,
                mintAuth: mintAuthPDA,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: TOKEN_2022_PROGRAM_ID
            }).instruction();
        const blockhash = await connection.getLatestBlockhash();

        const transaction = new Transaction({
            feePayer: new PublicKey(account as string),
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).add(movieReviewInstruction);

        const response = await createPostResponse({
            fields: {
                transaction: transaction,
                type: "transaction",
            }
        });
        return Response.json(response, { headers: ACTIONS_CORS_HEADERS });

    } catch (error) {
        // Log and return an error response
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers,
        });
    }
};
