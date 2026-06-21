<script setup lang="ts">
import type { QuestionOption } from '~/types/exam'

defineProps<{
  option: QuestionOption
  label: string
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
    <div class="flex items-start gap-3">
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
        :class="{
          'border-primary bg-primary/15 text-primary': selected && !correct && !incorrect,
          'border-success bg-success/15 text-success': correct,
          'border-error bg-error/15 text-error': incorrect,
          'border-default text-muted': !selected && !correct && !incorrect
        }"
      >
        {{ label }}
      </span>

      <div class="min-w-0 flex-1">
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
      </div>
    </div>
  </button>
</template>
