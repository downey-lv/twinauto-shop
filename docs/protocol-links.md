# Document links

Use `web+autoshop://document/123` (or `web+autoshop:123`) to open an
existing document by its order ID. The caller does not need its document type.
The authenticated `GET /document/resolve/:id` endpoint retrieves the document
grouping and any associated return ID. Linked returns open the return screen
with that document selected; other orders open their document view using the
database grouping (`in`, `service`, `return`, etc.).

Install the app in a browser supporting manifest protocol handlers, or accept
the browser's protocol registration prompt when visiting the app over HTTPS.
The manifest asks supported browsers to navigate an existing app window on launch.
Browser and OS support for custom protocol registration varies.

The handler receives `/?autoshop=<encoded protocol URL>` and translates it to
the hash route `/#/document/open/123` before Vue Router constructs hash history.
The launch-queue consumer also handles subsequent launches into an existing app.
This ordinary HTTPS/hash link also works
without protocol registration. Login preserves the requested destination,
including when the daily token expires. Invalid links, missing documents, and
lookup failures display Latvian errors; lookup failures can be retried.

Manual verification with a running API:

1. Open links for incoming, service, outgoing, and return-linked order IDs;
   check that the resulting route matches the database grouping or return ID.
2. Open a link while signed out and with an expired token; sign in and confirm
   that the requested document opens.
3. Try an invalid link and a nonexistent ID; verify the error display.
4. Install the app, allow protocol handling, and launch two different document
   links from another application to check launch behavior in your browser.
