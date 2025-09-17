<script lang="ts">
  import { onMount } from 'svelte';
  import { currentUser, selectedCourse } from '../lib/stores';
  import { api } from '../lib/api';
  import PageHeader from '../lib/components/PageHeader.svelte';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  import Toast from '../lib/components/Toast.svelte';

  let students: any[] = [];
  let attendance: { [key: string]: boolean } = {};
  let loading = true;
  let saving = false;
  let toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  onMount(async () => {
    if (!$selectedCourse) {
      window.location.hash = '#/courses';
      return;
    }

    try {
      const response = await api.get(`/students?courseId=${$selectedCourse.id}`);
      students = response.students || [];
      
      // Initialize attendance state
      students.forEach(student => {
        attendance[student.id] = false;
      });
    } catch (error) {
      console.error('Failed to load students:', error);
      showToast('Failed to load students', 'error');
    } finally {
      loading = false;
    }
  });

  function toggleAttendance(studentId: string) {
    attendance[studentId] = !attendance[studentId];
  }

  async function saveAttendance() {
    if (!$selectedCourse) return;

    saving = true;
    try {
      const attendanceData = Object.entries(attendance)
        .filter(([_, present]) => present)
        .map(([studentId]) => ({ studentId, courseId: $selectedCourse.id }));

      await api.post('/attendance', { attendance: attendanceData });
      showToast('Attendance saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      showToast('Failed to save attendance', 'error');
    } finally {
      saving = false;
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    toast = { show: true, message, type };
    setTimeout(() => {
      toast.show = false;
    }, 3000);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <PageHeader title="Take Attendance" />
  
  <div class="max-w-4xl mx-auto px-4 py-8">
    {#if $selectedCourse}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {$selectedCourse.name}
        </h2>
        <p class="text-gray-600">
          {$selectedCourse.code} • {new Date().toLocaleDateString()}
        </p>
      </div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    {:else if students.length === 0}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
        <p class="text-gray-600 mb-4">
          There are no students enrolled in this course yet.
        </p>
        <a 
          href="#/add-student" 
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Students
        </a>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Student List ({students.length} students)
          </h3>
        </div>
        
        <div class="divide-y divide-gray-200">
          {#each students as student}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={attendance[student.id]}
                  class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {student.name}
                      </p>
                      <p class="text-sm text-gray-500">
                        ID: {student.studentId}
                      </p>
                    </div>
                    <div class="text-right">
                      {#if attendance[student.id]}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Present
                        </span>
                      {:else}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Absent
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          {/each}
        </div>
        
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              {Object.values(attendance).filter(Boolean).length} of {students.length} students present
            </div>
            <button
              on:click={saveAttendance}
              disabled={saving}
              class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if saving}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              {:else}
                Save Attendance
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if toast.show}
  <Toast message={toast.message} type={toast.type} />
{/if}