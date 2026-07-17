import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "zkCAP API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/zkcap")
    
    # GitHub Webhook
    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "super_secret_webhook_key")
    GITHUB_API_TOKEN: str = os.getenv("GITHUB_API_TOKEN", "")
    
    # Phala Network TEE
    PHALA_TEE_ENDPOINT: str = os.getenv("PHALA_TEE_ENDPOINT", "http://localhost:9090/invoke")
    TEE_CALLBACK_BASE_URL: str = os.getenv("TEE_CALLBACK_BASE_URL", "http://localhost:8000")
    TEE_EVALUATION_TIMEOUT: int = int(os.getenv("TEE_EVALUATION_TIMEOUT", "120"))
    
    # Solana Blockchain
    SOLANA_PROGRAM_ID: str = os.getenv("SOLANA_PROGRAM_ID", "ZkCAPxyz123...placeholder")
    SOLANA_RPC_ENDPOINT: str = os.getenv("SOLANA_RPC_ENDPOINT", "https://api.devnet.solana.com")
    SOLANA_OPERATOR_KEYPAIR_PATH: str = os.getenv("SOLANA_OPERATOR_KEYPAIR_PATH", "~/.solana/id.json")
    ENABLE_SOLANA_ANCHORING: bool = os.getenv("ENABLE_SOLANA_ANCHORING", "False").lower() == "true"
    
    # zkTLS / Reclaim Protocol
    RECLAIM_API_KEY: str = os.getenv("RECLAIM_API_KEY", "")
    ENABLE_ZKTLS_PROOFS: bool = os.getenv("ENABLE_ZKTLS_PROOFS", "False").lower() == "true"

    # GitHub OAuth (Device Flow)
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # JWT Authentication
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 72

    class Config:
        env_file = ".env"

settings = Settings()
