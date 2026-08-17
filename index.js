// Host half of dsh-tick-rail. The plugin is UI-only: everything lives in the
// web client bundle (./client.js), which the client module registry discovers
// through the `dsh.client` declaration and serves to the browser. The host row
// only has to exist so the bundle appears in the composed loader graph.
export const name = 'dsh-tick-rail'

export function apply() {}
