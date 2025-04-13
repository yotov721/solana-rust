use anchor_lang::prelude::*;

declare_id!("6ZhfnambHxuUe9N3N7gRgvwmaBpdxkZgy3aYq5vhMP52");

#[program]
pub mod program_b {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from program B");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    pub pda_account: Signer<'info>,
}
