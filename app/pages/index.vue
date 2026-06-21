<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'
import type { SubjectCategory, SubjectManifestEntry } from '~/types/exam'

const manifest = await useSubjectManifest()
const historyStore = useHistoryStore()

const questionCounts = ref<Record<string, number>>({})
const timeLimits = ref<Record<string, number>>({})

if (manifest.value) {
  await Promise.all(
    manifest.value.map(async (subject) => {
      const data = await useSubjectQuestions(subject.questionFile)
      const count = data.value?.questions.length ?? 0
      questionCounts.value[subject.id] = count
      timeLimits.value[subject.id] = resolveTimeLimitMinutes(count, subject.timeLimitMinutes)
    })
  )
}

const sections: { id: SubjectCategory, title: string, description: string, icon: string }[] = [
  {
    id: 'kuliah',
    title: 'Pembelajaran Kuliah',
    description: 'Latihan soal mata kuliah universitas dan materi akademik.',
    icon: 'i-lucide-graduation-cap'
  },
  {
    id: 'uji-coba',
    title: 'Uji Coba Ujian',
    description: 'Mata pelajaran percobaan untuk menguji fitur dan alur ujian.',
    icon: 'i-lucide-flask-conical'
  },
  {
    id: 'bahasa',
    title: 'Pembelajaran Bahasa',
    description: 'Latihan kosakata, tata bahasa, dan pemahaman bahasa.',
    icon: 'i-lucide-languages'
  }
]

const subjectsByCategory = computed(() => {
  const grouped: Record<SubjectCategory, SubjectManifestEntry[]> = {
    'kuliah': [],
    'uji-coba': [],
    'bahasa': []
  }

  for (const subject of manifest.value ?? []) {
    grouped[subject.category].push(subject)
  }

  return grouped
})

const sectionById = computed(() =>
  Object.fromEntries(sections.map(section => [section.id, section])) as Record<SubjectCategory, typeof sections[number]>
)

const accordionItems = computed<AccordionItem[]>(() =>
  sections.map((section) => {
    const count = subjectsByCategory.value[section.id].length

    return {
      value: section.id,
      label: section.title,
      icon: section.icon,
      trailing: `${count} mata pelajaran`
    }
  })
)

const defaultOpenCategories = ['kuliah']

function hasPassed(subject: SubjectManifestEntry) {
  return historyStore.hasPassedSubject(subject.id, subject.passThreshold)
}

function getUnlockStatus(subject: SubjectManifestEntry) {
  return getEnglishLevelUnlockStatus(
    subject.id,
    manifest.value ?? [],
    historyStore.hasPassedSubject
  )
}

useSeoMeta({
  title: 'Exam Learning App',
  description: 'Practice exams with instant feedback and progress tracking'
})
</script>

<template>
  <UContainer class="py-8 space-y-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">
          Exam Learning
        </h1>
        <p class="text-muted mt-1">
          Pilih kategori pembelajaran untuk mulai berlatih
        </p>
      </div>
      <UButton
        to="/history"
        icon="i-lucide-history"
        variant="outline"
        color="neutral"
      >
        History
      </UButton>
    </div>

    <UAccordion
      type="multiple"
      :items="accordionItems"
      :default-value="defaultOpenCategories"
      :unmount-on-hide="false"
      :ui="{
        trigger: 'text-base font-semibold py-4',
        body: 'pb-4'
      }"
    >
      <template #trailing="{ item }">
        <span class="text-sm font-normal text-muted me-2">
          {{ item.trailing }}
        </span>
      </template>

      <template #body="{ item }">
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{ sectionById[item.value as SubjectCategory].description }}
          </p>

          <div
            v-if="subjectsByCategory[item.value as SubjectCategory].length > 0"
            class="grid gap-4 sm:grid-cols-3"
          >
            <UCard
              v-for="subject in subjectsByCategory[item.value as SubjectCategory]"
              :key="subject.id"
              :class="[
                'transition-all',
                getUnlockStatus(subject).unlocked
                  ? 'hover:ring-2 hover:ring-primary/30'
                  : 'opacity-75'
              ]"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start gap-1.5 min-w-0">
                    <h3 class="text-xl font-semibold">
                      {{ subject.name }}
                    </h3>
                    <UIcon
                      v-if="!getUnlockStatus(subject).unlocked"
                      name="i-lucide-lock"
                      class="size-5 shrink-0 mt-0.5 text-muted"
                      title="Terkunci"
                    />
                    <UIcon
                      v-else-if="hasPassed(subject)"
                      name="i-lucide-star"
                      class="size-5 shrink-0 mt-0.5 text-warning fill-warning"
                      title="Lulus"
                    />
                  </div>
                  <UBadge
                    v-if="getUnlockStatus(subject).unlocked && historyStore.bestScoreForSubject(subject.id) !== null"
                    color="primary"
                    variant="subtle"
                  >
                    Best: {{ historyStore.bestScoreForSubject(subject.id) }}%
                  </UBadge>
                </div>
                <p class="text-sm text-muted line-clamp-2">
                  {{ subject.description }}
                </p>
                <p
                  v-if="!getUnlockStatus(subject).unlocked"
                  class="text-sm text-warning"
                >
                  {{ formatEnglishLevelLockMessage(getUnlockStatus(subject)) }}
                </p>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{{ questionCounts[subject.id] ?? '…' }} soal</span>
                  <span>{{ formatTimeLimit(timeLimits[subject.id] ?? 40) }}</span>
                  <span>Min. {{ subject.passThreshold }}%</span>
                </div>
                <div class="flex items-center justify-end">
                  <UButton
                    v-if="getUnlockStatus(subject).unlocked"
                    :to="`/subjects/${subject.id}`"
                    color="primary"
                    size="sm"
                  >
                    View
                  </UButton>
                  <UButton
                    v-else
                    color="neutral"
                    variant="outline"
                    size="sm"
                    disabled
                    icon="i-lucide-lock"
                  >
                    Terkunci
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <UCard
            v-else
            class="border-dashed"
          >
            <div class="py-6 text-center text-muted">
              <UIcon
                name="i-lucide-book-open"
                class="mx-auto mb-2 size-8 opacity-60"
              />
              <p>Belum ada mata pelajaran di kategori ini.</p>
            </div>
          </UCard>
        </div>
      </template>
    </UAccordion>
  </UContainer>
</template>
