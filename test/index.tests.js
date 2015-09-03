var expect  = require('chai').expect;
var feature_change  = require('../');

describe('feature change', function(){
  it('should call done when expected completes successfully', function(done){
    var expected = function(cb){
      setImmediate(function(){
        cb(null, { success: true });
      });
    };

    var actual = function(cb){
      setImmediate(function(){
        cb(new Error('Failed'));
      });
    };
    feature_change(expected, actual, function(){}, function(err, result){
      expect(err).to.not.exist;
      expect(result.success).to.equal(true);
      done();
    });
  });

  it('should call done when expected completes with error', function(done){
    var expected = function(cb){
      setImmediate(function(){
        cb(new Error('Failed'));
      });
    };

    var actual = function(cb){
      setImmediate(function(){
        cb(null, { success: true });
      });
    };

    feature_change(expected, actual, function(){}, function(err, result){
      expect(err.message).to.equal('Failed');
      expect(result).to.not.exist;
      done();
    });
  });

  it('should invoke callback as soon as expected completes', function(done){
    var actual_done = false;
    var expected = function(cb){
      setImmediate(function(){
        cb(null, { success: true });
      });
    };

    var actual = function(cb){
      setTimeout(function(){
        actual_done = true;
        cb(null, { success: true });
      }, 100);
    };

    feature_change(expected, actual, function(){}, function(err, result){
      expect(actual_done).to.be.false;
      done();
    });
  });

  it('should not invoke log action if expected and actual result are equal', function(done){
    var expected = function(cb){
      setImmediate(function(){
        cb(null, { success: true });
      });
    };

    var actual = function(cb){
      setTimeout(function(){
        cb(null, { success: true });
      });
    };

    feature_change(expected, actual, function(){
      done(new Error('Log action was invoked'));
    }, function(err, result){
      expect(err).to.not.exist;
      expect(result.success).to.be.true;
      setTimeout(function(){
        done();
      }, 100);
    });
  });

  it('should invoke log action if results are different', function(done){
    var expected = function(cb){
      setImmediate(function(){
        cb(null, { success: true });
      });
    };

    var actual = function(cb){
      setTimeout(function(){
        cb(null, { success: false });
      });
    };

    feature_change(expected, actual, function(expected_result, actual_result){
      expect(expected_result.value.success).to.be.true;
      expect(expected_result.err).to.not.exist;
      expect(actual_result.value.success).to.be.false;
      expect(actual_result.err).to.not.exist;
      done();
    }, function(err, result){
      expect(err).to.not.exist;
      expect(result.success).to.be.true;
    });
  });

  it('should invoke log action if expected callback errors', function(done){
    var expected = function(cb){
      setImmediate(function(){
        cb(new Error('Failed'));
      });
    };

    var actual = function(cb){
      setTimeout(function(){
        cb(null, { success: false });
      });
    };

    feature_change(expected, actual, function(expected_result, actual_result){
      expect(expected_result.value).to.not.exist;
      expect(expected_result.err.message).to.equal('Failed');
      expect(actual_result.value.success).to.be.false;
      expect(actual_result.err).to.not.exist;
      done();
    }, function(err, result){
      expect(err.message).to.equal('Failed');
      expect(result).to.not.exist;
    });
  });
});