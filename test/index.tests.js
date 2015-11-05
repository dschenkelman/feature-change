var expect          = require('chai').expect;
var feature_change  = require('../');

var noop = function() {};

describe('feature change', function(){
  it('should call done when expected completes successfully', function(done){

    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(null, { success: true });
        });
      },
      actual: function(cb){
        setImmediate(function(){
          cb(new Error('Failed'));
        });
      },
      logAction: noop
    };

    feature_change(options, function (err, result) {
      expect(err).to.not.exist;
      expect(result.success).to.equal(true);
      done();
    });
  });

  it('should call done when expected completes with error', function(done){

    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(new Error('Failed'));
        });
      },
      actual: function(cb){
        setImmediate(function(){
          cb(null, { success: true });
        });
      },
      logAction: noop
    };

    feature_change(options, function (err, result) {
      expect(err.message).to.equal('Failed');
      expect(result).to.not.exist;
      done();
    });
  });

  it('should invoke callback as soon as expected completes', function(done){
    var actual_done = false;
    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(null, { success: true });
        });
      },
      actual: function(cb){
        setTimeout(function(){
          actual_done = true;
          cb(null, { success: true });
        }, 100);
      },
      logAction: noop
    };

    feature_change(options, function (err, result) {
      expect(actual_done).to.be.false;
      done();
    });
  });

  it('should not invoke log action if expected and actual result are equal', function(done){

    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(null, { success: true });
        });
      },
      actual: function(cb){
        setTimeout(function(){
          cb(null, { success: true });
        });
      },
      logAction: function() {
        done(new Error('Log action was invoked'));
      }
    };

    feature_change(options, function (err, result){
      expect(err).to.not.exist;
      expect(result.success).to.be.true;
      setTimeout(function(){
        done();
      }, 100);
    });
  });

  it('should invoke log action if results are different', function(done){

    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(null, { success: true });
        });
      },
      actual: function(cb){
        setTimeout(function(){
          cb(null, { success: false });
        });
      },
      logAction: function(expected_result, actual_result){
        expect(expected_result.value.success).to.be.true;
        expect(expected_result.err).to.not.exist;
        expect(actual_result.value.success).to.be.false;
        expect(actual_result.err).to.not.exist;
        done();
      }
    };
    feature_change(options, function (err, result){
      expect(err).to.not.exist;
      expect(result.success).to.be.true;
    });
  });

  it('should invoke log action if expected callback errors', function(done){
    var options = {
      expected: function(cb){
        setImmediate(function(){
          cb(new Error('Failed'));
        });
      },
      actual: function(cb){
        setTimeout(function(){
          cb(null, { success: false });
        });
      },
      logAction: function(expected_result, actual_result){
        expect(expected_result.value).to.not.exist;
        expect(expected_result.err.message).to.equal('Failed');
        expect(actual_result.value.success).to.be.false;
        expect(actual_result.err).to.not.exist;
        done();
      }
    };

    feature_change(options, function(err, result){
      expect(err.message).to.equal('Failed');
      expect(result).to.not.exist;
    });
  });

  describe('using a custom areEqual function', function () {

    it('should not invoke log action if expected and actual result are equal', function(done){
      var options = {
        expected: function(cb){
          setImmediate(function(){
            cb(null, { name: 'a' });
          });
        },
        actual: function(cb){
          setTimeout(function(){
            cb(null, { name: 'A' });
          });
        },
        logAction: function(){
          done(new Error('Log action was invoked'));
        },
        areEqual: function (expected_result, actual_result) {
          expect(expected_result.name).to.equal('a');
          expect(actual_result.name).to.equal('A');
          return true;
        }
      };

      feature_change(options, function (err, result) {
        expect(err).to.not.exist;
        expect(result.name).to.equal('a');
        setTimeout(function(){
          done();
        }, 100);
      });
    });

    it('should invoke log action if results are different', function(done){
      var options = {
        expected: function(cb){
          setImmediate(function(){
            cb(null, { success: true });
          });
        },
        actual: function(cb){
          setTimeout(function(){
            cb(null, { success: true });
          });
        },
        logAction: function (expected_result, actual_result) {
          expect(expected_result.value.success).to.be.true;
          expect(expected_result.err).to.not.exist;
          expect(actual_result.value.success).to.be.true;
          expect(actual_result.err).to.not.exist;
          done();
        },
        areEqual: function (expected_result, actual_result) {
          // validates that both results are the same instance
          expect(expected_result === actual_result).to.be.false;
          return false;
        }
      };

      feature_change(options, function (err, result) {
        expect(err).to.not.exist;
        expect(result.success).to.be.true;
      });
    });

  });
});
