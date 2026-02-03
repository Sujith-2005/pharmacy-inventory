import sys
import os

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database import engine, Base
from models import *  # Import all models to ensure they are registered

print("Updating database schema...")
Base.metadata.create_all(bind=engine)
print("Database schema updated successfully.")
