<script>
  import Nav from '$lib/Nav.svelte';
  import { questionsDatabase } from '$lib/questions.js';

  // ── Setup state ──────────────────────────────────────────────
  let selectedTest = 'A';
  let questionCount = 10;

  // ── Quiz state ───────────────────────────────────────────────
  let phase = 'setup'; // 'setup' | 'quiz' | 'results'
  let questions = [];
  let userAnswers = [];
  let answerStatus = []; // null | true | false
  let currentIdx = 0;
  let quizFinished = false;

  const testOptions = [
    { value: 'A',   label: 'Test A — Elektrotechnické merania' },
    { value: 'B',   label: 'Test B — Ochranné opatrenia' },
    { value: 'C',   label: 'Test C — Bezpečnosť práce' },
    { value: 'D',   label: 'Test D — Prvá pomoc' },
    { value: 'LEG', label: 'Legislatíva' },
  ];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    const available = questionsDatabase[selectedTest] ?? [];
    if (!available.length) { alert('Žiadne otázky.'); return; }
    const n = Math.min(questionCount, available.length);
    questions    = shuffle(available).slice(0, n);
    userAnswers  = Array(n).fill(null);
    answerStatus = Array(n).fill(null);
    currentIdx   = 0;
    quizFinished = false;
    phase        = 'quiz';
  }

  // ── Answer selection ─────────────────────────────────────────
  function selectOption(oi) {
    if (answerStatus[currentIdx] !== null) return;
    const q = questions[currentIdx];
    if (q.type === 'multi') {
      const cur = Array.isArray(userAnswers[currentIdx]) ? [...userAnswers[currentIdx]] : [];
      const pos = cur.indexOf(oi);
      if (pos === -1) cur.push(oi); else cur.splice(pos, 1);
      userAnswers[currentIdx] = cur.length ? cur : null;
    } else {
      userAnswers[currentIdx] = oi;
    }
    userAnswers = [...userAnswers];
  }

  function isSelected(oi) {
    const ans = userAnswers[currentIdx];
    if (ans === null || ans === undefined) return false;
    return Array.isArray(ans) ? ans.includes(oi) : ans === oi;
  }

  // ── Check ────────────────────────────────────────────────────
  function checkAnswer() {
    if (answerStatus[currentIdx] !== null) { alert('Túto otázku už máš skontrolovanú!'); return; }
    const q   = questions[currentIdx];
    const ans = userAnswers[currentIdx];
    if (ans === null || (Array.isArray(ans) && ans.length === 0)) {
      alert('Najprv označ nejakú odpoveď!'); return;
    }
    let ok = false;
    if (q.type === 'multi') {
      ok = Array.isArray(ans) && ans.length === q.correct.length &&
           JSON.stringify([...ans].sort()) === JSON.stringify([...q.correct].sort());
    } else {
      ok = q.correct.includes(ans);
    }
    answerStatus[currentIdx] = ok;
    answerStatus = [...answerStatus];
  }

  // ── Navigation ───────────────────────────────────────────────
  function prev() { if (currentIdx > 0) currentIdx--; }

  function next() {
    if (answerStatus[currentIdx] === null) { alert('Najprv skontroluj odpoveď!'); return; }
    if (currentIdx < questions.length - 1) currentIdx++;
  }

  function finishQuiz() {
    if (!answerStatus.every(s => s !== null)) { alert('Najprv skontroluj všetky otázky!'); return; }
    quizFinished = true;
    phase = 'results';
  }

  // ── Computed ─────────────────────────────────────────────────
  $: q            = questions[currentIdx];
  $: checked      = answerStatus[currentIdx];
  $: isLast       = currentIdx === questions.length - 1;
  $: canNext      = answerStatus[currentIdx] !== null && !isLast;
  $: canFinish    = isLast && answerStatus[currentIdx] !== null;
  $: correctCount = answerStatus.filter(Boolean).length;
  $: resultPct    = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  function answerLetter(ans) {
    if (ans === null || ans === undefined) return '?';
    if (Array.isArray(ans)) return ans.map(a => String.fromCharCode(65 + a)).join(', ');
    return String.fromCharCode(65 + ans);
  }
</script>

