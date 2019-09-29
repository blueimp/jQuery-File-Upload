FROM blueimp/chromedriver

USER root

RUN export DEBIAN_FRONTEND=noninteractive \
  && apt-get update \
  && apt-get install --no-install-recommends --no-install-suggests -y \
    nodejs \
    npm \
  # Remove obsolete files:
  && npm install -g \
    npm@latest \
    mocha-chrome \
  && apt-get clean \
  && rm -rf \
    /tmp/* \
    /usr/share/doc/* \
    /var/cache/* \
    /var/lib/apt/lists/* \
    /var/tmp/*

USER webdriver

WORKDIR /var/www/html

ENTRYPOINT ["mocha-chrome"]
