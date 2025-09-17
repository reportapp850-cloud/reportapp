<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from './lib/auth.js';
  import { selectedCourse } from './lib/stores.js';
  
  // Components
  import Toast from './lib/components/Toast.svelte';
  import LoginPage from './pages/LoginPage.svelte';
  import CourseSelectionPage from './pages/CourseSelectionPage.svelte';
  import DashboardPage from './pages/DashboardPage.svelte';
  import AddStudentPage from './pages/AddStudentPage.svelte';
  import AttendancePage from './pages/AttendancePage.svelte';

  let currentPage = 'login';
  
  onMount(() => {
    // Check if user is logged in
    authStore.subscribe(auth => {
      if (!auth.user) {
        currentPage = 'login';
      } else if (!$selectedCourse) {
        currentPage = 'course-selection';
      } else {
        if (currentPage === 'login' || currentPage === 'course-selection') {
          currentPage = 'dashboard';
        }
      }
    });
  });
  
  function navigateTo(page: string) {
    currentPage = page;
  }
</script>

<main class="min-h-screen bg-gray-900">
  {#if currentPage === 'login'}
    <LoginPage on:login={() => navigateTo('course-selection')} />
  {:else if currentPage === 'course-selection'}
    <CourseSelectionPage on:proceed={() => navigateTo('dashboard')} />
  {:else if currentPage === 'dashboard'}
    <DashboardPage 
      on:addStudent={() => navigateTo('add-student')}
      on:markAttendance={() => navigateTo('attendance')}
      on:changeCourse={() => navigateTo('course-selection')}
    />
  {:else if currentPage === 'add-student'}
    <AddStudentPage on:back={() => navigateTo('dashboard')} />
  {:else if currentPage === 'attendance'}
    <AttendancePage on:back={() => navigateTo('dashboard')} />
  {/if}
  
  <Toast />
</main>