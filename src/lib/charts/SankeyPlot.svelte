<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import * as d3 from "d3";
    import * as d3Sankey from "d3-sankey";
    import { select } from "d3-selection";
    import { onMount } from "svelte";
    
    export let trafficSankey: any;
    
    let svg: SVGElement;
     const width = 1200;
    const height = 900;

    onMount(() => {
        createSankyPlot();
    });
    function createSankyPlot() {
        const plot = select(svg)
            .attr("width", width)
            .attr("height", height);

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

        const tooltip = select(".content")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("border", "solid 1px #ccc")
            .style("padding", "5px")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("opacity", "0.6")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "24px");

        const color = d3.scaleOrdinal(d3.schemeCategory10);
        plot.append("g")
            .selectAll("rect")
            .data(sankeyNodes)
            .join("rect")
            .attr("x", (d: any) => d.x0)
            .attr("y", (d: any) => d.y0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("width", (d: any) => d.x1 - d.x0)
            .style("fill", (d: any) => color(d.name))
            .style("opacity", 0.8)
            .append("title")
            .text((d: any) => `${d.name}\n${d.value.toLocaleString()}`);

        plot.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(sankeyLinks)
            .enter()
            .append("path")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .attr("stroke", (d: any) => color(d.names[0]))
            .attr("stroke-width", (d: any) => d.width)
            .style("opacity", 0.2)
            .on("mouseover", function (event, d: any) {
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
                d3.select(this).transition().style("opacity", 0.2);
            })
            // .on("click", function (event, d: any) {
            //     tooltip
            //         .style("visibility", "visible")
            //         .text(
            //             `${d.names[0]} to ${d.names[1]}: ${parseInt(d.value).toLocaleString()} trips.`,
            //         );
            //     d3.select(this).transition().style("opacity", 1.0);
            // })
            .style("mix-blend-mode", "multiply");

        plot.append("g")
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
</script>

<div class="content" >
    <section class="visualization">
        <h2  in:slide={{ duration: 3000 }}>An example of a Sankey diagram illustrating Melbourne's origin-destination trips based on traffic data</h2>
        <p  in:slide={{ duration: 3000 }}>
            Below is a summary of total trips to and from Melbourne's SA4 areas based on a full day of traffic data.
            West Melbourne accounts for the largest volume of traffic, with most trips occurring within the same zones.
        </p>
        <svg bind:this={svg} in:fade={{ duration: 3000 }}></svg>
    </section>
</div>


<style>
    .content {
        align-content: center;
        max-width: 90%;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
        font-family: Arial, sans-serif;
    }

    
    h2 {
        color: #333;
    }

    p {
        color: #555;
        line-height: 1.6;
    }

    svg {
        display: block;
        margin: 2rem 0;
        margin: 0 auto;    /* Center the SVG horizontally */
        width: auto;       /* Adjust the width automatically */
        height: auto;      
    }
</style>