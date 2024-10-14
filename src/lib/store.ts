import { writable } from "svelte/store";

const dbInit = writable(false); // A store to track the DB connection status


export { dbInit };