<svelte:head><title>🎯 Kvíz | ELTEC</title></svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
  <Nav>
    <svelte:fragment slot="title">
      <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent mb-2">
        🎯 Strel odpoveď!
      </h1>
    </svelte:fragment>
    <svelte:fragment slot="subtitle">
      <p class="text-slate-400 text-sm">Vyber test, označ odpovede a klikni na "Skontrolovať"</p>
    </svelte:fragment>
  </Nav>

  <main class="max-w-2xl mx-auto px-6 py-10">

    <!-- ── Setup ─────────────────────────────────────────────── -->
    {#if phase === 'setup'}
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-10 text-center">
        <h2 class="text-2xl font-bold mb-8">🎯 Výber kvízu</h2>
        <div class="space-y-5 text-left">
          <label class="block">
            <span class="text-sm font-semibold text-slate-300 mb-2 block">📘 Vyber test</span>
            <select bind:value={selectedTest}
                    class="w-full bg-slate-700 border border-slate-600 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500">
              {#each testOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-slate-300 mb-2 block">🔢 Počet otázok</span>
            <input type="number" bind:value={questionCount} min="1" max="50"
                   class="w-full bg-slate-700 border border-slate-600 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500" />
          </label>
        </div>
        <button on:click={startQuiz}
                class="mt-8 px-10 py-3.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors duration-200">
          🚀 Spustiť kvíz
        </button>
      </div>

    <!-- ── Quiz ──────────────────────────────────────────────── -->
    {:else if phase === 'quiz' && q}
      <!-- Progress bar -->
      <div class="h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div class="h-full bg-emerald-500 transition-all duration-300 rounded-full"
             style="width:{(currentIdx / questions.length) * 100}%"></div>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 mb-4">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3 flex-wrap mb-6">
          <span class="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {currentIdx + 1} / {questions.length}
          </span>
          <span class="bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
            {q.type === 'multi' ? '✅ Viac správnych' : '🔘 Jedna správna'}
          </span>
        </div>

        <p class="text-lg font-bold mb-6 leading-snug">{q.question}</p>

        <!-- Options -->
        <div class="space-y-3">
          {#each q.options as opt, oi}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div
              on:click={() => selectOption(oi)}
              class="flex items-center gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-all duration-150
                {checked !== null && q.correct.includes(oi)
                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                  : checked !== null && isSelected(oi) && !q.correct.includes(oi)
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : isSelected(oi)
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-slate-700/40 border-slate-600/40 text-slate-300 hover:border-slate-500'}"
            >
              {#if q.type === 'multi'}
                <span class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold
                  {isSelected(oi) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-500'}">
                  {isSelected(oi) ? '✓' : ''}
                </span>
              {:else}
                <span class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  {isSelected(oi) ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'}">
                  {String.fromCharCode(65 + oi)}
                </span>
              {/if}
              <span class="text-sm font-medium">{String.fromCharCode(65 + oi)}) {opt}</span>
            </div>
          {/each}
        </div>

        <!-- Feedback -->
        {#if checked !== null}
          {@const correctLetters = q.correct.map(c => String.fromCharCode(65 + c)).join(', ')}
          {@const correctOpts    = q.correct.map(c => q.options[c]).join('; ')}
          <div class="mt-5 rounded-2xl p-4 border-l-4 {checked ? 'bg-emerald-500/10 border-emerald-500' : 'bg-red-500/10 border-red-500'}">
            <p class="font-bold mb-1 {checked ? 'text-emerald-400' : 'text-red-400'}">
              {checked ? '✓ Správne!' : '✗ Nesprávne'}
            </p>
            <p class="text-sm text-slate-400">Tvoja odpoveď: {answerLetter(userAnswers[currentIdx])}</p>
            {#if !checked}
              <p class="text-sm text-emerald-400 mt-1">Správna: {correctLetters}) {correctOpts}</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Nav buttons -->
      <div class="flex gap-3 flex-wrap">
        <button on:click={prev} disabled={currentIdx === 0}
                class="flex-1 py-3 rounded-full font-semibold transition-colors disabled:opacity-40 bg-slate-700 hover:bg-slate-600 text-slate-200">
          ◀ Predchádzajúca
        </button>
        <button on:click={checkAnswer} disabled={checked !== null}
                class="flex-1 py-3 rounded-full font-semibold transition-colors disabled:opacity-40 bg-amber-500 hover:bg-amber-600 text-white">
          ✅ Skontrolovať
        </button>
        {#if canNext}
          <button on:click={next} class="flex-1 py-3 rounded-full font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
            Ďalšia ▶
          </button>
        {:else if canFinish}
          <button on:click={finishQuiz} class="flex-1 py-3 rounded-full font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
            🏁 Ukončiť kvíz
          </button>
        {/if}
      </div>

    <!-- ── Results ────────────────────────────────────────────── -->
    {:else if phase === 'results'}
      {@const color = resultPct >= 90 ? '#10b981' : resultPct >= 75 ? '#3b82f6' : resultPct >= 50 ? '#f59e0b' : '#ef4444'}
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 text-center mb-6">
        <h2 class="text-2xl font-bold mb-4">📊 Konečné výsledky</h2>
        <p class="text-5xl font-extrabold mb-2" style="color:{color}">{correctCount} / {questions.length}</p>
        <p class="text-slate-400">({resultPct}%)</p>
        <button on:click={() => { phase = 'setup'; }}
                class="mt-6 px-8 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors">
          🔄 Nový kvíz
        </button>
      </div>

      <div class="space-y-3">
        {#each questions as qr, i}
          <div class="rounded-2xl p-4 border border-slate-700/50 bg-slate-800/40 border-l-4
            {answerStatus[i] ? 'border-l-emerald-500' : 'border-l-red-500'}">
            <p class="font-semibold text-sm mb-1">{i+1}. {qr.question}</p>
            <p class="text-sm text-slate-400">Tvoja odpoveď: {answerLetter(userAnswers[i])}</p>
            <p class="text-sm text-emerald-400">Správne: {qr.correct.map(c => String.fromCharCode(65+c)).join(', ')}</p>
          </div>
        {/each}
      </div>
    {/if}

  </main>
</div>
