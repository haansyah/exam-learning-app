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
  <span
    ref="container"
    class="formula-text"
    :class="{ 'formula-text--display': displayMode }"
  />
</template>

<style scoped>
.formula-text {
  display: inline-block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  vertical-align: middle;
  -webkit-overflow-scrolling: touch;
}

.formula-text--display {
  display: block;
  width: 100%;
}

.formula-text :deep(.katex) {
  font-size: clamp(0.875rem, 2.8vw, 1.125rem);
}

.formula-text :deep(.katex-display) {
  margin: 0;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  text-align: left;
}
</style>
