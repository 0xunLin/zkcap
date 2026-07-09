# Merkle tree generation logic
def generate_merkle_root(commit_hashes: list[str]) -> str:
    import hashlib
    combined = "".join(commit_hashes)
    return hashlib.sha256(combined.encode()).hexdigest()
