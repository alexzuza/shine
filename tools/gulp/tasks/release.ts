import gulpRunSequence = require('run-sequence');
import {task, src, dest} from 'gulp';
import * as path from 'path';

import { 
  DIST_ROOT,
  DIST_COMPONENTS_ROOT, 
  PLAYGROUND_DIST_ROOT,
  PROJECT_ROOT, 
  COMPONENTS_DIR, 
  HTML_MINIFIER_OPTIONS, 
  LICENSE_BANNER
} from '../constants';

import {
  cleanTask,
  tsBuildTask, 
  execNodeTask, 
  copyTask, 
  sequenceTask
} from '../helpers';


const inlineResources = require('../inline-resources');
const gulpRollup = require('gulp-better-rollup');
const gulpMinifyCss = require('gulp-clean-css');
const gulpMinifyHtml = require('gulp-htmlmin');
const gulpIf = require('gulp-if');

/** Path to the tsconfig used for ESM output. */
const tsconfigPath = path.relative(PROJECT_ROOT, path.join(COMPONENTS_DIR, 'tsconfig.json'));

/** Builds component typescript only (ESM output). */
task(':build:components:ts', tsBuildTask(COMPONENTS_DIR, 'tsconfig-esm.json'));

task('clean', cleanTask(DIST_ROOT));
task('clean:playground', cleanTask(PLAYGROUND_DIST_ROOT));

/** Copies assets (html, markdown) to build output. */
task(':build:components:assets', copyTask([
  path.join(COMPONENTS_DIR, '**/*.+(js|json|html)'),
  path.join(PROJECT_ROOT, 'README.md'),
  path.join(PROJECT_ROOT, 'LICENSE'),
], DIST_COMPONENTS_ROOT));

/** Minifies the HTML and CSS assets in the distribution folder. */
task(':build:components:assets:minify', () => {
  return src('**/*.+(html|css)', { cwd: DIST_COMPONENTS_ROOT})
    .pipe(gulpIf(/.css$/, gulpMinifyCss(), gulpMinifyHtml(HTML_MINIFIER_OPTIONS)))
    .pipe(dest(DIST_COMPONENTS_ROOT));
});

/** Inlines resources (html, css) into the JS output (for either ESM or CJS output). */
task(':inline-resources', () => inlineResources(DIST_COMPONENTS_ROOT));

/** Builds components with minified HTML and CSS inlined into the built JS. */
task(':build:components:inline:release', sequenceTask(
  [':build:components:ts', ':build:components:assets'],
  ':build:components:assets:minify',
  ':inline-resources'
));

/** Builds the UMD bundle for all of Angular Shine. */
task(':build:components:rollup', () => {
  const globals: {[name: string]: string} = {
    // Angular dependencies
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',

    // Rxjs dependencies
    'rxjs/Subject': 'Rx',
    'rxjs/add/observable/fromEvent': 'Rx.Observable',
    'rxjs/add/observable/forkJoin': 'Rx.Observable',
    'rxjs/add/observable/of': 'Rx.Observable',
    'rxjs/add/observable/merge': 'Rx.Observable',
    'rxjs/add/observable/throw': 'Rx.Observable',
    'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/filter': 'Rx.Observable.prototype',
    'rxjs/add/operator/do': 'Rx.Observable.prototype',
    'rxjs/add/operator/share': 'Rx.Observable.prototype',
    'rxjs/add/operator/finally': 'Rx.Observable.prototype',
    'rxjs/add/operator/catch': 'Rx.Observable.prototype',
    'rxjs/add/operator/first': 'Rx.Observable.prototype',
    'rxjs/add/operator/startWith': 'Rx.Observable.prototype',
    'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  };

  const rollupOptions = {
    context: 'this',
    external: Object.keys(globals)
  };

  const rollupGenerateOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: 'ng.shine',
    format: 'umd',
    globals,
    banner: LICENSE_BANNER,
    dest: 'shine.umd.js'
  };

  return src(path.join(DIST_COMPONENTS_ROOT, 'index.js'))
    .pipe(gulpRollup(rollupOptions, rollupGenerateOptions))
    .pipe(dest(path.join(DIST_COMPONENTS_ROOT, 'bundles')));
});

/** Builds components to ESM output and UMD bundle. */
task('build:components:release', sequenceTask(
  ':build:components:inline:release', 
  ':build:components:rollup'
));

/** Generates metadata.json files for all of the components. */
task('ngc', ['build:components:release'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigPath]
));


task('build:release', function(done: () => void) {
  gulpRunSequence(
    'clean',
    'clean:playground',
    'ngc',
    done);
});

task('default', ['build:release']);


