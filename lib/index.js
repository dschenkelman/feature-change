var deepEqual = require('deep-equal');

function handleCallback(results, logAction, err, value){
  if (err) {
    results.actual = { err: err };
  } else {
    results.actual = { value:  value };
  }

  if (Object.keys(results).length === 2){
    // all results available, but done has been called by handleExpectedCallback
    if (typeof results.expected.value !== 'undefined'){
      if (!deepEqual(results.expected.value, results.actual.value, { strict: true })){
        return logAction(results.expected, results.actual);
      }
    } else if (results.expected.err) {
      return logAction(results.expected, results.actual);
    }
  }
}

function handleExpectedCallback(results, logAction, done){
  return function (err, value){
    // we want to make sure the result is returned ASAP
    if (err) {
      setImmediate(function(){
        handleCallback(results, logAction, err, value);
      });

      return done(err);
    } else {
      setImmediate(function(){
        handleCallback(results, logAction, err, value);
      });

      return done(null, value);
    }
  };
}

module.exports = function(expected, actual, logAction, done){
  var results = {};
  expected(handleExpectedCallback(results, logAction, done));
  actual(handleCallback.bind(null, results, logAction));
};