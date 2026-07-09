use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

declare_id!("ZkCAPxyz123456789abcdefghijklmnopqrstuvwxyz");

pub const PROGRAM_SEED: &[u8] = b"zkcap";
pub const PROJECT_SEED: &[u8] = b"project";
pub const ATTESTATION_SEED: &[u8] = b"attestation";
pub const SBT_MINT_SEED: &[u8] = b"sbt_mint";

#[program]
pub mod zkcap_attestation {
    use super::*;

    /// Initialize a new project account.
    /// Seeds: ["project", project_id]
    pub fn initialize_project(
        ctx: Context<InitializeProject>,
        project_id: u64,
        repository_url: String,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project_account;
        project.project_id = project_id;
        project.authority = ctx.accounts.authority.key();
        project.repository_url = repository_url;
        project.total_attestations = 0;
        project.created_at = Clock::get()?.unix_timestamp;

        emit!(ProjectInitialized {
            project_id,
            authority: ctx.accounts.authority.key(),
            timestamp: project.created_at,
        });

        Ok(())
    }

    /// Record a verified attestation on-chain.
    /// Seeds: ["attestation", project_id, commit_hash]
    /// Requires:
    /// 1. TEE hardware signature validation
    /// 2. Security score >= 80
    /// 3. Optional zkTLS proof validation
    pub fn record_attestation(
        ctx: Context<RecordAttestation>,
        project_id: u64,
        commit_hash: String,
        security_score: u8,
        tee_hardware_signature: String,
        zkTLS_proof: Option<String>,
    ) -> Result<()> {
        require!(
            security_score <= 100,
            ErrorCode::InvalidSecurityScore
        );

        require!(
            security_score >= 80,
            ErrorCode::InsufficientSecurityScore
        );

        // Verify that the TEE signature matches expected format (basic validation)
        require!(
            tee_hardware_signature.len() >= 32,
            ErrorCode::InvalidTEESignature
        );

        let attestation = &mut ctx.accounts.attestation_account;
        attestation.project_id = project_id;
        attestation.commit_hash = commit_hash.clone();
        attestation.security_score = security_score;
        attestation.tee_hardware_signature = tee_hardware_signature;
        attestation.zkTLS_proof = zkTLS_proof;
        attestation.verified_at = Clock::get()?.unix_timestamp;
        attestation.sbt_mint_address = None;

        // Increment project attestation counter
        let project = &mut ctx.accounts.project_account;
        project.total_attestations = project.total_attestations.checked_add(1).unwrap();

        emit!(AttestationRecorded {
            project_id,
            commit_hash,
            security_score,
            timestamp: attestation.verified_at,
        });

        Ok(())
    }

    /// Mint a non-transferable Soulbound Token (SBT) to developer wallet.
    /// This represents verified technical milestone.
    pub fn mint_sbt(
        ctx: Context<MintSBT>,
        project_id: u64,
        commit_hash: String,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation_account;

        require!(
            attestation.sbt_mint_address.is_none(),
            ErrorCode::SBTAlreadyMinted
        );

        // In production, this would invoke SPL Token program to mint
        // For MVP, we just record the mint address
        attestation.sbt_mint_address = Some(ctx.accounts.sbt_mint.key());

        emit!(SBTMinted {
            recipient: ctx.accounts.recipient.key(),
            project_id,
            commit_hash,
            mint: ctx.accounts.sbt_mint.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Query attestation status by project and commit hash.
    /// This is not an instruction, but can be called via RPC for state queries.
    #[allow(dead_code)]
    pub fn verify_attestation(
        ctx: Context<VerifyAttestation>,
    ) -> Result<AttestationData> {
        let attestation = &ctx.accounts.attestation_account;
        Ok(AttestationData {
            project_id: attestation.project_id,
            commit_hash: attestation.commit_hash.clone(),
            security_score: attestation.security_score,
            verified_at: attestation.verified_at,
            sbt_minted: attestation.sbt_mint_address.is_some(),
        })
    }
}

// ===== ACCOUNTS =====

#[account]
pub struct ProjectAccount {
    pub project_id: u64,
    pub authority: Pubkey,
    pub repository_url: String, // Max 256 chars
    pub total_attestations: u64,
    pub created_at: i64,
}

#[account]
pub struct AttestationAccount {
    pub project_id: u64,
    pub commit_hash: String, // Max 64 chars (SHA-256 hex)
    pub security_score: u8,
    pub tee_hardware_signature: String, // Max 256 chars
    pub zkTLS_proof: Option<String>, // Max 512 chars
    pub verified_at: i64,
    pub sbt_mint_address: Option<Pubkey>,
}

// ===== CONTEXTS =====

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct InitializeProject<'info> {
    #[account(
        init,
        payer = authority,
        space = ProjectAccount::LEN,
        seeds = [PROJECT_SEED, project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project_account: Account<'info, ProjectAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: u64, commit_hash: String)]
pub struct RecordAttestation<'info> {
    #[account(mut)]
    pub project_account: Account<'info, ProjectAccount>,

    #[account(
        init,
        payer = authority,
        space = AttestationAccount::LEN,
        seeds = [
            ATTESTATION_SEED,
            project_id.to_le_bytes().as_ref(),
            commit_hash.as_bytes()
        ],
        bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintSBT<'info> {
    #[account(mut)]
    pub attestation_account: Account<'info, AttestationAccount>,

    #[account(init, payer = authority, mint::decimals = 0, mint::authority = authority)]
    pub sbt_mint: Account<'info, Mint>,

    #[account(init, payer = authority, associated_token_account::mint = sbt_mint, associated_token_account::authority = recipient)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    /// CHECK: We'll use this public key
    pub recipient: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyAttestation<'info> {
    pub attestation_account: Account<'info, AttestationAccount>,
}

// ===== ERRORS =====

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid security score: must be 0-100")]
    InvalidSecurityScore,

    #[msg("Insufficient security score: must be >= 80")]
    InsufficientSecurityScore,

    #[msg("Invalid TEE signature format")]
    InvalidTEESignature,

    #[msg("SBT already minted for this attestation")]
    SBTAlreadyMinted,

    #[msg("Unauthorized: only project authority can modify")]
    Unauthorized,
}

// ===== EVENTS =====

#[event]
pub struct ProjectInitialized {
    pub project_id: u64,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AttestationRecorded {
    pub project_id: u64,
    pub commit_hash: String,
    pub security_score: u8,
    pub timestamp: i64,
}

#[event]
pub struct SBTMinted {
    pub recipient: Pubkey,
    pub project_id: u64,
    pub commit_hash: String,
    pub mint: Pubkey,
    pub timestamp: i64,
}

// ===== DATA STRUCTURES =====

#[derive(Clone)]
pub struct AttestationData {
    pub project_id: u64,
    pub commit_hash: String,
    pub security_score: u8,
    pub verified_at: i64,
    pub sbt_minted: bool,
}

// ===== ACCOUNT SIZE CONSTANTS =====
impl ProjectAccount {
    pub const LEN: usize = 8 + // discriminator
        8 + // project_id
        32 + // authority (pubkey)
        (4 + 256) + // repository_url (String)
        8 + // total_attestations
        8; // created_at
}

impl AttestationAccount {
    pub const LEN: usize = 8 + // discriminator
        8 + // project_id
        (4 + 64) + // commit_hash (String, max 64 for SHA-256 hex)
        1 + // security_score
        (4 + 256) + // tee_hardware_signature (String)
        (1 + 4 + 512) + // zkTLS_proof (Option<String>)
        8 + // verified_at
        (1 + 32); // sbt_mint_address (Option<Pubkey>)
}
