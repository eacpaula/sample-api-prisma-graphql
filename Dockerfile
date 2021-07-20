FROM node:12.14

#############################################
# Installing and configuring instant client #
#############################################
WORKDIR /tmp

RUN apt-get update && \
    apt-get -y upgrade && \
    apt-get -y dist-upgrade && \
    apt-get install -y netcat

###############################################
# Installing and configuring npm dependencies #
###############################################

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN npm config set registry https://registry.npmjs.org/

ADD package.json /tmp/package.json

USER node

RUN cd /tmp && npm install

RUN cp -a /tmp/node_modules /home/node/app

COPY --chown=node:node . .

EXPOSE ${PORT}

CMD ["npx", "prisma", "generate"]