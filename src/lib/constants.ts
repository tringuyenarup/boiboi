/// ----------------------------------- QUERIES ----------------------------------- ///

import { writable } from "svelte/store";

/**
 * This interface contains a single source of data that includes: 
 *  File name:  name of the parquet file will be read
 *  Initialise query: query for reading, processing and registering the table into database
 *  List of queries: This is the list of query that might be called during the application running phase
**/

interface DbSource {
    fileName: string,
    initTableStmt: string,
    queries: Record<string, string>,
    draw: string,
};

const dBSources: Record<string, DbSource> = {
    "Private Vehicle": {
        fileName: "pv_links_volume.parquet",
        initTableStmt: `
                            CREATE TABLE pv_links_volume AS
                                WITH 
                                line_points AS (
                                    SELECT
                                        ST_StartPoint(geometry) AS start_point,
                                        ST_EndPoint(geometry) AS end_point,
                                        * EXCLUDE (geometry)
                                    FROM
                                        (
                                            SELECT * EXCLUDE (geometry), ST_GeomFromWKB(geometry) AS geometry 
                                                FROM parquet_scan('pv_links_volume.parquet')
                                        )
                                    WHERE
                                        class != 1
                                ),
                                point_coordinates AS (
                                    SELECT
                                        *,
                                        ST_X(start_point) AS x1,
                                        ST_Y(start_point) AS y1,
                                        ST_X(end_point) AS x2,
                                        ST_Y(end_point) AS y2
                                    FROM
                                        line_points
                                ),
                                offset_calculation AS (
                                    SELECT
                                        *,
                                        x1 - 10.0 * (y2 - y1) / SQRT(POW(x2 - x1, 2) + POW(y2 - y1, 2)) AS x1_offset,
                                        y1 + 10.0 * (x2 - x1) / SQRT(POW(x2 - x1, 2) + POW(y2 - y1, 2)) AS y1_offset,
                                        x2 - 10.0 * (y2 - y1) / SQRT(POW(x2 - x1, 2) + POW(y2 - y1, 2)) AS x2_offset,
                                        y2 + 10.0 * (x2 - x1) / SQRT(POW(x2 - x1, 2) + POW(y2 - y1, 2)) AS y2_offset
                                    FROM
                                        point_coordinates
                                )
                                SELECT
                                    * EXCLUDE (start_point, end_point, x1, y1, x2, y2, x1_offset, y1_offset, x2_offset, y2_offset),
                                    ST_AsGeoJSON(
                                        ST_FlipCoordinates(
                                            ST_Transform(
                                                ST_MakeLine(ST_Point(x1_offset, y1_offset), ST_Point(x2_offset, y2_offset)),
                                                'EPSG:20255',
                                                'EPSG:4326'
                                            )
                                        )
                                    ) AS geometry
                                FROM
                                    offset_calculation;
                        `,
        queries: {
            "volume_capacity": `
                                                SELECT
                                                    distance AS distance,
                                                    class AS link_class,
                                                    geometry AS geometry,
                                                    veh_vc_%period% AS "value"
                                                FROM pv_links_volume
                                                WHERE link_class != 1 AND
                                                    value != 0;
                                            `,
            "volume_difference": `
                                                SELECT
                                                    distance AS distance,
                                                    class AS link_class,
                                                    geometry,
                                                    ("veh_%from%" - "veh_%to%") AS "value",
                                                FROM pv_links_volume
                                                WHERE link_class != 1 AND 
                                                    value != 0;
                                                `,
        },
        draw: `
                                    SELECT
                                            class,
                                            COUNT(class) AS each_type,
                                            AVG(distance) AS average_length,
                                        FROM pv_links_volume
                                        WHERE
                                            ST_Intersects(ST_GeomFromGeoJSON('%geojson_str%'),ST_GeomFromGeoJSON(geometry))
                                        GROUP BY class;
                    
                                `,
    },
    "Public Transport": {
        fileName: "pt_links_volume.parquet",
        initTableStmt: `
                                                CREATE TABLE pt_links_volume AS
                                                    WITH
                                                        links_geometry AS (
                                                            SELECT A, B, geometry
                                                            FROM pv_links_volume
                                                        ),
                                                        out_pt_links AS (
                                                            SELECT *
                                                            FROM (
                                                                SELECT * FROM parquet_scan('pt_links_volume.parquet')
                                                            ) AS pt
                                                            INNER JOIN links_geometry
                                                            ON links_geometry.A = pt.A AND links_geometry.B = pt.B
                                                        )
                                                    SELECT
                                                        * EXCLUDE ("A:1", "B:1"),
                                                        LOWER(PERIOD) AS PERIOD,
                                                    FROM out_pt_links;
                                            `,
        queries: {
            "volume_capacity": `
                                                    SELECT
                                                        PT_VC AS "value",
                                                        PERIOD,
                                                        geometry,
                                                    FROM pt_links_volume 
                                                    WHERE
                                                    PERIOD = '%period%' AND
                                                    value != 0
                                                `,

        },
        draw: `
                                    SELECT  
                                            LONGNAME AS Line,
                                            AVG(VOL) AS average_vol,
                                            AVG(PT_VC) AS average_cap,
                                        FROM pt_links_volume
                                        WHERE
                                            ST_Intersects(ST_GeomFromGeoJSON('%geojson_str%'),ST_GeomFromGeoJSON(geometry))
                                        GROUP BY LONGNAME;
                    
                                `,
    },

}


