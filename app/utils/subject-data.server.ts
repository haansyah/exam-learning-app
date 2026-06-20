import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import manifestData from '../../public/data/manifest.json'
import type { SubjectManifestEntry, SubjectQuestionFile } from '~/types/exam'

export function getManifest(): SubjectManifestEntry[] {
  return manifestData as SubjectManifestEntry[]
}

export function getSubjectQuestions(questionFile: string): SubjectQuestionFile {
  const filePath = join(process.cwd(), 'public/data', questionFile)
  return JSON.parse(readFileSync(filePath, 'utf-8')) as SubjectQuestionFile
}
