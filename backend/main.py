from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import language_tool_python
import google.generativeai as genai

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Novel Writer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Settings
SECRET_KEY = "super-secret-key-for-dev"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_author(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    author = db.query(models.Author).filter(models.Author.username == username).first()
    if author is None:
        raise credentials_exception
    return author

@app.post("/api/register", response_model=schemas.AuthorResponse)
def register(author: schemas.AuthorCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Author).filter(models.Author.username == author.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pass = get_password_hash(author.password)
    db_author = models.Author(username=author.username, hashed_password=hashed_pass)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

@app.post("/api/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    author = db.query(models.Author).filter(models.Author.username == form_data.username).first()
    if not author or not verify_password(form_data.password, author.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": author.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me", response_model=schemas.AuthorResponse)
def get_me(author: models.Author = Depends(get_current_author)):
    return author

@app.get("/api/novels", response_model=List[schemas.Novel])
def get_novels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    novels = db.query(models.Novel).filter(models.Novel.author_id == current_author.id).offset(skip).limit(limit).all()
    return novels

@app.post("/api/novels", response_model=schemas.Novel)
def create_novel(novel: schemas.NovelCreate, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    db_novel = models.Novel(**novel.model_dump(), author_id=current_author.id)
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return db_novel

@app.get("/api/novels/{novel_id}", response_model=schemas.Novel)
def get_novel(novel_id: int, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id, models.Novel.author_id == current_author.id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel

@app.put("/api/novels/{novel_id}", response_model=schemas.Novel)
def update_novel(novel_id: int, novel_update: schemas.NovelUpdate, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id, models.Novel.author_id == current_author.id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    
    update_data = novel_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(novel, key, value)
        
    db.commit()
    db.refresh(novel)
    return novel

@app.delete("/api/novels/{novel_id}")
def delete_novel(novel_id: int, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id, models.Novel.author_id == current_author.id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
        
    db.delete(novel)
    db.commit()
    return {"message": "Novel deleted successfully"}

@app.post("/api/novels/{novel_id}/chapters", response_model=schemas.Chapter)
def create_chapter(novel_id: int, chapter: schemas.ChapterCreate, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id, models.Novel.author_id == current_author.id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
        
    db_chapter = models.Chapter(**chapter.model_dump(), novel_id=novel_id)
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

@app.get("/api/chapters/{chapter_id}", response_model=schemas.Chapter)
def get_chapter(chapter_id: int, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter or chapter.novel.author_id != current_author.id:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@app.put("/api/chapters/{chapter_id}", response_model=schemas.Chapter)
def update_chapter(chapter_id: int, chapter_update: schemas.ChapterUpdate, db: Session = Depends(get_db), current_author: models.Author = Depends(get_current_author)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter or chapter.novel.author_id != current_author.id:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    update_data = chapter_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chapter, key, value)
        
    db.commit()
    db.refresh(chapter)
    return chapter

lang_tool = None
def get_lang_tool():
    global lang_tool
    if lang_tool is None:
        lang_tool = language_tool_python.LanguageTool('en-US')
    return lang_tool

@app.post("/api/grammar-check", response_model=schemas.TextCorrectionResponse)
def grammar_check(request: schemas.TextCorrectionRequest, current_author: models.Author = Depends(get_current_author)):
    text = request.text
    if not text.strip():
        return schemas.TextCorrectionResponse(original_text=text, corrected_text="", suggestions=[])
        
    tool = get_lang_tool()
    matches = tool.check(text)
    corrected = language_tool_python.utils.correct(text, matches)
    
    suggestions = []
    for match in matches:
        if match.replacements:
            suggestions.append(f"Replace '{match.context[match.offset:match.offset+match.errorLength]}' with {match.replacements[:3]}")
        else:
            suggestions.append(f"Issue: {match.message}")
            
    return schemas.TextCorrectionResponse(
        original_text=text,
        corrected_text=corrected,
        suggestions=suggestions if suggestions else ["No major grammar issues found."]
    )

@app.post("/api/paragraph-correction", response_model=schemas.TextCorrectionResponse)
def paragraph_correction(request: schemas.TextCorrectionRequest, current_author: models.Author = Depends(get_current_author)):
    text = request.text
    if not text.strip():
        return schemas.TextCorrectionResponse(original_text=text, corrected_text="", suggestions=[])
        
    if not request.api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required for paragraph correction. Please enter it in the settings.")
        
    try:
        genai.configure(api_key=request.api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = (
            "You are an expert editor for a novelist. Overwrite the following paragraph to be highly engaging, "
            "vividly descriptive, and stylistically better. "
            "Only return the improved paragraph without any extra conversational text:\\n\\n"
            f"{text}"
        )
        
        response = model.generate_content(prompt)
        enhanced_text = response.text.strip()
        
        suggestions = ["Rewritten for better stylistic flow using Gemini.", "Consider comparing this with your original version."]
        
        return schemas.TextCorrectionResponse(
            original_text=text,
            corrected_text=enhanced_text,
            suggestions=suggestions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
