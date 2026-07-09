# Worker evaluation logic
def evaluate_commit(commit_hash: str) -> dict:
    return {"status": "evaluated", "hash": commit_hash}
