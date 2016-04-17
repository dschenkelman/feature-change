# feature-change

Module to run current and new versions of a feature simultaneously. It helps find differences between results without breaking user applications.

Once you are sure that there are no more differences you can just remove it.

This [blog post](https://auth0.com/blog/2015/10/27/feature-changes-at-auth0/) explains how it is used at Auth0.

## Install
```
npm i -S feature-change
```

## Usage
Let's assume you currently perform searches against mongodb and to improve upon this you want searches to be done in Elastic Search.
```js
var feature_change = require('feature-change');

var current_implementation = mongo_search;
var new_implementation = es_search;

var options = {
  expected: function(cb){
      current_implementation(current_opts, cb);
  },
  actual: function(cb){
      new_implementation(es_opts, cb);
  },
  logAction: function(mongo_result, es_result){
      // invoked when there is a difference in the results (useful for logging)
  }
};

feature_change(options, function(err, result){
    // this is the original callback you were using for mongo
    // err and result always come from mongo_search
});
```

## API
The `feature_change` function takes the following arguments:
* `options` - This parameter should contain the following properties:
  * `expected` - A function that takes a `cb` that performs the operation that results in the expected outcome. Commonly, the current implementation of your feature.
    * `cb(err, result)` - Takes `err` as the first parameter if an error occurred, otherwise `result` should be passed.
  * `actual` - A function that takes a `cb` that performs the operation that results in the actual outcome. Commonly, the new implementation of your feature.
      * `cb(err, result)` - Takes `err` as the first parameter if an error occurred, otherwise `result` should be passed.
  * `logAction` - A function that takes `expected_result` and `actual_result`. Only invoked if there is an error in `expected` or the results are different.
      * `expected_result` - An object that has an `err` property if an error occurred or a `value` if everything was successful.
      * `actual_result` - An object that has an `err` property if an error occurred or a `value` if everything was successful.
  * `areEqual` - (optional) A function that takes both results and must return a boolean indicating if both results are equal or not. By default the function from module `deep-equal` (https://www.npmjs.com/package/deep-equal) will be used.
* `done` - A function to be invoked with the result of the `expected` operation. This is commonly the callback you were using for the original implementation of the feature.

## Implementation details
The `result` or `err` from the `expected` operation is always the one that is provided in `done`. The goal of this module is not to provide one or the other, but to provide a way to find differences in results.

As soon as the `expected` callback completes `done` will be invoked, even if `actual` has not completed. That is because there is no need to delay the result of the operation.

## Contributing
Feel free to open issues with questions/bugs/features. PRs are also welcome.

## License
MIT
