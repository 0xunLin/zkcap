from fastapi import APIRouter

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/github")
async def github_webhook():
    return { "message": "recieved"}