# ImageUploadControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**uploadImage**](#uploadimage) | **POST** /api/images/upload | |

# **uploadImage**
> object uploadImage()


### Example

```typescript
import {
    ImageUploadControllerApi,
    Configuration,
    UploadImageRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageUploadControllerApi(configuration);

let folder: string; // (optional) (default to 'receptions')
let uploadImageRequest: UploadImageRequest; // (optional)

const { status, data } = await apiInstance.uploadImage(
    folder,
    uploadImageRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadImageRequest** | **UploadImageRequest**|  | |
| **folder** | [**string**] |  | (optional) defaults to 'receptions'|


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

