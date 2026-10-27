# RestaurantPicker redesign

The user-provided design-system.json and burger reference set the visual direction. The attached Apple Design document supplies design principles; its unrelated initial-response and workflow text is not part of the user request.

Dark charcoal, warm orange, rounded translucent surfaces, restrained inner highlights, and the burger silhouette follow that direction. The neutral system sans is the app's existing accessible type voice. ENERGY 2 / RHYTHM 2 / MOTION 1.

All five app screens keep their original IDs, fields, routes and actions. Desktop pairs the picker with its result; mobile stacks them above a floating navigation bar. Main actions retain dark text over warm orange for contrast. Existing light and device-matched themes remain available to preserve functionality; new installs default to the requested dark theme.

Glass blur is limited to the floating navigation and an open dialog. The other surfaces use translucent fills and highlights, avoiding stacked live blur. Two static warm background blooms and the orange action gradient reflect the supplied design, rather than adding unrelated decoration. Selected controls use an outline and tint; secondary actions stay neutral. Headline emphasis is explicitly requested by the design system.

The burger image is decorative, generated with the built-in imagegen tool, and does not depict an individual restaurant's dish. Saved and live restaurant records have no fabricated photos, ratings, prices or opening hours. Image path: assets/burger-hero.png. Prompt: isolated sesame-bun cheeseburger with cheddar, beef, lettuce, tomato and pickles; three-quarter front view; warm amber rim light; transparent background; no text, logos, phone, interface or particles.

Copy changes: Name A–Z becomes Name A to Z; price-label dashes become parentheses; saving references a heart rather than a star. Emoji action icons become labelled SVGs. The original meaning, option values and handlers are retained.

Validation records and screenshots live under .hallmark/screens. The restaurant regression suite remains unchanged. Browser smoke checks use isolated test data and intercept external providers; they do not modify the user's browser storage or verify live business availability.
