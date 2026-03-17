import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

async def check_fields():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["stocktraq"]
    
    collections = ["master_db", "ongoing_ipos", "closed_ipos"]
    
    for coll_name in collections:
        print(f"\n=== {coll_name} Sample ===")
        doc = await db[coll_name].find_one()
        if doc:
            print(json.dumps(doc, indent=2, cls=JSONEncoder))
        else:
            print(f"No document found in {coll_name}")

if __name__ == "__main__":
    asyncio.run(check_fields())
