<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { questionsDatabase, testConfigs } from '$lib/questions.js';

  // ── State ────────────────────────────────────────────────────
  let testKey    = 'A';
  let questions  = [];
  let config     = testConfigs['A'];
  let currentIdx = 0;
  let userAnswers = [];
  let timeLeft   = 0;
  let timerInterval;
  let showResults = false;
  let resultData  = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initTest() {
    const p       = $page.url.searchParams;
    testKey       = p.get('t') ?? 'A';
    const mixKeys = (p.get('keys') ?? '').split(',').filter(Boolean);
    const mixCount = parseInt(p.get('count') ?? '30');
    const mixTime  = parseInt(p.get('time')  ?? '45');

    if (testKey === 'MIX') {
      let all = [];
      mixKeys.forEach(k => { if (questionsDatabase[k]) all.push(...questionsDatabase[k]); });
      questions = shuffle(all).slice(0, Math.min(mixCount, all.length));
      config    = { name: 'Zmiešaný test', time: mixTime, desc: `${questions.length} otázok — ${mixKeys.join(', ')}` };
    } else {
      questions = shuffle(questionsDatabase[testKey] ?? []);
      config    = testConfigs[testKey] ?? testConfigs['A'];
    }

    userAnswers  = Array(questions.length).fill(null);
    currentIdx   = 0;
    timeLeft     = (config.time ?? 40) * 60;
    showResults  = false;
    resultData   = null;
    clearInterval(timerInterval);
    startTimer();
  }

  // ── Timer ────────────────────────────────────────────────────
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) { clearInterval(timerInterval); submitTest(); }
    }, 1000);
  }

  $: mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  $: secs = String(timeLeft % 60).padStart(2, '0');
  $: timerWarning = timeLeft > 0 && timeLeft <= 60;
  $: progress = questions.length
    ? (userAnswers.filter(a => a !== null).length / questions.length) * 100
    : 0;

  // ── Answer selection ─────────────────────────────────────────
  function selectOption(oi) {
    const q = questions[currentIdx];
    if (q.type === 'single') {
      userAnswers[currentIdx] = [oi];
    } else {
      const cur = userAnswers[currentIdx] ? [...userAnswers[currentIdx]] : [];
      const pos = cur.indexOf(oi);
      if (pos === -1) cur.push(oi); else cur.splice(pos, 1);
      userAnswers[currentIdx] = cur.length ? cur : null;
    }
    userAnswers = [...userAnswers];
  }

  function isSelected(oi) {
    return userAnswers[currentIdx]?.includes(oi) ?? false;
  }

  // ── Navigation ───────────────────────────────────────────────
  function prev()  { if (currentIdx > 0) currentIdx--; }
  function next()  { if (currentIdx < questions.length - 1) currentIdx++; }
  function goTo(i) { currentIdx = i; }

  // ── Submit ───────────────────────────────────────────────────
  function checkAnswer(q, ans) {
    if (!ans || ans.length === 0) return false;
    if (q.type === 'single') return ans.length === 1 && ans[0] === q.correct[0];
    if (ans.length !== q.correct.length) return false;
    return [...ans].sort().every((v, i) => v === [...q.correct].sort()[i]);
  }

  function submitTest() {
    clearInterval(timerInterval);
    let score = 0;
    const details = questions.map((q, i) => {
      const ans = userAnswers[i] ?? [];
      const ok  = checkAnswer(q, ans);
      if (ok) score++;
      return {
        question: q.question,
        userLetters:    ans.length ? ans.map(a => String.fromCharCode(65 + a)).join(', ') : 'Nezodpovedané',
        correctLetters: q.correct.map(c => String.fromCharCode(65 + c)).join(', '),
        correctOptions: q.correct.map(c => q.options[c]).join('; '),
        ok
      };
    });
    const pct = Math.round((score / questions.length) * 100);
    resultData  = { score, total: questions.length, pct, details };
    showResults = true;
  }

  function restartTest() {
    showResults = false;
    initTest();
  }

  onMount(() => initTest());
  onDestroy(() => clearInterval(timerInterval));
</script>

