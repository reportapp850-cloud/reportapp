<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let text: string = '';
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
</script>

<div class="flex items-center justify-center space-x-2">
  <div class="loading-spinner {sizeClasses[size]}"></div>
  {#if text}
    <span class="text-gray-400 text-sm">{text}</span>
  {/if}
</div>