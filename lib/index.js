var deepEqual = require('deep-equal');

function handleCallback(results, result_name, logAction, err, value){
  if (err) {
    results[result_name] = { err: err };
  } else {
    results[result_name] = { value:  value };
  }

  if (Object.keys(results).length === 2){
    // all results available, but done has been called by handleExpectedCallback
    if (typeof results.expected.value !== 'undefined'){
      if (!deepEqual(results.expected.value, results.actual.value)){
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
    setImmediate(function(){
      handleCallback(results, 'expected', logAction, err, value);
    });

    return done(err, value);
  };
}

module.exports = function(expected, actual, logAction, done){
  var results = {};
  expected(handleExpectedCallback(results, logAction, done));
  actual(handleCallback.bind(null, results, 'actual', logAction));
};