"""
Phala Network TEE Worker Integration
Handles communication with Trusted Execution Environment for commit evaluation
"""
import httpx
import logging
import json
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class TEEWorkerClient:
    """Client for invoking Phala Network TEE worker"""

    def __init__(self, endpoint_url: str, callback_base_url: str, timeout: int = 60):
        self.endpoint_url = endpoint_url
        self.callback_base_url = callback_base_url
        self.timeout = timeout

    async def invoke_evaluation(
        self,
        commit_id: int,
        commit_hash: str,
        commit_diff: str,
        commit_author: str,
        repository_url: str,
    ) -> str:
        """
        Invoke TEE worker for commit evaluation.
        
        Args:
            commit_id: Database commit ID
            commit_hash: Git commit hash
            commit_diff: Unified diff of the commit
            commit_author: Commit author name
            repository_url: Repository URL for context
            
        Returns:
            invocation_id: Unique ID for tracking this evaluation
            
        Raises:
            HTTPError: If TEE worker is unreachable
            ValueError: If endpoint not configured
        """
        if not self.endpoint_url or self.endpoint_url == "http://localhost:9090/invoke":
            raise ValueError("TEE worker endpoint not configured. Set PHALA_TEE_ENDPOINT env var.")

        callback_url = f"{self.callback_base_url}/api/v1/evaluation/callback"
        
        payload = {
            "commit_id": commit_id,
            "commit_hash": commit_hash,
            "commit_diff": commit_diff,
            "commit_author": commit_author,
            "repository_url": repository_url,
            "callback_url": callback_url,
            "timestamp": datetime.utcnow().isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                result = response.json()
                invocation_id = result.get("invocation_id") or result.get("id")
                logger.info(f"TEE invocation initiated: {invocation_id} for commit {commit_hash}")
                return invocation_id
        except httpx.RequestError as e:
            logger.error(f"TEE worker request failed: {str(e)}")
            raise
        except httpx.HTTPStatusError as e:
            logger.error(f"TEE worker returned error: {e.response.status_code} - {e.response.text}")
            raise
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Failed to parse TEE response: {str(e)}")
            raise ValueError(f"Invalid TEE response format: {str(e)}")


def get_tee_client(
    endpoint_url: str,
    callback_base_url: str,
) -> TEEWorkerClient:
    """Factory function to create TEE client"""
    return TEEWorkerClient(
        endpoint_url=endpoint_url,
        callback_base_url=callback_base_url,
    )
