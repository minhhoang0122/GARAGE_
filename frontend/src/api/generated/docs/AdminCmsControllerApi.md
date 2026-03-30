# AdminCmsControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createBlogPost**](#createblogpost) | **POST** /api/admin/cms/blog | |
|[**createLandingSection**](#createlandingsection) | **POST** /api/admin/cms/landing | |
|[**deleteBlogPost**](#deleteblogpost) | **DELETE** /api/admin/cms/blog/{id} | |
|[**deleteLandingSection**](#deletelandingsection) | **DELETE** /api/admin/cms/landing/{id} | |
|[**getAllBlogPosts**](#getallblogposts) | **GET** /api/admin/cms/blog | |
|[**getAllLandingSections**](#getalllandingsections) | **GET** /api/admin/cms/landing | |
|[**getBlogPost**](#getblogpost) | **GET** /api/admin/cms/blog/{id} | |
|[**updateBlogPost**](#updateblogpost) | **PUT** /api/admin/cms/blog/{id} | |
|[**updateLandingSection**](#updatelandingsection) | **PUT** /api/admin/cms/landing/{id} | |

# **createBlogPost**
> CmsBlogPost createBlogPost(cmsBlogPost)


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration,
    CmsBlogPost
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let cmsBlogPost: CmsBlogPost; //

const { status, data } = await apiInstance.createBlogPost(
    cmsBlogPost
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cmsBlogPost** | **CmsBlogPost**|  | |


### Return type

**CmsBlogPost**

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

# **createLandingSection**
> CmsLandingSection createLandingSection(cmsLandingSection)


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration,
    CmsLandingSection
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let cmsLandingSection: CmsLandingSection; //

const { status, data } = await apiInstance.createLandingSection(
    cmsLandingSection
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cmsLandingSection** | **CmsLandingSection**|  | |


### Return type

**CmsLandingSection**

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

# **deleteBlogPost**
> deleteBlogPost()


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteBlogPost(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteLandingSection**
> deleteLandingSection()


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteLandingSection(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllBlogPosts**
> Array<CmsBlogPost> getAllBlogPosts()


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

const { status, data } = await apiInstance.getAllBlogPosts();
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

# **getAllLandingSections**
> Array<CmsLandingSection> getAllLandingSections()


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

const { status, data } = await apiInstance.getAllLandingSections();
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

# **getBlogPost**
> CmsBlogPost getBlogPost()


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getBlogPost(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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

# **updateBlogPost**
> CmsBlogPost updateBlogPost(cmsBlogPost)


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration,
    CmsBlogPost
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let id: number; // (default to undefined)
let cmsBlogPost: CmsBlogPost; //

const { status, data } = await apiInstance.updateBlogPost(
    id,
    cmsBlogPost
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cmsBlogPost** | **CmsBlogPost**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**CmsBlogPost**

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

# **updateLandingSection**
> CmsLandingSection updateLandingSection(cmsLandingSection)


### Example

```typescript
import {
    AdminCmsControllerApi,
    Configuration,
    CmsLandingSection
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCmsControllerApi(configuration);

let id: number; // (default to undefined)
let cmsLandingSection: CmsLandingSection; //

const { status, data } = await apiInstance.updateLandingSection(
    id,
    cmsLandingSection
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cmsLandingSection** | **CmsLandingSection**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**CmsLandingSection**

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

