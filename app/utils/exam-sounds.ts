type Tone = {
  frequency: number
  duration: number
  delay?: number
  type?: OscillatorType
  volume?: number
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (import.meta.server) {
    return null
  }

  if (!audioContext) {
    audioContext = new AudioContext()
  }

  return audioContext
}

function playTones(tones: Tone[]) {
  const context = getAudioContext()
  if (!context) {
    return
  }

  if (context.state === 'suspended') {
    void context.resume()
  }

  const startTime = context.currentTime

  for (const tone of tones) {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const delay = tone.delay ?? 0
    const duration = tone.duration
    const volume = tone.volume ?? 0.2
    const toneStart = startTime + delay
    const toneEnd = toneStart + duration

    oscillator.type = tone.type ?? 'sine'
    oscillator.frequency.value = tone.frequency

    gainNode.gain.setValueAtTime(0.0001, toneStart)
    gainNode.gain.exponentialRampToValueAtTime(volume, toneStart + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(toneStart)
    oscillator.stop(toneEnd)
  }
}

export function playCorrectAnswerSound() {
  playTones([
    { frequency: 523.25, duration: 0.12, volume: 0.18 },
    { frequency: 659.25, duration: 0.18, delay: 0.1, volume: 0.2 }
  ])
}

export function playIncorrectAnswerSound() {
  playTones([
    { frequency: 220, duration: 0.08, type: 'square', volume: 0.08 },
    { frequency: 185, duration: 0.2, delay: 0.08, type: 'square', volume: 0.07 }
  ])
}

export function playPassSound() {
  playTones([
    { frequency: 523.25, duration: 0.12, volume: 0.16 },
    { frequency: 659.25, duration: 0.12, delay: 0.1, volume: 0.16 },
    { frequency: 783.99, duration: 0.12, delay: 0.2, volume: 0.16 },
    { frequency: 1046.5, duration: 0.28, delay: 0.3, volume: 0.18 }
  ])
}
