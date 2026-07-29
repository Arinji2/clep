import os
import glob
import asyncio
import logging
import aiosqlite

DB_PATH = "./data/clep.db"
MIGRATIONS_DIR = "./migrations"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clep.db")

async def get_db():
    os.makedirs("./data", exist_ok=True)
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode = WAL;")
    await db.execute("PRAGMA busy_timeout = 5000;")
    return db

async def run_migrations():
    db = await get_db()
    try:
        migration_files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql")))
        for file_path in migration_files:
            with open(file_path, "r", encoding="utf-8") as f:
                sql_script = f.read()
                await db.executescript(sql_script)
                logger.info(f"Executed migration: {os.path.basename(file_path)}")
        await db.commit()
    finally:
        await db.close()

async def cleanup_expired_clipboards_loop():
    """Hourly background task to clean up expired entries."""
    while True:
        try:
            db = await get_db()
            async with db.execute("DELETE FROM clipboards WHERE expires_at < CURRENT_TIMESTAMP") as cursor:
                await db.commit()
                if cursor.rowcount > 0:
                    logger.info(f"Cleaned {cursor.rowcount} expired clipboards")
            await db.close()
        except Exception as e:
            logger.error(f"Error cleaning expired clipboards: {e}")
        
        await asyncio.sleep(3600)  # Wait 1 hour
