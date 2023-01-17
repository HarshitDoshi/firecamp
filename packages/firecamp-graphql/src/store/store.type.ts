import { GetState, SetState } from 'zustand';
import { IGraphQL, TId } from '@firecamp/types';
import { _object } from '@firecamp/utils';
import {
  IRequestSlice,
  IPlaygrounds,
  IPlaygroundsSlice,
  ICollection,
  ICollectionSlice,
  IRuntime,
  IRuntimeSlice,
  IPullSlice,
  IUi,
  IUiSlice,
  IRequestChangeStateSlice,
} from './slices';

interface IStore
  extends IRequestSlice,
    IPlaygroundsSlice,
    IRuntimeSlice,
    ICollectionSlice,
    IPullSlice,
    IUiSlice,
    IRequestChangeStateSlice {
  originalRequest?: IGraphQL;
  initialise: (_request: Partial<IGraphQL>, tabId: TId) => void;
  context?: any;
  setContext: (ctx: any) => void;
}
interface IStoreState {
  request: IGraphQL;
  playgrounds: IPlaygrounds;
  runtime?: IRuntime;
  ui?: IUi;
  collection?: ICollection;
}
type TStoreSlice<T> = (
  set: SetState<IStore>,
  get: GetState<IStore>,
  ...k: any
) => T;
export { IStoreState, IStore, TStoreSlice };
