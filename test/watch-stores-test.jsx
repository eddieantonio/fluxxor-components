/*globals describe, it*/
/*eslint no-unused-expressions: false*/
import chai, {expect} from 'chai';

/* Must import testdom before React. */
import testdom from 'testdom';
testdom('<html><body></body></html>');

import React from 'react';
import Fluxxor from 'fluxxor';

import 'react/addons';
const {TestUtils} = React.addons;

import {watchStores, createFluxContext} from '..';

function createContext(delegateRender) {
  const flux = new Fluxxor.Flux({}, {});

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
    const Context = createContext(() => <Component />);

    /* Render the instance: */
    const tree = TestUtils.renderIntoDocument(<Context />);

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element.getDOMNode().textContent).to.equal('Hello, ladies!');
  });
});
