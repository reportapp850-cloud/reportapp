<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { api } from '../lib/api.js';
  import { setCourse, addToast } from '../lib/stores.js';
  import { authService } from '../lib/auth.js';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  import PageHeader from '../lib/components/PageHeader.svelte';
  
  const dispatch = createEventDispatcher();
  
  let departments: string[] = [];
  let years: string[] = [];
  let semesters: string[] = [];
  
  let selectedDepartment = '';
  let selectedYear = '';
  let selectedSemester = '';
  
  let loading = true;
  let submitting = false;
  
  onMount(async () => {
    try {
      const courses = await api.getCourses();
      departments = courses.departments;
      years = courses.years;
      semesters = courses.semesters;
    } catch (error: any) {
      addToast(error.message || 'Failed to load course options', 'error');
    } finally {
      loading = false;
    }
  });
  
  function handleDepartmentChange() {
    selectedYear = '';
    selectedSemester = '';
  }
  
  function handleYearChange() {
    selectedSemester = '';
  }
  
  async function handleProceed() {
    if (!selectedDepartment || !selectedYear || !selectedSemester) {
      addToast('Please select all course options', 'warning');
      return;
    }
    
    submitting = true;
    
    try {
      setCourse({
        department: selectedDepartment,
        year: selectedYear,
        semester: selectedSemester
      });
      
      addToast('Course selected successfully!', 'success');
      dispatch('proceed');
    } catch (error: any) {
      addToast('Failed to set course selection', 'error');
    } finally {
      submitting = false;
    }
  }
  
  function handleSignOut() {
    authService.logout();
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-2xl mx-auto">
    <PageHeader 
      title="Select Your Course"
      subtitle="Choose your department, year, and semester to continue"
    />
    
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading course options..." />
      </div>
    {:else}
      <div class="card">
        <div class="space-y-6">
          <!-- Department Selection -->
          <div>
            <label for="department" class="block text-sm font-medium text-gray-300 mb-3">
              Department
            </label>
            <select
              id="department"
              bind:value={selectedDepartment}
              on:change={handleDepartmentChange}
              class="form-select block w-full rounded-lg"
            >
              <option value="">Select Department</option>
              {#each departments as dept}
                <option value={dept}>{dept}</option>
              {/each}
            </select>
          </div>
          
          <!-- Year Selection -->
          <div>
            <label for="year" class="block text-sm font-medium text-gray-300 mb-3">
              Year
            </label>
            <select
              id="year"
              bind:value={selectedYear}
              on:change={handleYearChange}
              disabled={!selectedDepartment}
              class="form-select block w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Year</option>
              {#each years as year}
                <option value={year}>{year}</option>
              {/each}
            </select>
          </div>
          
          <!-- Semester Selection -->
          <div>
            <label for="semester" class="block text-sm font-medium text-gray-300 mb-3">
              Semester
            </label>
            <select
              id="semester"
              bind:value={selectedSemester}
              disabled={!selectedYear}
              class="form-select block w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Semester</option>
              {#each semesters as semester}
                <option value={semester}>{semester}</option>
              {/each}
            </select>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex space-x-4 pt-6">
            <button
              on:click={handleProceed}
              disabled={!selectedDepartment || !selectedYear || !selectedSemester || submitting}
              class="btn-primary flex-1"
            >
              {#if submitting}
                <LoadingSpinner size="sm" />
              {:else}
                Proceed to Dashboard
              {/if}
            </button>
            
            <button
              on:click={handleSignOut}
              class="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <!-- Course Info -->
      {#if selectedDepartment || selectedYear || selectedSemester}
        <div class="mt-6 bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-primary-400 mb-2">Selected Course</h3>
          <div class="space-y-1 text-sm text-gray-300">
            <p>Department: {selectedDepartment || 'Not selected'}</p>
            <p>Year: {selectedYear || 'Not selected'}</p>
            <p>Semester: {selectedSemester || 'Not selected'}</p>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>