<script>
  import { theme } from '$lib/theme.js';
  import { page } from '$app/stores';

  const links = [
    { href: '/',                   label: '🏠 Hlavná' },
    { href: '/spravne-odpovede',   label: '📚 Správne odpovede' },
    { href: '/kviz',               label: '🎯 Kvíz' },
  ];
</script>

<header class="bg-slate-800 border-b border-slate-700/50">
  <div class="max-w-7xl mx-auto px-6 py-5">
    <div class="flex justify-end mb-3">
      <button
        on:click={() => theme.toggle()}
        class="w-10 h-10 rounded-full bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-lg hover:bg-blue-500 hover:border-blue-500 transition-all duration-200"
        aria-label="Prepnúť tému"
      >
        {#if $theme === 'dark'}🌙{:else}☀️{/if}
      </button>
    </div>
    <div class="text-center">
      <slot name="title" />
      <slot name="subtitle" />
      <nav class="flex flex-wrap justify-center gap-3 mt-5">
        {#each links as link}
          {@const active = $page.url.pathname === link.href}
          <a
            href={link.href}
            class="px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200
              {active
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:-translate-y-0.5'}"
          >{link.label}</a>
        {/each}
      </nav>
    </div>
  </div>
</header>
