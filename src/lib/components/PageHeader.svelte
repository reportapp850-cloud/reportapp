<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let showBackButton = false;
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleBack() {
    dispatch('back');
  }
</script>

<div class="mb-8">
  <div class="flex items-center space-x-4">
    {#if showBackButton}
      <button
        on:click={handleBack}
        class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
    {/if}
    
    <div>
      <h1 class="text-3xl font-bold text-gray-100">{title}</h1>
      {#if subtitle}
        <p class="text-gray-400 mt-1">{subtitle}</p>
      {/if}
    </div>
  </div>
  
  <div class="mt-6 h-px bg-gradient-to-r from-primary-500/50 to-transparent"></div>
</div>