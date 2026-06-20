<script setup lang="ts">
import type { QuestionOption } from '~/types/exam'

defineProps<{
  option: QuestionOption
  selected: boolean
  correct?: boolean
  incorrect?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="min-w-0 w-full text-left rounded-lg border p-4 transition-colors"
    :class="{
      'border-primary bg-primary/10': selected && !correct && !incorrect,
      'border-success bg-success/10': correct,
      'border-error bg-error/10': incorrect,
      'border-default hover:border-primary/50': !selected && !disabled,
      'opacity-70 cursor-not-allowed': disabled && !selected
    }"
    :disabled="disabled"
    @click="emit('select')"
  >
    <img
      v-if="option.imageUrl"
      :src="option.imageUrl"
      :alt="option.text"
      class="mb-2 max-h-40 rounded object-contain"
    >
    <FormulaText
      v-if="option.isFormula"
      :content="option.text"
    />
    <span v-else>{{ option.text }}</span>
  </button>
</template>