/// ----------------------------------- MAP ----------------------------------- ///

const defaultStmt = `
		SELECT
			distance AS distance,
			class AS link_class,
			geometry,
			("veh_am" - "veh_pm") AS "value",
		FROM pv_links_volume
	`;

const map_initial_state = {
    lng: 144.960078,
    lat: -37.814478,
    zoom: 9,
}

const map_base_style = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';


/// ----------------------------------- MENU ----------------------------------- ///
const periods = [
    "AM",
    "PM",
    "IP",
    "OP",
];

const dbSourceNames = [
    "Private Vehicle", "Public Transport"
]
const map_layers: Record<string, maplibregl.LayerSpecification> = {
    "volume_difference": {
        id: "volume_difference",
        type: "line",
        source: "volume_difference",
        paint: {
            "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                [
                    "interpolate",
                    ["linear"],
                    ["abs", ["get", "value"]],
                    0,
                    0.25, // If value is 0, width is 0.25
                    1000,
                    1, // If value is 1000, width is 1
                ],
                8,
                [
                    "interpolate",
                    ["linear"],
                    ["abs", ["get", "value"]],
                    0,
                    0.5, // If value is 0, width is 0.5
                    1000,
                    3.5, // If value is 1000, width is 3.5
                ],
                13,
                [
                    "interpolate",
                    ["linear"],
                    ["abs", ["get", "value"]],
                    0,
                    1, // If value is 0, width is 1
                    1000,
                    10, // If value is 1000, width is 10
                ],
            ],
            "line-color": [
                "interpolate",
                ["linear"],
                ["get", "value"],
                10000 * -0.25,
                "#30a8f2",
                0,
                "#ffffff",
                10000 * 0.25,
                "#f76436",
            ],
        },
    },
    "volume_capacity": {
        id: "volume_capacity",
        type: "line",
        source: "volume_capacity",
        paint: {
            "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                [
                    "interpolate",
                    ["linear"],
                    ["get", "value"],
                    0,
                    0.25, // If value is 0, width is 0.25
                    1.5,
                    1, // If value is 1000, width is 1
                ],
                8,
                [
                    "interpolate",
                    ["linear"],
                    ["get", "value"],
                    0,
                    0.5, // If value is 0, width is 0.5
                    1.5,
                    3.5, // If value is 1000, width is 3.5
                ],
                13,
                [
                    "interpolate",
                    ["linear"],
                    ["get", "value"],
                    0,
                    1, // If value is 0, width is 1
                    1.5,
                    10, // If value is 1000, width is 10
                ],
            ],
            "line-color": [
                "interpolate",
                ["linear"],
                ["get", "value"],
                0,
                "#ffffff",
                0.5, "#21918c",
                1,
                "#fde725",
            ],
        }

    }
}

const current_layer_id = writable("volume_difference");

export { map_initial_state, map_base_style, periods, dBSources, dbSourceNames, map_layers, defaultStmt, current_layer_id };