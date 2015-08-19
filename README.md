# Fluxxor Components

[Higher-order components][hoc] for use with [Fluxxor][]. These are meant
to replace [FluxMixin][] and [StoreWatchMixin][].

[Fluxxor]: https://github.com/BinaryMuse/fluxxor
[hoc]: https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750
[FluxMixin]: http://fluxxor.com/documentation/flux-mixin.html
[StoreWatchMixin]: http://fluxxor.com/documentation/store-watch-mixin.html

# API

## `createContext(flux: Flux): Component`

Returns a new component whose elements pass the given Flux instance down
as a [context][]. Every child element of this new component will have
the Flux available as the context prop named `flux`.

Intended to replace [FluxMixin][].

[context]: https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html

### Example

```javascript
/* Create the flux instance. */
const flux = new Fluxxor.Flux(...);
/* Create the new component with a flux instance as context. */
const FluxContext = createFluxContext(flux);

class App extends React.Component {
  /* Declare that we accept the Flux instance from the context. */
  static get contextTypes() {
    return {
      flux: React.PropTypes.object
    };
  }

  render() {
    /* Use the flux instance. */
    const {flux} = this.context;
    const actionNames = Object.keys(flux.actions);
    return <ul>{actionNames.map(name =>
      <li key={name}>{name}</li>
    )}</ul>;
  }
}

/* Render the instance: */
React.render(
  document.getElementById('react'),
  <FluxContext>
    <App />
  </FluxContext>
);
```

## `watchStores(Component, ...StoreNames: String, onChange: (Flux) => Object): Component`

Watches the given stores, and passes the updates state as props to the
given component. Use the returned component as if it was the given
component; except it watches Fluxxor stores.

That is, it returns a component that wraps the given React component and
calls `onChange` when any of the given stores are changed. The return of
`onChange` is used to update the state; all of this state is
subsequently passed to the wrapped component as props, along with its
original props. Assumes `flux` exists in the context (i.e., in the
manner that `createFluxContext()` would provide it) or the Flux instance
passed as a prop named `flux`.

Intended to replace [StoreWatchMixin][].

```javascript
/* We're bringin' it back! */
class Blink extends React.Component {
  render() {
    const {children, speed} = this.props;
    const styles = {
      animation: `blink ${speed} steps(2, start) infinite`
    };
    return <div style={styles}>{children}</div>;
  }
}

/* Get the data from the Twitter store. */
const BlinkFromTwitter = watchStores(Blink, 'twitter', (flux) => ({
  children: flux.store('twitter').getLatestTweet()
}));

/* Render the instance: */
React.render(
  document.getElementById('react'),
  <FluxContext>
    <BlinkFromTwitter speed="250ms" />
  </FluxContext>
);
```

