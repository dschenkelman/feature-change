var deepEqual = require('deep-equal');
var immediate = require('immediate-invocation');

function handleCallback(results, result_name, logAction, areEqual, err, value){
  if (err) {
    results[result_name] = { err: err };
  } else {
    results[result_name] = { value:  value };
  }

  if (Object.keys(results).length === 2){
    // all results available, but done has been called by handleExpectedCallback
    if (typeof results.expected.value !== 'undefined'){
      if (!areEqual(results.expected.value, results.actual.value)){
        return logAction(results.expected, results.actual);
      }
    } else if (results.expected.err) {
      return logAction(results.expected, results.actual);
    }
  }
}

function handleExpectedCallback(results, logAction, done, areEqual){
  return function (err, value){
    // we want to make sure the result is returned ASAP
    setImmediate(function(){
      handleCallback(results, 'expected', logAction, areEqual, err, value);
    });

    return done(err, value);
  };
}

/**
 * Invokes two implemmentations of the same feature, it compares their results and invokes
 * the logAction callback when results are different
 * 
 * @param  {object}   options This parameter should contain the following properties:
 * 
 *   - expected: {Function}   it takes a 'cb' that performs the operation that
 *                            results in the expected outcome. Commonly, the current
 *                            implementation of your feature.
 *                            
 *   - actual: {Function}     It takes a cb that performs the operation that
 *                            results in the actual outcome. Commonly, the new
 *                            implementation of your feature.
 *                            
 *   - logAction: {Function}  Only invoked if there is an error in expected or the results
 *                            are different.
 *                            
 *   - areEqual: {Function}   (optional) A function that takes both results and must return
 *                            a boolean indicating if both results are equal or not.    
 * 
 * @param  {Function} done    [It will be invoked with the result of the expected operation.
 *                            This is commonly the callback you were using for the original
 *                            implementation of the feature.
 */
module.exports = function(options, done){

  if (typeof done !== 'function') {
    throw new Error('\'done\' argument must be a function.');
  }

  if (!options || typeof options !== 'object') {
    return immediate(done, new Error('\'options\' argument is invalid'));
  }

  if (typeof options.expected !== 'function') {
    return immediate(done, new Error('\'options.expected\' argument must be a function'));
  }

  if (typeof options.actual !== 'function') {
    return immediate(done, new Error('\'options.actual\' argument must be a function'));
  }

  if (typeof options.logAction !== 'function') {
    return immediate(done, new Error('\'options.logAction\' argument must be a function'));
  }  

  if (options.areEqual && typeof options.areEqual !== 'function') {
    return immediate(done, new Error('\'options.areEqual\' argument should be a function'));
  }  

  var results = {};
  var areEqual = options.areEqual || deepEqual;

  options.expected(handleExpectedCallback(results, options.logAction, done, areEqual));
  options.actual(handleCallback.bind(null, results, 'actual', options.logAction, areEqual));
};