<svelte:head><title>{config?.name ?? 'Test'} | ELTEC</title></svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

  <!-- Header -->
  <div class="bg-slate-800 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h2 class="text-xl font-bold">{config?.name ?? ''}</h2>
      <p class="text-slate-400 text-sm mt-0.5">{config?.desc ?? ''}</p>
    </div>
    <div class="font-mono text-2xl font-bold px-6 py-2 rounded-full border
      {timerWarning
        ? 'text-red-400 border-red-500/50 bg-red-500/10 animate-pulse'
        : 'text-amber-400 border-amber-500/30 bg-slate-900/60'}">
      {mins}:{secs}
    </div>
  </div>

  <!-- Progress bar -->
  <div class="h-1.5 bg-slate-800">
    <div class="h-full bg-emerald-500 transition-all duration-300 rounded-r-full" style="width:{progress}%"></div>
  </div>

  <!-- Question nav -->
  <div class="flex flex-wrap gap-2 px-6 py-4 bg-slate-800/40 border-b border-slate-700/30">
    {#each questions as _, i}
      <button
        on:click={() => goTo(i)}
        class="w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-150
          {i === currentIdx
            ? 'bg-blue-500 text-white scale-110'
            : userAnswers[i] !== null
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      >{i + 1}</button>
    {/each}
  </div>

  <!-- Question -->
  <div class="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-8">
    {#if questions.length && !showResults}
      {@const q = questions[currentIdx]}

      <div class="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 mb-6">
        <p class="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
          Otázka {currentIdx + 1} z {questions.length}
          {#if q.type === 'multi'}<span class="ml-2 text-amber-400">✦ viac správnych</span>{/if}
        </p>
        <h2 class="text-xl font-bold leading-snug">{q.question}</h2>
      </div>

      <div class="space-y-3 mb-8">
        {#each q.options as opt, oi}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <div
            on:click={() => selectOption(oi)}
            class="flex items-center gap-4 px-6 py-5 rounded-2xl border cursor-pointer transition-all duration-150
              {isSelected(oi)
                ? 'bg-blue-500/20 border-blue-500 text-white'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50 hover:translate-x-1'}"
          >
            <input
              type={q.type === 'single' ? 'radio' : 'checkbox'}
              checked={isSelected(oi)}
              on:click|stopPropagation={() => selectOption(oi)}
              class="w-5 h-5 accent-blue-500 cursor-pointer flex-shrink-0"
            />
            <span class="font-medium">{String.fromCharCode(65 + oi)}) {opt}</span>
          </div>
        {/each}
      </div>

      <div class="flex justify-between items-center pt-6 border-t border-slate-700/50 gap-3">
        <button
          on:click={prev}
          disabled={currentIdx === 0}
          class="px-6 py-3 rounded-full font-semibold min-w-[150px] transition-all
                 bg-slate-700 text-slate-200 hover:bg-slate-600
                 disabled:opacity-40 disabled:cursor-not-allowed"
        >← Predchádzajúca</button>

        {#if currentIdx === questions.length - 1}
          <button
            on:click={submitTest}
            class="px-6 py-3 rounded-full font-semibold min-w-[150px] bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          >✅ Odovzdať test</button>
        {:else}
          <button
            on:click={next}
            class="px-6 py-3 rounded-full font-semibold min-w-[150px] bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >Ďalšia →</button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Results modal -->
{#if showResults && resultData}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-5">
    <div class="bg-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">

      <div class="flex items-center justify-between px-8 py-6 border-b border-slate-700/50 flex-shrink-0">
        <h2 class="text-2xl font-bold">📊 Výsledky testu</h2>
        <button on:click={() => goto('/')}
                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors text-xl leading-none">✕</button>
      </div>

      <div class="overflow-y-auto p-8">
        <div class="flex flex-col items-center text-center mb-8">
          <div class="relative w-36 h-36 mb-4">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" stroke-width="10"/>
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={resultData.pct >= 90 ? '#10b981' : resultData.pct >= 75 ? '#3b82f6' : resultData.pct >= 50 ? '#f59e0b' : '#ef4444'}
                stroke-width="10"
                stroke-dasharray="{2 * Math.PI * 42}"
                stroke-dashoffset="{2 * Math.PI * 42 * (1 - resultData.pct / 100)}"
                stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-extrabold"
                style="color:{resultData.pct >= 90 ? '#10b981' : resultData.pct >= 75 ? '#3b82f6' : resultData.pct >= 50 ? '#f59e0b' : '#ef4444'}">
                {resultData.score}
              </span>
              <span class="text-slate-400">/ {resultData.total}</span>
            </div>
          </div>
          <p class="text-2xl font-bold"
            style="color:{resultData.pct >= 90 ? '#10b981' : resultData.pct >= 75 ? '#3b82f6' : resultData.pct >= 50 ? '#f59e0b' : '#ef4444'}">
            {resultData.pct >= 90 ? 'Výborný! 🎉' : resultData.pct >= 75 ? 'Dobrý! 👍' : resultData.pct >= 50 ? 'Priemerný 📊' : 'Treba viac trénovať 📚'}
          </p>
          <p class="text-slate-400 mt-1">Úspešnosť: <strong class="text-slate-200">{resultData.pct}%</strong></p>
        </div>

        <h3 class="font-bold mb-4 text-slate-300">Podrobné výsledky:</h3>
        <div class="space-y-3 mb-8">
          {#each resultData.details as d, i}
            <div class="rounded-2xl p-4 bg-slate-700/40 border border-slate-600/30 border-l-4
              {d.ok ? 'border-l-emerald-500' : 'border-l-red-500'}">
              <p class="font-semibold text-sm mb-1">{i+1}. {d.question}</p>
              <p class="text-sm {d.ok ? 'text-emerald-400' : 'text-red-400'}">
                {d.ok ? '✓' : '✗'} Vaša odpoveď: {d.userLetters}
              </p>
              {#if !d.ok}
                <p class="text-sm text-slate-400 mt-0.5">Správna: {d.correctLetters}) {d.correctOptions}</p>
              {/if}
            </div>
          {/each}
        </div>

        <div class="flex gap-3">
          <button on:click={restartTest}
                  class="flex-1 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors">
            🔄 Znova
          </button>
          <button on:click={() => goto('/')}
                  class="flex-1 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors">
            🏠 Domov
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
