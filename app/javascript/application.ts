/**
 * Main application entry point.
 * Replaces the Sprockets application.js manifest + calculist.init() in init.js.
 */

// Import all Item prototype extensions (must run before using Item)
import './shared/run/extendItemPrototype';

// Import all command registrations
import './shared/commands/commands';
import './shared/commands/commands.addId';
import './shared/commands/commands.celebrate';
import './shared/commands/commands.changeFont';
import './shared/commands/commands.copy';
import './shared/commands/commands.disableSpellcheck';
import './shared/commands/commands.enterSearchMode';
import './shared/commands/commands.executePreviousCommand';
import './shared/commands/commands.exitSearchMode';
import './shared/commands/commands.goHome';
import './shared/commands/commands.goto';
import './shared/commands/commands.gotoList';
import './shared/commands/commands.moveToBottom';
import './shared/commands/commands.moveToTop';
import './shared/commands/commands.pauseComputation';
import './shared/commands/commands.permanentlyDeleteList';
import './shared/commands/commands.resumeComputation';
import './shared/commands/commands.shareListWith';
import './shared/commands/commands.stopSharingListWith';

// Import UI components
import './client/ui/footerMenu';

// Import the init logic
import './client/init';
