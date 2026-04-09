import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json

async def check_data():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["stocktraq"]
    
    print("Checking master_db_v2...")
    doc = await db.master_db_v2.find_one()
    if doc:
        # Convert ObjectId to string for printing
        doc['_id'] = str(doc['_id'])
        print(json.dumps(doc, indent=2))
    else:
        print("No records found in master_db_v2")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_data())
