import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

async def migrate_new_data():
    # Use the same connection string as database.py
    # Fallback to localhost if not specified
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["stocktraq"]
    
    collection_name = "master_db_v2"
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "IPO_MasterBase_new.csv")
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    print(f"Reading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Basic cleaning
    # Replace NaN with None for MongoDB compatibility
    df = df.where(pd.notnull(df), None)
    
    # Convert dataframe to dictionary records
    records = df.to_dict("records")
    
    print(f"Migrating {len(records)} records to {collection_name}...")
    
    # Drop existing if any (user said 'rather than overwriting on it' 
    # but usually for migration we drop the target collection first to ensure a clean state 
    # of THAT specific versioned collection. If they meant 'dont overwrite master_db', 
    # then using 'master_db_v2' satisfies this.)
    await db[collection_name].drop()
    if records:
        await db[collection_name].insert_many(records)
    
    print(f"Successfully migrated {len(records)} records to collection '{collection_name}'")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_new_data())
