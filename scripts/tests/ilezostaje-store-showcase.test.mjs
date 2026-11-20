import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");
const storeUrl = "https://apps.microsoft.com/detail/9N1M8RZBRRCC";
const routes = [
  { path: "index.html", soon: "Wkrótce", other: "Coming soon" },
  { path: "pl/index.html", soon: "Wkrótce" },
  { path: "experience/index.html" },
  { path: "pl/experience/index.html" },
];

test("IleZostaje icon is part of the production build", () => {
  const iconPath = resolve(dist, "images/ilezostaje/icon.png");
  assert.ok(existsSync(iconPath), "Missing official IleZostaje icon in dist");
  assert.ok(statSync(iconPath).size > 4_000, "IleZostaje icon appears empty");
});

for (const route of routes) {
  test(route.path + " uses Microsoft Store, not GitHub releases, for IleZostaje", () => {
    const file = resolve(dist, route.path);
    assert.ok(existsSync(file), "Missing expected page: " + route.path);
    const html = readFileSync(file, "utf8");
    assert.ok(html.includes(storeUrl), "Missing direct Store link on " + route.path);
    assert.doesNotMatch(
      html,
      /href=["']https:\/\/github\.com\/987p2jnkrb-wq\/MyAnalyze-releases/,
      "Legacy release repository must not be a product purchase CTA",
    );
    if (route.path.endsWith("index.html") && !route.path.includes("experience")) {
      assert.ok(html.includes("/images/ilezostaje/icon.png"), "Missing brand image");
      assert.match(html, /macOS/);
      assert.match(html, /iOS/);
      if (route.path.startsWith("pl/")) assert.match(html, /Wkrótce/);
      else assert.match(html, /Coming soon/);
    }
  });
}
