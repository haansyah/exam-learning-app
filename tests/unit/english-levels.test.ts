import { describe, expect, it } from 'vitest'
import type { SubjectManifestEntry } from '~/types/exam'
import {
  formatEnglishLevelLockMessage,
  getEnglishLevelUnlockStatus,
  getPreviousEnglishLevelId,
  isEnglishSubject,
  parseEnglishLevel
} from '~/utils/english-levels'

const englishManifest: SubjectManifestEntry[] = [
  {
    id: 'english-l1',
    name: 'Bahasa Inggris Level 1',
    description: 'Level 1',
    passThreshold: 70,
    questionFile: 'subjects/english-l1.json',
    category: 'bahasa'
  },
  {
    id: 'english-l2',
    name: 'Bahasa Inggris Level 2',
    description: 'Level 2',
    passThreshold: 75,
    questionFile: 'subjects/english-l2.json',
    category: 'bahasa'
  },
  {
    id: 'english-l3',
    name: 'Bahasa Inggris Level 3',
    description: 'Level 3',
    passThreshold: 70,
    questionFile: 'subjects/english-l3.json',
    category: 'bahasa'
  }
]

describe('english level helpers', () => {
  it('parses english level ids', () => {
    expect(parseEnglishLevel('english-l1')).toBe(1)
    expect(parseEnglishLevel('english-l15')).toBe(15)
    expect(parseEnglishLevel('math101')).toBeNull()
  })

  it('detects english subjects', () => {
    expect(isEnglishSubject('english-l2')).toBe(true)
    expect(isEnglishSubject('ekma4213')).toBe(false)
  })

  it('returns previous english level id', () => {
    expect(getPreviousEnglishLevelId('english-l1')).toBeNull()
    expect(getPreviousEnglishLevelId('english-l2')).toBe('english-l1')
    expect(getPreviousEnglishLevelId('math101')).toBeNull()
  })

  it('always unlocks non-english and level 1 subjects', () => {
    const hasPassed = () => false

    expect(getEnglishLevelUnlockStatus('math101', englishManifest, hasPassed).unlocked).toBe(true)
    expect(getEnglishLevelUnlockStatus('english-l1', englishManifest, hasPassed).unlocked).toBe(true)
  })

  it('locks later english levels until previous level is passed', () => {
    const passedLevels = new Set<string>()

    const hasPassed = (subjectId: string, _passThreshold: number) => {
      if (subjectId === 'english-l1') {
        return passedLevels.has('english-l1')
      }
      if (subjectId === 'english-l2') {
        return passedLevels.has('english-l2')
      }
      return false
    }

    expect(getEnglishLevelUnlockStatus('english-l2', englishManifest, hasPassed).unlocked).toBe(false)
    expect(getEnglishLevelUnlockStatus('english-l3', englishManifest, hasPassed).unlocked).toBe(false)

    passedLevels.add('english-l1')

    expect(getEnglishLevelUnlockStatus('english-l2', englishManifest, hasPassed).unlocked).toBe(true)
    expect(getEnglishLevelUnlockStatus('english-l3', englishManifest, hasPassed).unlocked).toBe(false)

    passedLevels.add('english-l2')

    expect(getEnglishLevelUnlockStatus('english-l3', englishManifest, hasPassed).unlocked).toBe(true)
  })

  it('uses previous level pass threshold for unlock checks', () => {
    let checkedThreshold: number | null = null

    getEnglishLevelUnlockStatus(
      'english-l3',
      englishManifest,
      (_subjectId, passThreshold) => {
        checkedThreshold = passThreshold
        return false
      }
    )

    expect(checkedThreshold).toBe(75)
  })

  it('formats lock message for locked levels', () => {
    const status = getEnglishLevelUnlockStatus('english-l2', englishManifest, () => false)

    expect(formatEnglishLevelLockMessage(status)).toBe(
      'Level ini terkunci. Lulus Bahasa Inggris Level 1 dengan skor minimal 70% untuk membuka.'
    )
  })
})
