/**
 * Preload script: patches dns.lookup AND fetch() to use Cloudflare DNS (1.1.1.1)
 * for *.neon.tech domains that the college/restricted DNS blocks.
 *
 * Usage:  node -r ./scripts/dns-fix.js <your-script.js>
 */
const dns = require('dns');
const { Resolver } = dns;

const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

// Custom lookup function for neon.tech domains
function customLookup(hostname, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (typeof options === 'number') {
        options = { family: options };
    }

    if (hostname && hostname.includes('neon.tech')) {
        resolver.resolve4(hostname, (err, addresses) => {
            if (err || !addresses || addresses.length === 0) {
                return dns._lookup(hostname, options, callback);
            }
            // pg may call with { all: true } — return array of objects
            if (options && options.all) {
                callback(null, addresses.map(a => ({ address: a, family: 4 })));
            } else {
                callback(null, addresses[0], 4);
            }
        });
    } else {
        dns._lookup(hostname, options, callback);
    }
}

// Patch dns.lookup (used by https module, pg, etc.)
dns._lookup = dns.lookup;
dns.lookup = customLookup;

// Patch global fetch() dispatcher (uses undici internally)
try {
    const { Agent, setGlobalDispatcher } = require('undici');
    const agent = new Agent({
        connect: {
            lookup: (hostname, options, callback) => {
                if (hostname && hostname.includes('neon.tech')) {
                    resolver.resolve4(hostname, (err, addresses) => {
                        if (err || !addresses || addresses.length === 0) {
                            return dns._lookup(hostname, options, callback);
                        }
                        callback(null, [{ address: addresses[0], family: 4 }]);
                    });
                } else {
                    dns._lookup(hostname, options, callback);
                }
            }
        }
    });
    setGlobalDispatcher(agent);
} catch (_) {
    // undici not available — dns.lookup patch still covers https/pg
}
