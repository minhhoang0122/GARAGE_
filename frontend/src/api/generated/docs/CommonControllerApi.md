# CommonControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**search**](#search) | **GET** /api/common/search | |

# **search**
> object search()


### Example

```typescript
import {
    CommonControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommonControllerApi(configuration);

let query: string; // (default to undefined)

const { status, data } = await apiInstance.search(
    query
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **query** | [**string**] |  | defaults to undefined|


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

