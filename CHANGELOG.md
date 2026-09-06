# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Changed
- README now displays the actual application screenshots from `assets/screenshoot/`.
- Screenshot documentation now lists the current media assets and usage guidance.

## [2.1.0] - 2026-09-06

### Added
- GitHub Pages deployment workflow.
- Screenshot asset directory at `assets/screenshoot/`.
- Security policy and public-release repository metadata.

### Changed
- Standardized project name to `shopping-list`.
- Updated application metadata and version to 2.1.0.
- CI now uses Bun consistently with the committed `bun.lock`.
- PWA configuration now supports deployment under `/shopping-list/`.

### Removed
- AI Studio/Gemini-specific metadata and import-map references.

### Fixed
- GitHub Actions failure caused by using npm cache without an npm lockfile.
- Public deployment paths for icons, styles, application entry point, and PWA scope.
