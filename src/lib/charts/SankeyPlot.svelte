<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import * as d3 from "d3";
    import * as d3Sankey from "d3-sankey";
    import { onMount } from "svelte";

    export let trafficSankey: any;
    onMount(() => {
        plot();
    });
    function plot() {
        const width = 1765;
        const height = 800;

        // Remove any previous SVG to avoid overlapping charts
        // d3.select("svg").remove();

        // Create an SVG container
        const svg = d3
            .select("#sankey-container")
            .append("svg")
            .attr("width", "100vw")
            .attr("height", height)
            .style("width", "100%")
            .style("height", "auto");

        // Configure Sankey layout
        const sankey = d3Sankey
            .sankey()
            .nodeId((d: any) => d.index)
            .nodeAlign(d3Sankey.sankeyLeft)
            .nodeWidth(15)
            .nodePadding(10)
            .extent([
                [1, 5],
                [width - 1, height - 5],
            ]);

        const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
            nodes: trafficSankey.nodes,
            links: trafficSankey.links,
        });

        // Tooltips
        const tooltip = d3
            .select("#sankey-container")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("border", "solid 1px #ccc")
            .style("padding", "5px")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("opacity", "0.6")
            .style("font-family", "'Open Sans', sans-serif")
            .style("font-size", "14px");

        const color = d3.scaleOrdinal(d3.schemeAccent);
        svg.append("g")
            .selectAll("rect")
            .data(sankeyNodes)
            .join("rect")
            .attr("x", (d: any) => d.x0)
            .attr("y", (d: any) => d.y0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("width", (d: any) => d.x1 - d.x0)
            .style("fill", (d: any) => color(d.name))
            .append("title")
            .text((d: any) => `${d.name}\n${d.value.toLocaleString()}`);

        // Render links
        svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(sankeyLinks)
            .enter()
            .append("path")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .attr("stroke", (d: any) => color(d.names[0]))
            .attr("stroke-width", (d: any) => d.width)
            .style("opacity", 0.55)
            .on("mouseover", function (_event, d: any) {
                tooltip
                    .style("visibility", "visible")
                    .text(
                        `${d.names[0]} to ${d.names[1]}: ${parseInt(d.value).toLocaleString()} trips.`,
                    );
                d3.select(this).transition().style("opacity", 1.0);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
                d3.select(this).transition().style("opacity", 1.0);
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
                d3.select(this).transition().style("opacity", 0.55);
            })
            .style("mix-blend-mode", "multiply");

        // Render labels
        svg.append("g")
            .selectAll("text")
            .data(sankeyNodes)
            .enter()
            .append("text")
            .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr("y", (d: any) => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", (d: any) =>
                d.x0 < width / 2 ? "start" : "end",
            )
            .text((d: any) => d.name)
            .style("font", "12px Arial (sans-serif)")
            .style("font-size", (d: any) => `${(d.y1 - d.y0) * 0.2}px`)
            .append("tspan")
            .attr("fill-opacity", 0.7)
            .text((d: any) => ` \n${parseInt(d.value).toLocaleString()}`);
    }
    // $: plot();
</script>

<div id="sankey-container" in:slide={{ duration: 3000 }}></div>

<style>
    #sankey-container {
        justify-content: center;
        align-items: right;
        height: 100vh;
        width: 100%;
        margin-left: 1rem;
        background-color: #f8f9fa; /* Optional background color */
    }
</style>
