var expect  = require('chai').expect;
var feature_change  = require('../');

describe('feature change', function(){
  it('should call done when expected completes correctly', function(done){
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
});