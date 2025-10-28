
use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct MovieAccount {
    pub release_year: u16,
    pub bump: u8,

    #[max_len(100)]
    pub movie: String,
    #[max_len(100)]
    pub director: String,
    #[max_len(100)]
    pub hero: String,

}

#[derive(InitSpace)]
#[account]
pub struct MovieReview {
    #[max_len(35)]
    pub movie_rating: u8,
    #[max_len(35)]
    pub movie_address: Pubkey,
    #[max_len(200)]
    pub review_comment: String,
    #[max_len(50)]
    pub reviewer_name: String,

    pub bump: u8,
    pub reviewer: Pubkey,
}

#[derive(InitSpace)]
#[account]
pub struct UserVault {
    pub bump: u8,
    pub user: Pubkey,
    pub balance: u64,
    pub is_initialized: bool,
    pub last_withdraw_timestamp: i64,
    pub withdrawable_amount: u64,
}