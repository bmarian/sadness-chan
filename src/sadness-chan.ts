import utils from "./module/Utils"

Hooks.once('init', async function() {
    utils.debug('Preparing to collect tears.');
});

Hooks.once('setup', function() {
    utils.debug('Got bucket to catch tears.');
});

Hooks.once('ready', function() {
    utils.debug('Cry me a river baby.');
});