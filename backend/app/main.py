import asyncio
import secrets
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.models import IpResponse

from app.db import get_db, run_migrations, cleanup_expired_clipboards_loop
from app.middleware import NetworkMiddleware
from app.models import (
    CreateClipboardRequest,
    CreateClipboardSuccess,
    CreateClipboardCollision,
    ClipboardResponse,
    CheckCodeResponse,
    RandomCodeResponse,
    UpdateClipboardRequest,
)
from app.services import check_exists, generate_suggestions, generate_random_slug

@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_migrations()
    cleanup_task = asyncio.create_task(cleanup_expired_clipboards_loop())
    yield
    cleanup_task.cancel()

app = FastAPI(title="CLEP Backend API", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Network Middleware
app.add_middleware(NetworkMiddleware)

@app.get("/health")
async def health_check():
    try:
        db = await get_db()
        try:
            await db.execute("SELECT 1")
            return {"status": "healthy", "database": "connected"}
        finally:
            await db.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

@app.get("/api/ip", response_model=IpResponse)
async def get_ip(request: Request):
    return IpResponse(ip=getattr(request.state, "client_ip", "Unknown Network"))

@app.post("/api/create", response_model=CreateClipboardSuccess)
async def create_clipboard(req: CreateClipboardRequest, request: Request):
    network_hash = request.state.network_hash
    code = req.code.strip().lower() if req.code else ""
    db = await get_db()

    try:
        if not code:
            code = await generate_random_slug(db, network_hash)

        if await check_exists(db, code, network_hash):
            suggestions = await generate_suggestions(db, code, network_hash)
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content=CreateClipboardCollision(
                    success=False,
                    collision=True,
                    suggestions=suggestions
                ).model_dump()
            )

        # Generate a secure random token for the room creator
        owner_token = secrets.token_urlsafe(32)

        await db.execute(
            """
            INSERT INTO clipboards (code, network_hash, owner_token, content, expires_at)
            VALUES (?, ?, ?, '', datetime('now', '+24 hours'))
            """,
            (code, network_hash, owner_token)
        )
        await db.commit()

        return CreateClipboardSuccess(success=True, code=code, owner_token=owner_token)
    finally:
        await db.close()


@app.get("/api/clipboard/{code}", response_model=ClipboardResponse)
async def get_clipboard(code: str, request: Request):
    network_hash = request.state.network_hash
    clean_code = code.strip().lower()
    db = await get_db()

    try:
        async with db.execute(
            """
            SELECT code, content, created_at, expires_at 
            FROM clipboards 
            WHERE code = ? AND network_hash = ? AND expires_at > CURRENT_TIMESTAMP
            """,
            (clean_code, network_hash)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Clipboard not found or expired"
                )

            return ClipboardResponse(
                code=row["code"],
                content=row["content"],
                created_at=str(row["created_at"]),
                expires_at=str(row["expires_at"])
            )
    finally:
        await db.close()

@app.get("/api/check", response_model=CheckCodeResponse)
async def check_code(request: Request, code: str = Query(..., min_length=1)):
    network_hash = request.state.network_hash
    clean_code = code.strip().lower()
    db = await get_db()

    try:
        exists = await check_exists(db, clean_code, network_hash)
        suggestions = []
        if exists:
            suggestions = await generate_suggestions(db, clean_code, network_hash)

        return CheckCodeResponse(available=not exists, suggestions=suggestions)
    finally:
        await db.close()

@app.get("/api/random", response_model=RandomCodeResponse)
async def get_random_code(request: Request):
    network_hash = request.state.network_hash
    db = await get_db()
    try:
        code = await generate_random_slug(db, network_hash)
        return RandomCodeResponse(code=code)
    finally:
        await db.close()


@app.post("/api/update")
async def update_clipboard(req: UpdateClipboardRequest, request: Request):
    network_hash = request.state.network_hash
    clean_code = req.code.strip().lower()
    db = await get_db()

    try:
        # Require the owner_token to match to perform the update
        async with db.execute(
            """
            UPDATE clipboards 
            SET content = ? 
            WHERE code = ? AND network_hash = ? AND owner_token = ? AND expires_at > CURRENT_TIMESTAMP
            """,
            (req.content, clean_code, network_hash, req.owner_token)
        ) as cursor:
            await db.commit()
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Unauthorized, room not found, or expired"
                )
            return {"success": True, "message": "Clipboard updated"}
    finally:
        await db.close()
