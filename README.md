# Freeweight

Strength training platform connecting coaches and athletes.

## Repository Structure

```
/
├── index.html           # Landing page (GitHub Pages root)
├── styles.css           # Landing page styles
├── script.js            # Landing page scripts
├── demo/                # UI mockups (embedded in landing page)
├── landing/             # Landing page source files
├── backend/             # FastAPI backend (Python)
├── frontend/            # React Native mobile app (Expo)
└── mvp_spec.md          # Product specification
```

## GitHub Pages

The landing page is served from the root directory at:
- https://nitinsprao.github.io/freeweight

Root files (`index.html`, `styles.css`, `script.js`) are copies of `/landing/*` for GitHub Pages compatibility.

**To update the landing page:**
1. Edit files in `/landing/`
2. Copy to root: `cp landing/{index.html,styles.css,script.js} ./`
3. Commit and push

## Development

See individual READMEs:
- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)
- [Next Steps](NEXT_STEPS.md)

## Documentation

- [CLAUDE.md](CLAUDE.md) - Coding guidelines
- [STYLE_GUIDE.md](STYLE_GUIDE.md) - Design system
- [mvp_spec.md](mvp_spec.md) - Product specification
