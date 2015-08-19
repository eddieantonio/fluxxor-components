/*globals describe, it*/
/*eslint no-unused-expressions: false*/
import chai, {expect} from 'chai';

/* Must import testdom before React. */
import testdom from 'testdom';
testdom('<html><body></body></html>');

const React = require('react');
require('react/addons');
const {TestUtils} = React.addons;

import Fluxxor from 'fluxxor';

import {watchStores, createFluxContext} from '..';

/**
 * Stolen from: https://github.com/BinaryMuse/fluxxor/blob/ff410bec12a152aea1ddf2231fd0f826efbde075/test/unit/test_store_watch_mixin.js
 */
function createFlux() {
  var Store = Fluxxor.createStore({
    actions: {
      "ACTION": "handleAction"
    },

    initialize: function() {
      this.value = 0;
    },

    handleAction: function() {
      this.value++;
      this.emit("change");
    },

    getState: function() {
      return { value: this.value };
    }
  });

  var stores = {
    Store1: new Store(),
    Store2: new Store()
  };

  var actions = {
    act: function() {
      this.dispatch("ACTION", {});
    }
  };

  return new Fluxxor.Flux(stores, actions);
}

function createContext(flux, delegateRender) {
  return createFluxContext(flux, class Context extends React.Component {
    render() {
      return delegateRender();
    }
  });
}


describe('watchStores', () => {
  it('wraps an existing React component', () => {
    class DummyComponent extends React.Component {
      render() {
        return <span>Hello, ladies!</span>;
      }
    }

    const Component = watchStores(DummyComponent, () => ({}));
    expect(<Component />).to.satisfy(TestUtils.isElement);

    /* Render the component within a context. */
    const Context = createContext(createFlux(), () => <Component />);

    /* Render the instance: */
    const tree = TestUtils.renderIntoDocument(<Context />);

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element.getDOMNode().textContent).to.equal('Hello, ladies!');
  });

  it('sets the initial state from the store', () => {
    class CounterView extends React.Component {
      static get propTypes() {
        return {
          value: React.PropTypes.number.isRequired
        };
      }

      render() {
        return <span>{this.props.value}</span>;
      }
    }

    const Component = watchStores(CounterView, 'Store1', (flux) =>
      flux.store('Store1').getState()
    );

    const dummyFlux = createFlux();

    /* Render the component within a Flux context. */
    const Context = createContext(dummyFlux, () => <Component />);
    const tree = TestUtils.renderIntoDocument(<Context />);

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element.getDOMNode().textContent).to.equal('0');
  });


  it.skip('watches stores when they change', (done) => {
    class CounterView extends React.Component {
      static get propTypes() {
        return {
          value: React.PropTypes.number.isRequired
        };
      }

      render() {
        return <span>{this.props.value}</span>;
      }
    }

    const Component = watchStores(CounterView, 'Store1', (flux) =>
      flux.store('Store1').getState()
    );

    const dummyFlux = createFlux();

    /* Render the component within a Flux context. */
    const Context = createContext(dummyFlux, () => <Component />);
    const tree = TestUtils.renderIntoDocument(<Context />);

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element.getDOMNode().textContent).to.equal('0');

    /* Now, UNLEASH THE ACTION! */
    dummyFlux.actions.act();

    /* It should now be updated! */
    setTimeout(() => {
      expect(element.getDOMNode().textContent).to.equal('1');
      done();
    }, 0);
  });
});
