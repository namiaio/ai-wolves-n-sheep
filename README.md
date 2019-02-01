AI: Wolves & Sheep
===========

Alvar started this wanting to do something fun while learning the basics of A.I. and actually got quite a few laughs out of the experience.

In this project a small group of wolves to try catch all the sheep. Each sheep and wolf is its own agent. and each agent consists of perceptrons in a neural network.

The sheep are split into groups (of ten). They first find each other and then learn to run efficiently around the map as a group. Each sheep receives the location (x, y) and velocity (x, y) of every sheep in its group (so 4 values per sheep). They output 3 values which are used to move the sheep. After the creatures have moved their next target position is propagated back into the neural network.

They do their best to maintain a semi-static distance to each other, and try to move in a similar direction. Each sheep has different force and velocity values, so that the task isn't too easy. They also get a minimal speed boost when moving near to each other (indicated by a slight highlight).

The wolves are a singular group of 3. Their basic logic is similar to the sheep, but their input is all the sheep outputs put together. Whereas the sheep try to align into a similar heading, the wolves usually aim for the nearest sheep. Their general speed is also slightly slower and they do not get a speed boost for staying together.

Just for flair I've also added some sound effects and ambient. There's also a timer, so that you can compare results with your friends!

The project was started from the synaptic creature example and converted into modern class-based javascript syntax. There is a basic `Creature` class for the sheep, the `Wolf` is extended from that, a `Herd` for groups of creatures and a `Vector` mainly for direction and velocity. `app/world.js` is where everything interacts.

## Setup
Install dependencies
```sh
$ yarn
```

## Development
Run the local webpack-dev-server with livereload and autocompile on [http://localhost:8080/](http://localhost:8080/)
```sh
$ yarn dev
```
## Deployment
Build the current application (need to move audio assets manually).
```sh
$ yarn build
```

## [webpack](https://webpack.js.org/)
If you're not familiar with webpack, the [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) will serve the static files in your build folder and watch your source files for changes.
When changes are made the bundle will be recompiled. This modified bundle is served from memory at the relative path specified in publicPath.
