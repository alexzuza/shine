import {task} from 'gulp';
import gulpRunSequence = require('run-sequence');

import {cleanTask} from '../task_helpers';
import {DIST_ROOT} from '../constants';

task('clean', cleanTask(DIST_ROOT));

/** Removes redundant spec files from the release. TypeScript creates definition files for specs. */
// TODO(devversion): tsconfig files should share code and don't generate spec files for releases.
task(':build:release:clean-spec', cleanTask('dist/**/*(-|.)spec.*'));


task('build:release', function(done: () => void) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    ':build:release:clean-spec',
    done
  );
});

task('default', ['build:release']);


