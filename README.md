# About LUNA
Luna is a multiplayer post-apocalyptic game, where 3 warring factions compete for the favor of the New Archons. Join a faction, and build up your colony. Go on Expeditions in space. Encounter pirates. Loot asteroids. Uncover lore. Contribute to the Global War Effort, and support your faction as they attempt to defeat the others. Can you be the reason the tides turn?

# Client Setup

## installation
Please be sure to install the client files with `npm i` and then ensure you have the correct environment settings set up below.

## Setup

Building your own LUNA client is not recommended. We will not provide the required environment variables to connect to the official LUNA servers. However, if you are running your own, you will need to be sure to set the following environment variables:

```
VITE_SERVER_URL - string
VITE_APP_VERSION - version string
VITE_APP_REVISION - number
```

## Technologies
Luna is built on the Ionic 7 framework, Capacitor, and Typescript. This enables the client to be written once, and deployed to any platform.

LUNA is designed to be played on Android, however support for iOS is included.

