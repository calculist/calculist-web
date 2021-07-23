RAILS_ENV = ENV['RAILS_ENV'] || 'development'

namespace :assets do

  desc 'Update assets for use in the desktop app'
  task :update_desktop do
    puts "rake assets:clobber"
    Rake::Task['assets:clobber'].invoke
    puts "rake assets:precompile"
    Rake::Task['assets:precompile'].invoke

    assets_path = "#{Rails.root}/public/assets/"
    assets = ['js','css'].map {|x| Dir["#{assets_path}**/*.#{x}"] }.flatten

    digest_regex = /(-{1}[a-z0-9]{32}*\.{1}){1}/

    desktop_assets_path = assets_path.gsub('/public','/desktop')

    assets.each do |file_path|
      file_name = file_path.split(assets_path).pop.gsub(digest_regex, '.')
      desktop_file_path = "#{desktop_assets_path}#{file_name}"
      puts "Updating #{file_name}"
      if file_name == 'application.css'
        File.write(file_path, File.read(file_path).gsub(Rails.root.to_s, '~/calculist-web'))
      end
      FileUtils.mv(file_path, desktop_file_path)
    end

    puts "rm -R #{assets_path}"
    FileUtils.rm_r(assets_path)
  end

end
