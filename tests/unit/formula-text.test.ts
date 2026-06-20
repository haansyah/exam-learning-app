import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormulaText from '~/components/FormulaText.vue'

describe('FormulaText', () => {
  it('renders valid LaTeX without crashing', () => {
    const wrapper = mount(FormulaText, {
      props: { content: 'x^2 + y^2' }
    })
    expect(wrapper.find('.formula-text').exists()).toBe(true)
  })

  it('falls back gracefully on malformed LaTeX', () => {
    const wrapper = mount(FormulaText, {
      props: { content: '\\broken{' }
    })
    expect(wrapper.find('.formula-text').exists()).toBe(true)
  })
})
