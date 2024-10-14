<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import * as maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import MapboxDraw from "@mapbox/mapbox-gl-draw";
    import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
    import * as db from "$lib/db";

    import * as constants from "$lib/constants";
    import { slide } from "svelte/transition";
    import DrawArea from "./DrawArea.svelte";

    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
    // @ts-ignore
    MapboxDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";

    export let geojson_data: any | null;
    export let selectedMapType: string = "Volume Difference";
    export let selectedDatabase: string;

    let container: HTMLDivElement;
    let map: maplibregl.Map;
    let source: any;
    let current_layer_id: string;

    $: new_layer_id = selectedMapType
        .split(" ")
        .map((w) => w.toLocaleLowerCase())
        .join("_");

    const draw = new MapboxDraw({
        displayControlsDefault: true,
        controls: {
            polygon: true,
            trash: true,
        },
    });

    onMount(() => {
        map = new maplibregl.Map({
            container: container,
            style: constants.map_base_style,
            center: [
                constants.map_initial_state.lng,
                constants.map_initial_state.lat,
            ],
            zoom: constants.map_initial_state.zoom,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", () => {
            current_layer_id = new_layer_id;
            map.addSource(new_layer_id, {
                type: "geojson",
                lineMetrics: true,
                data: geojson_data || {
                    type: "FeatureCollection",
                    features: [],
                },
            });

            map.addControl(draw, "top-left");
            bindDrawEvent();

            map.addLayer(constants.map_layers[new_layer_id]);
            source = map.getSource(new_layer_id);
            current_layer_id = new_layer_id;

            bindHoverEvent(new_layer_id);
        });
    });

    onDestroy(() => {
        map.remove();
    });

    $: if (map && geojson_data && source) {
        if (current_layer_id !== new_layer_id) {
            if (!map.getSource(new_layer_id)) {
                map.addSource(new_layer_id, {
                    type: "geojson",
                    data: geojson_data,
                });
                map.addLayer(constants.map_layers[new_layer_id]);
            }

            map.setLayoutProperty(new_layer_id, "visibility", "visible");
            if (current_layer_id) {
                map.setLayoutProperty(current_layer_id, "visibility", "none");
            }

            if (map.getLayer(new_layer_id)) {
                bindHoverEvent(new_layer_id);
            } else {
                console.error(`Layer ${new_layer_id} does not exist.`);
            }

            current_layer_id = new_layer_id;
            source = map.getSource(new_layer_id);
        }

        source.setData(geojson_data);
    }

    function bindHoverEvent(layerId: string) {
        map.on("mousemove", layerId, (e) => {
            const tooltip: any = container.querySelector("#tooltip");
            const features = map.queryRenderedFeatures(e.point, {
                layers: [layerId],
            });

            if (features.length > 0) {
                const feature = features[0];

                if (layerId === "volume_difference") {
                    tooltip.innerHTML = `
                    <div><b>Link class: </b>${feature.properties.link_class}</div>
                    <div><b>Volume change: </b>${parseInt(feature.properties.value)}</div>`;
                } else {
                    tooltip.innerHTML = `
                    <div><b>Volume capacity: </b>${parseFloat(feature.properties.value).toFixed(2)}</div>`;
                }

                tooltip.style.display = "block";
                tooltip.style.left = e.point.x + "px";
                tooltip.style.top = e.point.y + "px";
            } else {
                tooltip.style.display = "none";
            }
        });

        map.on("mouseout", layerId, () => {
            const tooltip: any = container.querySelector("#tooltip");
            tooltip.style.display = "none";
        });
    }

    function bindDrawEvent() {
        map.on("draw.create", updateArea);
        map.on("draw.delete", updateArea);
        map.on("draw.update", updateArea);
    }

    async function updateArea(event: any) {
        const data = draw.getAll();
        const answer: any = document.getElementById("calculated-area");
        // this can also receive the layer type to retrieve the right kind of map layers
        // and table the perform the spatial joins
        if (data.features.length > 0) {
            let geojson_str = JSON.stringify(data.features[0].geometry);
            let template: string = constants.dBSources[selectedDatabase].draw;

            let query = substitute(template, { "%geojson_str%": geojson_str });
            console.log(query);
            let arrowTable = await db.query(query);
            const arrayData = arrowTable.toArray().map((row) => row.toJSON());

            let html = `<table>`;
            if (current_layer_id === "volume_capacity") {
                html +=
                    "<tr><th> Line </th><th> Avg. Vol </th><th>Avg. capacity</th></tr>";
            } else {
                html +=
                    "<tr><th> Type </th><th> Count </th><th>Avg. length (km)</th></tr>";
            }

            for (let i = 0; i < arrayData.length; i++) {
                const { geometry, ...properties } = arrayData[i];
                html += "<tr>";
                for (const [key, value] of Object.entries(properties)) {
                    // @ts-ignore
                    if (!isNaN(parseFloat(value))) {
                        // @ts-ignore
                        html += `<td>${parseFloat(value).toFixed(1)}</td>`;
                    } else {
                        html += `<td>${value}</td>`;
                    }
                }
                html += "</tr>";
            }

            html += "</table>";
            answer.innerHTML = html;
        } else {
            answer.innerHTML = "";
            if (event.type !== "draw.delete")
                alert("Use the draw tools to draw a polygon!");
        }
    }

    function substitute(input: string, map: Record<string, string>) {
        var output = input.replace(/%[^%]+%/g, function (match) {
            if (match in map) {
                return map[match];
            } else {
                return "";
            }
        });
        return output;
    }
</script>

<div class="map-wrapper">
    <div class="map-container" transition:slide bind:this={container}>
        <div
            id="tooltip"
            style="position: absolute; background-color: white; padding: 10px; border-radius: 5px; pointer-events: none; display: none; z-index: 1;"
        ></div>
        <DrawArea />
    </div>
</div>

<style>
    .map-wrapper {
        position: relative;
        height: 100vh;
        width: 92vw;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f0f0f0;
        margin: 1rem;
    }

    .map-container {
        position: relative;
        height: 100%;
        width: 100%;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
</style>
