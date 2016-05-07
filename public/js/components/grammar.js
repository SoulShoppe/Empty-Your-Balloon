'use strict';

// This module downloads the grammar from the json file and reassembles it in 
// a more usable form for other modules to work with. 
// This is meant to be psuedo-stateless, inasmuch as there is a basically 
// static database that the system is 

angular.module('PSMmla.grammar', ['PSMmla.util'])

.factory('GrammarServ', ['$http','$log','util','$routeParams', 
    function($http,$log,util,$routeParams) {

  // ### Type Signature Definitions ### 
  
  // Note: For our purposes a 'Hash' is a sort of generic typed record, and a 
  //       'Map' is the actual mapping of elements of one type to another. 
  //       They're both the same underlying type in javascript, but the 
  //       split is useful here. 

  // #### Type Sigs for Incoming Raw JSON #### 

  // type Id = String 
  //
  // type Statement = Hash { "RHS" :: String
  //                         "LHS" :: [String]
  //                       }
  //
  // type RawGrammar = Map Id Statement
  
  // #### Command Type Signatures ####

  // Note: Commands the root data structure of this entire system. 
  //       They represent both complete and partial constructions of statements
  //       within the specified grammer, as well as the subcomponents thereof. 

  // type ElemType = String -- this should be the normalized element head type
  //                        -- with any parameters removed 
  // 
  // type CmdSig = [String] -- the string literal components of a rule.
  //
  // type LID = Int -- Identifier for a particular set of valid hole types in a
  //                -- command
  // 
  // type Cmd = Hash { type :: ElemType 
  //                   sig :: CmdSig
  //                   inst :: [CmdComponent] -- [^1]
  //                   $$nextLID :: LID
  //                   $$LIDs :: [LID]
  //                 }
  //
  //  -- [^1]: I don't remember why I called these instances and I don't want
  //           to refactor right now. (TODO: Refactor this) But they repesent
  //           the set of possible expansions of components in the system. 
  //           This with LIDs acting as the index to a particular single 
  //           expansion of the components. 
  // 
  // type CmdComponent = Hash { cmpType :: ('lit'|'hol'|'inst'|'rng'|'txtbx'|'time') 
  //                                'lit'   => literal :: String 
  //                                'inst'  => inst :: Rule
  //                                'hol'   => type :: Map LID ElemType
  //                                'rng'   =>
  //                                    min :: Number
  //                                    max :: Number 
  //                                    def :: Number
  //                                    isSet :: Bool 
  //                                      true => val :: Number 
  //                                'txtbx' => 
  //                                    desc :: String 
  //                                    isSet :: Bool 
  //                                      true => val :: String 
  //                                'time' => 
  //                                    isSet :: Bool
  //                                      true => val :: Date
  //                          } 
  //
  // type CmdIndex = [Integer] -- Indexing into a command is basically popping
  //                           -- the first sub-index off a list, and recursing 
  //                           -- to that element in the instance
  
  // #### Rule Type Signatures ####

  // Note: Rules are the subset of commands found within the normalized grammar
  //       and cannot take on the full range of states of commands. 
  //       This allows for somewhat easier transformations between states 

  // type Rule = as Cmd except { inst :: [RuleComponent] }
  //
  // type RuleComponent = as CmdComponent except { cmpType :: ('lit'|'hol') 
  //   -- Only literals and holes are allowed in rules, they'll get expanded
  //   -- when they become options and then commands. 
  //
  // type RuleIndex = CmdIndex
  //
  // type NormedGrammar = Map ElemType [Rule]
  
  // #### Option Type Signatures ####
  
  // Note : Options are Partial Commands as presented to the user as choices. 
  //        They are a strict superset of rules and a subset of commands. 

  // type Option = as Cmd except { inst :: [OptionComponent] } 
  //
  // type OptionComponent = as CmdComponent except { isSet :: false } and
  //    the keys in 'type' cannot be special element types. (this bit is hard)  
  //
  // type OptionIndex = CmdIndex 

  // ### Function Prototypes ###
 
  // Private
  // 
  // matchingInstance :: ([CmdComponent],[CmdComponent],LID,LID) -> Bool
  // containsInstance :: (Cmd,[CmdCompoment],LID) -> Bool 
  // addInstance :: (Cmd,[CmdComponent],LID) -> Cmd
  // combineRules :: (Rule,Rule) -> Maybe Rule 
  // insertRule :: Rule -> () 
  // rulesFromStatement :: Statement -> [Rule] 
  // normalizeRaw :: rawJsonGrammar -> () 
  // getHoleFromSpecial :: ElemType -> OptionComponent
  // convRuleCmpToOptCmp :: (RuleComponent,LID) -> OptionComponent
  // convRuleInstToOptInst :: ([RuleComponent],LID) -> [OptionComponent]
  // isLidSpecial :: (Rule,LID) -> Bool 
  // stripLid :: (Cmd,LID) -> Hash { stripped : Cmd , remainder : Cmd )
  // isCmdSpecial :: Cmd -> Bool 
  // expandAtIndex :: (Option,CmdIndex) -> [Option]
  // isVacuous :: Cmd -> Bool
  // isEmpty :: Cmd -> Bool 
  // isSingleton :: Cmd -> Bool
  // getFirstHoleInd :: Cmd -> Maybe CmdIndex
  // countNonEmptyOpts :: [Option] -> Int
  // isComplete :: Cmd -> Bool
  // isFull :: Cmd -> Bool
  // printCmd :: Cmd -> String
  // printCmpt :: CmdComponent -> String
  
  // Public 
  //  
  // getRootHole :: () -> Cmd
  // getCompFromCmd :: (Cmd,Index) -> Maybe CmdComponent
  // getReplacementCompFromCmd :: (Cmd,Index) -> Maybe CmdComponent
  // getOptionsFromRule :: Rule -> [Option]
  // expandOption :: (Option,Bool) -> [Option]
  // getOptsForComp :: CmdComponent -> [Options]
  // insertCommand :: (Command,CmdIndex.Command) -> Command
  // isComplete :: Cmd -> Bool
  // isSingleton :: Cmd -> Bool
  // isEmpty :: Cmd -> Bool 
  // isFull :: Cmd -> Bool
  // printCmd :: Cmd -> String

  // ### General TODOs ###

  // TODO : Add timer and give up.  
  // TODO : Refactor function location in grammar.js
  // TODO : Testing
  // TODO : Add deep validity checks for all the types and repeatedly assert 
  //        their truth. 
  // TODO : Test Cases

  // ### Private Objects ###

  //  rawGrammar :: RawGrammar
  var rawGrammar = {};

  //  normGrammar :: NormedGrammar
  var normGrammar = new Map(); 

  // ### Private Functions ###
  
  //  Check whether the holes for a pair of (instance,LID) tuples are of a 
  //  matching type. 
  //
  //  matchingInstance :: ([CmdComponent],[CmdComponent],LID,LID) -> Bool
  var matchingInstance = function(inst1, inst2, lid1, lid2){ 
    for(var ix in inst1){
      
      // They can't be equal if any one component doesn't match. 
      if (inst1[ix].cmpType !== inst2[ix].cmpType) return false; 

      // If they match check for equality more specifically. 
      switch (inst1[ix].cmpType) {
        // For holes we only check the specific instance we care about. 
        case 'hol':
          if(inst1[ix].type[lid1] !== inst2[ix].type[lid2]) return false; 
          break;
        default: // TODO : insert other equality checks here ... 
          break; 
      }

    }
    return true; 
  };

  //  Check whether a particular (Instance,LID) pair is available (possibly 
  //  under a different LID in a particular command. 
  //
  //  containsInstance :: (Cmd,[CmdCompoment],LID) -> Bool 
  var containsInstance = function(cmd,inst,lidI){ 
    // If any of the (LID,instance) pairs match, then there exists a matching
    // component. 
    return _.some(cmd.$$LIDs, function(lidC){
      return matchingInstance(cmd.inst,inst,lidC,lidI); 
    });
  };

  //  Given a particular command and a specific (instance,LID) pair, add that 
  //  particular expansion of components to the command. This expects that the
  //  instance can be a valid part of the command given. 
  //
  //  addInstance :: (Cmd,[CmdComponent],LID) -> Cmd
  var addInstance = function(cmd,inst,lid){ 

    // TODO : Insert equality and validity asserotions here. 
     
    var nid = cmd.$$nextLID; 
    cmd.$$nextLID++; 
    cmd.$$LIDs.push(nid); 

    for(var ix in inst){
      if(inst[ix].cmpType === 'hol'){ 
        cmd.inst[ix].type[nid] = inst[ix].type[lid];
      }
    }

    return cmd; 
  };

  //  Given a pair of rules that otherwise match, make sure to insert any
  //  (instance,LID) pairs from the second into the first if they don't already
  //  exist.
  //
  //  combineRules :: (Rule,Rule) -> Maybe Rule 
  var combineRules = function(r1,r2){

    // Make sure the rules are compatible. 
    if(r1.type !== r2.type) return undefined; 
    if(!util.arraysEqual(r1.sig,r2.sig)) return undefined; 
    util.assert(r1.inst.length == r2.inst.length,
        "Sigs are equal but instances are not"); 

    var insertLIDs = [];

    // Gather LIDs to insert
    _.each(r2.$$LIDs, function (i) { 
      if(!containsInstance(r1,r2.inst,i)){
        insertLIDs.push(i);
      }
    }); 

    // Go ahead and insert them
    _.each(insertLIDs, function (i) { 
      r1 = addInstance(r1,r2.inst,i); 
    }); 

    return r1; 
  };

  //  Given a rule, insert it into the normalized grammar.
  //
  //  insertRule :: Rule -> () 
  var insertRule = function(rule){

    if(normGrammar[rule.type]){ 
      
      var relevantRules = normGrammar[rule.type]; 
      
     // var sigInd = _.findIndex(relevantRules, function(r){
     //   return util.arraysEqual(rule.sig,r.sig); 
     // });

     // if(sigInd == -1){
        normGrammar[rule.type].push(rule); 
     // } else { 

     //   // If the signatures match, then the instances must match. 
     //   var nr = combineRules(rule,normGrammar[rule.type][sigInd]);

     //   if(nr !== undefined){ 
     //     normGrammar[rule.type][sigInd] = nr;
     //   }
     // } 

    } else { 
      normGrammar[rule.type] = [rule];
    } 
  };

  //  Convert a statement into a set of rules. 
  //
  //  rulesFromStatement :: Statement -> [Rule] 
  var rulesFromStatement = function(statement){ 

    var type = statement["RHS"]; 
    var rules = [];
    
    //if(type == "action"){
    //          $log.error("found empty option \n\n" + JSON.stringify(statement,undefined,"  ") + "\n\n");
    //}
    _.each(statement["LHS"], function(lhs){

      // Split each of the given left hand sides so that you have alternating
      // terminal and paramater components.
      var postSplit = lhs.split(/<([^<>]*)>/);
      var sig = postSplit.filter( function(e,i){ return (i % 2) == 0; } );
      var inst = []; 
      var nLID = 0;
      
      // Generate the instance
      _.each(postSplit, function(cmpString,i){
        if((i % 2) == 1){ // Even indexed elements are holes
          // explicitly create the type map for this hole. 
          var tm = new Map(); 
          tm[nLID] = cmpString; 
          // And Insert
          inst[i] = { cmpType : 'hol',  type : tm};
        } else { // Odd ones are literals. 
          inst[i] = { cmpType : 'lit', literal : cmpString };
        }
      });

      var rule = { 
        type : type,
        sig : sig, 
        inst : inst, 
        $$nextLID : nLID + 1, 
        $$LIDs : [nLID], 
      };

    //  if(type == "action"){
    //          $log.error("found empty option \n\n" + JSON.stringify(lhs,undefined,"  ") + "\n\n");
    //          $log.error("found empty option \n\n" + JSON.stringify(rule,undefined,"  ") + "\n\n");
    //}
      rules.push(rule);
    });

    //if(type == "action"){
    //          $log.error("found empty rules\n\n" + JSON.stringify(_.map(rules,printCmd),undefined,"  ") + "\n\n");
    //}


    return rules; 
  };

  //  Take the entire raw grammar and normalize and insert it into the 
  //  normalized grammar structure. 
  //
  //  normalizeRaw :: rawJsonGrammar -> () 
  var normalizeRaw = function(raw){ 
    _.each(raw, function(statement,id){ 
      _.each(rulesFromStatement(statement), insertRule);
    });
  };

  //  Check whether a particular ElemType is special. 
  //
  //  isElemTypeSpecial :: ElemType -> Bool 
  var isElemTypeSpecial = function(et){ 
    var b = /^(\w*)\(([^\(\)]*)\)$/.test(et);
    //$log.debug("Tested '" + et + "' for specialness, got " + b);
    return b;
  };

  //  Check whether a compoment

  //  Get the hole for a special element type 
  //
  //  getHoleFromSpecial :: ElemType -> OptionComponent
  var getHoleFromSpecial = function(et){ 
    var match = /^(\w*)\(([^\(\)]*)\)$/.exec(et);
    if(!match){
      $log.error("Tried to parse non-special hole as special hole")
      return undefined; 
    }

    var type = match[1];

    // JSON uses only double quotes for string defs, so we turns non 
    // escaped single quotes in the parameter into double quotes before 
    // converting from json. For easy string entering :P 
    ////$log.debug("recoving parameter jsonf fron " + angular.toJson(et));

    var recoverDoubleQuotes = match[2].replace(/((?!\\)(.)'|^')/g,'$2"');
    //$log.debug("recovered double quotes to" + angular.toJson(recoverDoubleQuotes));
    var params = angular.fromJson("[" + recoverDoubleQuotes + "]"); 

    switch(type){ 
      case 'range': 
        var min = params[0]; 
        var max = params[1]; 
        var def = (min + max) / 2; 
        if(params.length >= 3) def = params[2]; 
        return { 
          cmpType : 'rng', 
          min : min, 
          max : max, 
          def : def, 
          isSet : false
        };
      case 'textbox': 
        var desc = "Enter whatever you want here."; 
        if(params.length >= 1) desc = params[0]; 
        return { 
          cmpType : 'txtbx',
          desc : desc,
          isSet : false
        };
      case 'time': 
        return { 
          cmpType : 'time',
          isSet : false
        }; 
      default: 
        $log.error("Unknown special hole type \'" + type + "\'.");
        return undefined;
    }
  }; 

  //  Convert a component at an LID to the option version 
  //
  //  convRuleCmpToOptCmp :: (RuleComponent,LID) -> OptionComponent
  var convRuleCmpToOptCmp = function (cmp,lid){ 
    if (cmp.cmpType !== 'hol') return cmp; 
    
    var type = cmp.type[lid];
    
    //$log.debug("checking specialness of \'" + type + "\'");
    if(isElemTypeSpecial(type)){
      //$log.debug("found special type \'" + type + "\'");
      var hole = getHoleFromSpecial(type); 
      //$log.debug("returned hole of \'" + angular.toJson(hole) + "\'");
      return hole;
    } else {
      var nCmp = _.clone(cmp); 
      nCmp.type = new Map(); 
      nCmp.type[lid] = type;
      return nCmp;
    }
  }

  //  Convert an instance at an LID into the option version.
  //
  //  convRuleInstToOptInst :: ([RuleComponent],LID) -> [OptionComponent]
  var convRuleInstToOptInst = function (rInst,lid) {
    //$log.debug("Convering rinst to optinst of " + angular.toJson(rInst) + " " + lid);
    return _.map(rInst,function(cmp){ return convRuleCmpToOptCmp(cmp,lid);});  
  }

  //  Checks whether a particular LID of a rule has special components
  //
  //  isLidSpecial :: (Rule,LID) -> Bool 
  var isLidSpecial = function(rule,lid){
    return _.some(rule.inst, function(cmp){ 
      if(cmp.cmpType === 'hol'){ 
        return isElemTypeSpecial(cmp.type[lid]); 
      } else {
        return false; 
      }
    });
  }

  //  Strips a an LID from a cmd and returns two rules with the stripped 
  //  component and the remainder. 
  //
  //  stripLid :: (Cmd,LID) -> Hash { stripped : Cmd , remainder : Cmd )
  var stripLid = function(cmd,lid){

    //$log.debug("Asked to strip lid " + lid + " from command " + angular.toJson(cmd));
    var stripped = _.clone(cmd); 
    var remainder = _.clone(cmd); 

    stripped.$$LIDs = [lid];
    stripped.inst = convRuleInstToOptInst(cmd.inst,lid)
    
    //$log.debug("Stripped Inst " + angular.toJson(stripped.inst));
    
    remainder.$$LIDs = _.without(cmd.$$LIDs,lid);
    remainder.inst = _.map(cmd.inst, function(cmp){
      if(cmp.cmpType === 'hol'){
        var newType = new Map(); 
        _.each(remainder.$$LIDs, function(i){
          newType[i] = cmp.type[i];
        });
        return {
          cmpType : 'hol', 
          type : newType 
        };
      } else {
        return _.clone(cmp); 
      }
    });



    return { 
      stripped : stripped,
      remainder : remainder
    };
  };

  //  Checks recursively whether a particular command contains any special 
  //  components. 
  //
  //  isCmdSpecial :: Cmd -> Bool 
  var isCmdSpecial = function (cmd) { 
    return _.some(cmd.inst,isCmpSpecial); 
  };

  //  Checks whether a component contains any special components 
  //
  //  isCmpSpecial :: CmdComponent -> Bool 
  var isCmpSpecial = function (cmp) {
    switch(cmp.cmpType){
      case 'rng':
      case 'time': 
      case 'txtbx':
        return true; 
      case 'inst':
        return isCmdSpecial(cmp.inst); 
      default:
        return false;
    };
  };

  //  Expend a particular index in an option 
  //
  //  expandAtIndex :: (Option,CmdIndex) -> [Option]
  var expandAtIndex = function(opt,ind) {
    var cmp = grammar.getReplacementCompFromCmd(opt,ind);
    var expOpts = grammar.getOptsForComp(cmp); 
    return util.concatMap(expOpts, function(rep){ 
      var newOpt = _.clone(opt); 
      return grammar.insertCommand(newOpt,ind,rep);
    });
  };

  //  Is a command Vacuous? 
  //
  //  isVacuous :: Cmd -> Bool
  var isVacuous = function(cmd){ 
    return _.every(cmd.sig, function(s){ 
      return (s.match(/\w/) == null);
    }); 
  };

  //  Is the command empty? 
  //
  //  isEmpty :: Cmd -> Bool 
  var isEmpty = function(cmd){ 
    // TODO : add checking for invalid command
    // if(!cmd){ 
    //   $log.error("invalid command"); 
    // }
    if((cmd.sig.length == 1) && (cmd.sig[0] == "")) return true; 
    var emptySig = _.every(cmd.sig, function stringEmpty(s){return s === "";});
    
    if(!emptySig) return false; 
    return _.every(cmd.inst, function isCmpEmpty(cmp){ 
      switch(cmp.cmpType){ 
        case 'lit':
          return cmp.literal == ""; 
        case 'inst': 
          return isEmpty(cmp.inst);
        default:
          return false; 
      }
    });
  };

  //  Is the command a singleton? i.e does it only contain "<RHS>"
  //
  //  isSingleton :: Cmd -> Bool
  var isSingleton = function(cmd){ 
    // TODO : add checking for invalid command
    if(cmd.sig.length != 2) return false; 
    var emptySig = _.every(cmd.sig, function(s){return s == "";});
    if(!emptySig) return false; 
    if(cmd.inst[1].cmpType == 'hol') return true; 
    if(cmd.inst[1].cmpType == 'inst') return isSingleton(cmd.inst[1].inst); 
    return false;
  };
 
  //  get The Index of the first hole in the statement
  //
  //  getFirstHoleInd :: Cmd -> Maybe CmdIndex
  var getFirstHoleInd = function(cmd){ 
    // TODO : add checking for invalid command
    var fIx = _.findIndex(cmd.inst, function(cmp){ 
      switch(cmp.cmpType){
        case 'hol':
          return true;
        case 'inst': 
          return (getFirstHoleInd(cmp.inst) !== undefined);
        default: 
          return false; 
      }
    });
    
    if(fIx == -1) return undefined; 

    if(cmd.inst[fIx].cmpType == 'inst'){
      return [fIx] + getFirstHoleInd(cmd.inst[fIx].inst); 
    } else { 
      return [fIx];  
    } 
  }; 

  //  count the number of non-empty components of the option list
  //
  //  countNonEmptyOpts :: [Option] -> Int
  var countNonEmptyOpts = function(opts){ 
    var c = 0; 
    _.each(opts, function(opt){ 
      if(!isEmpty(opt)) c++; 
    });
    return c; 
  }; 


  //  Is the Command Complete? I.e. is there nothing left to expand if left as
  //  is? 
  //
  //  isComplete :: Cmd -> Bool
  var isComplete = function(cmd){ 
    return _.every(cmd.inst, function(cmp){ 
      switch(cmp.cmpType){ 
        case 'hol':
          return false; 
        case 'inst': 
          return isComplete(cmp.inst); 
        default: 
          return true; 
      };
    });
  };

  //  Is the Command filled in? I.e. have all the special blocks have been 
  //  filled in? with actual values? 
  //
  //  isFull :: Cmd -> Bool
  var isFull = function(cmd){ 
    return _.every(cmd.inst, function(cmp){ 
      switch(cmp.cmpType){ 
        case 'hol':
        case 'lit':
          return true; 
        case 'inst': 
          return isFull(cmp.inst); 
        case 'rng': 
        case 'txtbx':
        case 'time': 
          return cmp.isSet && cmp.val;
        default: 
          $log.error("Command component has invalid cmpType."); 
          return false; 
      };
    });
  };

  //  printCmd :: Cmd -> String
  var printCmd = function(cmd){ 
    var out = ""; 
    _.each(cmd.inst, function(cmpt){ 
      out = out + printCmpt(cmpt);
    });
    return out;
  };

  //  printCmpt :: CmdComponent -> String
  var printCmpt = function(cmpt){ 
    switch (cmpt.cmpType){ 
      case 'lit':
        return cmpt.literal; 
      case 'inst': 
        return printCmd(cmpt.inst);
      case 'hol': 
         return "< Hole of " + angular.toJson(_.values(cmpt.type)) + ">";
      case 'rng':
         if(cmpt.isSet){ 
           return "" + cmpt.val; 
         } else { 
           return "<range>";  
         }
      case 'txtbx': 
         if(cmpt.isSet){ 
           return "" + cmpt.val; 
         } else { 
           return "<txtbx>";  
         }
      case 'time': 
         if(cmpt.isSet){ 
           return "" + cmpt.val.toTimeString(); 
         } else { 
           return "<time>";  
         }
    }
  };

  // ### Object Construction and Public Functions ###

  var grammar = {
    
    // ### Public Data ### 
    
    // TODO : remove this section entirely, it exists only for debug purposes
                          
    raw: rawGrammar, // :: RawGrammar
    norm: normGrammar, // :: Normed Grammar

    // ### Functions ###

    // getRootHole :: () -> Cmd
    //  generate the root hole object that the rest of the command descends
    //  from. 
    getRootHole: function(){ 

      var type = new Map(); 

      type[0] = "application"; 

      return { 
        type : "application",
        sig : ["",""], // shouldn't matter for anything past the insertion and
                   
        inst : [{ cmpType: 'lit', literal: ""},
                { cmpType: 'hol', type: type}, 
                { cmpType: 'lit', literal: ""}], 
        $$nextLID : 1, 
        $$LIDs : [0]
      };
    },

    // This will get a component from within a command.
    //
    // getCompFromCmd :: (Cmd,Index) -> Maybe CmdComponent
    getCompFromCmd: function (cmd,ind) {
      if(ind.length == 0){ // We're indexed into a command, but don't have an 
                           // index into the instance so we fail. 
        $log.error("Trying to get comp for invalid index.");
        return undefined; 
      } else { 

        var currentIndex = _.first(ind); 
        var remainingIndices = _.rest(ind);
        var component = cmd.inst[currentIndex]; 

        if (remainingIndices.length == 0){ 
          return component;
        } else if(component.cmpType == 'inst'){
          // We have more indeices, but the component type we indexed into is 
          // an instance so we can recurse further. 
          return grammar.getCompFromCmd(component.inst,remainingIndices);
        } else {
          $log.error("Invalid State, should only ever pop 1 from index per call.");
          return undefined;
        } 
      }
    },
      
    // This will get the component that should be used to replace whatever 
    // element is at the particular index of the command. 
    //
    // getReplacementCompFromCmd :: (Cmd,Index) -> Maybe CmdComponent
    getReplacementCompFromCmd: function (cmd,ind) {

      //$log.debug("Getting component at index " + angular.toJson(ind) ); 
      //$log.debug("  From Command " + angular.toJson(cmd) ); 
      // If we're creating a hole initialize it. 
      var holType = new Map(); 
      
      if(ind.length == 0){ // and index of [] is the current element. 
        // We're replacing this root, so just create a hole with the right type. 
        holType[0] = cmd.type;

      } else { 
        var component = grammar.getCompFromCmd(cmd,ind); 


        if(component.cmpType == 'inst'){
          // If we're at an instance, we want the type for the command in it. 
          holType[0] = component.inst.type; 
        } else { 
          // otherwise we can just return that component. 
          return component;
        }
      }
      
      // We didn't find a differnt type of component so just return a new hole.  
      return { cmpType : 'hol', type : holType }; 
    },


    // This will convert the rule into a set of options, checking for special 
    // holes and spliting them into separate options. 
    // This should just wrap things in an array if the input component is
    // already an option. (TODO: doublecheck whether this is true)
    //
    // getOptionsFromRule :: Rule -> [Option]
    getOptionsFromRule : function(rule){
      var options = [];
      //$log.debug(" Got rule of " + angular.toJson(rule) + ".");
      var remainderRule = rule; 
      if(!rule){ 
        $log.error("InvalidState");
      }
      var specialLIDs = _.filter(rule.$$LIDs,function(lid){
        return isLidSpecial(rule,lid); 
      });
     // if((rule.type == "television") && (specialLIDs.length == 3)){
     //   $log.debug(" Got specialLIDs of " + angular.toJson(specialLIDs) + ".");
     // }

    //if(rule.type == "action"){
    //          $log.error("found rule \n\n" + JSON.stringify(rule,undefined,"  ") + "\n\n");
    //}


      _.each(specialLIDs,function (lid){ 
        //if((rule.type == "television") && (specialLIDs.length == 3)){
          //$log.debug(" Stripping from " + lid + ".");
        //}
        var strippedPair = stripLid(remainderRule,lid); 
        
        options.push(_.clone(strippedPair.stripped)); 
        remainderRule = _.clone(strippedPair.remainder); 
      });

      // if((rule.type == "television") && (specialLIDs.length == 3)){
      //   $log.debug(" Got rule of \n\n" + JSON.stringify(rule,undefined,"  ") + "\n\n");
      //   $log.debug(" Got options of \n\n" + JSON.stringify(options,undefined,"  ") + "\n\n");
      //   $log.debug(" Got remainderRule of of \n\n" + 
      //              JSON.stringify(options,undefined,"  ") + "\n\n");
      // }
      //$log.debug(" Got remainder Rule of " + angular.toJson(remainderRule) + ".");
      //$log.debug(" Got remainder Rule lids of " + angular.toJson(remainderRule.$$LIDs) + ".");
      if(remainderRule.$$LIDs.length != 0) options.push(remainderRule); 
      //$log.debug(" Got options of " + angular.toJson(options) + ".");
      //if(rule.type == "action"){
      //        $log.error("options: \n\n" + 
      //              JSON.stringify(_.map(options,printCmd),undefined,"  ") + 
      //              "\n\n");
      //}


      return options; 
    },

    // This expands an option if it's too simple to present to the user, if 
    // the aggresive flag is set it will go a little deeper before stopping. 
    //
    // expandOption :: (Option,Bool) -> [Option]
    expandOption : function(inputOpt,aggressive){
      
      return grammar.getOptionsFromRule(inputOpt);
      
      //
      
      //var inst = inputOpt.inst;

      //var insts = util.concatMap(inst, function(cmp,ind,inst){ 
      //  switch(cmp.cmpType){
      //    case 'hol':
      //      if( _.any(_.values(cmp.type), function(s){ return /additional/.text(s);})){



      //      }
      //    default:
      //      return [];
      //  };
      //});

      //

      // if(isComplete(inputOpt)) return grammar.getOptionsFromRule(inputOpt);
      // var opts = [inputOpt];
      // if(!aggressive){
      //   aggressive = false;
      // } else {
      //   aggressive = true; 
      // }

      // //$log.debug("aggressivlely ? " + aggressive + ".");
      // opts = util.concatMap(opts, function(opt){ 
      //    var expInd = getFirstHoleInd(opt);

      //    if(expInd == undefined){
      //      return grammar.getOptionsFromRule(opt); 
      //    } if(isSingleton(opt) && ( /additional/.test(opt.type))
      //        /*|| aggressive || isVacuous(opt)*/){ 
      //      var expanded = expandAtIndex(opt,expInd); 
      //      return util.concatMap(expanded, grammar.getOptionsFromRule); 
      //    } else {
      //      return grammar.getOptionsFromRule(opt);
      //    }
      // });

      // return util.concatMap(opts,grammar.getOptionsFromRule);
    }, 

    // Returns the set of options to display when a particular component is 
    // selected by the user to insert into. 
    //
    // getOptsForComp :: CmdComponent -> [Options]
    getOptsForComp: function(cmp){ 
      switch(cmp.cmpType){
        case 'lit': 
          $log.error("Should never be asking for options for a literals."); 
          return undefined; 
        case 'inst': 
          $log.error("Should never be asking for options for an instance."); 
          return undefined; 
        case 'hol': 
          var rules = util.concatMap(cmp.type, function(elemType,lid){ 

            return normGrammar[elemType];
          });

          var opts = util.concatMap(rules, grammar.getOptionsFromRule); 
          var expOpts = util.concatMap(opts, function(opt){
            return grammar.expandOption(opt,false)
          }); 
          var expTries = 0; 

          // while((countNonEmptyOpts(expOpts) < 1) && (expTries < 1)){ 
          //   expOpts = util.concatMap(expOpts, function(opt){ 
          //     return grammar.expandOption(opt,true);
          //   });
          //   expTries++;
          //   $log.debug(expTries);
          // }

          return expOpts; 
        case 'rng':
          return [{ type : 'range', 
                    sig : ["",""],
                    inst : [{cmpType : 'lit', literal : ""},
                            cmp, 
                            {cmpType : 'lit', literal : ""}],
                    $$nextLID : 0, 
                    $$LIDs : []
                 }];
        case 'txtbx':
          return [{ type : 'textbox', 
                    sig : ["",""],
                    inst : [{cmpType : 'lit', literal : ""},
                            cmp, 
                            {cmpType : 'lit', literal : ""}],
                    $$nextLID : 0, 
                    $$LIDs : []
                 }];
        case 'time':
          return [{ type : 'time', 
                    sig : ["",""],
                    inst : [{cmpType : 'lit', literal : ""},
                            cmp, 
                            {cmpType : 'lit', literal : ""}],
                    $$nextLID : 0, 
                    $$LIDs : []
                 }];
        default: 
          return undefined; 
      } 
    },
  
    // Insert a command into another command at a fixed location. 
    //
    // insertCommand :: (Command,CmdIndex.Command) -> Command
    insertCommand : function (base,index,elem) { 
      if(index.length == 0) return elem; 

      var currentIndex = _.first(index); 
      var remainingIndices = _.rest(index);
      var cmp = base.inst[currentIndex]; 

      if(remainingIndices.length === 0){
        switch(cmp.cmpType){ 
          case 'hol': 

            // TODO : add checks to make sure we're inserting the correct type here.
            // We have a valid replacement, so lets modify this rule to only allow
            // the correct types in the remaining components.
            
            var insType = elem.type; 
            var validLIDs = _.keys(cmp.type); 
            validLIDs = _.filter(validLIDs, function(lid){
              return (cmp.type[lid] === insType); 
            });
            // filter out invalid LIDs from all components in the instance
            var newInst = _.map(base.inst, function(cmp){
              if(cmp.cmpType === 'hol'){

                var nType = new Map(); 
                _.each(cmp.type, function(v,k){
                  if(_.contains(validLIDs,k)){
                    nType[k] = v;
                  }
                });
                return { cmpType : 'hol', type : nType};
              } else {
                return cmp;
              }
            });

            // replace the component in the indexed location with a new one 
            // containing the chosen option.
            newInst[currentIndex] = {
              cmpType : 'inst', 
              inst: elem
            }

            // reassemble the rule and return it 
            return { 
              type : base.type, 
              sig : base.sig, 
              inst: newInst, 
              $$nextLID : base.$$nextLID,
              $$LIDs : validLIDs
            };
          case 'inst': 

            // Just replace the element in the inst with the new one. 

            var newInst = _.clone(base.inst);
            newInst[currentIndex] = {cmpType : 'inst', inst: elem};
            // reassemble the rule and return it 
            return { 
              type : base.type, 
              sig : base.sig, 
              inst: newInst, 
              $$nextLID : base.$$nextLID,
              $$LIDs : base.$$LIDs
            };

          default: 
            $log.error("Trying to insert command into invalid location."); 
            return undefined;
        }
      } else {
         switch(cmp.cmpType){ 
          case 'hol': 
          case 'inst': 

            // Just replace the element in the inst with the new one. 

            var newInst = _.clone(base.inst);
            newInst[currentIndex] = {cmpType : 'inst',
              inst: grammar.insertCommand(cmp.inst,remainingIndices,elem)};

            // reassemble the rule and return it 
            return { 
              type : base.type, 
              sig : base.sig, 
              inst: newInst, 
              $$nextLID : base.$$nextLID,
              $$LIDs : base.$$LIDs
            };

          default: 
            $log.error("Trying to insert command into invalid location."); 
            return undefined;
        }
 
      }
    },

    // TODO : move functions here or move everything outside of the hash ... 
    isCmdSpecial: isCmdSpecial,
    isEmpty: isEmpty,
    isComplete: isComplete,
    isSingleton: isSingleton,
    isFull: isFull,
    printCmd: printCmd
  };

  // ### Initialization actions ###
  if($routeParams['grammar']){
    var grammarLoc = 'grammars/' + $routeParams['grammar'] + '.json';
  } else { 
    var grammarLoc = 'grammars/psm-grammar.json';
  }

  $log.log("Loading Grammar From: " + grammarLoc);
  $http.get(grammarLoc).success(function(data) {
    rawGrammar = data;
    normalizeRaw(rawGrammar);
  });  

  return grammar;
}]);
