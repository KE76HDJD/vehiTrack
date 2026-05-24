import asyncio
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from backend.common.app.config import settings

async def verify_db():
    print(f"Connecting to DB: {settings.DATABASE_URL}...")
    engine = create_async_engine(settings.DATABASE_URL)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            row = result.fetchone()
            print(f"DB Connected! Postgres Version: {row[0]}")
            return True
    except Exception as e:
        print(f"DB Connection Failed: {e}")
        return False
    finally:
        await engine.dispose()

async def verify_redis():
    print(f"Connecting to Redis: {settings.REDIS_URL}...")
    try:
        r = redis.from_url(settings.REDIS_URL)
        ping = await r.ping()
        print(f"Redis Connected! Ping: {ping}")
        await r.close()
        return True
    except Exception as e:
        print(f"Redis Connection Failed: {e}")
        return False

async def main():
    db_ok = await verify_db()
    redis_ok = await verify_redis()
    
    if db_ok and redis_ok:
        print("All connections verified successfully!")
    else:
        print("Infrastructure verification failed. check the logs above.")

if __name__ == "__main__":
    asyncio.run(main())
