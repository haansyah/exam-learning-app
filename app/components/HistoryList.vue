<script setup lang="ts">
import type { ExamAttempt, SubjectManifestEntry } from '~/types/exam'

const props = defineProps<{
  attempts: ExamAttempt[]
  subjects: SubjectManifestEntry[]
}>()

const subjectMap = computed(() => new Map(props.subjects.map(s => [s.id, s])))

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div class="space-y-3">
    <UCard
      v-for="attempt in attempts"
      :key="attempt.attemptId"
      class="hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
      @click="navigateTo(`/subjects/${attempt.subjectId}/result/${attempt.attemptId}`)"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-medium">
            {{ subjectMap.get(attempt.subjectId)?.name ?? attempt.subjectId }}
          </p>
          <p class="text-sm text-muted">
            {{ formatDate(attempt.completedAt) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-semibold">{{ attempt.scorePercent }}%</span>
          <UBadge
            :color="attempt.passed ? 'success' : 'error'"
            variant="subtle"
          >
            {{ attempt.passed ? 'Passed' : 'Failed' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <UEmpty
      v-if="attempts.length === 0"
      icon="i-lucide-history"
      title="No attempts yet"
      description="Complete an exam to see your history here."
    />
  </div>
</template>
