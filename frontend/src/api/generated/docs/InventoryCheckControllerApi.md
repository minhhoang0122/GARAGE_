# InventoryCheckControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adjustStock**](#adjuststock) | **POST** /api/inventory-check/adjust | |
|[**getProductsForCheck**](#getproductsforcheck) | **GET** /api/inventory-check/products | |

# **adjustStock**
> object adjustStock(requestBody)


### Example

```typescript
import {
    InventoryCheckControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryCheckControllerApi(configuration);

let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.adjustStock(
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

# **getProductsForCheck**
> object getProductsForCheck()


### Example

```typescript
import {
    InventoryCheckControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryCheckControllerApi(configuration);

const { status, data } = await apiInstance.getProductsForCheck();
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

