# NotificationControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyNotifications**](#getmynotifications) | **GET** /api/notifications | |
|[**markAllAsRead**](#markallasread) | **PUT** /api/notifications/read-all | |
|[**markAsRead**](#markasread) | **PUT** /api/notifications/{id}/read | |

# **getMyNotifications**
> Array<NotificationDTO> getMyNotifications()


### Example

```typescript
import {
    NotificationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationControllerApi(configuration);

const { status, data } = await apiInstance.getMyNotifications();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<NotificationDTO>**

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

# **markAllAsRead**
> object markAllAsRead()


### Example

```typescript
import {
    NotificationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationControllerApi(configuration);

const { status, data } = await apiInstance.markAllAsRead();
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

# **markAsRead**
> object markAsRead()


### Example

```typescript
import {
    NotificationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.markAsRead(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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

