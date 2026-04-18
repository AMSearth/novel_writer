from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AuthorBase(BaseModel):
    username: str

class AuthorCreate(AuthorBase):
    password: str

class AuthorResponse(AuthorBase):
    id: int
    
    class Config:
        from_attributes = True

class ChapterBase(BaseModel):
    title: str
    content: str = ""

class ChapterCreate(ChapterBase):
    pass

class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Chapter(ChapterBase):
    id: int
    novel_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class NovelBase(BaseModel):
    title: str
    synopsis: Optional[str] = None

class NovelCreate(NovelBase):
    pass

class NovelUpdate(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None

class Novel(NovelBase):
    id: int
    author_id: int
    created_at: datetime
    chapters: List[Chapter] = []
    
    class Config:
        from_attributes = True

class TextCorrectionRequest(BaseModel):
    text: str
    api_key: Optional[str] = None

class TextCorrectionResponse(BaseModel):
    original_text: str
    corrected_text: str
    suggestions: List[str]
