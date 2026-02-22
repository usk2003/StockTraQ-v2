import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Add the current directory to sys.path to import ipo_constants
sys.path.append(os.path.join(os.getcwd(), '..', 'utils'))
try:
    from ipo_constants import ONGOING_IPOS_2026, CLOSED_IPOS_2026
except ImportError:
    ONGOING_IPOS_2026 = []
    CLOSED_IPOS_2026 = []

async def migrate_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["stocktraq"]

    # 1. Migrate Master DB (CSV)
    csv_path = "../data/IPO_MasterDB.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        # Convert df to records
        records = df.to_dict("records")
        await db.master_db.drop()
        await db.master_db.insert_many(records)
        print(f"Migrated {len(records)} records to master_db")

    # 2. Migrate Ongoing IPOs
    if ONGOING_IPOS_2026:
        await db.ongoing_ipos.drop()
        await db.ongoing_ipos.insert_many(ONGOING_IPOS_2026)
        print(f"Migrated {len(ONGOING_IPOS_2026)} records to ongoing_ipos")

    # 3. Migrate Closed IPOs
    if CLOSED_IPOS_2026:
        await db.closed_ipos.drop()
        await db.closed_ipos.insert_many(CLOSED_IPOS_2026)
        print(f"Migrated {len(CLOSED_IPOS_2026)} records to closed_ipos")

    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data())
