# SupplierControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSupplier**](#createsupplier) | **POST** /api/suppliers | |
|[**deleteSupplier**](#deletesupplier) | **DELETE** /api/suppliers/{id} | |
|[**getActiveSuppliers**](#getactivesuppliers) | **GET** /api/suppliers/active | |
|[**getAllSuppliers**](#getallsuppliers) | **GET** /api/suppliers | |
|[**getSupplierById**](#getsupplierbyid) | **GET** /api/suppliers/{id} | |
|[**updateSupplier**](#updatesupplier) | **PUT** /api/suppliers/{id} | |

# **createSupplier**
> Supplier createSupplier(supplier)


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration,
    Supplier
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

let supplier: Supplier; //

const { status, data } = await apiInstance.createSupplier(
    supplier
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **supplier** | **Supplier**|  | |


### Return type

**Supplier**

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

# **deleteSupplier**
> deleteSupplier()


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteSupplier(
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

# **getActiveSuppliers**
> Array<Supplier> getActiveSuppliers()


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

const { status, data } = await apiInstance.getActiveSuppliers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Supplier>**

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

# **getAllSuppliers**
> Array<Supplier> getAllSuppliers()


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

const { status, data } = await apiInstance.getAllSuppliers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Supplier>**

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

# **getSupplierById**
> Supplier getSupplierById()


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getSupplierById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**Supplier**

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

# **updateSupplier**
> Supplier updateSupplier(supplier)


### Example

```typescript
import {
    SupplierControllerApi,
    Configuration,
    Supplier
} from './api';

const configuration = new Configuration();
const apiInstance = new SupplierControllerApi(configuration);

let id: number; // (default to undefined)
let supplier: Supplier; //

const { status, data } = await apiInstance.updateSupplier(
    id,
    supplier
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **supplier** | **Supplier**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**Supplier**

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

