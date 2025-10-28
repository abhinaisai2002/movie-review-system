use anchor_lang::prelude::*;
use anchor_spl::token_interface::{MintTo, mint_to, transfer_checked, TransferChecked};

use crate::{
    ADMIN_PUBKEY, CreateMovie, CreateReview, DeleteMovieReview, UpdateReview, WithdrawTokens, errors::MovieReviewSystemError
};

pub fn create_movie_handler(
    _ctx: Context<CreateMovie>,
    movie: String,
    director: String,
    hero: String,
    release_year: u16,
) -> Result<()> {
    let movie_account = &mut _ctx.accounts.movie_account;
    let _user = &_ctx.accounts.user;

    if _user.key() != Pubkey::from_str_const(ADMIN_PUBKEY) {
        return Err(MovieReviewSystemError::InvalidUserToCreateMovie.into());
    }

    movie_account.movie = movie;
    movie_account.director = director;
    movie_account.hero = hero;
    movie_account.release_year = release_year;
    movie_account.bump = _ctx.bumps.movie_account;

    Ok(())
}

pub fn create_review_handler(
    _ctx: Context<CreateReview>,
    movie_rating: u8,
    review_comment: String,
    reviewer_name: String,
) -> Result<()> {
    // Implementation for creating a review goes here

    let movie_review_pda = &_ctx.accounts.movie_review.to_account_info();
    let movie_review = &mut _ctx.accounts.movie_review;

    if movie_review_pda.lamports() == 0 || movie_review_pda.data_is_empty() {
        return Err(MovieReviewSystemError::MovieReviewAccountAlreadyExists.into());
    }

    if review_comment.len() > 200 {
        return Err(MovieReviewSystemError::ReviewCommentTooLong.into());
    }
    if reviewer_name.len() > 50 {
        return Err(MovieReviewSystemError::ReviewerNameTooLong.into());
    }
    if movie_rating < 1 || movie_rating > 10 {
        return Err(MovieReviewSystemError::InvalidMovieRating.into());
    }

    movie_review.movie_rating = movie_rating;
    movie_review.review_comment = review_comment;
    movie_review.reviewer_name = reviewer_name;
    movie_review.movie_address = _ctx.accounts.movie_account.key();
    movie_review.bump = _ctx.bumps.movie_review;
    movie_review.reviewer = _ctx.accounts.user.key();

    let token_amount = 5000_00_000; // 5000 AST with 6 decimals

    let clock = Clock::get()?;

    if &_ctx.accounts.user_vault.is_initialized == &false {
        let user_vault = &mut _ctx.accounts.user_vault;
        user_vault.bump = _ctx.bumps.user_vault;
        user_vault.user = _ctx.accounts.user.key();
        user_vault.balance = 0;
        user_vault.is_initialized = true;
        user_vault.last_withdraw_timestamp = clock.unix_timestamp;
        user_vault.withdrawable_amount = 0;
    }

    let mint_authority_seeds: &[&[u8]] = &[b"mint_auth", &[_ctx.bumps.mint_auth]];


    mint_to(
        CpiContext::new_with_signer(
            _ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: _ctx.accounts.ast_mint.to_account_info(),
                to: _ctx.accounts.ast_token_ata.to_account_info(),
                authority: _ctx.accounts.mint_auth.to_account_info(),
            },
            &[mint_authority_seeds],
        ),
        token_amount,
    )?;

    if clock.unix_timestamp.checked_sub(_ctx.accounts.user_vault.last_withdraw_timestamp).unwrap() >= 300 {
        _ctx.accounts.user_vault.withdrawable_amount = _ctx.accounts.user_vault.withdrawable_amount.checked_add(_ctx.accounts.user_vault.balance).unwrap();
        _ctx.accounts.user_vault.balance = 0;
        _ctx.accounts.user_vault.last_withdraw_timestamp = clock.unix_timestamp;
    }
    _ctx.accounts.user_vault.balance = _ctx.accounts.user_vault.balance.checked_add(token_amount).unwrap();

    Ok(())
}

pub fn update_review_handler(
    _ctx: Context<UpdateReview>,
    movie_rating: u8,
    review_comment: String,
    reviewer_name: String,
) -> Result<()> {
    let movie_review_pda = &_ctx.accounts.movie_review.to_account_info();

    if movie_review_pda.lamports() == 0 || movie_review_pda.data_is_empty() {
        return Err(MovieReviewSystemError::MovieReviewAccountAlreadyExists.into());
    }

    if review_comment.len() > 200 {
        return Err(MovieReviewSystemError::ReviewCommentTooLong.into());
    }
    if reviewer_name.len() > 50 {
        return Err(MovieReviewSystemError::ReviewerNameTooLong.into());
    }
    if movie_rating < 1 || movie_rating > 10 {
        return Err(MovieReviewSystemError::InvalidMovieRating.into());
    }

    if &_ctx.accounts.movie_review.movie_address.key() != &_ctx.accounts.movie_account.key() {
        return Err(MovieReviewSystemError::UnauthorizedReviewUpdate.into());
    }

    let movie_review = &mut _ctx.accounts.movie_review;

    movie_review.movie_rating = movie_rating;
    movie_review.review_comment = review_comment;
    movie_review.reviewer_name = reviewer_name;

    Ok(())
}

pub fn delete_movie_review_handler(_ctx: Context<DeleteMovieReview>) -> Result<()> {
    msg!(
        "Deleting movie review account: {}",
        _ctx.accounts.movie_review.key()
    );
    Ok(())
}

pub fn withdraw_tokens_handler(_ctx: Context<WithdrawTokens>) -> Result<()> {
    let clock = Clock::get()?;
    
    // take a clone before mutable borrow
    let user_vault_info = _ctx.accounts.user_vault.to_account_info();

    let user_vault = &mut _ctx.accounts.user_vault;
    let user_ata = &_ctx.accounts.user_ata;

    if clock.unix_timestamp.saturating_sub(user_vault.last_withdraw_timestamp) >= 300 {
        let new_withdrawable = user_vault
            .withdrawable_amount
            .checked_add(user_vault.balance)
            .unwrap();

        user_vault.withdrawable_amount = new_withdrawable;
        user_vault.balance = 0;
    }

    let amount = user_vault.withdrawable_amount;
    if amount == 0 {
        return Err(MovieReviewSystemError::CoolingPeriodNotPassed.into());
    }

    let binding = _ctx.accounts.user.key();
    let user_vault_seeds: &[&[u8]] = &[
        b"user_vault",
        binding.as_ref(),
        &[user_vault.bump],
    ];

    transfer_checked(
        CpiContext::new_with_signer(
            _ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: _ctx.accounts.ast_token_ata.to_account_info(),
                to: user_ata.to_account_info(),
                authority: user_vault_info, // ✅ cloned earlier
                mint: _ctx.accounts.ast_mint.to_account_info(),
            },
            &[&user_vault_seeds[..]],
        ),
        amount,
        9,
    )?;

    user_vault.withdrawable_amount = 0;
    user_vault.last_withdraw_timestamp = clock.unix_timestamp;

    Ok(())
}
