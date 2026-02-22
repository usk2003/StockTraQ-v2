import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient

async def check_fields():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["stocktraq"]
    
    doc = await db.master_db.find_one()
    if doc:
        # Convert ObjectId to string
        doc['_id'] = str(doc['_id'])
        with open('master_db_sample.json', 'w') as f:
            json.dump(doc, f, indent=2)
        print("Wrote master_db_sample.json")
    else:
        print("No document found in master_db")

if __name__ == "__main__":
    asyncio.run(check_fields())
