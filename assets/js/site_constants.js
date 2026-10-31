
const basePath = '/saf-specification-fork';

// Public contract for the root-served plugin scripts (see plugin_versions_menu.js): released
// pages under /version/<x>/ load this file from the site root, so `basePath` and `releases`
// must keep their names and shapes; additions are fine.
// release menu entries; curated in _data/releases.yml, order = menu order
const releases = [{"id":"latest","label":"main"}];

