// ## Base Express Library ##
var express = require('express');
var app = express();

// ## Local pathname module? ## 
var path = require('path');


// ## SASS Parsing ##
var sassMiddleware = require('node-sass-middleware');
app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'public','css'),
    force: true, 
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));
//app.use(express.static(path.join(__dirname, 'public')));

// ## Automatic Minification ##
//var minify = require('express-minify');
//
//express.static.mime.define(
//{
//    'text/x-scss':        ['scss'],
//});
//app.use(minify({
//  cache: __dirname + "/static_cache"
//}));

// ## Automatic Compression ##
//var compression = require('compression');
//app.use(compression());

// ## Parse the bodies of post requests ##
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ## Favicon module for some reason? ## 
var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// ## Date-Time object ##
var date = new Date();

// ## Logging ##
var logger = require('morgan');
var fs = require('fs');
var logFileStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
if (app.get('env') == 'development') {
  app.use(logger('dev'));
} else {
  // Log to file for future use
  app.use(logger('combined', {stream: logfileStream}))
}


// ## UUIDs ##
var uuid = require('node-uuid');

// ## Database Initialization and Schema Def ##
var sqlite3 = require('sqlite3').verbose(); 
var db = new sqlite3.Database('user-log.db');
// Initialize Session Log Table
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='session_logs'",
  function(err,rows){ 
    if(err !== null){ 
      console.log(err); 
    } else if (rows === undefined) { 
      db.run('CREATE TABLE "session_logs" (' + 
                '"id" INTEGER PRIMARY KEY AUTOINCREMENT,' +  
                '"surveyid" TEXT,' + // survey id as given by qualtrix 
                '"promptid" TEXT,' + // newly generated promptID 
                '"time" TEXT,'     + // time of request call to server 
                '"log_data" TEXT'  + // JSON blob with content for server to log
             ')'
        ,function (err){ 
          if(err !== null){ 
            console.log(err); 
          } else {
            console.log("Table 'sessions' initialized."); 
          }
        }
      );
    } else {
      console.log("Table 'sessions' already initialized."); 
    }
  }
);

// Initialize Parser Log Table
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='parser_logs'",
  function(err,rows){ 
    if(err !== null){ 
      console.log(err); 
    } else if (rows === undefined) { 
      db.run('CREATE TABLE "parser_logs" (' + 
                '"id" INTEGER PRIMARY KEY AUTOINCREMENT,' +  
                '"time" TEXT,'     + // time of request call to server 
                '"log_data" TEXT'  + // JSON blob with content for server to log
             ')'
        ,function (err){ 
          if(err !== null){ 
            console.log(err); 
          } else {
            console.log("Table 'parser' initialized."); 
          }
        }
      );
    } else {
      console.log("Table 'parser' already initialized."); 
    }
  }
);


// Enter data into database
var logParserData = function(logData){ 
  var ret; 
  db.run(
    "INSERT INTO 'parser_logs' (time,log_data) " +
    "VALUES($time,$data)", 
    {
      $time: date.toJSON(),
      $data: JSON.stringify(logData,undefined, "  ")
    },
    function(err){ 
      if(err !== null){ 
        console.log(err); 
        ret = false;
      } else { 
        console.log("Sucessfull parser log entry added");  
        ret = true;
      }
    }
  );
  return ret;
};

// Enter data into database
var logUserData = function(sid,pid,logData){ 
  var ret; 
  db.run(
    "INSERT INTO 'session_logs' (surveyid,promptid,time,log_data) " +
    "VALUES($sid,$pid,$time,$data)", 
    {
      $sid: sid, 
      $pid: pid, 
      $time: date.toJSON(),
      $data: JSON.stringify(logData)
    },
    function(err){ 
      if(err !== null){ 
        console.log(err); 
        ret = false;
      } else { 
        console.log("Sucessfull log data addition of:");  
        console.log(JSON.stringify(logData));  
        ret = true;
      }
    }
  );
  return ret;
};

// get the user data back as a js object of some sort ... 
var getUserData = function(){ 
  var output; 
  db.all(
    "SELECT * FROM session_logs",
    function(err,rows){ 
      if(err !== null){ 
        console.log(err);
        output = null;
      } else {
        output = rows;
      }
    }
  );
  return output;
}

// ## ROUTES ##

// Get new prompt id
app.get('/new/pid.json',function(req,res, next){ 
  res.json({"pid":uuid.v4()});
});

// Submit log message 
app.post('/log', function(req,res,next){ 
  var ret = logUserData(req.body.sid,req.body.pid,req.body.data); 
  res.json({success: ret});
});

app.post('/logParser', function(req,res,next){ 
  var ret = logParserData(req.body.data); 
  res.json({success: ret});
});

// Static Directories (minification/compression?)
app.use(express.static('public'));

// ## Error handlers ##

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
