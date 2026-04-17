from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import time
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

@app.get("/api/novels", response_model=List[schemas.Novel])
def get_novels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    novels = db.query(models.Novel).offset(skip).limit(limit).all()
    return novels

@app.post("/api/novels", response_model=schemas.Novel)
def create_novel(novel: schemas.NovelCreate, db: Session = Depends(get_db)):
    db_novel = models.Novel(**novel.model_dump())
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return db_novel

@app.get("/api/novels/{novel_id}", response_model=schemas.Novel)
def get_novel(novel_id: int, db: Session = Depends(get_db)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel

@app.post("/api/novels/{novel_id}/chapters", response_model=schemas.Chapter)
def create_chapter(novel_id: int, chapter: schemas.ChapterCreate, db: Session = Depends(get_db)):
    novel = db.query(models.Novel).filter(models.Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    db_chapter = models.Chapter(**chapter.model_dump(), novel_id=novel_id)
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

@app.get("/api/chapters/{chapter_id}", response_model=schemas.Chapter)
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@app.put("/api/chapters/{chapter_id}", response_model=schemas.Chapter)
def update_chapter(chapter_id: int, chapter_update: schemas.ChapterUpdate, db: Session = Depends(get_db)):
    db_chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    update_data = chapter_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_chapter, key, value)
        
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

# Initialize language tool lazily
lang_tool = None
def get_lang_tool():
    global lang_tool
    if lang_tool is None:
        lang_tool = language_tool_python.LanguageTool('en-US')
    return lang_tool

@app.post("/api/grammar-check", response_model=schemas.TextCorrectionResponse)
def grammar_check(request: schemas.TextCorrectionRequest):
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
def paragraph_correction(request: schemas.TextCorrectionRequest):
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
