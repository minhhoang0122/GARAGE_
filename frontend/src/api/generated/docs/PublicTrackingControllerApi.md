# PublicTrackingControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getTrackingByUuid**](#gettrackingbyuuid) | **GET** /api/public/tracking/{uuid} | |
|[**trackVehicleProgress**](#trackvehicleprogress) | **GET** /api/public/tracking | |

# **getTrackingByUuid**
> object getTrackingByUuid()


### Example

```typescript
import {
    PublicTrackingControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTrackingControllerApi(configuration);

let uuid: string; // (default to undefined)

const { status, data } = await apiInstance.getTrackingByUuid(
    uuid
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uuid** | [**string**] |  | defaults to undefined|


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

# **trackVehicleProgress**
> object trackVehicleProgress()


### Example

```typescript
import {
    PublicTrackingControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTrackingControllerApi(configuration);

let bienSo: string; // (default to undefined)

const { status, data } = await apiInstance.trackVehicleProgress(
    bienSo
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bienSo** | [**string**] |  | defaults to undefined|


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

