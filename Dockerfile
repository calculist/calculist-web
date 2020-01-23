FROM ruby:2.3.1
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs
RUN mkdir /calculist-web
WORKDIR /calculist-web
COPY Gemfile /calculist-web/Gemfile
COPY Gemfile.lock /calculist-web/Gemfile.lock
RUN gem install bundler -v 1.16.5
RUN bundle install
COPY . /calculist-web
