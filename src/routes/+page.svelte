<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import * as db from "$lib/db";
	import Header from "$lib/components/Header.svelte";
	import { dbInit } from "$lib/store";
	import * as constants from "$lib/constants";

	import Home from "$lib/components/Home.svelte";

	let isReady = false;

	onMount(async () => {
		if (!$dbInit) {
			// normal start up
			await db.connect();
			await db.loadSpatialExtension();
			/// now we gonna load all data from the dbSources into our database
			for (const [, dbSource] of Object.entries(constants.dBSources)) {
				await db.addTable(dbSource.fileName, dbSource.initTableStmt);
			}

			dbInit.set(true);
			isReady = true;
		}
	});
</script>

{#if isReady || $dbInit}
	<Header />
{/if}
<Home />
