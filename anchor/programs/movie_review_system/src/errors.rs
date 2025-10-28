

use anchor_lang::prelude::*;


#[error_code]
pub enum MovieReviewSystemError {
    #[msg("Invalid user to create movie, only admin can create movie")]
    InvalidUserToCreateMovie,
    #[msg("Movie review account already exists")]
    MovieReviewAccountAlreadyExists,
    #[msg("Invalid Movie, Movie does not exist")]
    InvalidMovie,
    #[msg("Review comment is too long")]
    ReviewCommentTooLong,
    #[msg("Reviewer name is too long")]
    ReviewerNameTooLong,
    #[msg("Invalid movie rating, must be between 1 and 10")]
    InvalidMovieRating,
    #[msg("Unauthorized review update attempt")]
    UnauthorizedReviewUpdate,
    #[msg("Invalid mint authority for the AST mint")]
    InvalidMintAuthority,
    #[msg("Cooling period not yet passed for withdrawal")]
    CoolingPeriodNotPassed,
}