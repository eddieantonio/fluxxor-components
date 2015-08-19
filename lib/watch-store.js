import React, {PropTypes} from 'react';

/**
 * Decorates the given component with the ability to listen to Fluxxor stores.
 * Uses the Flux instance called `flux` in props or context. All data returned
 * from `onChange()` is used to set the state. This state is subsequently
 * passed to the wrapped component.
 *
 * See: https://github.com/BinaryMuse/fluxxor/blob/master/lib/store_watch_mixin.js
 *
 * @param Class Component Class of the component to wrap.
 * @param String... storeNames names of the stores to listen to.
 * @param Function onChange This callback is given the flux instance and must
 * return the new state of the object. It is called whenever a store changes.
 */
export default function watchStores(Component, ...storeNames) {
  if (storeNames.length < 1) {
    throw Error('Must pass at least the onChange callback.');
  }

  const onChange = storeNames.pop();
  if (typeof onChange !== 'function') {
    throw Error('Last argument must be a callback.');
  }

  return class WatchStore extends React.Component {
    static get contextTypes() {
      return {
        flux: React.PropTypes.object
      };
    }

    componentDidMount() {
      const flux = this._getFlux();
      /* https://github.com/BinaryMuse/fluxxor/blob/8c0c79ad4eef1167cbde5bd7fd488de31f9a3a26/lib/store_watch_mixin.js#L8 */
      storeNames.forEach((store) => {
        flux.store(store).on("change", this.setStateFromFlux.bind(this));
      });
    }

    componentWillUnmount() {
      const flux = this._getFlux();
      /* https://github.com/BinaryMuse/fluxxor/blob/8c0c79ad4eef1167cbde5bd7fd488de31f9a3a26/lib/store_watch_mixin.js#L15 */
      storeNames.forEach((store) => {
        flux.store(store).removeListener("change", this.setStateFromFlux.bind(this));
      });
    }

    setStateFromFlux() {
      const flux = this._getFlux();
      this.setState(onChange(flux));
    }

    _getFlux() {
      const flux = this.context.flux || this.props.flux;
      if (!flux) {
        throw Error('Could not find `flux` in context or props of this element!');
      }
      return flux;
    }

    render() {
      return <Component {...this.props} {...this.state}>{this.props.children}</Component>;
    }
  };
}
