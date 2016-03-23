# NEAT Frontend

1. [Module Structure](#module-structure)
1. [ECMAScript / JavaScript conventions](#ecmascript-javascript-conventions)
  * [ES6](#es6)
1. [React / JSX](#react-jsx)
1. [Bootstrap](#bootstrap)
  * [Overriding Bootstrap styles](#overriding-bootstrap-styles)
1. [Styles](#styles)
1. [Styleguide](#styleguide)
1. [Adding Bower Dependencies](#adding-bower-dependencies)

## Module Structure

Frontend code is separated into distinct and mostly self-contained "modules". A
module in this sense is a directory structure that contains all the JS, CSS,
and other static files to render a significant component of the app. Modules
directories have a structure like this:

```
moduleA
|
|-components/
| |- TableWidget.js
| |- ...
|
|-pages/
| |- FrontPage.js
| |- ...
|
|-routes/
| |- Routes.js
|
|-styles/
| |- styles.styl
| |- ...
|
|-tests/
| |-components/
| | |- table-widget.spec.js
| | |- ...
| |-pages/
| | |- front-page.spec.js
| | |- ...
| |-utils/
|   |- ...
|
|-utils/
  |- ...
```

## ECMAScript / JavaScript conventions

Currently we are using ES5 with `strict mode` compliance. Each new module should
declare `strict mode` and ensure that it passes linting.

### ES6

The frontend build system includes an ES6-capable compiler so new ES6 syntax is
allowed but make sure to get feedback when merging new language features.

## React / JSX

[React.js](https://facebook.github.io/react/) is the main rendering library used.
JSX is also fully utilized. When writing React / JSX please follow these conventions:

* Always fully define `propTypes`
* Organize methods within the file in the following order:
 * custom methods
 * mixin methods
 * react methods
* Prefix custom methods with leading underscore, e.g. `_myMethod`
* Split long JSX attribute lines into multiple lines (aim for one attribute per
line), e.g.
```
<Header className='foo'
    title='hello world'
    prop1='my prop'>
    ...
```

## Bootstrap

We use [Bootstrap](http://getbootstrap.com/) for its grid system and widgets.
To interface with react we use the [React Bootstrap](https://react-bootstrap.github.io/)
library.

### Overriding Bootstrap styles

Bootstrap can be [customized](http://getbootstrap.com/customize/#less-variables)
for the look and feel of any app. We override bootstrap variables in
[bootstrap-custom.styl](http://rg-sec-saws05.ad.sec.gov/neat-development/NEATO/blob/master/neat/static/src/modules/global-styles/bootstrap-custom.styl).

## Styles

We use [Stylus](https://learnboost.github.io/stylus/) syntax to write CSS
rules.

## Styleguide

For trivial questions of visual design we aim to use the
[18F styleguide for gov sites](https://playbook.cio.gov/designstandards/getting-started/)

## Adding Bower Dependencies

Bower typically uses the Internet to download packages. However, we've isolated
just the packages we need to a shared dep repo so we can do offline
installations.

From time to time a package upgrade or a new package might be added to the
bower manifest in which case that package also needs to be added to the shared
dep repo. The easiest way to do that is run a bower install without the
offline option, i.e.

    node_modules\.bin\bower install

This will require Internet access but will cache any new packages for future
offline use. Since the shared repo is already configured as the cache location
in `.bowerrc` it will cache any packages retrieved from the Internet.
