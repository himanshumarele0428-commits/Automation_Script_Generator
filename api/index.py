# This file is required for Vercel Python serverless functions
# It points to the backend FastAPI app
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.main import app
