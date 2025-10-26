use anchor_lang::prelude::*;

use crate::{
    errors::MovieReviewSystemError, CreateMovie, CreateReview, DeleteMovieReview, UpdateReview, ADMIN_PUBKEY
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
        msg!("Deleting movie review account: {}", _ctx.accounts.movie_review.key());
        Ok(())
    }