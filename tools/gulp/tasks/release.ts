import {task} from 'gulp';
import gulpRunSequence = require('run-sequence');

import {cleanTask} from '../helpers';
import {DIST_ROOT} from '../constants';

task('clean', cleanTask(DIST_ROOT));

task('build:release', function(done: () => void) {
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    done
  );
});

task('default', ['build:release']);


