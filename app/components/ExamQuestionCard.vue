<script setup lang="ts">
import type { Question } from '~/types/exam'

defineProps<{
  question: Question
  selectedOptionId: string | null
  checked: boolean
  correctOptionId?: string
}>()

const emit = defineEmits<{
  select: [optionId: string]
}>()
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="space-y-3">
        <img
          v-if="question.imageUrl"
          :src="question.imageUrl"
          :alt="question.text"
          class="max-h-64 w-full rounded-lg object-contain"
        >
        <FormulaText
          v-if="question.isFormula"
          :content="question.text"
          :display-mode="true"
        />
        <p v-else class="text-lg font-medium">
          {{ question.text }}
        </p>
      </div>

      <div class="space-y-2">
        <ExamOption
          v-for="option in question.options"
          :key="option.id"
          :option="option"
          :selected="selectedOptionId === option.id"
          :correct="checked && option.id === correctOptionId"
          :incorrect="checked && selectedOptionId === option.id && option.id !== correctOptionId"
          :disabled="checked"
          @select="emit('select', option.id)"
        />
      </div>

      <div
        v-if="checked"
        class="rounded-lg bg-muted/50 p-4 space-y-2"
      >
        <p class="text-sm font-semibold text-muted">
          Explanation
        </p>
        <img
          v-if="question.explanationImageUrl"
          :src="question.explanationImageUrl"
          alt="Explanation"
          class="max-h-48 rounded object-contain"
        >
        <p class="text-sm">
          {{ question.explanation }}
        </p>
      </div>
    </div>
  </UCard>
</template>
