# develop stage
FROM node:18.1.0-alpine as develop-stage
WORKDIR /app
RUN yarn global add @quasar/cli
RUN yarn global add cordova

USER root

FROM develop-stage as build-stage
WORKDIR /app


# FROM androidsdk/android-31 as android-stage
FROM alvrme/alpine-android:android-33-jdk11-v2023.09.10 as android-stage
COPY --from=build-stage /app /app
RUN apk add --update --no-cache curl
RUN apk add --update --no-cache nodejs npm
RUN wget -c https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-7.4.2-bin.zip
ENV GRADLE_HOME=/opt/gradle/gradle-7.4.2
ENV PATH=${GRADLE_HOME}/bin:${PATH}
WORKDIR /app
RUN npm install -g yarn
RUN yarn global add @quasar/cli
RUN yarn global add cordova

RUN sdkmanager --sdk_root=/opt/android-sdk-linux/ "build-tools;33.0.2"
RUN npm install -g firebase-tools
EXPOSE 6006
