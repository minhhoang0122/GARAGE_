# SystemConfigControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAllConfigs**](#getallconfigs) | **GET** /api/config | |
|[**updateConfigs**](#updateconfigs) | **POST** /api/config | |

# **getAllConfigs**
> { [key: string]: string; } getAllConfigs()


### Example

```typescript
import {
    SystemConfigControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemConfigControllerApi(configuration);

const { status, data } = await apiInstance.getAllConfigs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

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

# **updateConfigs**
> object updateConfigs(requestBody)


### Example

```typescript
import {
    SystemConfigControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemConfigControllerApi(configuration);

let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.updateConfigs(
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |


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

