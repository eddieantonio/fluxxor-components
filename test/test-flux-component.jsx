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

import {createFluxContext} from '..';

describe('createFluxContext', () => {
  it('returns a React component', () => {
    const flux = new Fluxxor.Flux({}, {});
    const FluxContext = createFluxContext(flux);

    expect(<FluxContext />).to.satisfy(TestUtils.isElement);
  });

  it('passes its immediate children the flux instance (React 0.13)', () => {
    /* NB: This is practically the example from the README. */
    class Child extends React.Component {
      /* Declare that we accept the Flux instance from the context. */
      static get contextTypes() {
        return {
          flux: React.PropTypes.object.isRequired
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

    /* XXX: Since React 0.13's context API is unstable, both parent and
     * owner must be the same component. So we create this dummy class, and
     * decorate it with createFluxContext. */
    class DummyClass extends React.Component {
      render() {
        return <Child />;
      }
    }

    /* Create flux and the context. */
    const fluxInstance = new Fluxxor.Flux({}, {
      someAction() { return; },
    });
    const FluxContext = createFluxContext(fluxInstance, DummyClass);

    /* Render the component: */
    const tree = TestUtils.renderIntoDocument(
      /* This is the silly way of doing it: */
      <FluxContext />
    );

    /* We'll know it rendered properly, because it extracted the name of the
     * action. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'li');
    expect(element).to.satisfy(instance => instance.isMounted);
    expect(element.getDOMNode().textContent).to.equal('someAction');
  });

  it.skip('passes its immediate children the flux instance', () => {
    /* NB: This is practically the example from the README. */
    class Child extends React.Component {
      /* Declare that we accept the Flux instance from the context. */
      static get contextTypes() {
        return {
          flux: React.PropTypes.object.isRequired
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

    /* Create flux and the context. */
    const fluxInstance = new Fluxxor.Flux({}, {
      someAction() { return; },
    });
    const FluxContext = createFluxContext(fluxInstance, DummyClass);

    /* Render the component: */
    const tree = TestUtils.renderIntoDocument(
      <FluxContext>
        <Child />
      </FluxContext>
    );

    /* We'll know it rendered properly, because it extracted the name of the
     * action. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'li');
    expect(element).to.satisfy(instance => instance.isMounted);
    expect(element.getDOMNode().textContent).to.equal('someAction');
  });


  it('passes its non-immediate ancestors a flux instance (React 0.13)', () => {
    /* Render using props and the flux instance. */
    class GreatGrandChild extends React.Component {
      static get contextTypes() {
        return {
          flux: React.PropTypes.object.isRequired
        };
      }

      render() {
        const {flux} = this.context;
        const text = flux.actions[this.props.name]();
        return <span>{text}</span>;
      }
    }

    class GrandChild extends React.Component {
      render() {
        return <strong><GreatGrandChild name="someFakeAction" /></strong>;
      }
    }

    const fluxInstance = new Fluxxor.Flux({}, {
      someFakeAction() { return 'blarrh, this is a string'; },
    });

    /* XXX: Since React 0.13's context API is unstable, both parent and
     * owner must be the same component. So we create this dummy class, and
     * decorate it with createFluxContext. */
    const FluxContext = createFluxContext(fluxInstance, class Child extends React.Component {
      render() {
        return <GrandChild {...this.props} />
      }
    });

    /* Render the instance: */
    const tree = TestUtils.renderIntoDocument(
      <FluxContext />
    );

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element).to.satisfy(instance => instance.isMounted);
    expect(element.getDOMNode().textContent).to.equal('blarrh, this is a string');
  });

  it.skip('passes its non-immediate ancestors can the flux instance', () => {

    /* Render using props and the flux instance. */
    class GrandChild extends React.Component {
      static get contextTypes() {
        return {
          flux: React.PropTypes.object.isRequired
        };
      }

      render() {
        const {flux} = this.context;
        const text = flux.actions[this.props.name]();
        return <span>{text}</span>;
      }
    }

    class Child extends React.Component {
      render() {
        return <strong><GrandChild name="someFakeAction" /></strong>;
      }
    }

    const fluxInstance = new Fluxxor.Flux({}, {
      someFakeAction() { return 'blarrh, this is a string'; },
    });
    const FluxContext = createFluxContext(fluxInstance);

    /* Render the instance: */
    TestUtils.renderIntoDocument(
      <FluxContext>
        <Child />
      </FluxContext>
    );

    /* It rendered properly when the weird message above appears in the DOM. */
    const element = TestUtils.findRenderedDOMComponentWithTag(tree, 'span');
    expect(element).to.satisfy(instance => instance.isMounted);
    expect(element.getDOMNode().textContent).to.equal('blarrh, this is a string');
  });
});
