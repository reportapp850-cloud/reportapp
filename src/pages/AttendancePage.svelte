<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { selectedCourse, addToast } from '../lib/stores.js';
  import { api } from '../lib/api.js';
  import PageHeader from '../lib/components/PageHeader.svelte';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  
  const dispatch = createEventDispatcher();

  let students: any[] = [];
  let attendanceMap: { [key: string]: 'present' | 'absent' | null } = {};
  let loading = true;
  let saving = false;
  let selectedDate = new Date().toISOString().split('T')[0];
  
  $: course = $selectedCourse;

  onMount(async () => {
    if (!course) {
      return;
    }

    await loadAttendanceData();
  });

  async function loadAttendanceData() {
    if (!course) return;
    
    loading = true;
    try {
      students = await api.getAttendance(course.department, course.year, course.semester, selectedDate);
      
      // Initialize attendance map
      attendanceMap = {};
      students.forEach(student => {
        attendanceMap[student.id] = student.status || null;
      });
    } catch (error: any) {
      addToast(error.message || 'Failed to load attendance data', 'error');
    } finally {
      loading = false;
    }
  }

  function setAttendance(studentId: string, status: 'present' | 'absent') {
    attendanceMap[studentId] = status;
  }
  
  async function handleDateChange() {
    await loadAttendanceData();
  }

  async function saveAttendance() {
    if (!course) return;

    saving = true;
    try {
      const attendanceRecords = Object.entries(attendanceMap)
        .filter(([_, status]) => status !== null)
        .map(([studentId, status]) => ({
          student_id: studentId,
          attendance_date: selectedDate,
          status
        }));

      await api.markAttendance(attendanceRecords);
      addToast('Attendance saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save attendance', 'error');
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    dispatch('back');
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-4xl mx-auto">
    <PageHeader
      title="Mark Attendance"
      subtitle="{course?.department} • {course?.year} • {course?.semester}"
      showBackButton
      on:back={handleBack}
    />
  
    <!-- Date Selection -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-100">Select Date</h3>
        <input
          type="date"
          bind:value={selectedDate}
          on:change={handleDateChange}
          class="form-input rounded-lg"
        />
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    {:else if students.length === 0}
      <div class="card text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-100 mb-2">No Students Found</h3>
        <p class="text-gray-400 mb-4">
          There are no students enrolled in this course yet.
        </p>
        <button
          on:click={() => dispatch('addStudent')}
          class="btn-primary"
        >
          Add Students
        </button>
      </div>
    {:else}
      <div class="card">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-100">
            Student List ({students.length} students)
          </h3>
          <p class="text-gray-400 text-sm mt-1">
            Date: {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
        
        <div class="space-y-3">
          {#each students as student}
            <div class="bg-gray-700/50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-100">
                    {student.full_name}
                  </p>
                  <p class="text-sm text-gray-400">
                    {student.registration_number}
                  </p>
                </div>
                
                <div class="flex space-x-2">
                  <button
                    on:click={() => setAttendance(student.id, 'present')}
                    class="px-3 py-1 rounded-lg text-sm font-medium transition-colors
                           {attendanceMap[student.id] === 'present' 
                             ? 'bg-green-600 text-white' 
                             : 'bg-gray-600 text-gray-300 hover:bg-green-600 hover:text-white'}"
                  >
                    Present
                  </button>
                  
                  <button
                    on:click={() => setAttendance(student.id, 'absent')}
                    class="px-3 py-1 rounded-lg text-sm font-medium transition-colors
                           {attendanceMap[student.id] === 'absent' 
                             ? 'bg-red-600 text-white' 
                             : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'}"
                  >
                    Absent
                  </button>
                  
                  {#if attendanceMap[student.id]}
                    <button
                      on:click={() => setAttendance(student.id, null)}
                      class="px-3 py-1 rounded-lg text-sm font-medium bg-gray-600 text-gray-300 hover:bg-gray-500"
                    >
                      Clear
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-6 pt-6 border-t border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-400">
              {Object.values(attendanceMap).filter(status => status === 'present').length} present, 
              {Object.values(attendanceMap).filter(status => status === 'absent').length} absent,
              {Object.values(attendanceMap).filter(status => status === null).length} unmarked
            </div>
            
            <div class="flex space-x-3">
              <button
                on:click={handleBack}
                class="btn-secondary"
              >
                Cancel
              </button>
              
              <button
                on:click={saveAttendance}
                disabled={saving}
                class="btn-primary"
              >
                {#if saving}
                  <LoadingSpinner size="sm" />
                {:else}
                  Save Attendance
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
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