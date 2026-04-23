<script>
  import { goto } from '$app/navigation';
  import Nav from '$lib/Nav.svelte';
  import { questionsDatabase, testConfigs } from '$lib/questions.js';

  // ── Test cards ──────────────────────────────────────────────
  const tests = [
    { key: 'A',   emoji: '🔧', title: 'Test A — Merania',       time: 40, count: 32,  desc: 'Elektrotechnické merania, bleskozvody, izolácia, uzemnenie a ochranné opatrenia' },
    { key: 'B',   emoji: '⚡', title: 'Test B — Ochrany',       time: 35, count: 24,  desc: 'Meranie ochrán, siete TT/TN, chrániče, ochranné vodiče a uzemnenie' },
    { key: 'C',   emoji: '👷', title: 'Test C — Bezpečnosť',    time: 50, count: 62,  desc: 'Bezpečnostné predpisy, PPN, príkazy B, ochranné pomôcky, vonkajšie vplyvy' },
    { key: 'D',   emoji: '🩺', title: 'Test D — Prvá pomoc',    time: 25, count: 21,  desc: 'Úrazy elektrickým prúdom, oživovanie, krvácanie, popáleniny, stabilizovaná poloha' },
    { key: 'LEG', emoji: '⚖️', title: 'Test Legislatíva',       time: 50, count: 57,  desc: 'Vyhláška 508/2009, TI, IBP, odborná spôsobilosť, skúšky, dokumentácia' },
  ];

  // ── Mix modal ───────────────────────────────────────────────
  let showMixModal = false;
  let mixCount = 30;
  let mixTime  = 45;
  let mixIncludes = { A: true, B: true, C: true, D: false, LEG: false };

  function startTest(key) {
    goto(`/test?t=${key}`);
  }

  function startMix() {
    const keys = Object.entries(mixIncludes).filter(([,v]) => v).map(([k]) => k);
    if (!keys.length) { alert('Vyber aspoň jeden test!'); return; }
    const params = new URLSearchParams({ t: 'MIX', keys: keys.join(','), count: mixCount, time: mixTime });
    goto(`/test?${params}`);
  }
</script>

<svelte:head><title>ELTEC Certifikačný systém</title></svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
  <Nav>
    <svelte:fragment slot="title">
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent mb-3">
        ⚡ ELTEC Certifikačný systém
      </h1>
    </svelte:fragment>
    <svelte:fragment slot="subtitle">
      <p class="text-slate-400 text-base">Profesionálna príprava na skúšky podľa Vyhlášky č.&nbsp;508/2009&nbsp;Z.z.</p>
    </svelte:fragment>
  </Nav>

  <main class="max-w-7xl mx-auto px-6 py-12">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {#each tests as t}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div
          class="relative group bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 cursor-pointer overflow-hidden
                 hover:border-blue-500/70 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.25)] transition-all duration-300"
          on:click={() => startTest(t.key)}
        >
          <!-- bg emoji -->
          <span class="absolute -bottom-3 -right-3 text-[8rem] opacity-[0.07] group-hover:opacity-[0.12] select-none pointer-events-none transition-opacity duration-300 leading-none">
            {t.emoji}
          </span>
          <!-- top accent bar -->
          <span class="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

          <h3 class="text-2xl font-bold mb-4 relative z-10">{t.title}</h3>

          <div class="flex gap-4 text-sm text-slate-400 bg-slate-700/40 border border-slate-600/30 rounded-full px-4 py-2 mb-5 relative z-10 w-fit">
            <span>⏱ {t.time} min</span>
            <span>📊 {t.count} otázok</span>
          </div>

          <p class="text-slate-400 text-sm leading-relaxed mb-6 min-h-[3.5rem] relative z-10">{t.desc}</p>

          <button
            class="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors duration-200 relative z-10"
            on:click|stopPropagation={() => startTest(t.key)}
          >
            Spustiť test
          </button>
        </div>
      {/each}

      <!-- Mix card -->
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        class="relative group bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 cursor-pointer overflow-hidden
               hover:border-amber-500/70 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.25)] transition-all duration-300"
        on:click={() => showMixModal = true}
      >
        <span class="absolute -bottom-3 -right-3 text-[8rem] opacity-[0.07] group-hover:opacity-[0.12] select-none pointer-events-none transition-opacity duration-300 leading-none">🎲</span>
        <span class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

        <h3 class="text-2xl font-bold mb-4 relative z-10">Zmiešaný test</h3>
        <div class="flex gap-4 text-sm text-slate-400 bg-slate-700/40 border border-slate-600/30 rounded-full px-4 py-2 mb-5 relative z-10 w-fit">
          <span>⏱ variabilný</span>
          <span>📊 variabilný</span>
        </div>
        <p class="text-slate-400 text-sm leading-relaxed mb-6 min-h-[3.5rem] relative z-10">Zmiešané otázky zo všetkých testov — A, B, C, D a Legislatíva</p>
        <button
          class="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors duration-200 relative z-10"
          on:click|stopPropagation={() => showMixModal = true}
        >
          Spustiť mix
        </button>
      </div>

    </div>
  </main>

  <footer class="border-t border-slate-800 bg-slate-900/60 text-slate-500 text-sm text-center py-6 mt-4">
    <p>© 2026 Certifikačný systém podľa Vyhlášky č.&nbsp;508/2009&nbsp;Z.z.</p>
    <p class="mt-1 text-xs opacity-60">Test A: 32 | Test B: 24 | Test C: 62 | Test D: 21 | Legislatíva: 57</p>
    <p class="mt-1">by Džanči from ❤️</p>
  </footer>
</div>

<!-- ── Mix Modal ─────────────────────────────────────────────── -->
{#if showMixModal}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-5"
       on:click|self={() => showMixModal = false}>
    <div class="bg-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-8 py-6 border-b border-slate-700/50">
        <h2 class="text-2xl font-bold">🎲 Zmiešaný test — nastavenie</h2>
        <button on:click={() => showMixModal = false}
                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors text-xl">✕</button>
      </div>
      <div class="p-8 space-y-6">
        <label class="block">
          <span class="text-sm font-semibold text-slate-300 mb-2 block">📊 Počet otázok</span>
          <input type="number" bind:value={mixCount} min="5" max="200"
                 class="w-full bg-slate-700 border border-slate-600 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-slate-300 mb-2 block">⏱ Časový limit (minúty)</span>
          <input type="number" bind:value={mixTime} min="5" max="240"
                 class="w-full bg-slate-700 border border-slate-600 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
        </label>
        <div class="bg-slate-700/50 border border-slate-600/40 rounded-2xl p-5">
          <h4 class="text-amber-400 font-semibold mb-4">Vyberte testy pre zmiešanie:</h4>
          {#each [['A','🔧 Test A (32)'], ['B','⚡ Test B (24)'], ['C','👷 Test C (62)'], ['D','🩺 Test D (21)'], ['LEG','⚖️ Legislatíva (57)']] as [k, label]}
            <label class="flex items-center gap-3 py-2 cursor-pointer hover:text-slate-100 transition-colors">
              <input type="checkbox" bind:checked={mixIncludes[k]}
                     class="w-5 h-5 rounded accent-amber-500 cursor-pointer" />
              <span class="text-slate-300">{label}</span>
            </label>
          {/each}
        </div>
        <button on:click={startMix}
                class="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors duration-200">
          🎲 Spustiť test
        </button>
      </div>
    </div>
  </div>
{/if}
