<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authService, authStore } from '../lib/auth.js';
  import { addToast } from '../lib/stores.js';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  
  const dispatch = createEventDispatcher();
  
  let isLogin = true;
  let email = '';
  let password = '';
  let fullName = '';
  let errors: { [key: string]: string } = {};
  
  $: loading = $authStore.loading;
  
  function validateForm() {
    errors = {};
    
    if (!email || !email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && (!fullName || fullName.trim().length < 2)) {
      errors.fullName = 'Full name is required';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        await authService.login(email, password);
        addToast('Welcome back!', 'success');
      } else {
        await authService.register(email, password, fullName);
        addToast('Account created successfully!', 'success');
      }
      dispatch('login');
    } catch (error: any) {
      addToast(error.message || 'Authentication failed', 'error');
    }
  }
  
  function toggleMode() {
    isLogin = !isLogin;
    errors = {};
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
          </svg>
        </div>
      </div>
      
      <h2 class="text-3xl font-bold text-gray-100">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p class="mt-2 text-gray-400">
        {isLogin ? 'Sign in to your student portal' : 'Join the student portal today'}
      </p>
    </div>
    
    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div class="space-y-4">
        {#if !isLogin}
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              bind:value={fullName}
              class="form-input block w-full rounded-lg"
              placeholder="Enter your full name"
              class:border-red-500={errors.fullName}
            />
            {#if errors.fullName}
              <p class="mt-1 text-sm text-red-500">{errors.fullName}</p>
            {/if}
          </div>
        {/if}
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="form-input block w-full rounded-lg"
            placeholder="Enter your email"
            class:border-red-500={errors.email}
          />
          {#if errors.email}
            <p class="mt-1 text-sm text-red-500">{errors.email}</p>
          {/if}
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="form-input block w-full rounded-lg"
            placeholder="Enter your password"
            class:border-red-500={errors.password}
          />
          {#if errors.password}
            <p class="mt-1 text-sm text-red-500">{errors.password}</p>
          {/if}
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          class="btn-primary w-full flex justify-center"
        >
          {#if loading}
            <LoadingSpinner size="sm" />
          {:else}
            {isLogin ? 'Sign In' : 'Create Account'}
          {/if}
        </button>
      </div>
      
      <div class="text-center">
        <button
          type="button"
          on:click={toggleMode}
          class="text-primary-400 hover:text-primary-300 text-sm"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>