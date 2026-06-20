import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { SubjectManifestEntry, SubjectQuestionFile } from '~/types/exam'
import { validateManifest, validateSubjectFile } from '~/utils/validate-data'

const dataDir = join(process.cwd(), 'public/data')

describe('data validation', () => {
  it('validates manifest and subject files', () => {
    const manifest = JSON.parse(
      readFileSync(join(dataDir, 'manifest.json'), 'utf-8')
    ) as SubjectManifestEntry[]

    expect(validateManifest(manifest)).toEqual([])

    for (const entry of manifest) {
      const subjectFile = JSON.parse(
        readFileSync(join(dataDir, entry.questionFile), 'utf-8')
      ) as SubjectQuestionFile
      expect(validateSubjectFile(subjectFile)).toEqual([])
    }
  })
})
