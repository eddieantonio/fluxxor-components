import React, {PropTypes} from 'react';

/* Wraps an element as an unfortunate workaround such that the parent and owner
 * context are exactly the same.
 *
 * See: https://gist.github.com/jimfb/0eb6e61f300a8c1b2ce7
 */
function createFluxContext0_13(flux, Component) {
  return class FluxContext extends React.Component {
    static get childContextTypes() {
      return {
        flux: React.PropTypes.object
      };
    }

    getChildContext() {
      return {
        flux
      };
    }

    render() {
      return <Component {...this.props}>{this.props.children}</Component>;
    }
  };
}

function createFluxContext0_14(flux) {
  return class FluxContext extends React.Component {
    static get childContextTypes() {
      return {
        flux: React.PropTypes.object
      };
    }

    getChildContext() {
      return {
        flux
      };
    }

    render() {
      return this.props.children || null;
    }
  };
}

/**
 * Returns a component whose child components will be given a context. This
 * context provides the Flux instance as `flux`.
 *
 * It's this:
 *    https://github.com/BinaryMuse/fluxxor/blob/master/lib/flux_mixin.js
 * But using composition
 *
 * @param Flux flux
 */
export default function createFluxContext(flux, Component) {
  if (Component !== undefined) {
    return createFluxContext0_13(flux, Component);
  }
  return createFluxContext0_14(flux);
}

