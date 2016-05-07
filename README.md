# Soul Shoppe - Empty Your Balloon 

## Getting Started

To get you started you can simply clone this repository and install
the dependencies:

### Prerequisites

Make sure you have node.js and npm installed. 
You can get them from [http://nodejs.org/](http://nodejs.org/).

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework 
code.  
The tools help us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a 
  [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that 
you have two new folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `public/bower_components` - contains the angular framework files


*Note that the `bower_components` folder would normally be installed in the 
root folder but angular-seed changes this location through the `.bowerrc` file.
Putting it in the public folder makes it easier to serve the files by a 
webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  
The simplest way to start this server is:

```
npm start
```

Now browse to the app at `http://localhost:3000/`.
There is also a grammar helper page at `http://localhost:3000/#/parser` on this
branch. 


### Run The Application in Production Mode 

To start the project on port 80 with logging to file and whatnot, run
the following: 

```
sudo npm run-script start-production
```

This is insecure, so you should probably change the port specified in 
`bin/www-production` and use IPTABLEs to forward port 80 to it properly. 

## Directory Layout

The directory files and files within the app, presented in approximately 
the best order to read them in. 

```
README.md             --> This readme file.
package.json          --> Node.JS and NPM configuration
app.js                --> The entire server side application
public/               --> All the static omponents of the application
  favicon.ico           --> Completely White favicon :P 
  index.html            --> The main HTML file, it mostly just loads other 
                            things it needs.
  js/                   --> Javsscript Files
    app.js                --> The main controller, mostly just passes things to
                              the command view. 
    commandView.js        --> Main App controller, this is where UI facing 
                              functionality is defined. 
    components/           --> All app specific modules
      grammar.js          --> The service that retrieves the grammar and 
                              provides access and manipulation ability.
      command.js          --> The directives that allow the display of commands
                              and partial commands within a controller. 
      options.js          --> The directives that allow various options to be 
                              presented and chosen from. 
      util.js             --> Utility functions and finters as a service.
  views/                --> HTML Templates 
    commandView.html      --> Template for the commandView controller
    cmdCmpt.html          --> Template for a directive that renders a single
                              component in a command. 
  css/                  --> Style Files
  fonts/                --> Fonts for use in places 
  grammars/             --> The various raw grmmar files
user-log.db           --> The database into which all user actions are written
static_cache/         --> Location of all minified CSS and JS during runtime
bower.json            --> Bower static dependancy tracking config
karma.conf.js         --> Config file for running unit tests with Karma
LICENSE               --> License under which this app is distributed  
```

## Maintenance

### Updating Frameworks 

Run the following to update node tools and static dependencies. 

```
npm update
bower update
```

## Testing

We don't really have tests at the moment, this section will be updated as 
they're added. 


