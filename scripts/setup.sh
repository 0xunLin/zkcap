#!/usr/bin/env bash
set -e

echo "Setting up zkCAP..."

# Setup Database
echo "Creating database if not exists..."
createdb zkcap || true

# Setup Backend
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
if [ ! -f .env ]; then
    cp .env.example .env
fi
alembic upgrade head
cd ..

# Setup Frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "Setup complete! Run 'uvicorn main:app --reload' in backend and 'npm run dev' in frontend."
