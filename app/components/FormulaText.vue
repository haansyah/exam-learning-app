<script setup lang="ts">
import katex from 'katex'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  content: string
  displayMode?: boolean
}>()

const container = ref<HTMLElement | null>(null)

function renderFormula() {
  if (!container.value) {
    return
  }

  try {
    katex.render(props.content, container.value, {
      displayMode: props.displayMode ?? false,
      throwOnError: false
    })
  } catch {
    container.value.textContent = props.content
  }
}

onMounted(renderFormula)
watch(() => props.content, renderFormula)
</script>

<template>
  <span ref="container" class="formula-text" />
</template>
