<script lang="ts">
	// Svelte std libaries
	import { onMount } from "svelte";

	import * as arrow from "apache-arrow";
	import * as db from "$lib/db";
	import { arrowTableToGeoJSON, createQueryStmt } from "$lib/mapping";

	import Menu from "$lib/components/Menu.svelte";
	import Map from "$lib/components/Map.svelte";
	import Header from "$lib/components/Header.svelte";
	import LoadingPage from "$lib/components/LoadingPage.svelte";
	import * as constants from "$lib/constants";

	let geojson_data: any;
	let selectedMapType: string = "Volume Difference";
	let selectedDatabase: string;
	let selectedTransitline: string;
	let transit_lines: string[];

	onMount(async () => {
		let default_results = await db.query(constants.defaultStmt);
		geojson_data = arrowTableToGeoJSON(default_results);

		let transit_results = await db.query(
			"SELECT DISTINCT LONGNAME FROM pt_links_volume",
		);

		const arrayData = transit_results.toArray().map((row) => row.toJSON());
		let results: string[] = [];
		for (let i = 0; i < arrayData.length; i++) {
			results[i] = arrayData[i].LONGNAME;
		}
		results.splice(0, 0, "All lines");
		transit_lines = results;
	});

	async function updateGeoJSON(event: any) {
		let {
			selectedDatabase: newSelectedDatabase,
			selectedMapType: newSelectedMapType,
			selectedTimeFrom,
			selectedTimeTo,
			selectedTransitLine: newSelectedTransitLine,
		} = {
			...event.detail,
		};

		selectedMapType = newSelectedMapType;
		selectedDatabase = newSelectedDatabase;

		if (newSelectedTransitLine) {
			selectedTransitline = newSelectedTransitLine;
		} else {
			selectedTransitline = "";
		}

		let queryStmt = createQueryStmt(
			selectedDatabase,
			selectedMapType,
			selectedTimeFrom,
			selectedTimeTo,
			selectedTransitline,
		);

		let results = await db.query(queryStmt);
		let new_geojson_data = arrowTableToGeoJSON(results);

		geojson_data = { ...new_geojson_data };
	}
</script>

<Header />

{#if geojson_data && transit_lines}
	<Menu selectedTransitLines={transit_lines} on:update={updateGeoJSON} />
	<Map {geojson_data} {selectedMapType} {selectedDatabase} />
{:else}
	<LoadingPage />
{/if}
