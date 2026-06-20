import type { SubjectManifestEntry, SubjectQuestionFile } from '~/types/exam'

export async function useSubjectManifest() {
  if (import.meta.server) {
    const { getManifest } = await import('~/utils/subject-data.server')
    return ref(getManifest())
  }

  const { data, error } = await useFetch<SubjectManifestEntry[]>('/data/manifest.json')

  if (error.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load subject manifest'
    })
  }

  return data
}

export async function useSubjectQuestions(questionFile: string) {
  if (import.meta.server) {
    const { getSubjectQuestions } = await import('~/utils/subject-data.server')
    return ref(getSubjectQuestions(questionFile))
  }

  const { data, error } = await useFetch<SubjectQuestionFile>(`/data/${questionFile}`)

  if (error.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load subject questions'
    })
  }

  return data
}
