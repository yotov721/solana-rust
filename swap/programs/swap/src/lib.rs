pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BHeDCXvv3fWWrNZDEHthvY13tjXVwGGMDtJqfPwkWcBD");

#[program]
pub mod swap { // defines all the instruction handlers
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64
    ) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?; // ? makes the function fail if error is thrown

        instructions::make_offer::save_offer(context, id, token_b_wanted_amount)
    }

    pub fn take_offer(
        context: Context<TakeOffer>
    ) -> Result<()> {
        instructions::take_offer::send_wanted_tokens_to_maker(&context)?;
        instructions::take_offer::withdraw_and_close_vault(&context)
    }
}
