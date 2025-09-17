<script lang="ts">
  import { toasts, removeToast } from '../stores.js';
  import { fly } from 'svelte/transition';

  function handleClose(id: string) {
    removeToast(id);
  }
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $toasts as toast (toast.id)}
    <div
      transition:fly={{ x: 300, duration: 300 }}
      class="toast {toast.type} flex items-center justify-between min-w-80"
      role="alert"
    >
      <div class="flex items-center">
        {#if toast.type === 'success'}
          <svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        {:else if toast.type === 'error'}
          <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        {:else if toast.type === 'warning'}
          <svg class="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        {:else}
          <svg class="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        {/if}
        
        <span class="text-sm font-medium">{toast.message}</span>
      </div>
      
      <button
        on:click={() => handleClose(toast.id)}
        class="ml-3 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast.success {
    @apply bg-green-900/90 border-green-500/50 backdrop-blur-sm;
  }
  
  .toast.error {
    @apply bg-red-900/90 border-red-500/50 backdrop-blur-sm;
  }
  
  .toast.warning {
    @apply bg-yellow-900/90 border-yellow-500/50 backdrop-blur-sm;
  }
  
  .toast.info {
    @apply bg-blue-900/90 border-blue-500/50 backdrop-blur-sm;
  }
</style>