const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
}

function setup(href) {
  let consumer;
  const context = {
    exports: {},
    URL,
    window: {
      location: new URL(href),
      history: {
        state: null,
        replaceState(state, title, url) {
          context.window.location = new URL(url);
        },
      },
      launchQueue: { setConsumer(callback) { consumer = callback; } },
    },
  };
  const source = fs.readFileSync(path.join(root, "src/core/services/AutoshopProtocol.ts"), "utf8");
  vm.runInNewContext(compile(source.split("export function registerAutoshopProtocol")[0]), context);
  return { context, protocol: context.exports, launch: (url) => consumer({ targetURL: url }) };
}

test("cold protocol launch is resolved before router history captures the hash", () => {
  const { context, protocol } = setup("https://shop.example/?autoshop=web%2Bautoshop%3A%2F%2Fdocument%2F123532");
  let capturedHash;
  const routerContext = {
    exports: {},
    require(name) {
      if (name === "@/core/services/AutoshopProtocol") return protocol;
      if (name === "vue-router") return {
        createWebHashHistory() { capturedHash = context.window.location.hash; return {}; },
        createRouter() { return { beforeEach() {} }; },
      };
      return {};
    },
  };
  const source = fs.readFileSync(path.join(root, "src/router/index.ts"), "utf8")
    .replace(/import\.meta\.env\.VITE_APP_NAME/g, '"Veikals"');
  vm.runInNewContext(compile(source), routerContext);
  assert.equal(capturedHash, "#/document/open/123532");
  assert.equal(context.window.location.search, "");
});

test("queued initial launch is skipped and later launches navigate by ID", async () => {
  const { protocol, launch } = setup("https://shop.example/?autoshop=web%2Bautoshop%3A123532");
  protocol.consumeProtocolLaunch();
  const navigations = [];
  protocol.registerProtocolLaunchConsumer({
    isReady: async () => {},
    replace: async (route) => navigations.push(route),
  });
  await launch("https://shop.example/?autoshop=web%2Bautoshop%3A123532");
  assert.equal(navigations.length, 0);
  await launch("https://shop.example/?autoshop=web%2Bautoshop%3A%2F%2Fdocument%2F456");
  assert.equal(navigations[0].name, "document-open");
  assert.equal(navigations[0].params.documentId, "456");
  await launch("https://shop.example/?autoshop=web%2Bautoshop%3A123532");
  assert.equal(navigations[1].params.documentId, "123532");
  await launch("https://other.example/?autoshop=web%2Bautoshop%3A789");
  await launch("https://shop.example/");
  await launch("invalid URL");
  assert.equal(navigations.length, 2);
  await launch("https://shop.example/?autoshop=web%2Bautoshop%3Ainvalid");
  assert.equal(navigations[2].params.documentId, "invalid");
});

test("ordinary startup keeps its existing route", () => {
  const { context, protocol } = setup("https://shop.example/#/dashboard");
  protocol.consumeProtocolLaunch();
  assert.equal(context.window.location.hash, "#/dashboard");
});
