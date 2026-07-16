# develop stage
FROM node:18.1.0-alpine AS develop-stage
WORKDIR /app
RUN yarn global add @quasar/cli
RUN yarn global add cordova

USER root



FROM develop-stage AS build-stage
WORKDIR /app
CMD [ "sh","-c", "yarn && cp -R src/assets/maps node_modules/fusioncharts/ && quasar build" ]

# android stage
FROM alvrme/alpine-android:android-34-jdk17-v2023.09.10 AS android-stage
COPY --from=build-stage /app /app

# atualiza os pacotes, instala gradle, firebase, quasar e cordova...
RUN apk add --update --no-cache \
      curl unzip bash nodejs npm && \
    wget -c https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -P /tmp && \
    unzip -d /opt/gradle /tmp/gradle-7.4.2-bin.zip && \
    npm install -g yarn firebase-tools && \
    yarn global add @quasar/cli cordova

# Atualiza o SDK para incluir o Android 15 (API 35)
RUN sdkmanager --sdk_root=${ANDROID_SDK_ROOT} \
    "platforms;android-35" \
    "platform-tools" \
    "build-tools;35.0.0"

ENV GRADLE_HOME=/opt/gradle/gradle-7.4.2
ENV PATH=${GRADLE_HOME}/bin:${PATH}
WORKDIR /app

RUN sdkmanager --sdk_root=/opt/android-sdk-linux/ "build-tools;34.0.0"
RUN npm install -g firebase-tools

#run if needed
ENV NODE_OPTIONS="--max_old_space_size=4096"
EXPOSE 6006
