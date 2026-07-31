// NODE_OPTIONS=--require ./scripts/dns-bypass.cjs
//
// This machine's network resolves some hosts (supabase.co, vercel.app) to a
// captive-portal address (10.40.124.9 / e.wg.restricted.in), so a locally-run
// app cannot reach its own backend. Node's `dns.lookup` goes through the OS
// resolver, which `dns.setServers` does not affect — so patch `lookup` to
// resolve via public DNS, falling back to the OS on any failure.
//
// Local development only: it changes nothing outside this process.
const dns = require("node:dns");
const { Resolver } = require("node:dns");

const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

const osLookup = dns.lookup.bind(dns);

dns.lookup = function patchedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const opts = typeof options === "number" ? { family: options } : options || {};

  resolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return osLookup(hostname, options, callback);
    }
    if (opts.all) {
      return callback(
        null,
        addresses.map((address) => ({ address, family: 4 }))
      );
    }
    return callback(null, addresses[0], 4);
  });
};
