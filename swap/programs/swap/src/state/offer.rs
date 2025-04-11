use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] // this macro exposes a property that returns the size needed to create this account on chain
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub token_b_wanted_amount: u64,
    pub bump: u8 // the bump ensures that the PDA does not collide with an existing account
}