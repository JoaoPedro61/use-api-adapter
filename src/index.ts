/* eslint-disable no-unused-expressions */
// eslint-disable-next-line prettier/prettier
import { useCallback, useState } from 'react';

export type UseApiAdapterInvokerWithCancelation<T> = [
  () => Promise<T>,
  (reason?: any) => void
]

export type UseApiAdapterInvoker<T, S> = (
  data?: S
) => Promise<T> | UseApiAdapterInvokerWithCancelation<T>

export type UseApiAdapterOptions<T, S, E> = {
  onCanceled?: Function
  onResponse?: (responseData?: T, requestData?: S) => void
  onFailure?: (responseError?: E, requestData?: S) => void
  onRequestStart?: (requestData?: S) => void
  onRequestEnd?: () => void
}

/**
 *
 * Simple hook, which controls the states of a request to a RestFull API,
 * with support for canceling requests, using `signal` Can be used
 * with `axios`, `fetch` and/or `XMLHttpRequest`, the latter
 * being wrapped in a promise structure.
 *
 * ---
 *
 * ### Basic example of use using `axios`:
 * ```typescriptreact
 * import React, { useCallback } from 'react';
 * import { useApiAdapter } from 'use-api-adapter';
 * import axios from 'axios';
 *
 * // Declare handler to invoque a request:
 * const getHandler => axios.get("/path/to/your/data").then(r => r.data);
 *
 * const ExampleComponent = () => {
 *   const {
 *     loading,
 *     data,
 *     error,
 *     request,
 *   } = useApiAdapter(getHandler);
 *
 *   const execute = useCallback(() => {
 *     request();
 *   }, []);
 *
 *   return (
 *     <div>
 *       { loading ? 'loading...' : error ? error : data }
 *       <button onclick={execute} disabled={loading}>
 *         Execute
 *       </button>
 *     </div>
 *   )
 * };
 *
 * ```
 *
 * ---
 *
 * ### Basic example of use using `fetch`:
 * ```typescriptreact
 * import React, { useCallback } from 'react';
 * import { useApiAdapter } from 'use-api-adapter';
 *
 * // Declare handler to invoque a request:
 * const getHandler => fetch("/path/to/your/data");
 *
 * const ExampleComponent = () => {
 *   const {
 *     loading,
 *     data,
 *     error,
 *     request,
 *   } = useApiAdapter(getHandler);
 *
 *   const execute = useCallback(() => {
 *     request();
 *   }, []);
 *
 *   return (
 *     <div>
 *       { loading ? 'loading...' : error ? error : data }
 *       <button onclick={execute} disabled={loading}>
 *         Execute
 *       </button>
 *     </div>
 *   )
 * };
 *
 * ```
 *
 * ---
 *
 * ### Basic example of use using `XMLHttpRequest`:
 * ```typescriptreact
 * import React, { useCallback } from 'react';
 * import { useApiAdapter } from 'use-api-adapter';
 *
 * // Declare handler to invoque a request:
 * const getHandler => new Promise((resolver, reject) => {
 *   const req = new XMLHttpRequest();
 *   req.addEventListener("load", () => resolver(req.responseText));
 *   req.addEventListener("error", () => reject(req.responseText));
 *   req.open("GET", "/path/to/your/data");
 *   req.send();
 * });
 *
 * const ExampleComponent = () => {
 *   const {
 *     loading,
 *     data,
 *     error,
 *     request,
 *   } = useApiAdapter(getHandler);
 *
 *   const execute = useCallback(() => {
 *     request();
 *   }, []);
 *
 *   return (
 *     <div>
 *       { loading ? 'loading...' : error ? error : data }
 *       <button onclick={execute} disabled={loading}>
 *         Execute
 *       </button>
 *     </div>
 *   )
 * };
 *
 * ```
 *
 * ---
 *
 * ### Basic example of use using `axios` and request cancelation:
 * We are using `axios` for this example but you can use with others ways
 * ```typescriptreact
 * import React, { useCallback } from 'react';
 * import { useApiAdapter } from 'use-api-adapter';
 * import axios from 'axios';
 *
 * // Declare handler to invoque a request:
 * const getHandler = () => {
 *   const controller = new AbortController();
 *
 *   return [
 *     () => axios.get("/path/to/your/data", {
 *       signal: controller.signal,
 *     }).then(r => r.data),
 *     (reason: string) => controller.abort(reason),
 *   ]
 * };
 *
 * const ExampleComponent = () => {
 *   const {
 *     loading,
 *     data,
 *     error,
 *     request,
 *     cancel,
 *   } = useApiAdapter(getHandler);
 *
 *   const execute = useCallback(() => {
 *     request();
 *   }, []);
 *
 *   return (
 *     <div>
 *       { loading ? 'loading...' : error ? error : data }
 *       <button onclick={execute} disabled={loading}>
 *         Execute
 *       </button>
 *       <button onclick={() => cancel('aborted by user')} disabled={!loading}>
 *         Cancel
 *       </button>
 *     </div>
 *   )
 * };
 *
 * ```
 *
 * ---
 *
 *
 * @template T Type of request response
 *
 * @template S Type of data that will be sent as a parameter to the `invoker`
 * function
 *
 * @template E Error type
 *
 * @param invoker
 *
 * @param options
 *
 * @return Collection of properties and states for actual
 * request instance.
 *
 */
const useApiAdapter = <T, S, E = any>(
  invoker: UseApiAdapterInvoker<T, S>,
  options?: UseApiAdapterOptions<T, S, E>
) => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)
  const [loading, setLoading] = useState(false)

  let cancel: UseApiAdapterInvokerWithCancelation<T>[1] | null = null

  const request = useCallback(async (data?: S) => {
    setLoading(true)
    setError(null)
    options?.onRequestStart?.(data)
    try {
      const promise = invoker(data)
      if (Array.isArray(promise)) {
        cancel = (reason) => {
          promise[1]?.(reason)
          options?.onCanceled?.(reason)
        }
        const result = await promise[0]()
        setData(result)
        setError(null)
        options?.onResponse?.(result, data)
      } else {
        cancel = null
        const result = await promise
        setData(result)
        setError(null)
        options?.onResponse?.(result, data)
      }
    } catch (err) {
      setData(null)
      setError(err)
      options?.onFailure?.(err, data)
    } finally {
      setLoading(false)
      options?.onRequestEnd?.()
    }
  }, [])

  return {
    data,
    error,
    loading,
    request,
    ...(cancel ? { cancel } : {})
  }
}

export { useApiAdapter }
