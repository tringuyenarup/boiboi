<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let id: string | null = null;
    export let label: string | null = null;
    export let array: string[];
    const dispatch = createEventDispatcher();

    function handleChange(event: Event) {
        const selectedValue = (event.target as HTMLSelectElement).value;
        dispatch("selectChange", { value: selectedValue });
    }
</script>

<div>
    <label for={id}>{label} </label>
    <select {id} on:change|preventDefault={handleChange}>
        <option value="" selected disabled>-- Please select an option --</option
        >
        {#each array as a}
            <option value={a}>{a}</option>
        {/each}
    </select>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
    }

    label {
        font-family: "Arial (sans-serif)", sans-serif;
        font-size: 20px;
        margin-bottom: 5px;
        color: #333;
        margin: 0.1rem;
    }

    select {
        width: 100%;
        padding: 1rem 2rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 1rem;
        transition: border-color 0.3s ease;
    }

    select:hover {
        border-color: #888;
    }

    select:focus {
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    select:disabled {
        background-color: #e9ecef;
        color: #6c757d;
        border-color: #6c757d;
        cursor: not-allowed;
    }

    option {
        padding: 5px;
    }
</style>
