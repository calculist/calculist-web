# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Calculist is an outliner/note-taking app with computation capabilities. The web app runs at app.calculist.io. This is a Rails 7.0 application (Ruby 3.2) with a rich JavaScript frontend using a custom module system and the Sprockets asset pipeline.

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
- Sprockets 4 asset pipeline (no Webpacker/import maps)
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

### Frontend (JavaScript)

**Module System:**
Uses `acyclic` for dependency injection. Modules register via:
```javascript
calculist.register('ModuleName', ['dep1', 'dep2'], function(dep1, dep2) {
  // module code
  return exportedValue;
});
```

Entry point initialized with `calculist.init([...deps], callback)`.

**Asset Pipeline Structure (`app/assets/javascripts/`):**
- `calculist.js` - Module system initialization
- `shared/Item/` - Core Item class (extends Backbone.View) split across many files
- `shared/commands/` - Command implementations (search, navigation, etc.)
- `shared/utility/` - Helper functions
- `client/services/` - Browser-specific services (sync, undo, preferences)
- `client/ui/` - UI components (save button, footer menu)
- `client/init.js` - Application bootstrap

**Item Class:**
The `Item` class is the core component. Key behaviors are split across files:
- `Item.js` - Base class with tree navigation methods
- `item.initialize.js` - Constructor logic
- `item.render.js` - DOM rendering
- `item.events.js` - Event handlers
- `item.handleKeydown.js` - Keyboard shortcuts
- `item.executeCommand.js` - Command mode
- `item.save.js` - Persistence

**Item Text Format:**
Items support computed values with syntax: `name [=] expression` or `name [:] value`
- `[=]` - Computed expression (evaluated)
- `[:]` - Static key-value assignment

**Global State:**
- `window.topItem` - Root item of current list
- `window.LIST_ID` - Current list ID
- `window.LIST_DATA` - Initial list data from server
- `sessionStorage.focusGuid` / `sessionStorage.zoomGuid` - Navigation state

### Vendor Dependencies (`vendor/assets/javascripts/`)

- `acyclic` - Custom dependency injection
- `backbone` - Item views extend Backbone.View
- `lodash` - Utility functions
- `d3` - Data visualization
- `katex` - LaTeX rendering
- `papaparse` - CSV parsing
- `evalculist` - Expression evaluator
- `jsondiffpatch` - Change detection for sync

## Testing

176 RSpec specs covering models, services, and request specs. Run via Docker:

```bash
docker-compose -f docker-compose.test.yml up -d db
docker-compose -f docker-compose.test.yml run --rm test
```

CI runs automatically on push/PR to master via GitHub Actions (`.github/workflows/test.yml`).

**Test infrastructure notes:**
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
