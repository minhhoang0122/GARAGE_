# TransactionControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createTransaction**](#createtransaction) | **POST** /api/transactions | |
|[**getByOrder**](#getbyorder) | **GET** /api/transactions/order/{orderId} | |
|[**getRecent**](#getrecent) | **GET** /api/transactions/recent | |
|[**getStats**](#getstats) | **GET** /api/transactions/stats | |

# **createTransaction**
> object createTransaction(requestBody)


### Example

```typescript
import {
    TransactionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionControllerApi(configuration);

let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.createTransaction(
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getByOrder**
> object getByOrder()


### Example

```typescript
import {
    TransactionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.getByOrder(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**number**] |  | defaults to undefined|


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

# **getRecent**
> object getRecent()


### Example

```typescript
import {
    TransactionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionControllerApi(configuration);

const { status, data } = await apiInstance.getRecent();
```

### Parameters
This endpoint does not have any parameters.


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

# **getStats**
> object getStats()


### Example

```typescript
import {
    TransactionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionControllerApi(configuration);

const { status, data } = await apiInstance.getStats();
```

### Parameters
This endpoint does not have any parameters.


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

