import random
import string
import aiosqlite

CHARACTERS = string.ascii_lowercase + string.digits  # 'abcdefghijklmnopqrstuvwxyz0123456789'

def random_char() -> str:
    return random.choice(CHARACTERS)

def generate_suggestion(input_code: str) -> str:
    extra = 1
    if len(input_code) == 1:
        if random.random() > 0.7:
            extra = 2
    else:
        extra = random.randint(1, 2)

    suffix = "".join(random_char() for _ in range(extra))
    return input_code + suffix

async def check_exists(db: aiosqlite.Connection, code: str, network_hash: str) -> bool:
    async with db.execute(
        """
        SELECT COUNT(*) FROM clipboards 
        WHERE code = ? AND network_hash = ? AND expires_at > CURRENT_TIMESTAMP
        """,
        (code, network_hash)
    ) as cursor:
        row = await cursor.fetchone()
        return row[0] > 0 if row else False

async def generate_suggestions(db: aiosqlite.Connection, input_code: str, network_hash: str) -> list[str]:
    suggestions = []
    seen = set()

    while len(suggestions) < 4:
        s = generate_suggestion(input_code)
        if s in seen:
            continue
        seen.add(s)

        if not await check_exists(db, s, network_hash):
            suggestions.append(s)

    return suggestions

async def generate_random_slug(db: aiosqlite.Connection, network_hash: str) -> str:
    while True:
        slug = "".join(random_char() for _ in range(2))
        if not await check_exists(db, slug, network_hash):
            return slug
