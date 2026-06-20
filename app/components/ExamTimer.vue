<script setup lang="ts">
import { formatTimer } from '~/utils/exam'

const props = defineProps<{
  secondsRemaining: number
}>()

const isLow = computed(() => props.secondsRemaining <= 5 * 60)
</script>

<template>
  <UBadge
    :color="isLow ? 'error' : 'neutral'"
    variant="subtle"
    size="lg"
    icon="i-lucide-timer"
  >
    {{ formatTimer(secondsRemaining) }}
  </UBadge>
</template>
