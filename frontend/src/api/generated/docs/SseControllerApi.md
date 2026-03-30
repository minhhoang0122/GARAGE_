# SseControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**stream**](#stream) | **GET** /api/sse/stream | |
|[**subscribeToTopic**](#subscribetotopic) | **POST** /api/sse/subscribe/{topic} | |
|[**unsubscribeFromTopic**](#unsubscribefromtopic) | **POST** /api/sse/unsubscribe/{topic} | |

# **stream**
> SseEmitter stream()


### Example

```typescript
import {
    SseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SseControllerApi(configuration);

const { status, data } = await apiInstance.stream();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SseEmitter**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **subscribeToTopic**
> object subscribeToTopic()


### Example

```typescript
import {
    SseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SseControllerApi(configuration);

let topic: string; // (default to undefined)

const { status, data } = await apiInstance.subscribeToTopic(
    topic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **topic** | [**string**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **unsubscribeFromTopic**
> object unsubscribeFromTopic()


### Example

```typescript
import {
    SseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SseControllerApi(configuration);

let topic: string; // (default to undefined)

const { status, data } = await apiInstance.unsubscribeFromTopic(
    topic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **topic** | [**string**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

