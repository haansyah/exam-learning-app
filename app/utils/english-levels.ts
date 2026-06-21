import type { SubjectManifestEntry } from '~/types/exam'

const ENGLISH_LEVEL_PATTERN = /^english-l(\d+)$/

export interface EnglishLevelUnlockStatus {
  isEnglishLevel: boolean
  unlocked: boolean
  prerequisiteId: string | null
  prerequisiteName: string | null
  prerequisitePassThreshold: number | null
}

export function parseEnglishLevel(subjectId: string): number | null {
  const match = subjectId.match(ENGLISH_LEVEL_PATTERN)
  if (!match) {
    return null
  }

  return Number(match[1])
}

export function isEnglishSubject(subjectId: string): boolean {
  return parseEnglishLevel(subjectId) !== null
}

export function getPreviousEnglishLevelId(subjectId: string): string | null {
  const level = parseEnglishLevel(subjectId)
  if (level === null || level <= 1) {
    return null
  }

  return `english-l${level - 1}`
}

export function getEnglishLevelUnlockStatus(
  subjectId: string,
  manifest: SubjectManifestEntry[],
  hasPassedSubject: (subjectId: string, passThreshold: number) => boolean
): EnglishLevelUnlockStatus {
  const level = parseEnglishLevel(subjectId)
  if (level === null) {
    return {
      isEnglishLevel: false,
      unlocked: true,
      prerequisiteId: null,
      prerequisiteName: null,
      prerequisitePassThreshold: null
    }
  }

  if (level <= 1) {
    return {
      isEnglishLevel: true,
      unlocked: true,
      prerequisiteId: null,
      prerequisiteName: null,
      prerequisitePassThreshold: null
    }
  }

  const prerequisiteId = getPreviousEnglishLevelId(subjectId)!
  const prerequisite = manifest.find(entry => entry.id === prerequisiteId)
  const prerequisitePassThreshold = prerequisite?.passThreshold ?? 70
  const unlocked = hasPassedSubject(prerequisiteId, prerequisitePassThreshold)

  return {
    isEnglishLevel: true,
    unlocked,
    prerequisiteId,
    prerequisiteName: prerequisite?.name ?? `Level ${level - 1}`,
    prerequisitePassThreshold
  }
}

export function formatEnglishLevelLockMessage(status: EnglishLevelUnlockStatus): string {
  if (!status.isEnglishLevel || status.unlocked || !status.prerequisiteName) {
    return ''
  }

  return `Level ini terkunci. Lulus ${status.prerequisiteName} dengan skor minimal ${status.prerequisitePassThreshold}% untuk membuka.`
}
