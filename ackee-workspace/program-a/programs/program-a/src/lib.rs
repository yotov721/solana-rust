use anchor_lang::prelude::*;
use program_b::program::ProgramB;

declare_id!("9X1Tp9DqSwtAANKk2vU5qn1okYU3ED4x14jHmqjC1Ghb");

#[program]
pub mod program_a {
    use anchor_lang::{
        accounts::account_info,
        solana_program::{
            program::{invoke, invoke_signed},
            system_instruction,
        },
    };

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from program A");

        let pda_address = ctx.accounts.pda_account.key();
        let signer = ctx.accounts.signer.key();
        let bump = ctx.bumps.pda_account;

        let instruction = &system_instruction::transfer(&pda_address, &signer, 1_000_000_000);

        let account_infos = [
            ctx.accounts.pda_account.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ]; // accounts that will be used in the call

        let signers_seeds: &[&[&[u8]]] = &[&[b"pda", signer.as_ref(), &[bump]]];
        invoke_signed(instruction, &account_infos, signers_seeds)?;

        // invoke(instruction, &account_infos)?;

        // new_with_signer - same as invoke_signed
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.program_b.to_account_info(),
            program_b::cpi::accounts::Initialize{ pda_account: ctx.accounts.pda_account.to_account_info() },
            signers_seeds
        );

        program_b::cpi::initialize(cpi_context)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: pda
    #[account(
        mut,
        seeds = [b"pda", signer.key().as_ref()], // string as bytes, signer key
        bump, // starts from 255 and loops until a bump that generates an account address is not on the curve is found
    )]
    pub pda_account: AccountInfo<'info>, // AccountInfo - general account on solana

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub program_b: Program<'info, ProgramB>,
}
