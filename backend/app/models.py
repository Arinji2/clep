from pydantic import BaseModel
from typing import List, Optional

class CreateClipboardRequest(BaseModel):
    code: Optional[str] = ""

class CreateClipboardSuccess(BaseModel):
    success: bool = True
    code: str
    owner_token: str

class CreateClipboardCollision(BaseModel):
    success: bool = False
    collision: bool = True
    suggestions: List[str]

class UpdateClipboardRequest(BaseModel):
    code: str
    content: str
    owner_token: str

class ClipboardResponse(BaseModel):
    code: str
    content: str
    created_at: str
    expires_at: str

class CheckCodeResponse(BaseModel):
    available: bool
    suggestions: List[str]

class RandomCodeResponse(BaseModel):
    code: str

class IpResponse(BaseModel):
    ip: str
