import * as arrow from 'apache-arrow';
import * as constants from '$lib/constants';

function arrowTableToGeoJSON(
    arrowTable: arrow.Table,
): GeoJSON.FeatureCollection {
    const arrayData = arrowTable.toArray().map((row) => row.toJSON());
    const features: GeoJSON.Feature[] = [];

    for (let i = 0; i < arrayData.length; i++) {

        const { geometry, ...properties } = arrayData[i];
        let convertedGeometry = JSON.parse(geometry);
        features.push({
            type: "Feature",
            geometry: convertedGeometry,
            properties,
        });
    }

    return {
        type: "FeatureCollection",
        features,
    };
}

function createQueryStmt(selectedDatabase: string,
    selectedMapType: string,
    selectedTimeFrom: string,
    selectedTimeTo: string,
    selectedTransitLine?: string): string {
    let key = selectedMapType.split(" ")
        .map((w) => w.toLocaleLowerCase())
        .join("_");

    let template = constants.dBSources[selectedDatabase].queries[key];

    switch (key) {
        case "volume_difference": { return substitute(template, { "%from%": selectedTimeFrom, "%to%": selectedTimeTo }); };
        case "volume_capacity": {
            if ((selectedTransitLine === "") || (selectedTransitLine === "All lines")) {
                return substitute(template, { "%period%": selectedTimeFrom });
            }
            else {
                return substitute(template, { "%period%": selectedTimeFrom }) + ` AND LONGNAME == '${selectedTransitLine}';`;

            }
        };
        default: throw Error(`Unknown key ${key}`);
    }

}

function substitute(input: string, map: Record<string, string>) {
    var output = input.replace(/%[^%]+%/g, function (match) {
        if (match in map) {
            return (map[match]);
        } else {
            return ("");
        }
    });
    return (output);
}


export { arrowTableToGeoJSON, createQueryStmt };