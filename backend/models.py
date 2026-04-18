from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Author(Base):
    __tablename__ = "authors"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    novels = relationship("Novel", back_populates="author", cascade="all, delete-orphan")

class Novel(Base):
    __tablename__ = "novels"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("authors.id"))
    title = Column(String, index=True)
    synopsis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    author = relationship("Author", back_populates="novels")
    chapters = relationship("Chapter", back_populates="novel", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    novel_id = Column(Integer, ForeignKey("novels.id"))
    title = Column(String)
    content = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    novel = relationship("Novel", back_populates="chapters")
