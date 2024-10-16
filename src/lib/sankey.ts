import { valueCounts, getCol } from 'zebras';

function getNodesList(input: any, direction: string) {
    let nodesList = [];
    for (let i = 0; i < input.length; i++) {
        nodesList.push({ name: input[i][direction] })
    }
    return Object.keys(valueCounts(getCol("name", nodesList)))
        .map(name => ({ name }));;
}


export function getTrafficSankey(input: any) {
    let uniqueFromNodes = getNodesList(input, 'source');
    let uniqueToNodes = getNodesList(input, 'target');

    let nodesListCombined = { origin: uniqueFromNodes, destination: uniqueToNodes }
    let ultimateNodes = uniqueFromNodes.concat(uniqueToNodes);

    let arrayLinks = [];
    for (let i = 0; i < input.length; i++) {
        let row = input[i];
        let source = "";
        let target = "";
        let names = [row.source, row.target]
        let value = row.value;

        let originList = nodesListCombined["origin"]
        let targetList = nodesListCombined["destination"]

        for (var a in originList) {
            let selectedNode = originList[a].name;
            if (selectedNode == row.source) {
                source = a;
            }
        }
        for (var g in targetList) {
            let targetSelected = targetList[g].name
            if (targetSelected == row.target) {
                target = g;
            }
        }
        arrayLinks.push({ source: parseInt(source), target: parseInt(target) + originList.length, names: names, value: value });
    }
    return { nodes: ultimateNodes, links: arrayLinks };
}
