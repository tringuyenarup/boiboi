<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { onMount } from "svelte";

    let isLoading = true;

    // Simulating a loading process
    onMount(() => {
        setTimeout(() => {
            isLoading = false; // You can trigger this when the actual loading finishes
        }, 3000); // Set the duration as needed
    });
</script>

{#if isLoading}
    <div class="loading-container" transition:fade={{ duration: 500 }}>
        <div class="loading-content" transition:scale={{ duration: 700 }}>
            <div class="spinner"></div>
            <p class="loading-text">Loading...</p>
        </div>
    </div>
{/if}

<style>
    .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999; /* Ensure it covers everything during loading */
    }

    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 6px solid #ccc;
        border-top: 6px solid #007bff; /* Spinner color */
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-text {
        margin-top: 15px;
        font-family: "Roboto", sans-serif;
        font-size: 1.2rem;
        color: #333;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
