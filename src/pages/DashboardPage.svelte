<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { selectedCourse, addToast, clearCourse } from '../lib/stores.js';
  import { authService, authStore } from '../lib/auth.js';
  import { api } from '../lib/api.js';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  import PageHeader from '../lib/components/PageHeader.svelte';
  
  const dispatch = createEventDispatcher();
  
  let stats = {
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    recentTrends: []
  };
  
  let loading = true;
  
  $: course = $selectedCourse;
  $: user = $authStore.user;
  
  onMount(() => {
    if (course) {
      loadDashboardData();
    }
  });
  
  async function loadDashboardData() {
    if (!course) return;
    
    loading = true;
    
    try {
      stats = await api.getDashboardStats(course.department, course.year, course.semester);
    } catch (error: any) {
      addToast(error.message || 'Failed to load dashboard data', 'error');
    } finally {
      loading = false;
    }
  }
  
  function handleAddStudent() {
    dispatch('addStudent');
  }
  
  function handleMarkAttendance() {
    dispatch('markAttendance');
  }
  
  function handleChangeCourse() {
    clearCourse();
    dispatch('changeCourse');
  }
  
  function handleSignOut() {
    authService.logout();
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-100">Dashboard</h1>
        {#if course}
          <p class="text-gray-400 mt-1">
            {course.department} • {course.year} • {course.semester}
          </p>
        {/if}
        {#if user}
          <p class="text-primary-400 text-sm mt-1">Welcome back, {user.full_name}</p>
        {/if}
      </div>
      
      <div class="flex space-x-3">
        <button
          on:click={handleChangeCourse}
          class="btn-secondary text-sm"
        >
          Change Course
        </button>
        <button
          on:click={handleSignOut}
          class="text-gray-400 hover:text-gray-200 text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
    
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    {:else}
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Students</p>
              <p class="text-3xl font-bold text-gray-100">{stats.totalStudents}</p>
            </div>
            <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Present Today</p>
              <p class="text-3xl font-bold text-green-400">{stats.presentToday}</p>
            </div>
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Absent Today</p>
              <p class="text-3xl font-bold text-red-400">{stats.absentToday}</p>
            </div>
            <div class="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Attendance Rate</p>
              <p class="text-3xl font-bold text-primary-400">{stats.attendanceRate}%</p>
            </div>
            <div class="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          on:click={handleAddStudent}
          class="card flex items-center justify-center space-x-3 py-8 hover:bg-gray-700 transition-colors"
        >
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <span class="text-lg font-medium text-gray-100">Add Student</span>
        </button>
        
        <button
          on:click={handleMarkAttendance}
          class="card flex items-center justify-center space-x-3 py-8 hover:bg-gray-700 transition-colors"
        >
          <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <span class="text-lg font-medium text-gray-100">Mark Attendance</span>
        </button>
        
        <button
          class="card flex items-center justify-center space-x-3 py-8 hover:bg-gray-700 transition-colors opacity-75 cursor-not-allowed"
          disabled
        >
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <span class="text-lg font-medium text-gray-100">Export Reports</span>
          <span class="text-xs text-gray-500">(Coming Soon)</span>
        </button>
      </div>
      
      <!-- Recent Attendance Trends -->
      {#if stats.recentTrends && stats.recentTrends.length > 0}
        <div class="card">
          <h3 class="text-xl font-semibold text-gray-100 mb-4">Recent Attendance (Last 7 Days)</h3>
          <div class="space-y-3">
            {#each stats.recentTrends as trend}
              <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span class="text-gray-300">{formatDate(trend.date)}</span>
                <div class="flex space-x-4 text-sm">
                  <span class="text-green-400">Present: {trend.present}</span>
                  <span class="text-red-400">Absent: {trend.absent}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>