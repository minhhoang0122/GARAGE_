# ReceptionControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addTimelineNote**](#addtimelinenote) | **POST** /api/reception/{id}/timeline/note | |
|[**createReception**](#createreception) | **POST** /api/reception | |
|[**getAllReceptions**](#getallreceptions) | **GET** /api/reception | |
|[**getReceptionById**](#getreceptionbyid) | **GET** /api/reception/{id} | |
|[**getTimeline**](#gettimeline) | **GET** /api/reception/{id}/timeline | |
|[**searchVehicle**](#searchvehicle) | **GET** /api/reception/vehicle | |

# **addTimelineNote**
> object addTimelineNote(requestBody)


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.addTimelineNote(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


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

# **createReception**
> object createReception(receptionFormData)


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration,
    ReceptionFormData
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

let receptionFormData: ReceptionFormData; //

const { status, data } = await apiInstance.createReception(
    receptionFormData
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **receptionFormData** | **ReceptionFormData**|  | |


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

# **getAllReceptions**
> object getAllReceptions()


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

const { status, data } = await apiInstance.getAllReceptions();
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

# **getReceptionById**
> object getReceptionById()


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getReceptionById(
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

# **getTimeline**
> object getTimeline()


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getTimeline(
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

# **searchVehicle**
> object searchVehicle()


### Example

```typescript
import {
    ReceptionControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReceptionControllerApi(configuration);

let plate: string; // (default to undefined)

const { status, data } = await apiInstance.searchVehicle(
    plate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **plate** | [**string**] |  | defaults to undefined|


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

