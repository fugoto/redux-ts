import { createStore, Action, Reducer, Store } from '../src/index';

interface IncrementAction extends Action {
  type: 'increment' | 'decrement' | 'doesnt exist',
}

describe('Redux TS', () => {
  describe('createStore', () => {
    describe('getState', () => {
      it('can be called and return an object with getState', () => {
        const dummyReducer: Reducer<any> = (state: any, action: Action) => {
          return {};
        };

        const store = createStore(dummyReducer);

        const state = store.getState();

        expect(state !== undefined).toBeTruthy();
      });

      it('getState returns the correct state', () => {
        const initialState = {
          message: '',
        };

        const dummyReducer: Reducer<typeof initialState> = (state = initialState, action: Action) => {
          switch (action.type) {
            case 'blah':
              return {
                message: 'hello',
              };
            default:
              return state;
          }
        };

        const store = createStore(dummyReducer);

        const state = store.getState();

        expect(state).toEqual(initialState);
      });
    });

    describe('dispatch', () => {
      const initialState = { count: 0 };
      const dispatchReducer: Reducer<typeof initialState> = (state = initialState, action) => {
        switch (action.type) {
          case 'increment':
            return {
              count: state.count + 1,
            };
          case 'decrement':
            return {
              count: state.count - 1,
            };
          default:
            return state;
        }
      }
      let store: Store<typeof initialState, IncrementAction>;

      beforeEach(() => {
        store = createStore<typeof initialState, IncrementAction>(dispatchReducer);
      });

      it('Changes state based on dispatched actions', () => {
        let state = store.getState();

        expect(state.count).toEqual(0);

        store.dispatch({
          type: 'increment',
        });

        state = store.getState();

        expect(state.count).toEqual(1);
      });

      it('Actions that arent registered, dont cause a new state to be created', () => {
        const firstState = store.getState();

        store.dispatch({
          type: 'doesnt exist',
        });

        const secondState = store.getState();

        expect(firstState).toBe(secondState);
      });
    });

    describe('subscribe/unsubscribe', () => {
      const initialState = { count: 0 };
      const dispatchReducer: Reducer<typeof initialState> = (state = initialState, action) => {
        switch (action.type) {
          case 'increment':
            return {
              count: state.count + 1,
            };
          case 'decrement':
            return {
              count: state.count - 1,
            };
          default:
            return state;
        }
      }
      let store: Store<typeof initialState, IncrementAction>;

      beforeEach(() => {
        store = createStore(dispatchReducer);
      });

      it('Can have subscribers registered who are called in order of invocation for changes in state', () => {
        let subscriberOneCount = 0;
        let subscriberTwoCount = 0;

        const subscriberOne = () => {
          ++subscriberOneCount;

          expect(subscriberTwoCount).toEqual(0);
        }

        const subscriberTwo = () => {
          ++subscriberTwoCount;

          expect(subscriberOneCount).toEqual(1);
        }

        store.subscribe(subscriberOne);
        store.subscribe(subscriberTwo);

        store.dispatch({
          type: 'increment',
        });

        expect(subscriberOneCount).toEqual(1);
        expect(subscriberTwoCount).toEqual(1);
      });

      it('Only calls subscribers on an actual state change', () => {
        const sub = () => {
          throw new Error('This should not have been called!');
        }

        store.subscribe(sub);

        store.dispatch({
          type: 'doesnt exist',
        });
      });
    });
  });
});
