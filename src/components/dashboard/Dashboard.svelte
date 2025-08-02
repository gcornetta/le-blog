
// src/components/dashboard/Dashboard.svelte
// The Svelte component for the admin dashboard.

<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  let stats = null;
  let loading = true;
  let error = null;

  // Tweened values for a nice animation effect on the stats
  const tweenedAdminCount = tweened(0, { duration: 1000, easing: cubicOut });
  const tweenedFailedLoginCount = tweened(0, { duration: 1000, easing: cubicOut });

  async function fetchStats() {
    loading = true;
    error = null;
    try {
      const response = await fetch('/api/v1/auth/stats');
      if (response.ok) {
        stats = await response.json();
        tweenedAdminCount.set(stats.adminCount);
        tweenedFailedLoginCount.set(stats.failedLoginCount);
      } else {
        const data = await response.json();
        error = data.error;
        if (response.status === 401) {
          window.location.href = '/admin'; // Redirect to login on auth failure
        }
      }
    } catch (err) {
      error = 'Failed to fetch dashboard data.';
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/v1/auth/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/admin';
      } else {
        console.error('Logout failed.');
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    }
  }

  onMount(async () => {
    fetchStats();
  });
</script>

<div class="min-h-screen bg-base-200 p-8 flex flex-col items-center">
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-primary">Admin Dashboard</h1>
      <button class="btn btn-error" on:click={handleLogout}>Log out</button>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    {:else if error}
      <div class="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: {error}</span>
        </div>
      </div>
    {:else}
      <div transition:fade>
        <p class="text-lg mb-8">
          Welcome to your administration panel! Here are some key statistics.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="card bg-neutral shadow-xl text-neutral-content">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-2xl">Total Admins</h2>
              <div class="text-6xl font-bold my-4">
                {$tweenedAdminCount.toFixed(0)}
              </div>
            </div>
          </div>
          <div class="card bg-neutral shadow-xl text-neutral-content">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-2xl">Recent Failed Logins</h2>
              <div class="text-6xl font-bold my-4">
                {$tweenedFailedLoginCount.toFixed(0)}
              </div>
              <p class="text-sm">Attempts in the last 15 minutes</p>
            </div>
          </div>
          <div class="card bg-neutral shadow-xl text-neutral-content">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-2xl">Last Login</h2>
              <p class="text-xl font-bold my-4">
                {stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Sample Protected Content</h2>
          <div class="p-6 bg-base-100 rounded-box shadow-xl">
            <p>This section contains content that is only visible to logged-in administrators. You can build your full blog management UI here using Svelte components.</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
