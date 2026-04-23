<script>
  import { onMount } from 'svelte';
  import Nav from '$lib/Nav.svelte';
  import { questionsDatabase } from '$lib/questions.js';
  import { browser } from '$app/environment';

  // ── Tabs ─────────────────────────────────────────────────────
  let activeTab = 'A';
  const tabs = [
    { key: 'A',   label: '📘 Test A' },
    { key: 'B',   label: '📗 Test B' },
    { key: 'C',   label: '📕 Test C' },
    { key: 'D',   label: '📙 Test D' },
    { key: 'LEG', label: '⚖️ Legislatíva' },
  ];

  // ── PDF management ───────────────────────────────────────────
  let pdfFiles = [];

  const permanentPDFs = [
    { name: '📘 Zhrnutie A',           url: '/pdfka/Zhrnutie-A.pdf' },
    { name: '📗 Zhrnutie B',           url: '/pdfka/Zhrnutie-B.pdf' },
    { name: '📕 Zhrnutie C',           url: '/pdfka/Zhrnutie-C.pdf' },
    { name: '📙 Zhrnutie D',           url: '/pdfka/Zhrnutie-D.pdf' },
    { name: '📓 Zhrnutie Legislatíva', url: '/pdfka/Zhrnutie-leg.pdf' },
  ];

  onMount(() => {
    if (!browser) return;
    const saved = localStorage.getItem('pdfFiles');
    if (saved) pdfFiles = JSON.parse(saved);
  });

  function savePDFs() {
    if (browser) localStorage.setItem('pdfFiles', JSON.stringify(pdfFiles));
  }

  function formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') { alert('Prosím, nahrajte iba PDF súbory.'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        pdfFiles = [...pdfFiles, { name: file.name, size: formatSize(file.size), data: e.target.result.split(',')[1] }];
        savePDFs();
      };
      reader.readAsDataURL(file);
    });
  }

  function openPDF(index) {
    const pdf = pdfFiles[index];
    if (!pdf?.data) return;
    const bytes = Uint8Array.from(atob(pdf.data), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob), '_blank');
  }

  function deletePDF(index) {
    if (!confirm('Naozaj chcete vymazať tento súbor?')) return;
    pdfFiles = pdfFiles.filter((_, i) => i !== index);
    savePDFs();
  }

  // ── Drag & drop ──────────────────────────────────────────────
  let dragOver = false;

  function onDrop(e) {
    e.preventDefault();
    dragOver = false;
    handleFiles(e.dataTransfer.files);
  }

  let fileInput;
</script>

<svelte:head><title>📚 Správne odpovede | ELTEC</title></svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
  <Nav>
    <svelte:fragment slot="title">
      <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent mb-2">
        📚 Správne odpovede
      </h1>
    </svelte:fragment>
    <svelte:fragment slot="subtitle">
      <p class="text-slate-400 text-sm">Prehľad správnych odpovedí a študijné materiály</p>
    </svelte:fragment>
  </Nav>

  <main class="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

    <!-- ── Left column: PDF manager ──────────────────────────── -->
    <aside class="lg:w-80 flex-shrink-0 lg:sticky lg:top-6 lg:self-start space-y-6">

      <!-- Upload area -->
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        on:click={() => fileInput.click()}
        on:dragover|preventDefault={() => dragOver = true}
        on:dragleave={() => dragOver = false}
        on:drop={onDrop}
        class="bg-slate-800/60 border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200
          {dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600/50 hover:border-blue-500/60 hover:bg-slate-800'}"
      >
        <input bind:this={fileInput} type="file" accept=".pdf" multiple class="hidden"
               on:change={e => { handleFiles(e.target.files); fileInput.value = ''; }} />
        <p class="text-4xl mb-3">📤</p>
        <p class="font-semibold text-slate-300 mb-1">Nahrajte PDF súbory</p>
        <p class="text-slate-500 text-sm">Kliknite alebo presuňte súbory</p>
        <button class="mt-3 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                on:click|stopPropagation={() => fileInput.click()}>
          Vybrať súbory
        </button>
      </div>

      <!-- Permanent PDFs -->
      <div>
        <h3 class="font-bold text-slate-300 mb-3 pl-1 border-l-4 border-blue-500 pl-3">📌 Trvalé materiály</h3>
        <div class="space-y-2">
          {#each permanentPDFs as pdf}
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5
                        hover:border-blue-500/50 hover:translate-x-1 transition-all duration-200">
              <span class="text-2xl">📄</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate">{pdf.name}</p>
                <p class="text-xs text-slate-500">Trvalý materiál</p>
              </div>
              <button on:click={() => window.open(pdf.url, '_blank')}
                      class="w-8 h-8 rounded-xl bg-slate-700 hover:bg-blue-500 text-slate-300 hover:text-white transition-colors flex items-center justify-center text-sm">
                🔍
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- User PDFs -->
      {#if pdfFiles.length > 0}
        <div>
          <h3 class="font-bold text-slate-300 mb-3 border-l-4 border-blue-500 pl-3">📁 Vami nahrané</h3>
          <div class="space-y-2">
            {#each pdfFiles as pdf, i}
              <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
                <span class="text-2xl">📄</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{pdf.name}</p>
                  <p class="text-xs text-slate-500">{pdf.size}</p>
                </div>
                <div class="flex gap-1">
                  <button on:click={() => openPDF(i)}
                          class="w-8 h-8 rounded-xl bg-slate-700 hover:bg-blue-500 text-slate-300 hover:text-white transition-colors flex items-center justify-center text-sm">
                    🔍
                  </button>
                  <button on:click={() => deletePDF(i)}
                          class="w-8 h-8 rounded-xl bg-slate-700 hover:bg-red-500 text-slate-300 hover:text-white transition-colors flex items-center justify-center text-sm">
                    🗑️
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="text-center py-8 text-slate-500">
          <p class="text-4xl mb-2 opacity-40">📭</p>
          <p class="text-sm">Žiadne nahrané súbory</p>
        </div>
      {/if}
    </aside>

    <!-- ── Right column: Answers ──────────────────────────────── -->
    <div class="flex-1 min-w-0">
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.key}
            class="px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200
              {activeTab === tab.key
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:border-blue-500/50 hover:text-slate-200'}"
          >{tab.label}</button>
        {/each}
      </div>

      <!-- Questions list -->
      <div class="space-y-3">
        {#each (questionsDatabase[activeTab] ?? []) as q, i}
          <div class="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
            <p class="font-semibold text-sm mb-3">{i + 1}. {q.question}</p>
            <div class="grid gap-2">
              {#each q.options as opt, oi}
                <div class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm
                  {q.correct.includes(oi)
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-700/40 border-slate-600/30 text-slate-400'}">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    {q.correct.includes(oi) ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}">
                    {q.correct.includes(oi) ? '✓' : String.fromCharCode(65 + oi)}
                  </span>
                  {String.fromCharCode(65 + oi)}) {opt}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

  </main>
</div>
