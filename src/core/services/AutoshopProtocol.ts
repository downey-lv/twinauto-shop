import type { Router } from "vue-router";

let startupLink: string | null = null;

/** Accept order IDs without requiring callers to know the document grouping. */
export function parseDocumentLink(value: string): string | null {
  // Supported forms: web+autoshop:123 and web+autoshop://document/123.
  const match = /^web\+autoshop:(?:\/\/document\/|\/\/)?([1-9]\d*)\/?$/i.exec(value);
  return match ? match[1] : null;
}

export function consumeProtocolLaunch(): void {
  const url = new URL(window.location.href);
  const link = url.searchParams.get("autoshop");
  if (link === null) return;
  startupLink = link;
  url.searchParams.delete("autoshop");
  const id = parseDocumentLink(link);
  url.hash = id
    ? `/document/open/${id}`
    : "/document/open/invalid";
  window.history.replaceState(window.history.state, "", url);
}

/** Handle launch URLs also when the browser delivers them to an existing app. */
export function registerProtocolLaunchConsumer(router: Router): void {
  const launchWindow = window as Window & {
    launchQueue?: {
      setConsumer(callback: (params: { targetURL?: string }) => void): void;
    };
  };
  if (!launchWindow.launchQueue) return;
  launchWindow.launchQueue.setConsumer(async ({ targetURL }) => {
    if (!targetURL) return;
    let url: URL;
    try {
      url = new URL(targetURL);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    const link = url.searchParams.get("autoshop");
    if (link === null) return;
    // Initial navigation already consumed this launch before creating the router.
    const alreadyConsumed = link === startupLink;
    startupLink = null;
    if (alreadyConsumed) return;
    const id = parseDocumentLink(link);
    await router.isReady();
    await router.replace({
      name: "document-open",
      params: { documentId: id ?? "invalid" },
    });
  });
}

export function registerAutoshopProtocol(): void {
  if (!window.isSecureContext || !navigator.registerProtocolHandler) return;
  try {
    const handler = new URL(import.meta.env.BASE_URL, window.location.origin);
    handler.search = "autoshop=%s";
    navigator.registerProtocolHandler("web+autoshop", handler.href);
  } catch {
    // Registration can be disabled by browser settings; normal links still work.
  }
}
