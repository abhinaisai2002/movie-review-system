use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::*,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

pub mod state;
use crate::state::{MovieAccount, MovieReview, UserVault};

pub mod errors;

pub mod handlers;
use crate::handlers::{create_movie_handler, create_review_handler, update_review_handler, delete_movie_review_handler};

declare_id!("3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy");

const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

const ADMIN_PUBKEY: &str = "EH6KP8sVYg793JEW5EwoELRh1at3sDbPj9RebhFnUR5R";

#[program]
pub mod movie_review_system {

    use super::*;

    pub fn create_movie(
        _ctx: Context<CreateMovie>,
        movie: String,
        director: String,
        hero: String,
        release_year: u16,
    ) -> Result<()> {
        return create_movie_handler(_ctx, movie, director, hero, release_year);
    }

    pub fn create_review(
        _ctx: Context<CreateReview>,
        movie_rating: u8,
        review_comment: String,
        reviewer_name: String,
    ) -> Result<()> {
        return create_review_handler(_ctx, movie_rating, review_comment, reviewer_name);
    }

    pub fn update_review(
        _ctx: Context<UpdateReview>,
        movie_rating: u8,
        review_comment: String,
        reviewer_name: String,
    ) -> Result<()> {
        return update_review_handler(_ctx, movie_rating, review_comment, reviewer_name);
    }

    pub fn delete_movie_review(_ctx: Context<DeleteMovieReview>) -> Result<()> {
        return delete_movie_review_handler(_ctx);
    }

}

#[derive(Accounts)]
#[instruction(movie: String)]
pub struct CreateMovie<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + MovieAccount::INIT_SPACE + movie.len(),
        seeds = [b"movie", movie.as_bytes()],
        bump
    )]
    pub movie_account: Account<'info, MovieAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateReview<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"movie", movie_account.movie.as_bytes()],
        bump = movie_account.bump,
    )]
    pub movie_account: Account<'info, MovieAccount>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + MovieReview::INIT_SPACE,
        seeds = [b"review", movie_account.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub movie_review: Account<'info, state::MovieReview>,

    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"user_vault", user.key().as_ref()],
        bump,
        space = ANCHOR_DISCRIMINATOR_SIZE + UserVault::INIT_SPACE,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = ast_mint,
        associated_token::authority = user_vault,
        associated_token::token_program = token_program,
    )]
    pub ast_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = ast_mint.mint_authority.unwrap() == mint_auth.key() @ errors::MovieReviewSystemError::InvalidMintAuthority
    )]
    pub ast_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        seeds = [b"mint_auth"],
        bump
    )]
    /// CHECK: PDA authority for minting
    pub mint_auth: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct UpdateReview<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"movie", movie_account.movie.as_bytes()],
        bump = movie_account.bump,
    )]
    pub movie_account: Account<'info, MovieAccount>,

    #[account(
        mut,
        seeds = [b"review", movie_account.key().as_ref(), user.key().as_ref()],
        bump = movie_review.bump,
    )]
    pub movie_review: Account<'info, MovieReview>,
}

#[derive(Accounts)]
pub struct DeleteMovieReview<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"review", movie_account.key().as_ref(), user.key().as_ref()],
        bump = movie_review.bump,
        close = user,
    )]
    pub movie_review: Account<'info, MovieReview>,

    #[account(
        seeds = [b"movie", movie_account.movie.as_bytes()],
        bump = movie_account.bump,
    )]
    pub movie_account: Account<'info, MovieAccount>,
}
