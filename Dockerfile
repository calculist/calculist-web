FROM ruby:3.2-bookworm
RUN apt-get update -qq && apt-get install -y build-essential default-libmysqlclient-dev curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
RUN mkdir /calculist-web
WORKDIR /calculist-web
COPY Gemfile /calculist-web/Gemfile
COPY package.json package-lock.json /calculist-web/
RUN gem install bundler
RUN bundle install
RUN npm ci
COPY . /calculist-web
