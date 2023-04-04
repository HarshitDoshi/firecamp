import _cleanDeep from 'clean-deep';
import _cloneDeep from 'lodash/cloneDeep';
import { nanoid as id } from 'nanoid';
import {
  TId,
  ERequestTypes,
  ISocketIOConnection,
  ISocketIO,
  ESocketIOClientVersion,
  TRequestPath,
} from '@firecamp/types';
import _url from '@firecamp/url';
import { _object, _array, _string } from '@firecamp/utils';
import {
  RequestConnection,
  DefaultRequestConfig,
  InitPlayground,
} from '../constants';
import { ISocket } from '../store';
import { EConnectionState } from '../types';

// import { IUiRequestPanel } from '../store/slices';

const getPathFromUrl = (url: string) => {
  return url.split(/[?#]/)[0];
};

/** normalize the socket.io request */
export const normalizeRequest = (request: Partial<ISocketIO>): ISocketIO => {
  const _nr: ISocketIO = {
    //socket.io url will only have { raw: ""} but in ui we need actual url object IUrl
    //@ts-ignore
    url: { raw: '', queryParams: [], pathParams: [] },
    config: {
      rejectUnauthorized: false,
      timeout: 20000,
      reconnection: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      version: ESocketIOClientVersion.v4,
      onConnectListeners: [],
    },
    connections: [],
    listeners: [],
    __meta: {
      name: '',
      type: ERequestTypes.SocketIO,
      version: '2.0.0',
    },
    __ref: { id: '', collectionId: '' },
  };

  const {
    url,
    connections = _nr.connections,
    listeners,
    config = _nr.config,
    __meta = _nr.__meta,
    __ref = _nr.__ref,
  } = request;

  //normalize url
  //normalize url
  if (url?.raw) {
    _nr.url.raw = getPathFromUrl(url.raw);
  }

  // normalize __meta
  _nr.__meta.name = __meta.name || 'Untitled Request';
  _nr.__meta.description = __meta.description || '';
  _nr.__meta.fOrders = __meta.fOrders || [];
  _nr.__meta.iOrders = __meta.iOrders || [];
  _nr.__meta.type = ERequestTypes.SocketIO;
  _nr.__meta.version = '2.0.0';

  // normalize __ref
  _nr.__ref.id = __ref.id || id();
  _nr.__ref.collectionId = __ref.collectionId;
  _nr.__ref.folderId = __ref.folderId;
  _nr.__ref.createdAt = __ref.createdAt || new Date().valueOf();
  _nr.__ref.updatedAt = __ref.updatedAt || new Date().valueOf();
  _nr.__ref.createdBy = __ref.createdBy || '';
  _nr.__ref.updatedBy = __ref.updatedBy || '';

  // normalize connections
  _nr.connections = [];
  _nr.connections = connections.map(
    (connection: ISocketIOConnection) =>
      _object.mergeDeep(RequestConnection, connection) as ISocketIOConnection
  );
  if (!_nr.connections?.length) _nr.connections = [RequestConnection];

  // normalize listeners
  if (Array.isArray(listeners)) _nr.listeners = listeners;

  // normalize config
  _nr.config = _object.mergeDeep(DefaultRequestConfig, config);
  return _nr;
};

export const initialiseStoreFromRequest = (
  _request: Partial<ISocketIO>,
  __meta?: {
    tabId?: TId;
    requestPath?: TRequestPath;
  }
): ISocket => {
  const request: ISocketIO = normalizeRequest(_request);
  const defaultConnection =
    request.connections?.find((c) => c.isDefault === true) || RequestConnection;
  const playgroundId = defaultConnection.id;

  const url = _url.updateByQuery(request.url, defaultConnection.queryParams);
  const displayUrl = url.raw;

  return {
    request,
    runtime: {
      displayUrl,
      activePlayground: defaultConnection.id,
      playgroundTabs: [
        {
          id: defaultConnection.id,
          name: defaultConnection.name,
          __meta: {
            isSaved: false,
            hasChange: false,
          },
        },
      ],
      isRequestRunning: false,
      isRequestSaved: !!request.__ref.collectionId,
      tabId: __meta?.tabId,
      requestPath: __meta?.requestPath,
    },
    playgrounds: {
      // add logic for init playgrounds by connections
      [defaultConnection.id]: {
        id: defaultConnection.id,
        connectionState: EConnectionState.Ideal,
        logFilters: {
          type: '',
          event: '',
        },
        emitter: InitPlayground,
        selectedCollectionEmitter: '',
        activeListeners: [],
        activeArgIndex: 0,
      },
    },
    logs: {
      [playgroundId]: [],
    },
    ui: {
      isFetchingRequest: false,
    },
  };
};
