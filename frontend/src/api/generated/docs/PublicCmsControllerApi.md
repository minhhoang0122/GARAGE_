# PublicCmsControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getBlogPost1**](#getblogpost1) | **GET** /api/public/cms/blog/{slug} | |
|[**getBlogPosts**](#getblogposts) | **GET** /api/public/cms/blog | |
|[**getLandingSections**](#getlandingsections) | **GET** /api/public/cms/landing | |

# **getBlogPost1**
> CmsBlogPost getBlogPost1()


### Example

```typescript
import {
    PublicCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCmsControllerApi(configuration);

let slug: string; // (default to undefined)

const { status, data } = await apiInstance.getBlogPost1(
    slug
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|


### Return type

**CmsBlogPost**

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

# **getBlogPosts**
> Array<CmsBlogPost> getBlogPosts()


### Example

```typescript
import {
    PublicCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCmsControllerApi(configuration);

const { status, data } = await apiInstance.getBlogPosts();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CmsBlogPost>**

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

# **getLandingSections**
> Array<CmsLandingSection> getLandingSections()


### Example

```typescript
import {
    PublicCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicCmsControllerApi(configuration);

const { status, data } = await apiInstance.getLandingSections();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CmsLandingSection>**

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

