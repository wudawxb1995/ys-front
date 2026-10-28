<template>
  <span class="pick-avatar" :style="{ background: mark.bg }" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path v-for="(d, index) in mark.paths" :key="index" :d="d" />
    </svg>
  </span>
</template>

<script>
const marks = {
  'ex-fire': { bg: 'linear-gradient(145deg,#ff8a5b,#e23b3b)', paths: ['M12 4.5v15', 'M4.5 12h15', 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z', 'M12 10.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z'] },
  'ex-measure': { bg: 'linear-gradient(145deg,#3ec6c0,#0e8f9a)', paths: ['M4 16.5 9.2 7.2l3.1 5.2 2.2-3.4L20 16.5', 'M4 19h16'] },
  'ex-aim': { bg: 'linear-gradient(145deg,#5b8cff,#2f4de0)', paths: ['M12 3.5v3', 'M12 17.5v3', 'M3.5 12h3', 'M17.5 12h3', 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z'] },
  'ex-weather': { bg: 'linear-gradient(160deg,#7ad7ff,#2f7ef0)', paths: ['M12 4.2v1.6', 'M7.2 6.4l1.1 1.1', 'M16.8 6.4 15.7 7.5', 'M8.2 11.2a2.6 2.6 0 0 1 4.9-1.2 2.1 2.1 0 0 1 3.2 1.7h.2a2.3 2.3 0 0 1 0 4.6H9.2a2.5 2.5 0 0 1-1-4.8z'] },
  'ex-move': { bg: 'linear-gradient(145deg,#3dce7a,#0e9a62)', paths: ['M4 15h10.5a3 3 0 0 0 3-2.2L19 8H8', 'M7.2 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z', 'M16.2 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z', 'M4 11h3'] },
  'ex-protect': { bg: 'linear-gradient(145deg,#6a7cff,#3a3f9a)', paths: ['M12 3.5 19 6.2v5.2c0 4.2-2.8 7.2-7 8.6-4.2-1.4-7-4.4-7-8.6V6.2L12 3.5z', 'M9 12.1 11 14l4-4.2'] },
  'ex-info': { bg: 'linear-gradient(145deg,#49b0ff,#1766d6)', paths: ['M5 18.5V10', 'M12 18.5V6', 'M19 18.5v-5', 'M4 18.5h16'] },
  'ex-env': { bg: 'linear-gradient(145deg,#ffb347,#f07a1a)', paths: ['M10 5.5h4', 'M11 5.5v8.2a3 3 0 1 0 2 0V5.5', 'M12 16.2v.1'] },
  'ex-rel': { bg: 'linear-gradient(145deg,#36c3b4,#0c7f8c)', paths: ['M12 7V4.5', 'M12 7a5 5 0 1 1-4.3 2.5', 'M8.2 6.2 12 7l-.6 3.6'] },
  'ex-emc': { bg: 'linear-gradient(145deg,#b06bff,#6a34d4)', paths: ['M3.5 12c2-3.2 3.2-3.2 5.2 0s3.2 3.2 5.2 0 3.2-3.2 5.2 0'] },
  'ex-safe': { bg: 'linear-gradient(145deg,#ff6b6b,#d7263d)', paths: ['M12 3.8 20 18.2H4L12 3.8z', 'M12 9.2v4.2', 'M12 16.2h.01'] },
  'ex-evidence': { bg: 'linear-gradient(145deg,#f0b429,#d4890b)', paths: ['M7 4.5h7.2L18 8.2V19.5H7z', 'M14 4.6V8.2H18', 'M9.5 12.2h5', 'M9.5 15.4h5'] },
  'ex-outline': { bg: 'linear-gradient(145deg,#4c8dff,#1d4ed8)', paths: ['M8 5.5h11', 'M8 12h11', 'M8 18.5h11', 'M4.5 5.5h.01', 'M4.5 12h.01', 'M4.5 18.5h.01'] },
  'sk-outline': { bg: 'linear-gradient(145deg,#5aa2ff,#1d4f91)', paths: ['M5 7.5h14v11H5z', 'M8 5.5h8', 'M9 11.5h6', 'M9 14.5h4'] },
  'sk-criteria': { bg: 'linear-gradient(145deg,#34d399,#047857)', paths: ['M6 4.5h12v15H6z', 'M9 12.2 11 14l4-4.2'] },
  'sk-trace': { bg: 'linear-gradient(145deg,#f59e0b,#b45309)', paths: ['M8 4.5h8v15l-4-2.4-4 2.4z'] },
  'sk-factor': { bg: 'linear-gradient(145deg,#22d3ee,#0369a1)', paths: ['M4.5 4.5h6.2v6.2H4.5z', 'M13.3 4.5h6.2v6.2h-6.2z', 'M4.5 13.3h6.2v6.2H4.5z', 'M13.3 13.3h6.2v6.2h-6.2z'] },
  'sk-sample': { bg: 'linear-gradient(145deg,#818cf8,#4338ca)', paths: ['M8.2 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z', 'M15.8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z', 'M4.8 18.2c.4-2.4 2-3.6 3.4-3.6s3 1.2 3.4 3.6', 'M12.4 18.2c.4-2.4 2-3.6 3.4-3.6s3 1.2 3.4 3.6'] },
  'sk-ready': { bg: 'linear-gradient(145deg,#2dd4bf,#0f766e)', paths: ['M6 20.2V4.8h.2L17 9.2 6.2 13.6'] },
  'sk-resource': { bg: 'linear-gradient(145deg,#fb7185,#be123c)', paths: ['M4.5 8.5 12 4.8l7.5 3.7L12 12.2 4.5 8.5z', 'M4.5 8.5V16L12 19.6 19.5 16V8.5', 'M12 12.2v7.4'] },
  'sk-budget': { bg: 'linear-gradient(145deg,#38bdf8,#1d4ed8)', paths: ['M5 19V5', 'M5 19h14', 'M8.5 15.5v-4', 'M12 15.5V8', 'M15.5 15.5v-6'] },
  'sk-weather': { bg: 'linear-gradient(145deg,#67e8f9,#0284c7)', paths: ['M7.5 16.8h8.4a2.6 2.6 0 0 0 .2-5.2 3.4 3.4 0 0 0-6.5 1.2 2.4 2.4 0 0 0-2.1 4z'] },
  'sk-anomaly': { bg: 'linear-gradient(145deg,#fb923c,#ea580c)', paths: ['M12 4.2 20 18.2H4L12 4.2z', 'M12 9.4v4', 'M12 16h.01'] },
  'sk-stop': { bg: 'linear-gradient(145deg,#f43f5e,#9f1239)', paths: ['M8 4.5h8l4 4v7l-4 4H8l-4-4v-7l4-4z', 'M9.2 9.2l5.6 5.6', 'M14.8 9.2l-5.6 5.6'] },
  'sk-review': { bg: 'linear-gradient(145deg,#a78bfa,#6d28d9)', paths: ['M5 18.5h4.2L18.2 9.5l-3.2-3.2L6 15.3v3.2z', 'M13.6 7.6l3.2 3.2'] },
  'rx-judge': { bg: 'linear-gradient(145deg,#34d399,#047857)', paths: ['M7 4.5h10v15H7z', 'M9.5 12.2 11.2 14 15 10'] },
  'rx-fire': { bg: 'linear-gradient(145deg,#ff8a5b,#e23b3b)', paths: ['M12 4.5v15', 'M4.5 12h15', 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z'] },
  'rx-measure': { bg: 'linear-gradient(145deg,#3ec6c0,#0e8f9a)', paths: ['M4 16.5 9.2 7.2l3.1 5.2 2.2-3.4L20 16.5', 'M4 19h16'] },
  'rx-move': { bg: 'linear-gradient(145deg,#3dce7a,#0e9a62)', paths: ['M4 15h10.5a3 3 0 0 0 3-2.2L19 8H8', 'M7.2 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z', 'M16.2 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z'] },
  'rx-protect': { bg: 'linear-gradient(145deg,#6a7cff,#3a3f9a)', paths: ['M12 3.5 19 6.2v5.2c0 4.2-2.8 7.2-7 8.6-4.2-1.4-7-4.4-7-8.6V6.2L12 3.5z'] },
  'rx-info': { bg: 'linear-gradient(145deg,#49b0ff,#1766d6)', paths: ['M5 18.5V10', 'M12 18.5V6', 'M19 18.5v-5', 'M4 18.5h16'] },
  'rx-env': { bg: 'linear-gradient(145deg,#ffb347,#f07a1a)', paths: ['M10 5.5h4', 'M11 5.5v8.2a3 3 0 1 0 2 0V5.5'] },
  'rx-rel': { bg: 'linear-gradient(145deg,#36c3b4,#0c7f8c)', paths: ['M12 7V4.5', 'M12 7a5 5 0 1 1-4.3 2.5', 'M8.2 6.2 12 7l-.6 3.6'] },
  'rx-emc': { bg: 'linear-gradient(145deg,#b06bff,#6a34d4)', paths: ['M3.5 12c2-3.2 3.2-3.2 5.2 0s3.2 3.2 5.2 0 3.2-3.2 5.2 0'] },
  'rx-cause': { bg: 'linear-gradient(145deg,#fb923c,#c2410c)', paths: ['M12 4.2 20 18.2H4L12 4.2z', 'M12 9.4v4', 'M12 16h.01'] },
  'rx-evidence': { bg: 'linear-gradient(145deg,#f0b429,#d4890b)', paths: ['M7 4.5h7.2L18 8.2V19.5H7z', 'M14 4.6V8.2H18', 'M9.5 12.2h5'] },
  'rx-report': { bg: 'linear-gradient(145deg,#4c8dff,#1d4ed8)', paths: ['M7 4.5h7.2L18 8.2V19.5H7z', 'M14 4.6V8.2H18', 'M9.5 12h5', 'M9.5 15h3.5'] },
  'rs-outline': { bg: 'linear-gradient(145deg,#5aa2ff,#1d4f91)', paths: ['M8 5.5h11', 'M8 12h11', 'M8 18.5h11', 'M4.5 5.5h.01', 'M4.5 12h.01', 'M4.5 18.5h.01'] },
  'rs-criteria': { bg: 'linear-gradient(145deg,#34d399,#047857)', paths: ['M6 4.5h12v15H6z', 'M9 12.2 11 14l4-4.2'] },
  'rs-review': { bg: 'linear-gradient(145deg,#a78bfa,#6d28d9)', paths: ['M5 18.5h4.2L18.2 9.5l-3.2-3.2L6 15.3v3.2z'] },
  'rs-judge': { bg: 'linear-gradient(145deg,#2dd4bf,#0f766e)', paths: ['M5 19V5', 'M5 19h14', 'M8.5 15.5v-4', 'M12 15.5V8', 'M15.5 15.5v-6'] },
  'rs-raw': { bg: 'linear-gradient(145deg,#38bdf8,#1d4ed8)', paths: ['M7 5.5h10v13H7z', 'M9.5 9h5', 'M9.5 12h5', 'M9.5 15h3'] },
  'rs-shot': { bg: 'linear-gradient(145deg,#fb7185,#be123c)', paths: ['M12 4.5v15', 'M4.5 12h15', 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z'] },
  'rs-cause': { bg: 'linear-gradient(145deg,#fb923c,#c2410c)', paths: ['M12 4.2 20 18.2H4L12 4.2z', 'M12 9.4v4'] },
  'rs-close': { bg: 'linear-gradient(145deg,#34d399,#065f46)', paths: ['M5 12.5 9.2 16.5 19 7.5'] },
}

const fallback = { bg: 'linear-gradient(145deg,#7eb6e8,#1668a8)', paths: ['M12 7.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z', 'M6.5 18.5c.6-3 2.6-4.5 5.5-4.5s4.9 1.5 5.5 4.5'] }

export default {
  props: { id: { type: String, default: '' } },
  computed: {
    mark() {
      return marks[this.id] || fallback
    },
  },
}
</script>

<style scoped>
.pick-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(28, 64, 110, .16);
}
.pick-avatar svg { width: 26px; height: 26px; }
</style>
