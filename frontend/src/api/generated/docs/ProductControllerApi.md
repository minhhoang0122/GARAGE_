# ProductControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**batchUpdate**](#batchupdate) | **POST** /api/products/batch-update | |
|[**createProduct**](#createproduct) | **POST** /api/products | |
|[**getAllProducts**](#getallproducts) | **GET** /api/products | |
|[**updateProduct**](#updateproduct) | **PUT** /api/products/{id} | |

# **batchUpdate**
> object batchUpdate(requestBody)


### Example

```typescript
import {
    ProductControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductControllerApi(configuration);

let requestBody: Array<{ [key: string]: object; }>; //

const { status, data } = await apiInstance.batchUpdate(
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **Array<{ [key: string]: object; }>**|  | |


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

# **createProduct**
> object createProduct(product)


### Example

```typescript
import {
    ProductControllerApi,
    Configuration,
    Product
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductControllerApi(configuration);

let product: Product; //

const { status, data } = await apiInstance.createProduct(
    product
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **product** | **Product**|  | |


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

# **getAllProducts**
> object getAllProducts()


### Example

```typescript
import {
    ProductControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductControllerApi(configuration);

const { status, data } = await apiInstance.getAllProducts();
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

# **updateProduct**
> object updateProduct(product)


### Example

```typescript
import {
    ProductControllerApi,
    Configuration,
    Product
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductControllerApi(configuration);

let id: number; // (default to undefined)
let product: Product; //

const { status, data } = await apiInstance.updateProduct(
    id,
    product
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **product** | **Product**|  | |
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

