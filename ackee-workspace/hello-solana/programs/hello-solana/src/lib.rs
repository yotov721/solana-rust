use anchor_lang::prelude::*;

declare_id!("8XtAND5JMUGSruZ1EvTvKAaoiB1WuC25tvMGdTZxUk77");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, hello: String) -> Result<()> { // the initialize instruction expects account of the Initialize context
        msg!("Greetings from: {:?}", ctx.program_id);

        let data_account = &mut ctx.accounts.data_account; // take the data account as a mutable reference
        data_account.hello = hello;

        Ok(())
    }
}

#[derive(Accounts)] // define what accounts the instructions within the program expect
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 200
    )]
    pub data_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct DataAccount {
    pub hello: String,
}