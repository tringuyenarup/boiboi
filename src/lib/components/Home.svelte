<script lang="ts">
    import { onMount } from "svelte";
    import { scaleLinear } from "d3-scale";
    // @ts-ignore
    import { select } from "d3-selection";

    let randomData = [];
    let svg: SVGElement;
    const width = 600;
    const height = 400;

    // Generating random data for fun
    function generateRandomData(count: any) {
        return Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            value: Math.random() * 100,
        }));
    }

    // @ts-ignore
    function createVisualization(data) {
        const colorScale = scaleLinear()
            .domain([0, 100])
            // @ts-ignore
            .range(["#f4e2d8", "#f76436"]);

        const plot = select(svg)
            .attr("width", width)
            .attr("height", height)
            .style("border", "2px solid #222");

        plot.selectAll("circle")
            .data(data)
            .enter()
            .append("circle") // @ts-ignore
            .attr("cx", (d) => d.x)
            // @ts-ignore
            .attr("cy", (d) => d.y) // @ts-ignore
            .attr("r", 10)
            // @ts-ignore
            .style("fill", (d) => colorScale(d.value))
            .style("opacity", 0.75)
            .style("stroke", "#222")
            .style("stroke-width", "2px");
    }

    // Set up the visualization when component mounts
    onMount(() => {
        randomData = generateRandomData(30); // 30 random points
        createVisualization(randomData);
    });
</script>

<div class="content">
    <section class="introduction">
        <h1>The Art of Map Visualization in Svelte</h1>
        <p>
            Welcome to the ultimate guide to crafting mesmerizing map
            visualizations using the magical powers of Svelte and D3.js. Here,
            we don't just plot data, we craft stories, we invoke emotions, and
            we make art out of geographic information.
        </p>
    </section>

    <section class="visualization">
        <h2>Randomly Generated Wonder</h2>
        <p>
            Below, you see a totally arbitrary plot of 30 random points that
            exist only in this virtual universe. Notice the carefully crafted
            color gradient, signifying absolutely nothing other than the
            inherent beauty of randomness.
        </p>
        <svg bind:this={svg}></svg>
    </section>

    <section class="philosophy">
        <h2>Philosophy of Map Visualization</h2>
        <p>
            Why maps? Why colors? Why random points? These are the questions
            that keep us up at night. With Svelte, we embrace the ephemeral, the
            fleeting moment when a user zooms in and out of a map, marveling at
            the intricate balance between data and design.
        </p>
        <p>
            The true beauty of map visualization is not in the data, nor the
            map, but in the interplay between the two, an eternal dance of
            information and aesthetics.
        </p>
    </section>
</div>

<style>
    .content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-family: Arial, sans-serif;
    }

    h1,
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
    }

    .introduction {
        text-align: center;
        margin-bottom: 2rem;
    }

    .visualization {
        text-align: center;
        margin: 3rem 0;
        padding: 1rem;
        background-color: #fafafa;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .philosophy {
        margin-top: 3rem;
        text-align: center;
        font-style: italic;
    }
</style>
