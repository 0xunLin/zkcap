# Blockchain anchoring logic
def anchor_to_chain(merkle_root: str) -> str:
    return f"tx_mock_{merkle_root[:10]}"
