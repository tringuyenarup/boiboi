<script lang="ts">
	import SankeyPlot from "$lib/charts/SankeyPlot.svelte";
	import Header from "$lib/components/Header.svelte";
	import { getTrafficSankey } from "$lib/sankey";
	import * as d3 from "d3";
	import { onMount } from "svelte";

	let trafficSankey: any;

	onMount(async () => {
		let input = await d3.csv("output.csv");
		trafficSankey = getTrafficSankey(input);
	});
</script>

<Header />
{#if trafficSankey}
	<SankeyPlot {trafficSankey} />
{/if}
