<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { selectedCourse, addToast } from '../lib/stores.js';
  import { api } from '../lib/api.js';
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte';
  import PageHeader from '../lib/components/PageHeader.svelte';
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    registrationNumber: '',
    fullName: '',
    department: '',
    year: '',
    semester: '',
    bloodGroup: '',
    phoneNumber: '',
    emailAddress: '',
    address: ''
  };
  
  let errors: { [key: string]: string } = {};
  let submitting = false;
  
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  $: course = $selectedCourse;
  
  // Pre-fill course data
  $: if (course) {
    formData.department = course.department;
    formData.year = course.year;
    formData.semester = course.semester;
  }
  
  function validateForm() {
    errors = {};
    
    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration number is required';
    }
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    if (!formData.year) {
      errors.year = 'Year is required';
    }
    
    if (!formData.semester) {
      errors.semester = 'Semester is required';
    }
    
    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }
    
    if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      errors.emailAddress = 'Invalid email format';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    submitting = true;
    
    try {
      await api.addStudent(formData);
      addToast('Student added successfully!', 'success');
      handleBack();
    } catch (error: any) {
      addToast(error.message || 'Failed to add student', 'error');
    } finally {
      submitting = false;
    }
  }
  
  function handleBack() {
    dispatch('back');
  }
  
  function resetForm() {
    formData = {
      registrationNumber: '',
      fullName: '',
      department: course?.department || '',
      year: course?.year || '',
      semester: course?.semester || '',
      bloodGroup: '',
      phoneNumber: '',
      emailAddress: '',
      address: ''
    };
    errors = {};
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-4xl mx-auto">
    <PageHeader
      title="Add New Student"
      subtitle="Enter student information for {course?.department} • {course?.year} • {course?.semester}"
      showBackButton
      on:back={handleBack}
    />
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
      <div class="card">
        <h3 class="text-xl font-semibold text-gray-100 mb-6">Student Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Registration Number -->
          <div class="md:col-span-2">
            <label for="regNumber" class="block text-sm font-medium text-gray-300 mb-2">
              Registration Number *
            </label>
            <input
              id="regNumber"
              type="text"
              bind:value={formData.registrationNumber}
              class="form-input block w-full rounded-lg"
              placeholder="Enter registration number"
              class:border-red-500={errors.registrationNumber}
            />
            {#if errors.registrationNumber}
              <p class="mt-1 text-sm text-red-500">{errors.registrationNumber}</p>
            {/if}
          </div>
          
          <!-- Full Name -->
          <div class="md:col-span-2">
            <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              bind:value={formData.fullName}
              class="form-input block w-full rounded-lg"
              placeholder="Enter full name"
              class:border-red-500={errors.fullName}
            />
            {#if errors.fullName}
              <p class="mt-1 text-sm text-red-500">{errors.fullName}</p>
            {/if}
          </div>
          
          <!-- Department -->
          <div>
            <label for="department" class="block text-sm font-medium text-gray-300 mb-2">
              Department *
            </label>
            <input
              id="department"
              type="text"
              bind:value={formData.department}
              class="form-input block w-full rounded-lg bg-gray-700 cursor-not-allowed"
              readonly
            />
          </div>
          
          <!-- Year -->
          <div>
            <label for="year" class="block text-sm font-medium text-gray-300 mb-2">
              Year *
            </label>
            <input
              id="year"
              type="text"
              bind:value={formData.year}
              class="form-input block w-full rounded-lg bg-gray-700 cursor-not-allowed"
              readonly
            />
          </div>
          
          <!-- Semester -->
          <div>
            <label for="semester" class="block text-sm font-medium text-gray-300 mb-2">
              Semester *
            </label>
            <input
              id="semester"
              type="text"
              bind:value={formData.semester}
              class="form-input block w-full rounded-lg bg-gray-700 cursor-not-allowed"
              readonly
            />
          </div>
          
          <!-- Blood Group -->
          <div>
            <label for="bloodGroup" class="block text-sm font-medium text-gray-300 mb-2">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              bind:value={formData.bloodGroup}
              class="form-select block w-full rounded-lg"
            >
              <option value="">Select blood group</option>
              {#each bloodGroups as bg}
                <option value={bg}>{bg}</option>
              {/each}
            </select>
          </div>
          
          <!-- Phone Number -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              bind:value={formData.phoneNumber}
              class="form-input block w-full rounded-lg"
              placeholder="+91 98765 43210"
              class:border-red-500={errors.phoneNumber}
            />
            {#if errors.phoneNumber}
              <p class="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            {/if}
          </div>
          
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              bind:value={formData.emailAddress}
              class="form-input block w-full rounded-lg"
              placeholder="student@example.com"
              class:border-red-500={errors.emailAddress}
            />
            {#if errors.emailAddress}
              <p class="mt-1 text-sm text-red-500">{errors.emailAddress}</p>
            {/if}
          </div>
          
          <!-- Address -->
          <div class="md:col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <textarea
              id="address"
              bind:value={formData.address}
              rows="3"
              class="form-input block w-full rounded-lg"
              placeholder="Enter complete address"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="flex space-x-4 justify-end">
        <button
          type="button"
          on:click={resetForm}
          class="btn-secondary"
        >
          Reset Form
        </button>
        
        <button
          type="button"
          on:click={handleBack}
          class="btn-secondary"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={submitting}
          class="btn-primary"
        >
          {#if submitting}
            <LoadingSpinner size="sm" />
          {:else}
            Add Student
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>