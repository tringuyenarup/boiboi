<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import * as constants from "$lib/constants";
    import Select from "$lib/components/Select.svelte";

    const dispatch = createEventDispatcher();

    export let selectedTransitLines: string[];

    let selectedDatabase: string = "Private Vehicle";
    let selectedMapType: string = "";
    let selectedTimeFrom: string = "";
    let selectedTimeTo: string = "";
    let selectedTransitLine: string = "";

    function submitForm() {
        dispatch("update", {
            selectedDatabase: selectedDatabase,
            selectedMapType: selectedMapType,
            selectedTimeFrom: selectedTimeFrom,
            selectedTimeTo: selectedTimeTo,
            selectedTransitLine: selectedTransitLine,
        });

        selectedTransitLine = "";
    }

    $: formValid =
        selectedMapType === "Volume Difference"
            ? selectedDatabase && selectedTimeFrom && selectedTimeTo
            : selectedMapType.length > 0 &&
              selectedDatabase &&
              selectedTimeFrom;

    $: selectMapTypes = Object.keys(
        constants.dBSources[selectedDatabase].queries,
    ).map((k) =>
        k
            .replace("_", " ")
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase()),
    );

    $: selectedMapType = selectMapTypes[0];
</script>

<form on:submit|preventDefault={submitForm}>
    <Select
        id="selectedDatabase"
        label="Please select database:"
        array={constants.dbSourceNames}
        on:selectChange={(event) => {
            selectedDatabase = event.detail.value;
        }}
    />
    <Select
        id="selectedMapType"
        label="Select map type:"
        array={selectMapTypes}
        on:selectChange={(event) => {
            selectedMapType = event.detail.value;
        }}
    />
    {#if selectedDatabase === "Public Transport"}
        <Select
            id="selectTransitLine"
            label="Choose transit line: "
            array={selectedTransitLines}
            on:selectChange={(event) => {
                selectedTransitLine = event.detail.value;
            }}
        />
    {/if}
    <Select
        id="selectTimeFrom"
        label="Choose time period: "
        array={constants.periods}
        on:selectChange={(event) => {
            selectedTimeFrom = event.detail.value;
        }}
    />
    {#if selectedMapType === "Volume Difference"}
        <Select
            id="selectTimeTo"
            label="Choose time period: "
            array={constants.periods}
            on:selectChange={(event) => {
                selectedTimeTo = event.detail.value;
            }}
        />
    {/if}
</form>
<div>
    <button type="button" on:click={submitForm} disabled={!formValid}
        >Update Map</button
    >
</div>

<style>
    form {
        position: center;
        width: 90%;
        margin: 1rem;
        background-color: #e5effd;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    button {
        background-color: #c0392b; /* Red button background to match header */
        color: white;
        font-size: 1.1rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        padding: 1rem 2rem;
        margin: 1rem;
    }

    button:hover {
        background-color: #e74c3c; /* Slightly lighter red for hover effect */
    }

    button:disabled {
        background-color: #dcdcdc;
        color: #777;
        cursor: not-allowed;
    }
</style>
