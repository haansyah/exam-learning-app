<script setup lang="ts">
import type { ExamAttempt } from '~/types/exam'
import {
  buildScoreChartPoints,
  indexToChartX,
  scoreToChartY
} from '~/utils/score-chart'

const props = defineProps<{
  attempts: ExamAttempt[]
  passThreshold: number
}>()

const CHART_WIDTH = 400
const CHART_HEIGHT = 220
const PADDING = { top: 16, right: 16, bottom: 36, left: 40 }

const chartLeft = PADDING.left
const chartRight = CHART_WIDTH - PADDING.right
const chartTop = PADDING.top
const chartBottom = CHART_HEIGHT - PADDING.bottom

const points = computed(() => buildScoreChartPoints(props.attempts))

const yTicks = [0, 25, 50, 75, 100]

const passThresholdY = computed(() =>
  scoreToChartY(props.passThreshold, chartTop, chartBottom)
)

const plottedPoints = computed(() =>
  points.value.map(point => ({
    ...point,
    x: indexToChartX(point.index, points.value.length, chartLeft, chartRight),
    y: scoreToChartY(point.scorePercent, chartTop, chartBottom)
  }))
)

const linePath = computed(() => {
  if (plottedPoints.value.length === 0) {
    return ''
  }

  return plottedPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 class="font-semibold">
            Score over time
          </h2>
          <p class="text-sm text-muted">
            Oldest attempt on the left, newest on the right
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs text-muted">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-success" />
            Passed
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-error" />
            Failed
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-px w-4 border-t border-dashed border-warning" />
            Pass {{ passThreshold }}%
          </span>
        </div>
      </div>

      <svg
        :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
        class="w-full h-auto"
        role="img"
        aria-label="Line chart of exam scores over time"
      >
        <g class="text-muted opacity-30">
          <line
            v-for="tick in yTicks"
            :key="tick"
            :x1="chartLeft"
            :x2="chartRight"
            :y1="scoreToChartY(tick, chartTop, chartBottom)"
            :y2="scoreToChartY(tick, chartTop, chartBottom)"
            stroke="currentColor"
            stroke-width="1"
          />
        </g>

        <g class="text-xs fill-muted">
          <text
            v-for="tick in yTicks"
            :key="`label-${tick}`"
            :x="chartLeft - 8"
            :y="scoreToChartY(tick, chartTop, chartBottom) + 4"
            text-anchor="end"
          >
            {{ tick }}
          </text>
        </g>

        <line
          :x1="chartLeft"
          :x2="chartRight"
          :y1="passThresholdY"
          :y2="passThresholdY"
          class="stroke-warning"
          stroke-width="1.5"
          stroke-dasharray="5 4"
        />

        <path
          v-if="plottedPoints.length > 1"
          :d="linePath"
          fill="none"
          class="stroke-primary"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <g>
          <circle
            v-for="point in plottedPoints"
            :key="point.completedAt"
            :cx="point.x"
            :cy="point.y"
            r="5"
            :class="point.passed ? 'fill-success' : 'fill-error'"
            stroke="var(--ui-bg)"
            stroke-width="2"
          >
            <title>{{ point.label }} — {{ point.scorePercent }}% ({{ formatDate(point.completedAt) }})</title>
          </circle>
        </g>

        <g class="text-xs fill-muted">
          <text
            v-for="point in plottedPoints"
            :key="`x-${point.completedAt}`"
            :x="point.x"
            :y="CHART_HEIGHT - 10"
            text-anchor="middle"
          >
            {{ point.label }}
          </text>
        </g>
      </svg>
    </div>
  </UCard>
</template>
