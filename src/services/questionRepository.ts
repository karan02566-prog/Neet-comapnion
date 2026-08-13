import { getDB } from './db'
import type { Question, QuestionSubject, SourceType } from '../types/question'

export async function addQuestion(question: Question): Promise<void> {
  const db = await getDB()
  await db.add('questions', question)
}

export async function updateQuestion(question: Question): Promise<void> {
  const db = await getDB()
  await db.put('questions', question)
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('questions', id)
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  const db = await getDB()
  return db.get('questions', id)
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDB()
  return db.getAll('questions')
}

export async function getQuestionsBySubject(subject: QuestionSubject): Promise<Question[]> {
  const db = await getDB()
  return db.getAllFromIndex('questions', 'by-subject', subject)
}

export async function getQuestionsByChapter(chapter: string): Promise<Question[]> {
  const db = await getDB()
  return db.getAllFromIndex('questions', 'by-chapter', chapter)
}

export async function getQuestionsByYear(year: number): Promise<Question[]> {
  const db = await getDB()
  return db.getAllFromIndex('questions', 'by-year', year)
}

export async function getQuestionsBySource(sourceType: SourceType): Promise<Question[]> {
  const db = await getDB()
  return db.getAllFromIndex('questions', 'by-source', sourceType)
}