<template>
  <div class="mermaid-diagram" v-html="svg"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  code: {
    type: String,
    required: true
  }
})

const { isDark } = useData()
const svg = ref('')

let mermaidModule = null

const renderDiagram = async () => {
  if (typeof window === 'undefined') return
  try {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    if (!mermaidModule) {
      const mod = await import('mermaid')
      mermaidModule = mod.default
    }

    mermaidModule.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark.value ? 'dark' : 'default',
      fontFamily: 'var(--vp-font-family-base, sans-serif)',
      themeVariables: {
        fontSize: '14px'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        padding: 20,
        nodeSpacing: 45,
        rankSpacing: 45
      }
    })

    const raw = decodeURIComponent(props.code)
    const id = 'mermaid-' + Math.random().toString(36).substring(2, 9)
    const res = await mermaidModule.render(id, raw)
    svg.value = res.svg
  } catch (err) {
    console.error('Mermaid render error:', err)
  }
}

onMounted(() => {
  renderDiagram()
})

watch(isDark, () => {
  renderDiagram()
})
</script>
