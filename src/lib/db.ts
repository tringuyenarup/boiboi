import * as duckdb from '@duckdb/duckdb-wasm';

import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type * as arrow from 'apache-arrow';

let instance: AsyncDuckDB | null = null;
let connection: AsyncDuckDBConnection | null = null;
let worker: Worker | null = null;

async function query(query: string): Promise<arrow.Table> {
    assertConnected(connection);
    return await connection.query(query);
}

async function connect(): Promise<void> {
    if (!instance) {
        const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
            mvp: {
                mainModule: duckdb_wasm,
                mainWorker: mvp_worker
            },
            eh: {
                mainModule: duckdb_wasm_eh,
                mainWorker: eh_worker
            }
        };
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        worker = new Worker(bundle.mainWorker!);
        instance = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
        await instance.instantiate(bundle.mainModule, bundle.pthreadWorker);
    }
    if (!connection) {
        connection = await instance.connect();
    }
}

async function loadSpatialExtension(): Promise<void> {
    assertConnected(connection);
    await connection.query('INSTALL spatial;LOAD spatial;');

}

async function addTable(fileName: string, query: string): Promise<void> {
    assertLoaded(instance);
    assertConnected(connection);

    const response = await fetch(`${fileName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${fileName}`);
    }

    await instance.registerFileBuffer(fileName, new Uint8Array(await response.arrayBuffer()));
    await connection.query(query);
}

function assertLoaded(instance: AsyncDuckDB | null = null): asserts instance is AsyncDuckDB {
    if (!instance) throw new Error('DuckDB instance is not present. Call connect() first!');
}

function assertConnected(connection: AsyncDuckDBConnection | null): asserts connection is AsyncDuckDBConnection {
    if (!connection) {
        throw new Error('DuckDB instance is not present. Call connect() first!');
    }
}

async function terminate(): Promise<void> {
    if (connection) {
        await connection.close();
        connection = null;
    }
    if (instance) {
        await instance.terminate();
        instance = null;
    }
    if (worker) {
        worker.terminate();
        worker = null;
    }
}

export { connect, loadSpatialExtension, query, addTable, terminate };