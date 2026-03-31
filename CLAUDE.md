# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Calculist is an outliner/note-taking app with computation capabilities. The web app runs at app.calculist.io. This is a Rails 7.0 application (Ruby 3.2) with a TypeScript frontend bundled by esbuild.

## Development Commands

```bash
# Start development server (Docker - recommended)
# App runs at http://localhost:3006 (or set APP_PORT in .env)
docker-compose up -d
docker-compose logs -f web

# Run tests in Docker
docker-compose -f docker-compose.test.yml up -d db
docker-compose -f docker-compose.test.yml run --rm test

# Run a single test file in Docker
docker-compose -f docker-compose.test.yml run --rm test bundle exec rspec spec/services/item_manager_spec.rb

# Rails console in Docker
docker-compose exec web bundle exec rails c

# Generate a beta access code for dev signup
docker-compose exec web bundle exec rails runner "puts BetaAccess.create!.code"
# Then visit /join?invite_code=<code>
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `CALCULIST_DATABASE`, `CALCULIST_DATABASE_PASSWORD` - MySQL/MariaDB credentials
- `SECRET_KEY_BASE` - Rails secret (use `rails secret` to generate)
- `SHARED_SECRET` - Must be 64+ hex chars for MessageEncryptor (32 bytes key + 32 bytes sign secret)
- `MAILGUN_USERNAME`, `MAILGUN_PASSWORD` - For email delivery
- `STRIPE_*` keys - Optional, for subscription features
- `APP_PORT` - Local port for dev server (default: 3001)

All secrets are accessed via `ENV[]` directly (not `Rails.application.secrets`).

## Architecture

### Backend (Rails 7.0)

**Stack:**
- Ruby 3.2, Rails 7.0, Puma 6, MariaDB/MySQL
- Devise for authentication (with confirmable, custom login field)
- jsbundling-rails with esbuild for JavaScript, Sprockets 4 for other assets
- Docker (ruby:3.2-bookworm + mariadb:10.11)

**Data Model:**
- `User` → has many `List` → has many `Item`
- Items form a tree structure via `parent_guid` (not foreign key, uses GUID strings)
- Special list types: `user_primary`, `user_preferences`, `welcome`
- Items have `sort_order` (float) for ordering within parent
- All models extend `ApplicationRecord`

**Key Services (`app/services/`):**
- `ItemManager` - Builds and persists item trees, handles bulk updates via raw SQL inserts
- `UserPreferencesManager` - Sets up default lists for new users from JSON config files in `config/lists/`
- `StripeHelper` - Subscription management

**Controllers:**
- `ListPagesController` - Renders list views (HTML pages)
- `ListsController` - JSON API for list CRUD and sync
- `SubscriptionsController` - Stripe checkout flow
- `Users::RegistrationsController` - Custom Devise registration with beta access codes

**Sync Mechanism:**
- Lists track `update_count` for versioning
- Items track `list_update_id` and `initial_list_update_id`
- Client sends delta changes via `PUT /lists/:id` with `changes` array
- Server returns `last_save` for conflict detection

**Known Issues:**
- `render_403` in `ApplicationController` is buggy — uses `message:` which isn't a valid render option, causing `MissingTemplate` errors. The `destroy` action in `ListsController` works correctly because it uses `render status: :forbidden, json: {...}` instead.

### Frontend (TypeScript)

**Build System:**
- TypeScript source in `app/javascript/`, bundled by esbuild (`esbuild.config.js`)
- Output to `app/assets/builds/` for Sprockets to serve
- `tsconfig.json` with `strict: false`, target ES2020, ESNext modules
- Type checking via `npx tsc --noEmit`

**Source Structure (`app/javascript/`):**
- `application.ts` - Entry point
- `shared/Item/` - Core Item class split across many files
- `shared/commands/` - Command implementations (search, navigation, etc.)
- `shared/utility/` - Helper functions
- `shared/run/` - Runtime helpers
- `client/services/` - Browser-specific services (sync, undo, preferences)
- `client/ui/` - UI components (save button, footer menu)
- `client/init.ts` - Application bootstrap
- `client/http.ts` - HTTP client
- `vendor/` - Vendored JS with `.d.ts` type declarations (evalculist, confetti, undomanager)

**Item Class:**
The `Item` class is the core component. Key behaviors are split across files:
- `Item.ts` - Base class with tree navigation methods
- `item.initialize.ts` - Constructor logic
- `item.render.ts` - DOM rendering
- `item.events.ts` - Event handlers
- `item.handleKeydown.ts` - Keyboard shortcuts
- `item.executeCommand.ts` - Command mode
- `item.save.ts` - Persistence

**Item Text Format:**
Items support computed values with syntax: `name [=] expression` or `name [:] value`
- `[=]` - Computed expression (evaluated)
- `[:]` - Static key-value assignment

**Global State:**
- `window.topItem` - Root item of current list
- `window.LIST_ID` - Current list ID
- `window.LIST_DATA` - Initial list data from server
- `sessionStorage.focusGuid` / `sessionStorage.zoomGuid` - Navigation state

### Dependencies

NPM packages (see `package.json`):
- `backbone` - Item views extend Backbone.View
- `lodash` - Utility functions
- `d3` - Data visualization
- `katex` - LaTeX rendering
- `papaparse` - CSV parsing
- `jsondiffpatch` - Change detection for sync
- `jquery` - DOM manipulation

Vendored in `app/javascript/vendor/` (with `.d.ts` declarations):
- `evalculist` - Expression evaluator
- `confetti` - Confetti animation
- `undomanager` - Undo/redo stack

## Testing

**Ruby (RSpec):** Models, services, and request specs. Run via Docker:

```bash
docker-compose -f docker-compose.test.yml up -d db
docker-compose -f docker-compose.test.yml run --rm test
```

**JavaScript (Jest):** 9 test files in `spec/javascripts/` covering Item operations, computation, parsing, serialization. Run locally:

```bash
npm test              # run all JS tests
npm run test:watch    # watch mode
```

Jest config in `jest.config.js`. Uses `esbuild-jest` transformer and `jsdom` environment. Browser dependencies (jQuery, Backbone, etc.) and client services are mocked via `spec/javascripts/__mocks__/`. Test helper at `spec/javascripts/helpers/calculistTestHelper.ts` provides `createCalculist()` and `createItemTree()`.

**CI** runs automatically on push/PR to master (`.github/workflows/test.yml`):
1. TypeScript type check (`tsc --noEmit`)
2. esbuild build (`npm run build`)
3. RSpec tests (`bundle exec rspec`)
4. Jest tests (`npm test`)

**Ruby test infrastructure notes:**
- `spec/support/test_helpers.rb` provides `create_user`, `create_list`, `create_item`, `create_tree` helpers
- `spec/rails_helper.rb` stubs `set_shared_token` to avoid `domain: :all` cookie issues with Rack::Test
- `spec/services/shared_token_spec.rb` tests the `MessageEncryptor` code path directly (bypassing the stub)

## Key URLs

- `/join?invite_code=<code>` - Registration (requires beta access code)
- `/login` - Sign in
- `/:username` - User's primary list (profile page)
- `/:username/:handle` - Specific list
- `/l/:hex_id` - List by hex ID (shareable link)
- `/preferences` - User preferences list
- `/welcome` - Welcome tutorial list
