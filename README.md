# use-api-adapter

> A adapter for API request calls.

[![NPM](https://img.shields.io/npm/v/use-api-adapter.svg)](https://www.npmjs.com/package/use-api-adapter) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-api-adapter
```

## Description

Simple hook, which controls the states of a request to a RestFull API,
with support for canceling requests, using `signal` Can be used
with `axios`, `fetch` and/or `XMLHttpRequest`, the latter
being wrapped in a promise structure.

## Usage

---

### Basic example of use using `axios`:

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';
import axios from 'axios';

// Declare handler to invoque a request:
const getHandler => axios.get("/path/to/your/data").then(r => r.data);

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
  } = useApiAdapter(getHandler);

  const execute = useCallback(() => {
    request();
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
    </div>
  )
};

```

---

### Basic example of use using `fetch`:

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';

// Declare handler to invoque a request:
const getHandler => fetch("/path/to/your/data");

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
  } = useApiAdapter(getHandler);

  const execute = useCallback(() => {
    request();
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
    </div>
  )
};

```

---

### Basic example of use using `XMLHttpRequest`:

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';

// Declare handler to invoque a request:
const getHandler => new Promise((resolver, reject) => {
  const req = new XMLHttpRequest();
  req.addEventListener("load", () => resolver(req.responseText));
  req.addEventListener("error", () => reject(req.responseText));
  req.open("GET", "/path/to/your/data");
  req.send();
});

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
  } = useApiAdapter(getHandler);

  const execute = useCallback(() => {
    request();
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
    </div>
  )
};

```

---

### Basic example of use using `axios` and request cancelation:

We are using `axios` for this example but you can use with others ways

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';
import axios from 'axios';

// Declare handler to invoque a request:
const getHandler = () => {
  const controller = new AbortController();

  return [
    () => axios.get("/path/to/your/data", {
      signal: controller.signal,
    }).then(r => r.data),
    (reason: string) => controller.abort(reason),
  ]
};

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
    cancel,
  } = useApiAdapter(getHandler);

  const execute = useCallback(() => {
    request();
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
      <button onclick={() => cancel('aborted by user')} disabled={!loading}>
        Cancel
      </button>
    </div>
  )
};

```

---

### Basic example of use using `axios` and request cancelation, sending filters to a API:

We are using `axios` for this example but you can use with others ways

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';
import axios from 'axios';

inteface Params {
  limit: number,
  offset: number,
}

// Declare handler to invoque a request:
const getHandler = (params: Params) => {
  const controller = new AbortController();

  return [
    () => axios.get("/path/to/your/data", {
      signal: controller.signal,
      params: params,
    }).then(r => r.data),
    (reason: string) => controller.abort(reason),
  ]
};

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
    cancel,
  } = useApiAdapter(getHandler);

  const execute = useCallback(() => {
    request({
      limit: 1000,
      offset: 0
    });
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
      <button onclick={() => cancel('aborted by user')} disabled={!loading}>
        Cancel
      </button>
    </div>
  )
};

```

---

### Basic example of use using `axios` and request cancelation, sending filters to a API, using listenners:

We are using `axios` for this example but you can use with others ways

```tsx
import React, { useCallback } from 'react';
import { useApiAdapter } from 'use-api-adapter';
import axios from 'axios';

inteface Params {
  limit: number,
  offset: number,
}

// Declare handler to invoque a request:
const getHandler = (params: Params) => {
  const controller = new AbortController();

  return [
    () => axios.get("/path/to/your/data", {
      signal: controller.signal,
      params: params,
    }).then(r => r.data),
    (reason: string) => controller.abort(reason),
  ]
};

const ExampleComponent = () => {
  const {
    loading,
    data,
    error,
    request,
    cancel,
  } = useApiAdapter(getHandler, {
    onCanceled: () => console.log('onCanceled'),
    onResponse: () => console.log('onResponse'),
    onFailure: () => console.log('onFailure'),
    onRequestStart: () => console.log('onRequestStart'),
    onRequestEnd: () => console.log('onRequestEnd'),
  });

  const execute = useCallback(() => {
    request({
      limit: 1000,
      offset: 0
    });
  }, []);

  return (
    <div>
      { loading ? 'loading...' : error ? error : data }
      <button onclick={execute} disabled={loading}>
        Execute
      </button>
      <button onclick={() => cancel('aborted by user')} disabled={!loading}>
        Cancel
      </button>
    </div>
  )
};

```

---

## License

MIT © [JoaoPedro61](https://github.com/JoaoPedro61)
