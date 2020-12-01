export interface Action {
  type: string | Symbol;
}
export type Reducer<State> = (state: State, action: Action) => State;
export type Listener = () => void;
export type Unsubscribe = () => void;
export interface ReduxStore<A extends Action = Action> {
  getState: () => any;
  dispatch: (action: A) => A;
  subscribe: (listener: Listener) => Unsubscribe;
}

export class Store<State, A extends Action = Action> implements ReduxStore<A> {
  private reducer: Reducer<State>;
  private state: State;
  private REDUX_INIT = Symbol('REDUX_INIT');
  private subscriberMap = new Map<Listener, Listener>()

  public constructor(reducer: Reducer<State>) {
    this.reducer = reducer;

    let preloadedState: State | unknown | undefined = undefined;

    this.state = this.reducer(preloadedState as State, { type: this.REDUX_INIT });
  }

  public getState = (): State => {
    return this.state;
  }

  public dispatch = (action: A): A => {
    const originalState = this.state;

    this.state = this.reducer(this.state, action);

    if (this.state !== originalState) {
      this.subscriberMap.forEach(subscriber => subscriber());
    }

    return action;
  }

  public subscribe = (listener: Listener): Unsubscribe => {
    this.subscriberMap.set(listener, listener);

    const unsubscribe = () => {
      this.subscriberMap.delete(listener);
    }

    return unsubscribe;
  };
}

export const createStore = <State, A extends Action = Action>(reducer: Reducer<State>) => {
  return new Store<State, A>(reducer);
}
