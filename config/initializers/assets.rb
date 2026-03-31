# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '2.0'

# Remove app/assets/javascripts from the asset path — JS is now handled by esbuild.
# Only keep app/assets/builds (esbuild output), stylesheets, images, and vendor assets.
Rails.application.config.assets.paths.delete(Rails.root.join('app/assets/javascripts').to_s)

# Precompile additional assets.
Rails.application.config.assets.precompile += ['*.svg', '*.eot', '*.woff', '*.woff2', '*.ttf']
