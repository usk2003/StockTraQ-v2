import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_fields():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["stocktraq"]
    
    print("--- Master DB Sample Keys ---")
    doc = await db.master_db.find_one()
    if doc:
        for k in doc.keys():
            print(k)
    else:
        print("No document found in master_db")

    print("\n--- Details Sub-keys ---")
    if doc and 'details' in doc:
        for k in doc['details'].keys():
            print(k)

if __name__ == "__main__":
    asyncio.run(check_fields())
